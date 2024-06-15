from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid
from datetime import datetime
from app.services import database_services

user_routes = Blueprint('user', __name__)

users_collection = database_services.get_collection('users')


@user_routes.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    try:
        if user_id:
            user = users_collection.find_one({"_id": user_id})
            if user:
                return jsonify({"success": True, "user": user, "message": "Nouvelle conversation ajoutée."}), 200
            else:
                return jsonify({"success": False, "message": "Utilisateur non trouvé."}), 404
    except Exception as e:
        return jsonify({"error": "Erreur lors de l'ajout de la nouvelle conversation.", "details": str(e)}), 500


@user_routes.route('/user/<userId>/choiceLevel', methods=['PATCH'])
def choiceLevel(userId):
    try:
        # Récupérer le niveau envoyé dans le corps de la requête
        data = request.get_json()
        level = data.get('level')

        if not level:
            # Si le niveau n'est pas fourni, renvoyer une erreur
            return jsonify({"success": False, "message": "Le niveau est requis."}), 400
        
        # Convertir userId en ObjectId si nécessaire (dépend de votre implémentation)
        # Si vos ID d'utilisateur ne sont pas des ObjectId, supprimez cette conversion
        user_id_obj = ObjectId(userId) if ObjectId.is_valid(userId) else userId

        # Mise à jour du document utilisateur avec le nouveau niveau
        result = users_collection.update_one({"_id": user_id_obj}, {"$set": {"level": level}})

        if result.matched_count == 0:
            # Si aucun utilisateur n'a été trouvé avec cet ID
            return jsonify({"success": False, "message": "Utilisateur non trouvé."}), 404

        # Si la mise à jour a réussi
        return jsonify({"success": True, "message": "Le niveau de l'utilisateur a été mis à jour."}), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Erreur lors de la mise à jour du niveau.", "details": str(e)}), 500
    
@user_routes.route('/user/<user_id>/superUser', methods=['GET'])
def get_super_user_status(user_id):
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
        if user:
            super_user_status = user.get('superUser', False)
            return jsonify({"success": True, "superUser": super_user_status})
        else:
            return jsonify({"success": False, "message": "Utilisateur non trouvé."}), 404
    except Exception as e:
        return jsonify({"error": "Erreur lors de la récupération du statut superUser.", "details": str(e)}), 500


@user_routes.route('/user/<email>/superUser', methods=['PATCH'])
def update_super_user_status(email):
    try:
        data = request.get_json()
        if 'superUser' not in data:
            return jsonify({"success": False, "message": "superUser est requis."}), 400

        super_user = data['superUser']

        result = users_collection.update_one({"email": email}, {"$set": {"superUser": super_user}})

        if result.matched_count == 0:
            return jsonify({"success": False, "message": "Utilisateur non trouvé."}), 404

        return jsonify({"success": True, "message": "Statut superUser de l'utilisateur mis à jour."}), 200

    except Exception as e:
        return jsonify({"success": False, "message": "Erreur lors de la mise à jour du statut superUser.", "details": str(e)}), 500