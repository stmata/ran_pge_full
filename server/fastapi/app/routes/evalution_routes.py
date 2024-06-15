from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse
from fastapi.param_functions import Body
from typing import List, Dict, Optional
from datetime import datetime
from bson.objectid import ObjectId
import json
from concurrent.futures import ThreadPoolExecutor
import asyncio

from app.services import vector_services, evalution_services, database_services

evalution_router = APIRouter()

users_collection = database_services.get_collection('users')

# ThreadPoolExecutor to execute tasks asynchronously
executor = ThreadPoolExecutor(max_workers=10)

# Helper function to convert MongoDB documents (including ObjectId) to JSON
def mongo_to_json(data):
    """Convert MongoDB documents, which may contain ObjectId instances, to JSON."""
    return json.loads(json.dumps(data, default=lambda o: str(o) if isinstance(o, ObjectId) else o))

@evalution_router.post("/evalution/", response_model=List[Dict])
async def evalution(request: Request):
    try:
        data = await request.json()
        quiz = data.get('quiz')
        print(quiz)

        user_id = data.get('userId')

        level = data.get('level')
        module = data.get('module')
        topicsName = data.get('topicsName')
        chapter = data.get('chapterName')

        if not topicsName:
            blob_name = f'General/{level}/{module}'
        else:
            blob_name = f'Partial/{level}/{module}/{topicsName}'
        print(blob_name)
        current_vector_store = vector_services.get_vector_store(blob_name)
        if current_vector_store:
            evaluation = await evalution_services.get_quiz_data(current_vector_store,level)
            listEvaluation = evalution_services.string_to_list(evaluation)
            return JSONResponse(content=listEvaluation, status_code=200)
        return JSONResponse(content={'message': 'Store processed and sent successfully'}, status_code=200)
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return JSONResponse(content={'error': error_message}, status_code=500)

@evalution_router.post("/evalutionwithprompt/", response_model=List[Dict])
async def evalutionwithprompt(request: Request):
    try:
        data = await request.json()
        level = data.get('level')
        module = data.get('module')
        topicsName = data.get('topicsName')
        nbrinnerList = data.get('nbrinnerList')

        if not topicsName or (topicsName == "Evaluation Globale" or topicsName == "Global Evaluation"):
            blob_name = f'General/{level}/{module}'
        else:
            blob_name = f'Partial/{level}/{module}/{topicsName}'
        print(blob_name)
        current_vector_store = vector_services.get_vector_store(blob_name)
        if current_vector_store:
            evaluation = await evalution_services.get_quiz_data_for_client_web(current_vector_store,level,nbrinnerList)
            listEvaluation = evalution_services.string_to_list(evaluation)
            return JSONResponse(content=listEvaluation, status_code=200)
        return JSONResponse(content={'message': 'Store processed and sent successfully'}, status_code=200)
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return JSONResponse(content={'error': error_message}, status_code=500)

@evalution_router.post("/users/{userId}/evaluation", response_model=Dict)
async def save_evaluation(userId: str, request: Request):
    try:
        data = await request.json()

        # Préparation de l'objet d'évaluation avec des champs supplémentaires comme la date et l'heure
        evaluation = {
            "id": str(ObjectId()),  # Génère un nouvel ObjectId pour l'évaluation
            "courseName": data.get("courseName"),
            "note": data.get("note"),
            "date": datetime.now().strftime('%Y-%m-%d'),
            "time": data.get("time"),
            "chapterName": data.get("chapterName")
        }

        # Utilisation de l'opérateur $push pour ajouter la nouvelle évaluation
        # au tableau evaluations de l'utilisateur spécifié
        result = users_collection.update_one(
            {"_id": ObjectId(userId)},
            {"$push": {"evaluations": evaluation}}
        )

        # Vérifier si l'utilisateur a été trouvé et mis à jour
        if result.matched_count:
            return JSONResponse(content={'message': 'Évaluation ajoutée avec succès'}, status_code=200)
        else:
            return JSONResponse(content={'error': 'Utilisateur non trouvé'}, status_code=404)
    except Exception as e:
        error_message = f"Une erreur est survenue lors de l'enregistrement de l'évaluation : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)
    
@evalution_router.get("/users/{userId}/evaluation", response_model=List[Dict])
async def get_user_evaluations(userId: str):
    try:
        # Convert the userId to ObjectId and search for the user
        user = users_collection.find_one({"_id": ObjectId(userId)}, {"evaluations": 1})

        if user and "evaluations" in user:
            # Use the helper function to ensure ObjectId is serialized properly
            return JSONResponse(content=mongo_to_json(user['evaluations']))
        elif user:
            return {'message': 'Aucune évaluation trouvée pour cet utilisateur'}
        else:
            raise HTTPException(status_code=404, detail='Utilisateur non trouvé')
    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des évaluations : {e}"
        print(error_message)
        raise HTTPException(status_code=500, detail=error_message)
    
