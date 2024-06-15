from datetime import datetime
from fastapi import APIRouter, Body, HTTPException, Request
from bson import ObjectId
from pydantic import BaseModel, Field
from app.services import database_services, chat_services
from typing import List, Optional

message_routes = APIRouter()
users_collection = database_services.get_collection('users')

class Message(BaseModel):
    id: str
    text: str
    user: int
    time: str
    nouveau: bool = False

class Conversation(BaseModel):
    id: str = Field(..., description="ID de la conversation")
    title: str = Field(..., description="Titre de la conversation")
    createdAt: datetime = Field(..., description="Date de création de la conversation")
    messages: list = Field([], description="Liste des messages de la conversation")

class MessageRequest(BaseModel):
    messages: List[Conversation]

@message_routes.get('/users/{userId}/messages')
async def load_messages(userId: str, conversationId: str = None):
    try:
        # Assurez-vous d'avoir une collection users avec des documents structurés appropriés
        user = users_collection.find_one({"_id": ObjectId(userId)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if conversationId:
            conversation = next((conv for conv in user.get("conversations", []) if conv["id"] == conversationId), None)
            
            if conversation:
                return conversation.get("messages", [])
            else:
                raise HTTPException(status_code=404, detail="Conversation not found")
        else:
            return user.get("conversations", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@message_routes.put('/users/{userId}/conversations/{conversationId}')
async def save_messages(userId: str, conversationId: str, request: Request):
    try:
        data = await request.json()
        newMessages = data.get('newMessages', [])
        
        if not newMessages:
            raise HTTPException(status_code=400, detail="No new messages provided")

    except Exception as e:
        # Gérer les erreurs liées à la lecture de la requête JSON
        print(f"Erreur lors de la lecture de la requête JSON : {str(e)}")
        raise HTTPException(status_code=400, detail="Invalid request data")

    try:
        # Récupérer le document utilisateur entier sans projection spécifique pour les conversations
        user_doc = users_collection.find_one({"_id": ObjectId(userId)})

        if user_doc is None:
            raise HTTPException(status_code=404, detail="User not found")

        # Filtrer manuellement les conversations en Python
        conversations = [conv for conv in user_doc.get('conversations', []) if conv.get('id') == conversationId]

        if not conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")

    except Exception as e:
        # Gérer les erreurs liées à la recherche dans MongoDB
        print(f"Erreur lors de la recherche dans MongoDB : {str(e)}")
        raise HTTPException(status_code=500, detail="Database search error")

    try:
        update_fields = {"conversations.$.messages": newMessages}

        # Utiliser .get() avec une liste vide comme valeur par défaut
        existingMessages = conversations[0].get('messages', [])

        # Si c'est le premier message, changer également le titre
        if not existingMessages:
            newTitle = chat_services.generate_title_with_openai(newMessages)
            update_fields["conversations.$.title"] = newTitle

        # Mettre à jour la conversation
        result = users_collection.update_one(
            {"_id": ObjectId(userId), "conversations.id": conversationId},
            {"$set": update_fields}
        )

        if result.modified_count == 0:
            # Si aucune conversation n'a été mise à jour, renvoyer une erreur
            raise HTTPException(status_code=400, detail="Update failed, conversation might already be up-to-date")

    except Exception as e:
        # Gérer les erreurs liées à la mise à jour dans MongoDB
        print(f"Erreur lors de la mise à jour dans MongoDB : {str(e)}")
        raise HTTPException(status_code=500, detail="Database update error")

    return {"success": "Messages updated"}