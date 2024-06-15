from bson.objectid import ObjectId
from fastapi import APIRouter, Body, Request, HTTPException
from datetime import datetime
from app.services import database_services

router = APIRouter()
users_collection = database_services.get_collection('users')

@router.get('/users/{user_id}')
async def get_user(user_id: str):
    try:
        if user_id:
            user = users_collection.find_one({"_id": user_id})
            if user:
                return {"success": True, "user": user, "message": "New conversation added."}
            else:
                raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding new conversation: {str(e)}")

@router.patch('/user/{userId}/choiceLevel')
async def choice_level(userId: str, request: Request):
    try:
        data = await request.json()
        level = data.get('level')
        if not level:
            # Si le niveau n'est pas fourni, renvoyer une erreur
            raise HTTPException(status_code=400, detail="Level is required.")

        # Convertir userId en ObjectId si nécessaire (dépend de votre implémentation)
        # Si vos ID d'utilisateur ne sont pas des ObjectId, supprimez cette conversion
        user_id_obj = ObjectId(userId) if ObjectId.is_valid(userId) else userId

        # Mise à jour du document utilisateur avec le nouveau niveau
        result = users_collection.update_one({"_id": user_id_obj}, {"$set": {"level": level}})

        if result.matched_count == 0:
            # Si aucun utilisateur n'a été trouvé avec cet ID
            raise HTTPException(status_code=404, detail="User not found.")

        # Si la mise à jour a réussi
        return {"success": True, "message": "User level updated."}
    
    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating level: {str(e)}")

@router.get('/user/{user_id}/superUser')
async def get_super_user_status(user_id: str):
    try:
        user_id_obj = ObjectId(user_id) if ObjectId.is_valid(user_id) else user_id
        user = users_collection.find_one({"_id": user_id_obj}, {"superUser": 1})

        if user is None:
            raise HTTPException(status_code=404, detail="User not found")

        super_user_status = user.get('superUser', False)
        return {"success": True, "superUser": super_user_status}
    
    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving superUser status: {str(e)}")

@router.patch('/user/{email}/superUser')
async def update_super_user_status(email: str, request: Request):
    try:
        data = await request.json()
        if 'superUser' not in data:
            raise HTTPException(status_code=400, detail="superUser is required")

        superUser = data['superUser']

        result = users_collection.update_one({"email": email}, {"$set": {"superUser": superUser}})

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")

        return {"success": True, "message": "User superUser status updated."}
    
    except HTTPException as http_error:
        raise http_error

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating superUser status: {str(e)}")