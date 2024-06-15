from pymongo import MongoClient
from .database_service import MongoDBManager

class ContentChecker:
    def __init__(self):
        self.db_manager = MongoDBManager() 
        self.collection = self.db_manager.get_collection('Content')  

    def content_exists(self, processed_transcript_start: str, processed_transcript_end: str) -> bool:
        try:
            query = {
                "start_text_traitee": processed_transcript_start,
                "end_text_traitee": processed_transcript_end
            }
            if self.collection.find_one(query):
                return True
            return False
        except Exception as e:
            print(f"Une erreur est survenue lors de la vérification du contenu : {e}")
            return False
