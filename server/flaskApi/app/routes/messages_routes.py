from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid
from datetime import datetime
from app.services import database_services, chat_services
from pymongo.errors import PyMongoError  # Importez cette exception pour les erreurs liées à PyMongo

message_routes = Blueprint('message_routes', __name__)

users_collection = database_services.get_collection('users')


@message_routes.route('/users/<userId>/messages', methods=['GET'])
def load_messages(userId):
    try:
        # Assurez-vous d'avoir une collection users avec des documents structurés appropriés
        user = users_collection.find_one({"_id": ObjectId(userId)})
        if not user:
            return jsonify({"error": "User not found"}), 404

        conversationId = request.args.get('conversationId')  # Passé comme paramètre de requête
        conversation = next((conv for conv in user.get("conversations", []) if conv["id"] == conversationId), None)
        
        if conversation:
            return jsonify(conversation.get("messages", [])), 200
        else:
            return jsonify({"error": "Conversation not found"}), 404
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

# message_routes.route('/users/<userId>/conversations/<conversationId>', methods=['PUT'])
# def save_messages(userId, conversationId):
#     try:
#         newMessages = request.json.get('newMessages')

#         print(newMessages)
        
#         # Mettre à jour seulement la conversation spécifique avec les nouveaux messages
#         result = users_collection.update_one(
#             {"_id": ObjectId(userId), "conversations.id": conversationId},
#             {"$set": {"conversations.$.messages": newMessages}}
#         )
        
#         if result.modified_count == 0:
#             return jsonify({"error": "Conversation not found or update failed","conversationId":conversationId}), 404

#         return jsonify({"success": "Messages updated"}), 200
#     except Exception as e:
#         print(str(e))
#         return jsonify({"error": str(e)}), 500


@message_routes.route('/users/<userId>/conversations/<conversationId>', methods=['PUT'])
def save_messages(userId, conversationId):
    try:
        newMessages = request.json.get('newMessages')
    except Exception as e:
        # Gérer les erreurs liées à la lecture de la requête JSON
        print(f"Erreur lors de la lecture de la requête JSON : {str(e)}")
        return jsonify({"error": "Invalid request data"}), 400

    try:
        # Récupérer le document utilisateur entier sans projection spécifique pour les conversations
        user_doc = users_collection.find_one({"_id": ObjectId(userId)})

        if user_doc is None:
            return jsonify({"error": "User not found"}), 404
        
        # Filtrer manuellement les conversations en Python
        conversations = [conv for conv in user_doc.get('conversations', []) if conv.get('id') == conversationId]

        if not conversations:
            return jsonify({"error": "Conversation not found"}), 404

        # Logique pour travailler avec les conversations filtrées
        # print(conversations)
    except PyMongoError as e:
        # Gérer les erreurs liées à la recherche dans MongoDB
        print(f"Erreur lors de la recherche dans MongoDB : {str(e)}")
        return jsonify({"error": "Database search error"}), 500

    if conversations is None:
        return jsonify({"error": "Conversation not found"}), 404

    try:
        update_fields = {"conversations.$.messages": newMessages}
         # Utiliser .get() avec une liste vide comme valeur par défaut
        existingMessages = conversations[0].get('messages', [])
        # print(existingMessages)
        # Si c'est le premier message, changer également le titre
        if not existingMessages:
            # print(newMessages)
            newTitle = chat_services.generate_title_with_openai(newMessages)
            update_fields["conversations.$.title"] = newTitle

        # Mettre à jour la conversation
        result = users_collection.update_one(
            {"_id": ObjectId(userId), "conversations.id": conversationId},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            # Si aucune conversation n'a été mise à jour, renvoyer une erreur
            return jsonify({"error": "Update failed, conversation might already be up-to-date"}), 400

    except PyMongoError as e:
        # Gérer les erreurs liées à la mise à jour dans MongoDB
        print(f"Erreur lors de la mise à jour dans MongoDB : {str(e)}")
        return jsonify({"error": "Database update error"}), 500

    return jsonify({"success": "Messages updated"}), 200