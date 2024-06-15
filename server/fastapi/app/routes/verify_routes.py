from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from bson.objectid import ObjectId
from app.services import email_services
from app.services import database_services
from jose import jwt
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta, timezone

load_dotenv() 

router = APIRouter()
users_collection = database_services.get_collection('users')

@router.post('/send_verifyMail')
async def send_verify_mail(request: Request):
    try:
        data = await request.json()
        email = data.get('email', '').lower()

        verification_code = email_services.generate_verification_code()

        name_parts = email.split('@')[0].split('.')
        user = " ".join([part.capitalize() for part in name_parts])

        email_services.send_verification_email(email, verification_code, user)

        user_document = users_collection.find_one({"email": email})

        if user_document:
            update_result = users_collection.update_one(
                {"_id": user_document['_id']},
                {"$set": {"verification_code": verification_code}}
            )

            if update_result.modified_count > 0:
                return {'message': 'Verification code updated successfully'}, 200
            else:
                raise HTTPException(status_code=500, detail='Failed to update verification code')
        else:
            insert_result = users_collection.insert_one({
                "email": email,
                "user": user,
                "verification_code": verification_code
            })

            if insert_result.inserted_id:
                return {'message': 'Verification email sent successfully'}, 200
            else:
                raise HTTPException(status_code=500, detail='Failed to send verification email')

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending verification email: {str(e)}")

@router.post('/send_ContactMail')
async def send_contact_mail(request: Request):
    try:
        data = await request.json()
        email = data.get('email', '').lower()
        name = data.get('name', '')
        subject = data.get('subject', '')
        content = data.get('content', '')

        ok = email_services.send_contact_email(email, name, subject, content)

        if ok:
            return {'message': 'Contact email sent successfully'}, 200
        else:
            raise HTTPException(status_code=500, detail='Failed to send contact email')

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending contact email: {str(e)}")

@router.post('/verify_code')
async def verify_code(request: Request):
    try:
        data = await request.json()
        email = data.get('email', '').lower()
        code = data.get('code', '')

        user_document = users_collection.find_one({"email": email}, {"verification_code": 1, "level": 1})
        
        if user_document and user_document.get('verification_code') == code:
            user_id = str(user_document["_id"])

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

            if "level" in user_document:
                data = {
                    "success": True,
                    "accessToken": access_token,
                    "accessTokenExpiresAt": access_token_exp.isoformat(),
                    "refreshToken": refresh_token,
                    "refreshTokenExpiresAt": refresh_token_exp.isoformat(),
                    "message": "Verification code is correct and user level is defined.",
                    "_id": user_id,
                    "level": user_document["level"], 
                    "existingLevel": True
                }
                print(data)
                return JSONResponse(content=data, status_code=200)
            else:
                data = {
                    "success": True,
                    "accessToken": access_token,
                    "accessTokenExpiresAt": access_token_exp.isoformat(),
                    "refreshToken": refresh_token,
                    "refreshTokenExpiresAt": refresh_token_exp.isoformat(),
                    "message": "Verification code is correct but no level is defined for the user.",
                    "_id": user_id,
                    "existingLevel": False,
                }
                print(data)
                return JSONResponse(content=data, status_code=200)
        else:
            return {"success": False, "message": "Invalid verification code"}, 400

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying code: {str(e)}")

@router.post('/refresh')
async def refresh_token(request: Request):
    try:
        data = await request.json()
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

        new_access_token = jwt.encode(access_payload, os.getenv('SECRET_KEY'), algorithm='HS256') 
        new_refresh_token = jwt.encode(refresh_payload, os.getenv('SECRET_KEY'), algorithm='HS256') 

        data = {
            'accessToken': new_access_token,
            'accessTokenExpiresAt': access_token_exp.isoformat(),
            'refreshToken': new_refresh_token,
            'refreshTokenExpiresAt': refresh_token_exp.isoformat()
        }
        return JSONResponse(content=data, status_code=200)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing token: {str(e)}")

@router.patch('/users/{user_id}/update_verification_code')
async def update_verification_code(user_id: str):
    try:
        if not ObjectId.is_valid(user_id):
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        user_id = ObjectId(user_id)

        result = users_collection.update_one(
            {"_id": user_id},
            {"$set": {"verification_code": ''}}
        )

        if result.matched_count == 0:
            return {"error": "User not found"}, 404

        return {"success": "Verification code updated successfully"}, 200

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
