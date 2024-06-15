import os
import time
from flask import jsonify
from .extractors_service import Extractor
from .unify_service import DataSaver
from .database_service import MongoDBManager
from .contentcheck_service import ContentChecker
from .processor_service import TranscriptProcessor
import os

class PDF:
    def __init__(self):
        self.db_manager = MongoDBManager()
        self.extractor = Extractor()
        self.unify_service = DataSaver() 
        self.checkContent = ContentChecker()
        self.process = TranscriptProcessor()
        self.collection = self.db_manager.get_collection("Content")

    def traitement_pdf_pptx(self, data):
        temp_file_path = None  
        try:
            if 'pdf_file' not in data:
                return jsonify({"error": "Aucun fichier fourni"}), 400
            
            file_name, document_bytes = data['pdf_file']
            level = data.get('Level')
            title = data.get('Title')
            module = data.get('course_name')
            topic = data.get('topic')
            if not level or not module or not title:
                return jsonify({"error": "Level, titre et module requis"}), 400
            
            temp_folder_path = "./temporaire"
            if not os.path.exists(temp_folder_path):
                os.makedirs(temp_folder_path)
            
            suffix = '.pdf' if file_name.lower().endswith('.pdf') else '.pptx'
            temp_file_path = f"{temp_folder_path}/fichier_temp_{time.time()}{suffix}"
            with open(temp_file_path, 'wb') as temp_file:
                temp_file.write(document_bytes)
                print('Fichier temporaire créé avec succès:', temp_file_path)
                
            start_extraction_time = time.time()
            if suffix == '.pdf':
                text = self.extractor.pdf_to_text(temp_file_path)
            elif suffix == '.pptx':
                text = self.extractor.extract_text_from_pptx(temp_file_path)
            else:
                return jsonify({"error": "Format de fichier non pris en charge"}), 400
            end_extraction_time = time.time()
            extraction_time = end_extraction_time - start_extraction_time
            print("Extraction terminée.")
            words = text.split()
            start_transcript = ' '.join(words[:30])
            end_transcript = ' '.join(words[-30:])
            if self.checkContent.content_exists(start_transcript, end_transcript):
                return jsonify({"error": "Un contenu similaire existe déjà."}), 409
            document = { 
                "title": title,
                "level": level,
                "module": module,
                "topic": topic,
                "source": f"From {suffix}",
                "text_brute": text,
                "start_text_traitee": start_transcript,
                "end_text_traitee": end_transcript,
                "extraction_time": extraction_time,
            }
            data_to_send = [document]
            resultat_fonction =self.unify_service.sauvegarder_et_envoyer(data_to_send)
            if resultat_fonction:
                rst = self.collection.insert_one(document)
                if rst.inserted_id:   
                    print("Insertion du document dans MongoDB.")
                    return jsonify({"message": "Transcription sauvegardée dans Content"}), 200
                else:
                    print("Erreur lors de l'insertion du document dans MongoDB.")
                    return jsonify({"message": "Erreur lors de l'insertion du document dans MongoDB."}), 500
            else:
                print("Erreur lors de l'exécution de la fonction sauvegarder_et_envoyer.")
                return jsonify({"message": "Error interne, Try later."}), 500
            
        except Exception as e:
            return jsonify({"error": f"Une erreur est survenue : {e}"}), 500

        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.remove(temp_file_path)
                print('Fichier temporaire supprimé avec succès:', temp_file_path)