async def get_plan_for_module(level, cours, full_module_name, module_questions):
    """
    Asynchronously retrieves plans for a module using a thread pool executor.

    Args:
    - level: Level of the module
    - cours: Course name
    - full_module_name: Full module name
    - module_questions: Questions for the module

    Returns:
    - Tuple containing module name and plan
    """

    blob_name = f'Partial/{level}/{cours}/{full_module_name}'
    loop = asyncio.get_event_loop()
    current_vector_store = await loop.run_in_executor(
        executor, vector_services.get_vector_store, blob_name
    )
    if current_vector_store:
        plan = await evalution_services.makePlanForStudent(current_vector_store,level, module_questions)
        return full_module_name, plan
    return full_module_name, None

@evalution_router.post("/getPlans", response_model=Dict[str, List])
async def getPlans(request: Request):
    """
    Endpoint to retrieve plans for multiple modules.

    Expected JSON data:
    {
        "questions": {
            "Module 1": ["Question 1", "Question 2"],
            ...
        },
        "cours": "Course name",
        "level": "Course level"
    }

    Returns plans for each module.
    """

    try:
        modulesnameL3 = [
            "Module 1 : Premiers pas",
            "Module 2 : Le Marketing Stratégique",
            "Module 3 : Le Marketing Opérationnel - Le Produit et la Marque",
            "Module 4 : Le Marketing Opérationnel - La Distribution",
            "Module 5 : Le Marketing Opérationnel - Le Prix",
            "Module 6 : Le Marketing Opérationnel - La Communication"
        ]

        modulesnameM1 = [
            "Session1",
            "Session2",
            "Session3",
            "Session4",
            "Session5",
        ]

        modulesname = []
        data = await request.json()
        questions_by_module = data.get('questions')
        cours = data.get('cours')
        level = data.get('level')
        if level == 'L3':
            modulesname = modulesnameL3
        elif level == 'M1':
            modulesname = modulesnameM1
        tasks = []
        for module_key, module_questions in questions_by_module.items():
            full_module_name = next((name for name in modulesname if name.startswith(module_key)), None)
            if full_module_name:
                tasks.append(get_plan_for_module(level, cours, full_module_name, module_questions))
                print(f"Plan for {full_module_name}: {tasks}")

        plans = {}
        for task in asyncio.as_completed(tasks):
            full_module_name, plan = await task
            if plan:
                print(f"Plan for {full_module_name} is ready: {plan}")
                plans[full_module_name] = plan

        return JSONResponse(content=plans, status_code=200)

    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return JSONResponse(content={'error': error_message}, status_code=500)
    
@evalution_router.post("/qcmwithdatafram", response_model=List[Dict])
async def qcm_with_dataframe(request: Request):
    """
    Endpoint to retrieve questions for a quiz in QCM format from a file.

    Expected JSON data:
    {
       "courseName": "Name of the course",
        "level": "Level of the course",
        "fileName": "Name of the file containing open-ended quiz questions"
    }

    Returns the quiz questions in JSON format or an error message if the file is not found.
    """
    try:
        data = await request.json()
        course_name = data.get('courseName')
        level = data.get('level')
        file_name = data.get('fileName')

        # Récupérer les questions pour le fichier spécifié
        questions = evalution_services.quizz_qcm_offline(course_name,level,file_name)
        if questions:
            # Envoyer les questions en JSON
            print(questions)
            return JSONResponse(content=questions, status_code=200)
        else:
            return JSONResponse(content={'message': 'Fichier non trouvé ou erreur lors de la récupération des questions'}, status_code=404)

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)
    
@evalution_router.post("/qouvertewithdatafram", response_model=List[Dict])
async def qouverte_with_dataframe(request: Request):
    """
    Endpoint to retrieve questions for an open quiz from a file.

    Expected JSON data:
    {
        "courseName": "Name of the course",
        "level": "Level of the course",
        "fileName": "Name of the file containing open-ended quiz questions"
    }

    Returns the quiz questions in JSON format or an error message if the file is not found.
    """
    try:
        data = await request.json()
        course_name = data.get('courseName')
        level = data.get('level')
        file_name = data.get('fileName')

        # Récupérer les questions pour le fichier spécifié
        questions = evalution_services.quizz_ouverte_offline(course_name,level,file_name)
        if questions:
            # Envoyer les questions en JSON
            print(questions)
            return JSONResponse(content=questions, status_code=200)
        else:
            return JSONResponse(content={'message': 'Fichier non trouvé ou erreur lors de la récupération des questions'}, status_code=404)

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)
    
