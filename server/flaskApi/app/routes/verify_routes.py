from flask import Blueprint, request, jsonify
import requests
from pymongo import MongoClient
from bson.objectid import ObjectId
from app.services import email_services
from app.services import database_services
from jose import jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone

load_dotenv() 

verify_routes = Blueprint('verify_routes', __name__)

users_collection = database_services.get_collection('users')
 
@verify_routes.route('/send_verifyMail', methods=['POST'])
def send_verifyMail():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()

        verification_code = email_services.generate_verification_code()

        name_parts = email.split('@')[0].split('.')
        user = " ".join([part.capitalize() for part in name_parts])

        email_services.send_verification_email(email, verification_code, user)

        # Recherche de l'utilisateur par email
        user_document = users_collection.find_one({"email": email})

        if user_document:
            # Mise à jour de l'utilisateur existant avec le nouveau code de vérification
            update_result = users_collection.update_one(
                {"_id": user_document['_id']},
                {"$set": {"verification_code": verification_code}}
            )

            if update_result.modified_count > 0:
                return jsonify({'message': 'Code de vérification mis à jour avec succès'}), 200
            else:
                return jsonify({'error': 'Échec de la mise à jour du code de vérification'}), 500
        else:
            # Création d'un nouvel utilisateur
            insert_result = users_collection.insert_one({
                "email": email,
                "user": user,
                "verification_code": verification_code
            })

            if insert_result.inserted_id:
                return jsonify({'message': 'Email de vérification envoyé avec succès'}), 200
            else:
                return jsonify({'error': 'Échec de l\'envoi de l\'email de vérification'}), 500

    except Exception as e:
        return jsonify({'message': "Erreur lors de l'envoi de l'email de vérification", 'error': str(e)}), 500
    
@verify_routes.route('/send_ContactMail', methods=['POST'])
def send_ContactMail():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        name = data.get('name', '')
        subject = data.get('subject', '')
        content = data.get('content', '')

        ok = email_services.send_contact_email(email, name, subject, content)

        if ok:
            return jsonify({'message': 'Email de vérification envoyé avec succès'}), 200
        else:
            return jsonify({'message': 'Échec de l\'envoi de l\'email de vérification'}), 500

    except Exception as e:
        return jsonify({'message': "Erreur lors de l'envoi de l'email de vérification", 'error': str(e)}), 500


@verify_routes.route('/verify_code', methods=['POST'])
def verify_code():
    try:
        data = request.get_json()
        email = data.get('email', '').lower()
        code = data.get('code', '')
        mobile = data.get('mobile')


        # Récupérer le document de l'utilisateur, y compris le code de vérification et le niveau
        user_document = users_collection.find_one({"email": email}, {"verification_code": 1, "level": 1})

        if user_document and user_document.get('verification_code') == code:
            # Le code de vérification correspond
            user_id = str(user_document["_id"])  # Conversion de ObjectId en string


            access_token_exp = datetime.now(timezone.utc) + timedelta(minutes=50)
            refresh_token_exp = datetime.now(timezone.utc) + timedelta(days=7)

            payload = {
                'email': email,
                'exp': access_token_exp
            }

            refresh_payload = {
                'email': email,
                'exp': refresh_token_exp
            }
            
           
            access_token = jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')
            refresh_token = jwt.encode(refresh_payload, os.getenv('SECRET_KEY'), algorithm='HS256')
            
            # Génération du token JWT sans tenter de le décoder
            #token = jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256') if hasattr(jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256'), 'decode') else jwt.encode(payload, os.getenv('SECRET_KEY'), algorithm='HS256')
            # Vérifier l'existence du niveau pour l'utilisateur
            if "level" in user_document:

                if (mobile):
                # Si un niveau est défini pour l'utilisateur
                    return jsonify({
                        "success": True,
                        "message": "Le code de vérification est correct et le niveau de l'utilisateur est défini.",
                        "_id": user_id,
                        "level": user_document["level"], 
                        "existingLevel": True
                    }), 200
                 
                else:
                    return jsonify({
                        "success": True,
                        "accessToken":access_token,
                        "accessTokenExpiresAt": access_token_exp.isoformat(),
                        "refreshToken": refresh_token,
                        "refreshTokenExpiresAt": refresh_token_exp.isoformat(),
                        "message": "Le code de vérification est correct et le niveau de l'utilisateur est défini.",
                        "_id": user_id,
                        "level": user_document["level"],  
                        "existingLevel": True
                    }), 200

            else:

                if (mobile):
                    # Si aucun niveau n'est défini pour l'utilisateur
                    return jsonify({
                        "success": True,
                        "message": "Le code de vérification est correct mais aucun niveau n'est défini pour l'utilisateur.",
                        "_id": user_id,
                        "existingLevel": False,
                    }), 200
                else:
                    return jsonify({
                        "success": True,
                        "message": "Le code de vérification est correct mais aucun niveau n'est défini pour l'utilisateur.",
                        "_id": user_id,
                        "existingLevel": False,
                        "accessToken":access_token,
                        "accessTokenExpiresAt": access_token_exp.isoformat(),
                        "refreshToken": refresh_token,
                        "refreshTokenExpiresAt": refresh_token_exp.isoformat(),
                    }), 200
        else:
            # Le code de vérification ne correspond pas
            return jsonify({"success": False, "message": "Le code de vérification est incorrect."}), 400

    except Exception as e:
        return jsonify({'error': "Erreur lors de la vérification du code.", 'exception': str(e)}), 500

@verify_routes.route('/refresh', methods=['POST'])
def refresh_token():
    try:
        data = request.get_json()
        refresh_token = data.get('refreshToken')
        payload = jwt.decode(refresh_token, os.getenv('SECRET_KEY'), algorithms=['HS256'])
        email = payload['email']

        access_token_exp = datetime.now(timezone.utc) + timedelta(minutes=50)
        refresh_token_exp = datetime.now(timezone.utc) + timedelta(days=7)

        access_payload = {
            'email': email,
            'exp': access_token_exp
        }

        refresh_payload = {
            'email': email,
            'exp': refresh_token_exp
        }
        print('refresh Token succefully')
        new_access_token = jwt.encode(access_payload, os.getenv('SECRET_KEY'), algorithm='HS256') 
        new_refresh_token = jwt.encode(refresh_payload, os.getenv('SECRET_KEY'), algorithm='HS256') 

        return jsonify({
            'accessToken': new_access_token,
            'accessTokenExpiresAt': access_token_exp.isoformat(),
            'refreshToken': new_refresh_token,
            'refreshTokenExpiresAt': refresh_token_exp.isoformat()
        }), 200
    except Exception as e:
        return jsonify({'error': "Erreur lors du rafraîchissement du token.", 'exception': str(e)}), 500


@verify_routes.route('/users/<user_id>/update_verification_code', methods=['PATCH'])
def update_verification_code(user_id):
    try:
        # Conversion de user_id en ObjectId pour la recherche dans MongoDB
        if not ObjectId.is_valid(user_id):
            return jsonify({"error": "Invalid user ID format"}), 400
        
        user_id = ObjectId(user_id)

        # Mise à jour du code de vérification pour l'utilisateur
        result = users_collection.update_one(
            {"_id": user_id},
            {"$set": {"verification_code": ''}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"success": "Verification code updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
