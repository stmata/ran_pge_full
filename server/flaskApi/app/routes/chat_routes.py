# from flask import Blueprint, request, jsonify
# from app.services import vector_services, chat_services
# import tempfile
# from pydub import AudioSegment
# from werkzeug.utils import secure_filename
# import os
# from cachetools import TTLCache

# chat_route = Blueprint('chat', __name__)

# from openai import OpenAI
# client = OpenAI()
# vector_store_cache = TTLCache(maxsize=100, ttl=3600)

# # Variable globale pour stocker temporairement le vector_store
# current_vector_store = None


# @chat_route.route('/chat', methods=['POST'])
# def chat():
#     global current_vector_store
#     cache_key = None
#     try:
#         if not request.content_type.startswith('multipart/form-data'):

#             data = request.get_json()
#             level = data.get('level')
#             module = data.get('module')
#             topicsName = data.get('topicsName')
#             user_id = data.get('userId')
#             cache_key = f"vector_store:{user_id}"

#             print(data)
           
#             # level = 'L3'
#             # module = 'Marketing'
#             # document = 'kotler'
#             # chapter = 'Chapter 1'
#             # type = 'Partial'

#             if not topicsName:
#                 blob_name = f'General/{level}/{module}'
#             else:
#                 blob_name = f'Partial/{level}/{module}/{topicsName}'
#             print(blob_name)
#             current_vector_store = vector_services.get_vector_store(blob_name)
#             vector_store_cache[cache_key] = current_vector_store
#             return jsonify({'message': 'vector store get avec succès'}),200
#         if request.content_type.startswith('multipart/form-data') and current_vector_store is not None:
#             user_id = request.form.get('userId')
#             cache_key = f"vector_store:{user_id}"
#             print(cache_key)
#             if cache_key in vector_store_cache:


#                 question = request.form.get('question')
#                 chat_id = request.form.get('chat_id')
#                 regenerate = request.form.get('regenerate')
#                 type = request.form.get('type')

#                 full_transcripts = ''
#                 vector_store_cache[cache_key] = current_vector_store
#                 if type == 'audio':
#                     if 'audio' not in request.files:
#                         return jsonify({'error': 'Aucun fichier audio fourni'}), 400

#                     audio_file = request.files['audio']

#                     try:
#                         # Création d'un fichier temporaire pour le M4A sans supprimer automatiquement
#                         tmp_m4a_path = tempfile.mktemp(suffix=".m4a")
#                         audio_file.save(tmp_m4a_path)
#                         print(f"Fichier temporaire m4a sauvegardé à {tmp_m4a_path}")
#                         with open(tmp_m4a_path, 'rb') as audio_file:
#                             transcription = client.audio.transcriptions.create(
#                                 model="whisper-1", 
#                                 file=audio_file, 
#                                 response_format="text",
#                             )
#                             print(transcription)

#                         full_transcripts = transcription
#                         question = full_transcripts
                        
#                     except Exception as e:
#                         print(f"Erreur lors de la conversion de l'audio : {e}")
#                         return jsonify({'error': f"Erreur lors de la conversion de l'audio : {e}"}), 500
#                     finally:
#                         # Nettoyage: Suppression des fichiers temporaires
#                         if os.path.exists(tmp_m4a_path):
#                             os.remove(tmp_m4a_path)
#                         # if os.path.exists(tmp_wav_path):
#                         #     os.remove(tmp_wav_path)


#                 # Les champs nécessaires ne sont pas tous présents, autre logique
#                 print("Champs nécessaires non présents, autre logique exécutée")
            
#                 # Passer l'historique à la méthode pour obtenir la chaîne de conversation
#                 conversation_chain = chat_services.get_conversation_chain(current_vector_store, memory_key=chat_id)

#                 if conversation_chain is not None:
#                     if regenerate :
#                         formatted_question = question
#                     else:
#                         formatted_question =f"Please answer the following question: {question} based on the specific content you have. If you do not find the answers do respond. Make sure you have the right respond."
                    
