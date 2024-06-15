from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
import uuid
from datetime import datetime
from app.services import database_services

course_routes = Blueprint('course_routes', __name__)

courses_collection = database_services.get_collection('featured')

@course_routes.route('/featured', methods=['GET'])
def get_all_featured():
    try:
        # Récupérer tous les documents dans la collection 'featured'
        featured_courses = courses_collection.find({})
        
        # Convertir les documents en liste et les documents BSON en JSON
        featured_list = list(featured_courses)
        for item in featured_list:
            item["_id"] = str(item["_id"])  # Convertir Object_id en string pour JSON
        
        return jsonify(featured_list)
    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

@course_routes.route('/get_user_courses/<level>', methods=['POST'])
def get_courses_by_level(level):
        try:
        # Récupérer tous les documents dans la collection 'featured'
            featured_courses_bylevel = courses_collection.find({'title': level})
            
            # Convertir les documents en liste et les documents BSON en JSON
            featured_list = list(featured_courses_bylevel)
            for item in featured_list:
                item["_id"] = str(item["_id"])  # Convertir Object_id en string pour JSON
            
            return jsonify(featured_list)
        except Exception as e:
            print(str(e))
            return jsonify({"error": str(e)}), 500