import os
import time
from flask import jsonify
from .extractors_service import Extractor
from .unify_service import DataSaver
from .database_service import MongoDBManager
from .contentcheck_service import ContentChecker
from .processor_service import TranscriptProcessor
from .transcript_service import TranscriptionService
from fpdf import FPDF

class URL:
    def __init__(self):
        self.db_manager = MongoDBManager()
        self.extractor = Extractor()
        self.unify_service = DataSaver() 
        self.checkContent = ContentChecker()
        self.process = TranscriptProcessor()
        self.transc = TranscriptionService()
        self.collection = self.db_manager.get_collection("Content")

    def traitement_lienYT(self, data):
        try:
            if not data:
                return jsonify({"error": "Aucune donnée JSON fournie"}), 400
            video_link = data.get('video_link')
            title = data.get('Title')
            level = data.get('Level')
            module = data.get('course_name')
            topic = data.get('topic')
            if not level or not module or not title:
                return jsonify({"Level et module et titre requis"}), 400
            if not video_link:
                return jsonify({"error": "Le lien de la vidéo est requis"}), 400
    
            start_extraction_time = time.time()
            video_id = self.extractor.extract_youtube_id(video_link)
            end_extraction_time = time.time()
            extraction_time = end_extraction_time - start_extraction_time
    
            if not video_id:
                return jsonify({"error": "L'ID de la vidéo YouTube n'a pas pu être extrait. Assurez-vous que le lien est sous le format : https://www.youtube.com/watch?v=RBSUwFGa6Fk"}), 400
        # Obtention et traitement de la transcription
            start_transcription_time = time.time()
            transcript = self.transc.get_youtube_transcript(video_id)
            end_transcription_time = time.time()
            transcription_time = end_transcription_time - start_transcription_time
            words = transcript.split()
            # Prétraitement de la transcription pour les vérifications de début et de fin
            start_transcript = ' '.join(words[:30])
            end_transcript = ' '.join(words[-30:])
            if self.checkContent.content_exists(start_transcript, end_transcript):
                return jsonify({"error": "Un contenu similaire existe déjà."}), 409
            # Préparation des données pour la sauvegarde
            document = {
                "title": title,
                "level": level,
                "module": module,
                "topic": topic,
                "source": "From Youtube URL",
                "text_brute": transcript,
                # "text_traitee": processed_transcript,
                "start_text_traitee": start_transcript,
                "end_text_traitee": end_transcript,
                "extraction_time": extraction_time,
                "transcription_time": transcription_time,
                # "preprocessing_time": preprocessing_time
            }
            data_to_send = [document]
            resultat_fonction =self.unify_service.sauvegarder_et_envoyer(data_to_send)
            print(resultat_fonction)
            if resultat_fonction:
                rst = self.collection.insert_one(document)
                if rst.inserted_id:
                    print("Insertion du document dans MongoDB.")
                    return jsonify({"message": "Transcription sauvegardée dans Content et PDF créé."}), 200

                else:
                    print("Erreur lors de l'insertion du document dans MongoDB.")
                    return jsonify({"message": "Erreur lors de l'insertion du document dans MongoDB."}), 500
            else:
                print("Erreur lors de l'exécution de la fonction sauvegarder_et_envoyer.")
                return jsonify({"message": "Error interne, Try later."}), 500
            
            # pdf_file_name = f"{level}_{module}_{topic}_{title}.pdf"
            # transcript_folder = 'transcript'
            # if not os.path.exists(transcript_folder):
            #     os.makedirs(transcript_folder)
            # pdf_file_path = os.path.join(transcript_folder, pdf_file_name)
            # pdf = FPDF()
            # pdf.add_page()
            # pdf.set_font("Arial", size=12)
            # lines = transcript.split('\n')
            # for line in lines:
            #     pdf.multi_cell(0, 10, line)
            # pdf.output(pdf_file_path)
    
        except Exception as e:
            return jsonify({"error": f"Une erreur est survenue : {e}"}), 500