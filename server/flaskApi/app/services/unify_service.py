from .database_service import MongoDBManager
from .chunks_service import TextChunker
from .vector_service import VectorStoreManager

class DataSaver:
    def __init__(self):
        self.db_manager = MongoDBManager()
        self.chunk_service = TextChunker()
        self.vector_service = VectorStoreManager()  
        self.collection = self.db_manager.get_collection('Content')  
 
    def sauvegarder_et_envoyer(self, data: list) -> dict:
        if not data:
            return {"status_code": 400, "response": "Aucune donnée fournie"}
 
        send_result = self.receive_data(data)
        return send_result
       
    def receive_data(self, data):
        try:
            for item in data:
                
                chunks, module, level, title, content_type, topic = self.chunk_service.get_text_chunks(item)  
                if chunks:
                    send_result = self.vector_service.create_vector_store(chunks, module, level, topic)
           
            return send_result
        except Exception as e:
            return print({"status": "Error", "error": "Erreur lors de la récupération des données JSON: " + str(e)}), 500