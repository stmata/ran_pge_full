from bson.objectid import ObjectId
from pydantic import BaseModel
import uuid
from fastapi import APIRouter, HTTPException, Body, Request
from datetime import datetime
from app.services import database_services
from pydantic import BaseModel, Field

router = APIRouter()

users_collection = database_services.get_collection('users')

class UpdateTitleRequest(BaseModel):
    title: str

class Conversation(BaseModel):
    id: str = Field(..., description="ID de la conversation")
    title: str = Field(..., description="Titre de la conversation")
    createdAt: datetime = Field(..., description="Date de création de la conversation")
    messages: list = Field([], description="Liste des messages de la conversation")


@router.get("/users/{userId}/conversations")
async def load_conversations(userId: str):
    try:
        user = users_collection.find_one({"_id": ObjectId(userId)})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        conversations = user.get("conversations", [])
        return conversations

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/{userId}/conversations/{conversationId}")
async def delete_conversation(userId: str, conversationId: str):
    try:
        result = users_collection.update_one(
            {"_id": ObjectId(userId)},
            {"$pull": {"conversations": {"id": conversationId}}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found or user not found")

        return {"success": "Conversation deleted"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/users/{userId}/conversations")
async def add_new_conversation(userId: str):
    try:
        newConversationId = str(uuid.uuid4())
        newConversation = Conversation(
            id=newConversationId,
            title="New Chat",
            createdAt=datetime.utcnow(),
            messages=[]
        )

        result = users_collection.update_one(
            {"_id": ObjectId(userId)},
            {"$push": {"conversations": newConversation.dict()}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")

        return {"newConversationId": newConversationId}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/users/{userId}/conversations/{conversationId}/title")
async def update_conversation_title(userId: str, conversationId: str, request: Request):
    try:
        data = await request.json()
        title = data.get('title', '')
        if not title:
            raise HTTPException(status_code=400, detail="Title is required")

        
        result = users_collection.update_one(
            {"_id": ObjectId(userId), "conversations.id": conversationId},
            {"$set": {"conversations.$.title": title}}
        )

        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Conversation not found or user not found")

        return {"success": "Conversation title updated"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
