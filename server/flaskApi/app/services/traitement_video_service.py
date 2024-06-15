from flask import request, jsonify
from .extractors_service import Extractor
from .unify_service import DataSaver
from .database_service import MongoDBManager
from .contentcheck_service import ContentChecker
from .processor_service import TranscriptProcessor
from .transcript_service import TranscriptionService
from pydub import AudioSegment
import tempfile
import os
import time

class Video:
    def __init__(self):
        self.db_manager = MongoDBManager()
        self.extractor = Extractor()
        self.unify_service = DataSaver() 
        self.checkContent = ContentChecker()
        self.process = TranscriptProcessor()
        self.transc = TranscriptionService()
        self.collection = self.db_manager.get_collection("Content")

    def traitement_video(self, data):
        temp_30_sec_start_filename = None  
        temp_30_sec_end_filename = None
        try:
            if 'video_file' not in data:
                return jsonify({"error": "Aucun fichier vidéo fourni", "message": "Video file not provided"}), 400
            # Vérification des champs obligatoires
            if not all(key in data for key in ['Title', 'Level', 'course_name']):
                return jsonify({"error": "Level, titre et module requis", "message": "Level, title, and module required"}), 400
            
            video_file = data['video_file']
            title = data.get('Title')
            level = data.get('Level')
            module = data.get('course_name')
            topic = data.get('topic')
            print(video_file)
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as audio_temp:
                audio_extraction_start_time = time.time()
                self.extractor.extract_audio(video_file, audio_temp.name)
                audio_extraction_end_time = time.time()
                audioExtractTime = audio_extraction_end_time - audio_extraction_start_time
                
                audio_load_start_time = time.time()
                audio = AudioSegment.from_file(audio_temp.name)
                audio_load_end_time = time.time()
                audioChargedTime = audio_load_end_time - audio_load_start_time

                audio_30_sec_start = audio[:30000]
                temp_30_sec_start_filename = audio_temp.name.replace('.wav', '_30sec_start.wav')
                audio_30_sec_start.export(temp_30_sec_start_filename, format="wav")

                transcript_start = self.transc.transcribe_recognize_whisper(temp_30_sec_start_filename)
                
                audio_30_sec_end = audio[-30000:]  
                temp_30_sec_end_filename = audio_temp.name.replace('.wav', '_30sec_end.wav')
                audio_30_sec_end.export(temp_30_sec_end_filename, format="wav")

                transcript_end = self.transc.transcribe_recognize_whisper(temp_30_sec_end_filename)
                full_transcription_start_time = time.time()
                full_transcript = self.transc.transcribe_recognize_whisper(audio_temp.name)
                full_transcription_end_time = time.time()
                transTime = full_transcription_end_time - full_transcription_start_time
                document = {
                    "title":title,
                    "level":level,
                    "module":module,
                    "topic" : topic,
                    "source": "From Local Video",
                    "text_brute": full_transcript,
                    "start_text_traitee": transcript_start,
                    "end_text_traitee": transcript_end,
                    "audio_extraction_time": audioExtractTime,
                    "audio_loading_time": audioChargedTime,
                    "full_transcription_time": transTime
                }
                print(document)
                # data_to_send = [document]
                # self.unify_service.sauvegarder_et_envoyer(data_to_send)
                # rst = self.collection.insert_one(document)
                # if rst.inserted_id:  
                #     print("Insertion du document dans MongoDB.")
                # else:
                #     print("Erreur lors de l'insertion du document dans MongoDB.")
                #     return jsonify({"message": "Erreur lors de l'insertion du document dans MongoDB."}), 500
        
                return jsonify({"message": "Transcription sauvegardée dans Content"}), 200
            
        except Exception as e:
            print(f"Une erreur est survenue : {e}")
            return jsonify({"error": f"Une erreur est survenue : {e}"}), 500

        finally:
            if audio_temp and os.path.exists(audio_temp.name):
                os.remove(audio_temp.name)
            if temp_30_sec_start_filename and os.path.exists(temp_30_sec_start_filename):
                os.remove(temp_30_sec_start_filename)
            if temp_30_sec_end_filename and os.path.exists(temp_30_sec_end_filename):
                os.remove(temp_30_sec_end_filename)

        