#                     # Utiliser la chaîne de conversation pour obtenir la réponse, en supposant que la méthode attend un dictionnaire
#                     answer = conversation_chain({'question': formatted_question})
#                     print(answer)

                
#                 return jsonify({'message': 'Autre logique exécutée avec succès', 'answer': answer['answer'], 'full_transcripts': full_transcripts}),200
#             else:
#                 error_message = 'Auncun donne envoyee'
#                 print(error_message)
#                 return jsonify({'error': error_message}), 400
     
#         else:
#             error_message = 'Auncun donne envoyee'
#             print(error_message)
#             return jsonify({'error': error_message}), 400


#     except Exception as e:
#         # Gestion des erreurs générales
#         error_message = f"Une erreur générale est survenue : {e}"
#         print(error_message)
#         return jsonify({"error": error_message}), 500

from flask import Blueprint, request, jsonify, Response
import time
import json
from app.services import vector_services, chat_services
import tempfile
from pydub import AudioSegment
from werkzeug.utils import secure_filename
import os
from cachetools import TTLCache
import requests
import pickle
import base64
from threading import Thread
from concurrent.futures import ThreadPoolExecutor


chat_route = Blueprint('chat', __name__)

from openai import OpenAI
client = OpenAI()

# vector_store_cache = TTLCache(maxsize=100, ttl=3600)

# # Variable globale pour stocker temporairement le vector_store
# current_vector_store = None

JSON_SERVER_URL = 'http://localhost:4000/vectorStores'

def get_all_vector_stores():
    response = requests.get(JSON_SERVER_URL)
    if response.ok:
        return response.json()  # Retourne la liste de tous les vectorStores
    else:
        return None

def store_vector_store(user_id, vector_store):
    # Récupérer tous les vectorStores existants
    all_vector_stores = get_all_vector_stores()
    
    if all_vector_stores:
        # Chercher si un vectorStore existe déjà pour ce userId
        existing_store = next((item for item in all_vector_stores if item['userId'] == user_id), None)
        
        if existing_store:
            # Si un vectorStore existe, mettre à jour ce vectorStore avec les nouvelles données
            store_id = existing_store['id']  # L'ID du vectorStore existant
            update_url = f"{JSON_SERVER_URL}/{store_id}"
            response = requests.put(update_url, json={'userId': user_id, 'vectorStore': vector_store})
            if response.ok:
                return store_id  # Retourne l'ID du vectorStore mis à jour
            else:
                return None
        else:
            # Si aucun vectorStore n'existe pour ce userId, créer un nouveau vectorStore
            return create_new_vector_store(user_id, vector_store)
    else:
        # Si la récupération des vectorStores échoue, considérer comme une erreur
        return None

def create_new_vector_store(user_id, vector_store):
    # Créer un nouveau vectorStore
    data = {'userId': user_id, 'vectorStore': vector_store}
    response = requests.post(JSON_SERVER_URL, json=data)
    if response.ok:
        return response.json()['id']  # Retourne l'ID généré par le serveur JSON
    else:
        return None


def get_vector_store_by_id(store_id):
    response = requests.get(f"{JSON_SERVER_URL}/{store_id}")
    if response.ok:
        return response.json()['vectorStore']
    else:
        return None

