from flask import Blueprint, request, jsonify
from app.services import speech_services
import threading

textToSpeech_routes = Blueprint('textToSpeech_routes', __name__)
audio_cache = {}  # Cache to store pre-generated audio

def generate_and_cache_speech(text, voice):
    audio_base64 = speech_services.generate_speech(text, voice)
    audio_cache[(text, voice)] = audio_base64

@textToSpeech_routes.route('/textToSpeech', methods=['POST'])
def textToSpeech():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Aucune donnée JSON fournie"}), 400
        
        text = data.get('text')
        voice = data.get('voice')
        
        # Check if the response is already in the cache
        cache_key = (text, voice)
        if cache_key in audio_cache:
            return jsonify({"audioBase64": audio_cache[cache_key]})

        # If not in cache, generate audio
        audio_base64 = speech_services.generate_speech(text, voice)
        
        # Store the result in the cache for future requests
        audio_cache[cache_key] = audio_base64
        
        # Optionally, spawn a thread to pre-generate and cache common responses
        threading.Thread(target=generate_and_cache_speech, args=(text, voice)).start()
        
        return jsonify({"audioBase64": audio_base64})

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

