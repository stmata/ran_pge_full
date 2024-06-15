from fastapi import APIRouter, HTTPException
from bson import ObjectId
from typing import Dict, List
from app.services import database_services

course_routes = APIRouter()

courses_collection = database_services.get_collection('featured')

@course_routes.get('/featured', response_model=List[Dict])
async def get_all_featured():
    try:
        # Récupérer tous les documents dans la collection 'featured'
        featured_courses = courses_collection.find({})

        # Convertir les documents en liste et les documents BSON en JSON
        featured_list = list(featured_courses)
        for item in featured_list:
            item["_id"] = str(item["_id"])  # Convertir Object_id en string pour JSON

        return featured_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@course_routes.post('/get_user_courses/{level}', response_model=List[Dict])
async def get_courses_by_level(level: str):
    try:
        # Récupérer tous les documents dans la collection 'featured'
        featured_courses_bylevel = courses_collection.find({'title': level})

        # Convertir les documents en liste et les documents BSON en JSON
        featured_list = list(featured_courses_bylevel)
        for item in featured_list:
            item["_id"] = str(item["_id"])  # Convertir Object_id en string pour JSON

        return featured_list
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
