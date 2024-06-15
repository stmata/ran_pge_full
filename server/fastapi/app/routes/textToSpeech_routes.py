from fastapi import APIRouter, Request, HTTPException
from app.services import speech_services
import threading

router = APIRouter()
audio_cache = {}  # Cache pour stocker l'audio pré-généré

def generate_and_cache_speech(text, voice):
    audio_base64 = speech_services.generate_speech(text, voice)
    audio_cache[(text, voice)] = audio_base64

@router.post('/textToSpeech')
async def text_to_speech(request: Request):
    try:
        data = await request.json()
        if not data:
            raise HTTPException(status_code=400, detail="No JSON data provided")
        
        text = data.get('text')
        voice = data.get('voice')
        
        # Vérifie si la réponse est déjà dans le cache
        cache_key = (text, voice)
        if cache_key in audio_cache:
            return {"audioBase64": audio_cache[cache_key]}

        # Si ce n'est pas dans le cache, génère l'audio
        audio_base64 = speech_services.generate_speech(text, voice)
        
        # Stocke le résultat dans le cache pour les futures requêtes
        audio_cache[cache_key] = audio_base64
        
        # En option, lance un thread pour pré-générer et mettre en cache des réponses courantes
        threading.Thread(target=generate_and_cache_speech, args=(text, voice)).start()
        
        return {"audioBase64": audio_base64}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
