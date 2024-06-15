import os
import time
from dotenv import load_dotenv
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import faiss
from azure.storage.blob import BlobServiceClient
from .database_service import MongoDBManager
from openai import AzureOpenAI

class VectorStoreManager:
    def __init__(self):
        self.load_env()
        self.db_manager = MongoDBManager()
        self.collection = self.db_manager.get_collection('VSInfos')
        self.blob_service_client = BlobServiceClient.from_connection_string(os.getenv('AZURE_STORAGE_CONNECTION_STRING'))
        self.container_name = "magasindevectorestore2"
        self.embedding = OpenAIEmbeddings(api_key=os.getenv('OPENAI_API_KEY'))
        # self.embedding = AzureOpenAI(api_key=os.getenv('AZURE_OPENAI_KEY'), azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT') , azure_deployment='embedding', api_version="2023-05-15")

        self.VECTOR_STORE_DIR = "./vector_stores"
        # Assurez-vous que le répertoire existe
        os.makedirs(self.VECTOR_STORE_DIR, exist_ok=True)

    def load_env(self):
        load_dotenv()

    def down_vector_store(self, blob_name):
        """
        Télécharge un vector store depuis Azure Blob Storage et le désérialise.
        """
        try:
            # Télécharge les données binaires du vector store depuis Azure
            vector_store = self.download_from_azure(blob_name)
            # vector_store = faiss.FAISS.deserialize_from_bytes(data, self.embedding)
            return vector_store
        except Exception as e:
            print(f"Erreur lors du chargement du vector store depuis Azure: {e}")
            raise
        
    def get_vector_store(self, blob_name):
        """
        Télécharge un vector store depuis Azure Blob Storage et le désérialise.
        """
        try:
            # Télécharge les données binaires du vector store depuis Azure
            data = self.download_from_azure(blob_name)
            vector_store = faiss.FAISS.deserialize_from_bytes(data, self.embedding)
            return vector_store
        except Exception as e:
            print(f"Erreur lors du chargement du vector store depuis Azure: {e}")
            raise

    def change_vector(self, data):
        """
        Télécharge un vector store depuis Azure Blob Storage et le désérialise.
        """
        try:
            # Télécharge les données binaires du vector store depuis Azure
            # data = self.download_from_azure(blob_name)
            vector_store = faiss.FAISS.deserialize_from_bytes(data, self.embedding)
            return vector_store
        except Exception as e:
            print(f"Erreur lors du chargement du vector store depuis Azure: {e}")
            raise

   

    def download_from_azure(self, blob_name):
        blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
        downloader = blob_client.download_blob()
        return downloader.readall()

    def upload_to_azure(self, blob_name, data):
            blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
            blob_client.upload_blob(data, overwrite=True)
    
    # def download_from_azure(self, blob_name):
    #         blob_client = self.blob_service_client.get_blob_client(container=self.container_name, blob=blob_name)
    #         downloader = blob_client.download_blob()
    #         return downloader.readall()

    def create_vector_store(self, text_chunks, module, level, topic):
        try:
            start_time = time.time()
            general_blob_name = f'General/{level}/{module}'
            self.process_and_upload_vector_store(text_chunks, general_blob_name)
            if topic:
                partial_blob_name = f'Partial/{level}/{module}/{topic}'
                self.process_and_upload_vector_store(text_chunks, partial_blob_name)
            end_time = time.time()
            el_time = round(end_time - start_time, 2)
            if topic:
                filter_query = {"level": level, "module": module, "topic": topic, "azurepath": partial_blob_name}
            else:
                filter_query = {"level": level, "module": module, "azurepath": general_blob_name}
            update_query = {"$inc": {"elapsed_time": el_time}}
            self.collection.update_one(filter_query, update_query, upsert=True)
            self.update_featured_status(level, module, topic)
            print(f"Elapsed time for serialization and uploading: {el_time}s")
            return True  # Or any other value indicating success
        except Exception as e:
            print(f"An error occurred: {str(e)}")
            return False  # Or handle the error as needed


    def update_featured_status(self, niveau_selected, cours, topic):
        try:
            query = {
                "title": niveau_selected,
                "courses.name": cours,
                "courses.topics.name": topic,
            }
            featured_item = self.collection.find_one(query)
            if featured_item:
                for course in featured_item['courses']:
                    if course['name'] == cours:
                        for top in course['topics']:
                            if top['name'] == topic:
                                top['status'] = True  
                                break
                self.collection.replace_one(query, featured_item) 
                return True
        except Exception as e:
            print("Échec de la mise à jour du statut dans la collection featured :", e)
            return False
        
    def process_and_upload_vector_store(self, text_chunks, blob_name):
        vector_store = faiss.FAISS.from_texts(embedding=self.embedding, texts=text_chunks)
        if self.blob_exists(blob_name):
            existing_data = self.download_from_azure(blob_name)
            existing_vector_store = faiss.FAISS.deserialize_from_bytes(existing_data, self.embedding)
            existing_vector_store.merge_from(vector_store)
            serialized_data = existing_vector_store.serialize_to_bytes()
        else:
            serialized_data = vector_store.serialize_to_bytes()
        self.upload_to_azure(blob_name, serialized_data)

    def blob_exists(self, blob_name):
        container_client = self.blob_service_client.get_container_client(self.container_name)
        return any(blob.name == blob_name for blob in container_client.list_blobs(name_starts_with=blob_name))

    
