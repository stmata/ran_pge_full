from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.responses import JSONResponse, StreamingResponse
from typing import Dict
import time
import json
from app.services import vector_services, chat_services
import tempfile
from pydub import AudioSegment
import os
import base64
from threading import Thread
from concurrent.futures import ThreadPoolExecutor
import requests
import pickle 
from openai import OpenAI

client = OpenAI()

JSON_SERVER_URL = 'http://localhost:4000/vectorStores'


chat_route = APIRouter()

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
    
@chat_route.post("/chat/{store_id}", response_model=Dict)
async def chat(store_id: str, request: Request):
    try:
        data = await request.json()
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
            return JSONResponse(content={'message': 'vector store get avec succès', 'store_id': store_id}, status_code=200)
        else:
            chat_id = data.get('chat_id')
            question_type = data.get('type')
            regenerate = data.get('regenerate')
            question = data.get('question')
            level = data.get('level')

            full_transcripts = ''
            vector = get_vector_store_by_id(store_id)
            encoded_data = base64.b64decode(vector)
            current_vector_store = vector_services.change_vector(encoded_data)

            # Récupération et décodage du fichier audio si le type est 'audio'
            if question_type == 'audio':
                try:
                    audio_base64 = data.get('audio')  # Contient l'audio en Base64
                    if not audio_base64:
                        return JSONResponse(content={'error': 'Aucun contenu audio trouvé'}, status_code=400)

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
                    return JSONResponse(content={'error': f"Erreur lors de la conversion de l'audio : {e}"}, status_code=500)
                finally:
                    # Nettoyage: Suppression des fichiers temporaires
                    if os.path.exists(tmp_file_path):
                        os.remove(tmp_file_path)

            # Les champs nécessaires ne sont pas tous présents, autre logique
            print("Champs nécessaires non présents, autre logique exécutée")

            # Passer l'historique à la méthode pour obtenir la chaîne de conversation
            conversation_chain = chat_services.get_conversation_chain(current_vector_store, memory_key=chat_id)

            if conversation_chain is not None:
                if regenerate:
                    formatted_question = question
                else:
                    formatted_question = f"Please answer the following question: {question} based on the specific content you have. If you do not find the answers do respond. Make sure you have the right respond. It is not necessary to start the response by using the term 'based on the content provided'"
                    if level:
                        if level == "L3":
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

            return JSONResponse(content={'message': 'Autre logique exécutée avec succès', 'answer': answer['answer'], 'full_transcripts': full_transcripts}, status_code=200)

    except Exception as e:
        # Gestion des erreurs générales
        error_message = f"Une erreur générale est survenue : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)


# @chat_route.websocket("/ws/{user_id}")
# async def websocket_endpoint(user_id: str, websocket: WebSocket):
#     await websocket_service.connect(user_id, websocket)
#     try:
#         while True:
#             await websocket.receive_text()  # Ignore messages for now
#     except WebSocketDisconnect:
#         websocket_service.disconnect(user_id)

@chat_route.post("/chat2/{store_id}", response_model=Dict)
async def chat(store_id: str, request: Request):
    try:
        data = await request.json()
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
            return JSONResponse(content={'message': 'vector store get avec succès', 'store_id': store_id}, status_code=200)
        else:
            chat_id = data.get('chat_id')
            question_type = data.get('type')
            regenerate = data.get('regenerate')
            question = data.get('question')
            level = data.get('level')

            full_transcripts = ''
            vector = get_vector_store_by_id(store_id)
            encoded_data = base64.b64decode(vector)
            current_vector_store = vector_services.change_vector(encoded_data)

            # Récupération et décodage du fichier audio si le type est 'audio'
            if question_type == 'audio':
                try:
                    audio_base64 = data.get('audio')  # Contient l'audio en Base64
                    if not audio_base64:
                        return JSONResponse(content={'error': 'Aucun contenu audio trouvé'}, status_code=400)

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
                    return JSONResponse(content={'error': f"Erreur lors de la conversion de l'audio : {e}"}, status_code=500)
                finally:
                    # Nettoyage: Suppression des fichiers temporaires
                    if os.path.exists(tmp_file_path):
                        os.remove(tmp_file_path)

            # Les champs nécessaires ne sont pas tous présents, autre logique
            print("Champs nécessaires non présents, autre logique exécutée")
            
            conversation_chain = chat_services.get_conversation_chain(current_vector_store)

            if conversation_chain is not None:
                if regenerate:
                    formatted_question = question
                else:
                    formatted_question = f"Please answer the following question: {question} based on the specific content you have. If you do not find the answers do respond. Make sure you have the right respond. It is not necessary to start the response by using the term 'based on the content provided'"
                    if level:
                        if level == "L3":
                            formatted_question = f"""Veuillez fournir une réponse détaillée et informative à la question suivante : {question}, en vous basant sur le contenu spécifique à votre disposition. Si vous ne trouvez pas de réponse directe, fournissez tout de même une réponse pertinente. Assurez-vous que la réponse soit correcte. Il n'est pas nécessaire de commencer votre réponse par 'en fonction du contenu fourni'. Toutes les réponses doivent être formulées exclusivement en français et formatées en Markdown. Utilisez des puces ou des numéros pour formater la réponse si nécessaire, par exemple :
                                                    - Option 1
                                                    - Option 2
                                                    - Option 3
                                                    ou
                                                    1. Option 1
                                                    2. Option 2
                                                    3. Option 3"""

                # Utiliser la chaîne de conversation pour obtenir la réponse en streaming
                response_generator = chat_services.stream_chat_response(formatted_question, current_vector_store)
                return StreamingResponse(response_generator, media_type='text/event-stream')

    except Exception as e:
        # Gestion des erreurs générales
        error_message = f"Une erreur générale est survenue : {e}"
        print(error_message)
        return JSONResponse(content={'error': error_message}, status_code=500)