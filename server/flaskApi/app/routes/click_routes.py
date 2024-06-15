from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid
from datetime import datetime
from app.services import database_services

click_routes = Blueprint('click_routes', __name__)

click_collection = database_services.get_collection('click')
featured_collection = database_services.get_collection('featured')

@click_routes.route('/click_checkandsave', methods=['POST'])
def click_checkandsave():
    try:
        data = request.json
        user_id = data.get('user_id')
        target_type = data.get('target_type')  # 'course' ou 'topic'
        target_id = data.get('target_id')  # ID du cours ou du topic

        if not user_id or not target_type or not target_id:
            return jsonify({"error": "Informations insuffisantes fournies"}), 400

        # Vérifiez si un clic existe déjà pour cet utilisateur et cette cible
        existing_click = click_collection.find_one({"user_id": user_id, "target_id": target_id})

        if existing_click and existing_click.get('clicked'):
            return jsonify({"message": "Déjà existant"}), 200
        else:
            # Enregistrement du clic dans la collection des clics
            click_collection.insert_one({
                "user_id": user_id,
                "target_id": target_id,
                "clicked": True,
                "date": datetime.now()
            })

        # Mise à jour du compteur de stars
        if target_type == "course":
            update_result = featured_collection.update_one(
                {"courses._id": target_id},
                {"$inc": {"courses.$.stars": 1}}
            )
        elif target_type == "topic":
            # Pour les topics, on doit d'abord trouver le bon cours, ensuite le bon topic à mettre à jour
            update_result = featured_collection.update_one(
                {"courses.topics._id": target_id},
                {"$inc": {"courses.$[course].topics.$[topic].stars": 1}},
                array_filters=[{"course.topics._id": target_id}, {"topic._id": target_id}]
            )

        if update_result.modified_count > 0:
            return jsonify({"message": "Clic enregistré et contenu mis à jour dans featured"}), 200
        else:
            return jsonify({"error": "Impossible de mettre à jour le contenu dans featured"}), 404

    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        print(error_message)
        return jsonify({"error": error_message}), 500