@evalution_router.post("/evalgeneralwithdatafram/{subfolder_name}", response_model=List[Dict])
async def get_evaluations_general(subfolder_name: str, request: Request):
    """
    Endpoint to retrieve questions from a general evaluation folder.

    Args:
    - subfolder_name: Subfolder name ('Ouverte' or 'QCM')

    Returns the quiz questions in JSON format or an error message if the subfolder is not valid or questions are not found.
    """
    try:
        data = await request.json()
        course_name = data.get('courseName')
        level = data.get('level')
        # Vérifier si le sous-dossier est valide
        if subfolder_name not in ['Ouverte', 'QCM']:
            return JSONResponse(content={'error': 'Nom de sous-dossier non valide'}, status_code=400)

        # Appeler la méthode appropriée en fonction du sous-dossier
        if subfolder_name == 'Ouverte':
            questions = evalution_services.quizz_ouverte_offline_general(course_name,level)
        elif subfolder_name == 'QCM':
            questions = evalution_services.quizz_qcm_offline_general(course_name,level)

        # Vérifier si des questions ont été récupérées
        if questions:
            print(questions)
            return JSONResponse(content=questions, status_code=200)
        else:
            print(f'Aucune question trouvée dans le sous-dossier {subfolder_name}')
            return JSONResponse(content={'message': f'Aucune question trouvée dans le sous-dossier {subfolder_name}'}, status_code=404)

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)
    

@evalution_router.post("/getReferenceswithdatafram", response_model=List[Dict])
async def get_references_with_dataframe(request: Request):
    """
    Endpoint to retrieve questions and references from a specified folder and file.

    Expected JSON data:
    {
        "folder": "Folder name",
        "fileName": "Name of the file containing questions and references"
    }

    Returns the questions and references in JSON format or an error message if the file is not found.
    """
    try:
        data = await request.json()
        course_name = data.get('courseName')
        level = data.get('level')
        folder = data.get('folder')
        file_name = data.get('fileName')

        # Utilisez la méthode extract_questions_and_references pour extraire les questions et les références
        questions_and_references = evalution_services.extract_questions_and_references(course_name,level,folder, file_name)

        if questions_and_references is not None:
            # Retournez les questions et les références en JSON
            return JSONResponse(content=questions_and_references, status_code=200)
        else:
            return JSONResponse(content={'message': 'Fichier non trouvé ou erreur lors de la récupération des questions et des références'}, status_code=404)

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions et des références : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)
    

@evalution_router.post("/users/{userId}/add_evaluation_initiale", response_model=Dict)
async def add_evaluation_initiale(userId: str, request: Request):
    """
    Endpoint to add an initial evaluation for a user.

    Expected JSON data:
    {
        "courseName": "Name of the course",
        "level": "L3/M1",
        "quizEvaluated": true/false or "openEvaluated": true/false
    }

    Returns a success message or an error if the user is not found.
    """
    try:
        data = await request.json()
        
        # Vérifier si l'utilisateur existe dans la base de données
        user = users_collection.find_one({"_id": ObjectId(userId)})
        if not user:
            return JSONResponse(content={'error': 'Utilisateur non trouvé'}, status_code=404)
        
        # Initialiser la liste d'évaluations initiales s'il n'existe pas encore
        if "evaluationInitiale" not in user:
            user["evaluationInitiale"] = []
        
        # Préparation de l'objet d'évaluation initiale avec la date actuelle
        evaluation_initiale = {
            "quizEvaluated": data.get("quizEvaluated"),
            "openEvaluated": data.get("openEvaluated"),
            "date": datetime.now().strftime('%Y-%m-%d')
        }
        
        # Si une certaine évaluation n'est pas fournie, la définir comme False
        if "quizEvaluated" not in data:
            evaluation_initiale["quizEvaluated"] = False
        if "openEvaluated" not in data:
            evaluation_initiale["openEvaluated"] = False
        
        # Ajouter l'évaluation initiale pour le cours et le niveau spécifiés
        level = data.get("level")
        # Rechercher l'index de l'évaluation pour ce cours
        index = next((i for i, eval_item in enumerate(user["evaluationInitiale"]) if eval_item["courseName"] == data["courseName"]), None)
        if index is not None:
            # Ajouter l'évaluation au niveau spécifié
            user["evaluationInitiale"][index][level] = [evaluation_initiale]
        else:
            # Ajouter une nouvelle entrée pour ce cours avec l'évaluation
            user["evaluationInitiale"].append({
                "courseName": data["courseName"],
                level: [evaluation_initiale]
            })
        
        # Mettre à jour l'utilisateur dans la base de données
        users_collection.update_one(
            {"_id": ObjectId(userId)},
            {"$set": {"evaluationInitiale": user["evaluationInitiale"]}}
        )

        print("Évaluation initiale ajoutée avec succès")
        return JSONResponse(content={'message': 'Évaluation initiale ajoutée avec succès'}, status_code=200)

    except Exception as e:
        error_message = f"Une erreur est survenue lors de l'ajout de l'évaluation initiale : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)


    
