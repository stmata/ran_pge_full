from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
import uuid
from datetime import datetime
from app.services import database_services

conversation_routes = Blueprint('conversation_routes', __name__)

users_collection = database_services.get_collection('users')

    
@conversation_routes.route('/users/<userId>/conversations', methods=['GET'])
def load_conversations(userId):
    try:
        user = users_collection.find_one({"_id": ObjectId(userId)})
        # print(userId)
        # print(user)
        if not user:
            return jsonify({"error": "User not found"}), 404

        conversations = user.get("conversations", [])
        # print(conversations)
        return jsonify(conversations), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@conversation_routes.route('/users/<userId>/conversations/<conversationId>', methods=['DELETE'])
def delete_conversation(userId, conversationId):
    try:
        result = users_collection.update_one(
            {"_id": ObjectId(userId)},
            {"$pull": {"conversations": {"id": conversationId}}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Conversation not found or user not found"}), 404

        # Pour simplifier, on ne renvoie pas toutes les conversations après suppression
        # On renvoie juste un message de succès
        return jsonify({"success": "Conversation deleted"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@conversation_routes.route('/users/<userId>/conversations', methods=['PATCH'])
def add_new_conversation(userId):
    try:
        # Générer un nouvel ID de conversation
        newConversationId = str(uuid.uuid4())
        newConversation = {
            "id": newConversationId,
            "title": f"New Chat",
            "createdAt": datetime.utcnow(),
            "messages": []
        }
        
        result = users_collection.update_one(
            {"_id": ObjectId(userId)},
            {"$push": {"conversations": newConversation}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "User not found"}), 404

        return jsonify({"newConversationId": newConversationId}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@conversation_routes.route('/users/<userId>/conversations/<conversationId>/title', methods=['PATCH'])
def update_conversation_title(userId, conversationId):
    try:
        # Extraire le nouveau titre de la requête
        data = request.get_json()
        newTitle = data.get("title")
        if not newTitle:
            return jsonify({"error": "Title is required"}), 400

        # Mettre à jour le titre de la conversation spécifiée
        result = users_collection.update_one(
            {"_id": ObjectId(userId), "conversations.id": conversationId},
            {"$set": {"conversations.$.title": newTitle}}
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Conversation not found or user not found"}), 404

        return jsonify({"success": "Conversation title updated"}), 200
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500
