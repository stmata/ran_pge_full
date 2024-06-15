from flask import Blueprint, request, jsonify, g
from app.services import vector_services, evalution_services,database_services
from datetime import datetime
from bson.objectid import ObjectId 
import json
from cachetools import TTLCache
from concurrent.futures import ThreadPoolExecutor
import asyncio

evalution_route = Blueprint('evalution_route', __name__)

users_collection = database_services.get_collection('users')

# ThreadPoolExecutor to execute tasks asynchronously
executor = ThreadPoolExecutor(max_workers=10)

# vector_store_cache = TTLCache(maxsize=100, ttl=3600)
# current_vector_store = None

@evalution_route.route('/evalution', methods=['POST'])
async def evalution():
    # global current_vector_store
    # cache_key = None
    try:
        data = request.get_json()
        quiz = data.get('quiz')
        print(quiz)
        
        user_id = data.get('userId')
        # cache_key = f"vector_store:{user_id}"

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
            # vector_store_cache[cache_key] = current_vector_store
            return jsonify(listEvaluation), 200
        # return jsonify({'message': 'Store processed and sent successfully'}), 200
        #  query = {
        #     "level": data.get('level'),
        #     "module": data.get('module'),
        #     "document": data.get('documentName'),
        #     "chapiter": data.get('chapterName')  # Assurez-vous que le champ dans MongoDB correspond à ce que vous recherchez
        # }
        # document = content_collection.find_one(query)
        # if document:
        #     text_brute = document.get('text_brute')
        #     print(text_brute)
        #     evaluation = evalution_services.get_quiz_data(text_brute)
        #     listEvaluation = evalution_services.string_to_list(evaluation)
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return jsonify({"error": error_message}), 500

    
@evalution_route.route('/users/<userId>/evaluation', methods=['POST'])
def save_evaluation(userId):
    try:
        data = request.get_json()
        # Préparation de l'objet d'évaluation avec des champs supplémentaires comme la date et l'heure
        evaluation = {
            "id": ObjectId(),  # Génère un nouvel ObjectId pour l'évaluation
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
            return jsonify({'message': 'Évaluation ajoutée avec succès'}), 200
        else:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de l'enregistrement de l'évaluation : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500

# Helper function to convert MongoDB documents (including ObjectId) to JSON
def mongo_to_json(data):
    """Convert MongoDB documents, which may contain ObjectId instances, to JSON."""
    return json.loads(json.dumps(data, default=lambda o: str(o) if isinstance(o, ObjectId) else o))

@evalution_route.route('/users/<userId>/evaluations', methods=['GET'])
def get_user_evaluations(userId):
    try:
        # Convert the userId to ObjectId and search for the user
        user = users_collection.find_one({"_id": ObjectId(userId)}, {"evaluations": 1})
        
        if user and "evaluations" in user:
            # Use the helper function to ensure ObjectId is serialized properly
            return jsonify(mongo_to_json(user['evaluations'])), 200
        elif user:
            return jsonify({'message': 'Aucune évaluation trouvée pour cet utilisateur'}), 404
        else:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des évaluations : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500


# new route added by cheikh
@evalution_route.route("/evalutionwithprompt", methods=['POST'])
async def evalutionwithprompt():
    try:
        data = request.json
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
            evaluation = await evalution_services.get_quiz_data_for_client_web(current_vector_store, level, nbrinnerList)
            listEvaluation = evalution_services.string_to_list(evaluation)
            return jsonify(listEvaluation), 200
        return jsonify({'message': 'Store processed and sent successfully'}), 200
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return jsonify({'error': error_message}), 500


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

@evalution_route.route('/getPlans', methods=['POST'])
async def getPlans():
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
        data = request.get_json()
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

        return jsonify(plans), 200

    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return jsonify({"error": error_message}), 500

# @evalution_route.route('/getPlans', methods=['POST'])
# async def getPlans():

#     try:
#         modulesname = [
#         "Module 1 : Premiers pas",
#         "Module 2 : Le Marketing Stratégique",
#         "Module 3 : Le Marketing Opérationnel - Le Produit et la Marque",
#         "Module 4 : Le Marketing Opérationnel - La Distribution",
#         "Module 5 : Le Marketing Opérationnel - Le Prix",
#         "Module 6 : Le Marketing Opérationnel - La Communication"
#         ]
#         data = request.get_json()
#         questions_by_module = data.get('questions')  
#         cours = data.get('cours') 
#         level = data.get('level') 

#         plans = {}
#         for module_key, module_questions in questions_by_module.items():
#             # Trouver le nom complet du module correspondant
#             full_module_name = next((name for name in modulesname if name.startswith(module_key)), None)
            
#             if full_module_name:
#                 blob_name = f'Partial/{level}/{cours}/{full_module_name}'
#                 #blob_name = f'General/{level}/{cours}'
#                 current_vector_store = vector_services.get_vector_store(blob_name)
#                 if current_vector_store:
#                     print(f"Vector store for {full_module_name}: {current_vector_store}")
#                     plan = await evalution_services.makePlanForStudent(current_vector_store, module_questions)
#                     plans[full_module_name] = plan
#                     print(f"Plan for {full_module_name}: {plan}")

#         return jsonify(plans), 200

#     except Exception as e:
#         error_message = f"Une erreur générale est survenue : {e}"
#         return jsonify({"error": error_message}), 500

#route pour les quizz offline utilisant le datafram QCM
@evalution_route.route('/qcmwithdatafram', methods=['POST'])
async def qcm_with_dataframe():
    """
    Endpoint to retrieve questions for a quiz in QCM format from a file.

    Expected JSON data:
    {
        "fileName": "Name of the file containing quiz questions"
    }

    Returns the quiz questions in JSON format or an error message if the file is not found.
    """
    try:
        data = request.get_json()
        course_name = data.get('courseName')
        level = data.get('level')
        file_name = data.get('fileName')
        
        # Récupérer les questions pour le fichier spécifié
        questions = evalution_services.quizz_qcm_offline(course_name,level,file_name)
        if questions:
            # Envoyer les questions en JSON
            print(questions)
            return jsonify(questions), 200
        else:
            return jsonify({'message': 'Fichier non trouvé ou erreur lors de la récupération des questions'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500

@evalution_route.route('/qouvertewithdatafram', methods=['POST'])
async def qouverte_with_dataframe():
    """
    Endpoint to retrieve questions for an open quiz from a file.

    Expected JSON data:
    {
        "fileName": "Name of the file containing quiz questions"
    }

    Returns the quiz questions in JSON format or an error message if the file is not found.
    """
    try:
        data = request.get_json()
        course_name = data.get('courseName')
        level = data.get('level')
        file_name = data.get('fileName') 
        
        # Récupérer les questions pour le fichier spécifié
        questions = evalution_services.quizz_ouverte_offline(course_name,level,file_name)
        if questions:
            # Envoyer les questions en JSON
            print(questions)
            return jsonify(questions), 200
        else:
            return jsonify({'message': 'Fichier non trouvé ou erreur lors de la récupération des questions'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500

@evalution_route.route('/evalgeneralwithdatafram/<subfolder_name>', methods=['POST'])
async def get_evaluations_general(subfolder_name):
    """
    Endpoint to retrieve questions from a general evaluation folder.

    Args:
    - subfolder_name: Subfolder name ('Ouverte' or 'QCM')

    Returns the quiz questions in JSON format or an error message if the subfolder is not valid or questions are not found.
    """
    try:
        data = request.get_json()
        course_name = data.get('courseName')
        level = data.get('level')

        # Vérifier si le sous-dossier est valide
        if subfolder_name not in ['Ouverte', 'QCM']:
            return jsonify({'error': 'Nom de sous-dossier non valide'}), 400

        # Appeler la méthode appropriée en fonction du sous-dossier
        if subfolder_name == 'Ouverte':
            questions = evalution_services.quizz_ouverte_offline_general(course_name,level)
        elif subfolder_name == 'QCM':
            questions = evalution_services.quizz_qcm_offline_general(course_name,level)
        
        # Vérifier si des questions ont été récupérées
        if questions:
            print(questions)
            return jsonify(questions), 200
        else:
            print(f'Aucune question trouvée dans le sous-dossier {subfolder_name}')
            return jsonify({'message': f'Aucune question trouvée dans le sous-dossier {subfolder_name}'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500

@evalution_route.route('/getReferenceswithdatafram', methods=['POST'])
async def get_references_with_dataframe():
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
        data = request.get_json()
        course_name = data.get('courseName')
        level = data.get('level')
        folder = data.get('folder')  
        file_name = data.get('fileName') 
        
        # Utilisez la méthode extract_questions_and_references pour extraire les questions et les références
        questions_and_references = evalution_services.extract_questions_and_references(course_name,level,folder, file_name)
        
        if questions_and_references is not None:
            # Retournez les questions et les références en JSON
            return jsonify(questions_and_references), 200
        else:
            return jsonify({'message': 'Fichier non trouvé ou erreur lors de la récupération des questions et des références'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération des questions et des références : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500


@evalution_route.route('/users/<userId>/add_evaluation_initiale', methods=['POST'])
def add_evaluation_initiale(userId):
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
        data = request.get_json()
        
        # Vérifier si l'utilisateur existe dans la base de données
        user = users_collection.find_one({"_id": ObjectId(userId)})
        if not user:
            return jsonify({'error': 'Utilisateur non trouvé'}), 404
        
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

        return jsonify({'message': 'Évaluation initiale ajoutée avec succès'}), 200

    except Exception as e:
        error_message = f"Une erreur est survenue lors de l'ajout de l'évaluation initiale : {e}"
        return jsonify({'error': error_message}), 500

@evalution_route.route('/users/<userId>/up_evaluation_initiale', methods=['PUT'])
def update_evaluation_initiale(userId):
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
        data = request.get_json()
        
        course_name = data.get("courseName")
        level = data.get("level")
        quiz_evaluated = data.get("quizEvaluated")
        open_evaluated = data.get("openEvaluated")
        
        if not course_name or not level or (quiz_evaluated is None and open_evaluated is None):
            return jsonify({'error': 'Invalid request data'}), 400

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
            return jsonify({'error': 'User or initial evaluation not found'}), 404

        return jsonify({'message': 'Initial evaluation updated successfully'}), 200

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la modification de l'évaluation initiale : {e}"
        return jsonify({'error': error_message}), 500


@evalution_route.route('/users/<userId>/get_evaluation_initiale', methods=['GET'])
def get_evaluation_initiale(userId):
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
            return jsonify(user['evaluationInitiale']), 200
        elif user:
            print("Aucune évaluation initiale trouvée pour cet utilisateur")
            return jsonify({'message': 'Aucune évaluation initiale trouvée pour cet utilisateur'}), 404
        else:
            print("Utilisateur non trouvé")
            return jsonify({'error': 'Utilisateur non trouvé'}), 404

    except Exception as e:
        error_message = f"Une erreur est survenue lors de la récupération de l'évaluation initiale : {e}"
        print(error_message)
        return jsonify({'error': error_message}), 500


@evalution_route.route('/compare_answers', methods=['POST'])
async def compare_answers():
    """
    Endpoint to compare answers using GPT-3.

    Expected JSON data:
    {
        "listToCorrect": ["Answer 1", "Answer 2", ...]
    }

    Returns results of answer comparisons.
    """
    try:
        data = request.get_json()
        listToCorrect = data.get('listToCorrect')
        results = evalution_services.compare_multiple_answers(listToCorrect)
        print(results)
        return jsonify({'results': results}), 200
    except Exception as e:
        error_message = f"An error occurred: {e}"
        print(error_message)
        return jsonify({"error": error_message}), 500

@evalution_route.route("/addorupdatestatusofdatafram/<course>/<level>/<evaluation_type>", methods=["PUT"])
async def update_status(course, level, evaluation_type):
    try:
        data = request.get_json()
        status = data.get("status")
        success = evalution_services.add_or_update_status(course, level, evaluation_type, status)
        if success:
            return jsonify({"message": "Status updated successfully"}), 200
        else:
            return jsonify({"error": f"Folder for {course}/{level}/{evaluation_type} not found"}), 404
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return jsonify({"error": error_message}), 500

@evalution_route.route("/checkstatusofdatafram/<course>/<level>/<evaluation_type>", methods=["GET"])
async def get_status(course, level, evaluation_type):
    try:
        status = await evalution_services.get_status(course, level, evaluation_type)
        return jsonify({"status": status}), 200
    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        return jsonify({"error": error_message,"status": False}), 500