@evalution_router.put("/users/{userId}/up_evaluation_initiale", response_model=Dict)
async def update_evaluation_initiale(userId: str, request: Request):
    """
    Endpoint to update an initial evaluation for a user.

    Expected JSON data:
    {
        "courseName": "Name of the course",
        "level": "L3/M1",
        "quizEvaluated": true/false or "openEvaluated": true/false
    }

    Returns a success message or an error if the initial evaluation or user is not found.
    """
    try:
        data = await request.json()
        
        course_name = data.get("courseName")
        level = data.get("level")
        quiz_evaluated = data.get("quizEvaluated")
        open_evaluated = data.get("openEvaluated")
        
        if not course_name or not level or (quiz_evaluated is None and open_evaluated is None):
            raise HTTPException(status_code=400, detail="Invalid request data")

        # Création de la requête de mise à jour dynamique
        update_query = {}
        if quiz_evaluated is not None:
            update_query[f"evaluationInitiale.$[elem].{level}.$[levelElem].quizEvaluated"] = quiz_evaluated
        if open_evaluated is not None:
            update_query[f"evaluationInitiale.$[elem].{level}.$[levelElem].openEvaluated"] = open_evaluated
        
        # Tentative de mise à jour de l'utilisateur
        result = users_collection.update_one(
            {"_id": ObjectId(userId), "evaluationInitiale.courseName": course_name},
            {"$set": update_query},
            array_filters=[
                {"elem.courseName": course_name},
                {"levelElem.date": {"$exists": True}}
            ]
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="User or initial evaluation not found")

        return {"message": "Initial evaluation updated successfully"}

    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        error_message = f"Une erreur est survenue lors de la modification de l'évaluation initiale : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)



    
@evalution_router.get("/users/{userId}/get_evaluation_initiale", response_model=List[Dict])
async def get_evaluation_initiale(userId: str):
    """
    Endpoint to retrieve the initial evaluation for a user.

    Parameters:
    - userId: The ID of the user whose initial evaluation is to be retrieved.

    Returns the initial evaluation data for the user if found, or an appropriate error message
    if the user or the initial evaluation is not found.
    """
    try:
        user = users_collection.find_one({"_id": ObjectId(userId)}, {"evaluationInitiale": 1})

        if user and "evaluationInitiale" in user:
            print(user['evaluationInitiale'])
            return JSONResponse(content=user['evaluationInitiale'], status_code=200)
        elif user:
            print("Aucune évaluation initiale trouvée pour cet utilisateur")
            return JSONResponse(content={'message': 'Aucune évaluation initiale trouvée pour cet utilisateur'}, status_code=404)
        else:
            print("Utilisateur non trouvé")
            return JSONResponse(content={'error': 'Utilisateur non trouvé'}, status_code=404)

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération de l'évaluation initiale : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)
    
@evalution_router.post("/compare_answers", response_model=List[Dict])
async def compare_answers(request: Request):
    """
    Endpoint to compare answers using GPT-3.

    Expected JSON data:
    {
        "listToCorrect": ["Answer 1", "Answer 2", ...]
    }

    Returns results of answer comparisons.
    """
    try:
        data = await request.json()
        listToCorrect = data.get('listToCorrect')
        results = evalution_services.compare_multiple_answers(listToCorrect)
        print(results)
        return JSONResponse(content={'results': results}, status_code=200)
    except Exception as e:
        error_message = f"An error occurred: {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)

@evalution_router.put("/addorupdatestatusofdatafram/{course}/{level}/{evaluation_type}", response_model=Dict)
async def update_status(course: str, level: str, evaluation_type: str, request: Request):
    try:
        data = await request.json()
        status = data.get('status')
        success = evalution_services.add_or_update_status(course, level, evaluation_type, status)
        if success:
            return JSONResponse(content={'message': 'Status updated successfully'}, status_code=200)
        else:
            return JSONResponse(content={'error': f"Folder for {course}/{level}/{evaluation_type} not found"}, status_code=404)
    except HTTPException as e:
        return JSONResponse(content={'error': str(e)}, status_code=e.status_code)
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return JSONResponse(content={'error': error_message}, status_code=500)

@evalution_router.get("/checkstatusofdatafram/{course}/{level}/{evaluation_type}", response_model=Dict)
async def get_status(course: str, level: str, evaluation_type: str):
    try:
        status = await evalution_services.get_status(course, level, evaluation_type)
        return JSONResponse(content={'status': status}, status_code=200)
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return JSONResponse(content={'error': error_message}, status_code=500)