@chat_route.route('/chat/<store_id>', methods=['POST'])
def chat(store_id):
    # global current_vector_store
    # cache_key = None
    print(store_id)
    try:

        data = request.get_json()
        user_id = data.get('userId')

        if store_id == 'noID':
            level = data.get('level')
            module = data.get('module')
            topicsName = data.get('topicsName')
            if not topicsName:
                blob_name = f'General/{level}/{module}'
            else:
                blob_name = f'Partial/{level}/{module}/{topicsName}'
            print(blob_name)
            current_vector_store = vector_services.down_vector_store(blob_name)
            encoded_data = base64.b64encode(current_vector_store).decode('utf-8')
            store_id = store_vector_store(user_id, encoded_data)
            return jsonify({'message': 'vector store get avec succès','store_id':store_id}),200
        else:
            chat_id = data.get('chat_id')
            question_type = data.get('type')
            regenerate = data.get('regenerate')
            question = data.get('question')
            level = data.get('level')
         

            full_transcripts = ''
            vector = get_vector_store_by_id(store_id)
            encoded_data = base64.b64decode(vector)
            current_vector_store= vector_services.change_vector(encoded_data)

            # Récupération et décodage du fichier audio si le type est 'audio'
            if question_type == 'audio':
                try:
                    audio_base64 = data.get('audio')  # Contient l'audio en Base64
                    if not audio_base64:
                        return jsonify({'error': 'Aucun contenu audio trouvé'}), 400
                    
                    # Décoder le fichier audio de Base64 et le sauvegarder temporairement
                    audio_data = base64.b64decode(audio_base64)
                    with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp_file:
                        tmp_file.write(audio_data)
                        tmp_file_path = tmp_file.name
                        print(f"Fichier temporaire m4a sauvegardé à {tmp_file_path}")
                        with open(tmp_file_path, 'rb') as audio_file:
                            transcription = client.audio.transcriptions.create(
                                model="whisper-1", 
                                file=audio_file, 
                                response_format="text",
                            )
                            print(transcription)

                        full_transcripts = transcription
                        question = full_transcripts
                    
                except Exception as e:
                    print(f"Erreur lors de la conversion de l'audio : {e}")
                    return jsonify({'error': f"Erreur lors de la conversion de l'audio : {e}"}), 500
                finally:
                    # Nettoyage: Suppression des fichiers temporaires
                    if os.path.exists(tmp_file_path):
                        os.remove(tmp_file_path)
                    # if os.path.exists(tmp_wav_path):
                    #     os.remove(tmp_wav_path)


            # Les champs nécessaires ne sont pas tous présents, autre logique
            print("Champs nécessaires non présents, autre logique exécutée")
        
            # Passer l'historique à la méthode pour obtenir la chaîne de conversation
            conversation_chain = chat_services.get_conversation_chain(current_vector_store, memory_key=chat_id)

            if conversation_chain is not None:
                if regenerate :
                    formatted_question = question
                else:
                    #formatted_question =f"Please answer the following question: {question} based on the specific content you have. If you do not find the answers do respond. Make sure you have the right respond."
                    formatted_question =f"Please answer the following question: {question} based on the specific content you have. If you do not find the answers do respond. Make sure you have the right respond. It is not necessary to start the response by using the term 'based on the content provided'"
                    if level :
                        if level == "L3":
                            #formatted_question =f"Veuillez répondre à la question suivante : {question}, en vous basant sur le contenu spécifique à votre disposition. Si vous ne trouvez pas de réponse directe, fournissez tout de même une réponse pertinente. Assurez-vous que la réponse soit correcte. Il n'est pas nécessaire de commencer votre réponse par 'en fonction du contenu fourni'. Toutes les réponses doivent être formulées exclusivement en français."
                            formatted_question = f"""Veuillez fournir une réponse détaillée et informative à la question suivante : {question}, en vous basant sur le contenu spécifique à votre disposition. Si vous ne trouvez pas de réponse directe, fournissez tout de même une réponse pertinente. Assurez-vous que la réponse soit correcte. Il n'est pas nécessaire de commencer votre réponse par 'en fonction du contenu fourni'. Toutes les réponses doivent être formulées exclusivement en français et formatées en Markdown. Utilisez des puces ou des numéros pour formater la réponse si nécessaire, par exemple :
                                                - Option 1
                                                - Option 2
                                                - Option 3
                                                ou
                                                1. Option 1
                                                2. Option 2
                                                3. Option 3"""

                # Utiliser la chaîne de conversation pour obtenir la réponse, en supposant que la méthode attend un dictionnaire
                answer = conversation_chain({'question': formatted_question})
                #print(answer)

            
            return jsonify({'message': 'Autre logique exécutée avec succès', 'answer': answer['answer'], 'full_transcripts': full_transcripts}),200

    except Exception as e:
        # Gestion des erreurs générales
        error_message = f"Une erreur générale est survenue : {e}"
        print(error_message)
        return jsonify({"error": error_message}), 500


# def process_conversation(current_vector_store, chat_id, regenerate, question, level):
#     print("Champs nécessaires non présents, autre logique exécutée")
#     conversation_chain = chat_services.get_conversation_chain(current_vector_store, memory_key=chat_id)
#     if conversation_chain is not None:
#         if regenerate:
#             formatted_question = question
#         else:
#             formatted_question = f"Please answer the following question: {question} based on the specific content you have. If you do not find the answers do respond. Make sure you have the right respond. It is not necessary to start the response by using the term 'based on the content provided'"
#             if level:
#                 if level == "L3":
#                     formatted_question = f"""Veuillez fournir une réponse détaillée et informative à la question suivante : {question}, en vous basant sur le contenu spécifique à votre disposition. Si vous ne trouvez pas de réponse directe, fournissez tout de même une réponse pertinente. Assurez-vous que la réponse soit correcte. Il n'est pas nécessaire de commencer votre réponse par 'en fonction du contenu fourni'. Toutes les réponses doivent être formulées exclusivement en français et formatées en Markdown. Utilisez des puces ou des numéros pour formater la réponse si nécessaire, par exemple :
#                                             - Option 1
#                                             - Option 2
#                                             - Option 3
#                                             ou
#                                             1. Option 1
#                                             2. Option 2
#                                             3. Option 3"""
#         answer = conversation_chain({'question': formatted_question})
#         print(answer)
#         return answer

# @chat_route.route('/chat/<store_id>', methods=['POST'])
# def chat(store_id):
#     try:
#         data = request.get_json()
#         user_id = data.get('userId')

#         if store_id == 'noID':
#             level = data.get('level')
#             module = data.get('module')
#             topicsName = data.get('topicsName')
#             if not topicsName:
#                 blob_name = f'General/{level}/{module}'
#             else:
#                 blob_name = f'Partial/{level}/{module}/{topicsName}'
#             current_vector_store = vector_services.down_vector_store(blob_name)
#             encoded_data = base64.b64encode(current_vector_store).decode('utf-8')
#             store_id = store_vector_store(user_id, encoded_data)
#             return jsonify({'message': 'vector store get avec succès','store_id':store_id}),200
#         else:
#             chat_id = data.get('chat_id')
#             question_type = data.get('type')
#             regenerate = data.get('regenerate')
#             question = data.get('question')
#             level = data.get('level')
#             full_transcripts = ''
#             vector = get_vector_store_by_id(store_id)
#             encoded_data = base64.b64decode(vector)
#             current_vector_store = vector_services.change_vector(encoded_data)

#             if question_type == 'audio':
#                 try:
#                     audio_base64 = data.get('audio')
#                     if not audio_base64:
#                         return jsonify({'error': 'Aucun contenu audio trouvé'}), 400
                    
#                     audio_data = base64.b64decode(audio_base64)
#                     with tempfile.NamedTemporaryFile(delete=False, suffix='.m4a') as tmp_file:
#                         tmp_file.write(audio_data)
#                         tmp_file_path = tmp_file.name
#                         print(f"Fichier temporaire m4a sauvegardé à {tmp_file_path}")
#                         with open(tmp_file_path, 'rb') as audio_file:
#                             transcription = client.audio.transcriptions.create(
#                                 model="whisper-1", 
#                                 file=audio_file, 
#                                 response_format="text",
#                             )

#                         full_transcripts = transcription
#                         question = full_transcripts
                    
#                 except Exception as e:
#                     print(f"Erreur lors de la conversion de l'audio : {e}")
#                     return jsonify({'error': f"Erreur lors de la conversion de l'audio : {e}"}), 500
#                 finally:
#                     if os.path.exists(tmp_file_path):
#                         os.remove(tmp_file_path)


#             #conversation_thread = Thread(target=process_conversation, args=(current_vector_store, chat_id, regenerate, question, level))
#             #conversation_thread.start()
#             conversation_thread = ThreadPoolExecutor().submit(process_conversation, current_vector_store, chat_id, regenerate, question, level)
#             answer = conversation_thread.result()
#             return jsonify({'message': 'Autre logique exécutée avec succès', 'answer': answer['answer'], 'full_transcripts': full_transcripts}), 200
#             # Attendre que le thread soit terminé pour récupérer la réponse
#             #conversation_thread.join()

#             #return jsonify({'message': 'Autre logique exécutée avec succès', 'answer': conversation_thread.result, 'full_transcripts': full_transcripts}), 200

#     except Exception as e:
#         error_message = f"Une erreur générale est survenue : {e}"
#         print(error_message)
#         return jsonify({"error": error_message}), 500

