import os
import numpy as np
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
from .database_service import MongoDBManager
 
class ContentManagement:
    def __init__(self):
        load_dotenv()  
        connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.db_manager = MongoDBManager()
        self.content_collection = self.db_manager.get_collection("Content")
        self.vs_infos_collection = self.db_manager.get_collection("VSInfos")
        self.collection = self.db_manager.get_collection("featured")
        self.container_name = "magasindevectorestore2"

    def get_vs(self, niveau_selected):
        try:
            courses = self.collection.find({"title": niveau_selected})
            cour = list(course["name"] for doc in courses for course in doc.get("courses",[]))
            return cour
        except Exception as e:
            print(f"An error occurred while retrieving courses for level '{niveau_selected}': {e}")
            return []
        
    def pie(self):
        count_pdf = self.content_collection.count_documents({"source": {"$in": ["From .pdf", "From .pptx"]}})
        count_youtube_url = self.content_collection.count_documents({"source": "From Youtube URL"})
        count_local_video = self.content_collection.count_documents({"source": "From Local Video"})
        return count_pdf, count_local_video, count_youtube_url
 
    def list_vs(self, level):
        vs_list = []
        cours = self.get_vs(level)
        if cours:
            for cour in cours:
                container_client = self.blob_service_client.get_container_client(container=self.container_name)
                general_blobs_list = container_client.list_blobs(name_starts_with=f"General/{level}/{cour}")
                general_vecteurs_stocks = [blob.name for blob in general_blobs_list]
                if general_vecteurs_stocks:
                    vs_list.extend(general_vecteurs_stocks)
                partial_blobs_list = container_client.list_blobs(name_starts_with=f"Partial/{level}/{cour}")
                partial_vecteurs_stockes = [blob.name for blob in partial_blobs_list]
                if partial_vecteurs_stockes:
                    vs_list.extend(partial_vecteurs_stockes)
        return vs_list

    def time(self, level):
        documents = list(self.vs_infos_collection.find({"level": level}))
        transformed_data = {}
        for doc in documents:
 
            category = doc['document']
            if 'elapsed_time' in doc:
                averages = np.mean(doc['elapsed_time'])
               
                transformed_data[category] = averages
 
        categories = sorted(transformed_data.keys()) 
        averages = transformed_data 
       
        return categories, averages
    
    def blob_exists(self, blob_name):
        container_client = self.blob_service_client.get_container_client(self.container_name)
        return any(blob.name == blob_name for blob in container_client.list_blobs(name_starts_with=blob_name))
 
    def delete_vs_gen(self, niveau_selected, cours):
        container_client = self.blob_service_client.get_container_client(container=self.container_name)
        dossier_path = f"General/{niveau_selected}/{cours}"
        partial = f"Partial/{niveau_selected}/{cours}/"
        try:
            blob_list = container_client.list_blobs(name_starts_with=dossier_path)
            for blob in blob_list:
                container_client.delete_blob(blob)
                query2 = {"level": niveau_selected,"module":cours}
                try:
                    self.content_collection.delete_many(query2)
                    blob_list2 = container_client.list_blobs(name_starts_with=partial)
                    for blob in blob_list2:
                        print(blob.name)
                        container_client.delete_blob(blob)
                    self.update_all_featured_status(niveau_selected,cours)
                    query = {"module": cours}
                    delete_result = self.vs_infos_collection.delete_many(query)
                    if delete_result.deleted_count > 0:
                        
                        print(f"{delete_result.deleted_count} documents ont été supprimés.")
                    else:
                        print("Aucun document correspondant n'a été supprimé.")
                except Exception as e:
                    print("Échec de la suppression de la collection MongoDB :", e)
                    return False
        except Exception as e:
            print("Échec de la suppression du stockage blob :", e)
            return False
        return True
 
    def delete_vs(self, niveau_selected, cours, topic):
        container_client = self.blob_service_client.get_container_client(container=self.container_name)
        dossier_path = f"Partial/{niveau_selected}/{cours}/{topic}"
        gen = f"General/{niveau_selected}/{cours}"
        try:
            blob_list = container_client.list_blobs(name_starts_with=dossier_path)
            for blob in blob_list:
                container_client.delete_blob(blob)
            self.update_featured_status(niveau_selected, cours, topic)
            query = {"azurepath": dossier_path}
            delete_result = self.vs_infos_collection.delete_many(query)
            if delete_result.deleted_count > 0:
                
                print(f"{delete_result.deleted_count} documents ont été supprimés.")
            else:
                print("Aucun document correspondant n'a été supprimé.")
            blob_list2 = container_client.list_blobs(name_starts_with=gen)
            if len(list(blob_list2)) > 0:
                print('Have')
            else:
                query2 = {"topic": topic}
                try:
                    self.content_collection.delete_many(query2)
                    self.update_featured_status(niveau_selected, cours, topic)

                except Exception as e:
                    print("Échec de la suppression de la collection MongoDB :", e)
                    return False
        except Exception as e:
            print("Échec de la suppression du stockage blob :", e)
            return False
       
        return True
   
    def update_all_featured_status(self, niveau_selected, cours):
        try:
            print('coucou')
            query = {
                "title": niveau_selected,
                "courses.name": cours
            }
            update_query = {
                "$set": {
                    "courses.$[course].topics.$[topic].status": False
                }
            }
            array_filters = [
                {"course.name": cours},
                {"topic.status": {"$ne": False}}  # Ne met à jour que les topics dont le statut est différent
            ]
            result = self.collection.update_many(query, update_query, array_filters=array_filters)

            if result.modified_count > 0:
                print('Statut mis à jour avec succès pour tous les topics correspondants.')
                return True
            else:
                print('Aucun document mis à jour.')
                return False
        except Exception as e:
            print(f"Une erreur s'est produite : {e}")
            return False

    def update_featured_status(self, niveau_selected, cours, topic):
        try:
            print('toto')
            query = {
                "title": niveau_selected,
                "courses.name": cours,
                "courses.topics.name": topic,
            }
            update_query = {
                "$set": {
                    "courses.$[course].topics.$[topic].status": False
                }
            }
            array_filters = [
                {"course.name": cours},
                {"topic.name": topic}
            ]
            result = self.collection.update_one(query, update_query, array_filters=array_filters)

            if result.modified_count > 0:
                print('Statut mis à jour avec succès.')
                return True
            else:
                print('Aucun document mis à jour.')
                return False
        except Exception as e:
            print(f"Une erreur s'est produite : {e}")
            return False

    def vs_exists(self, dossier_path):
        container_client = self.blob_service_client.get_container_client(container=self.container_name)
        try:
            blob_list = container_client.list_blobs(name_starts_with=dossier_path)
            return len(list(blob_list)) > 0
        except Exception as e:
            print("Échec de la vérification de l'existence du stockage blob :", e)
            return False
        
    def vs_exists(self, dossier_path):
        container_client = self.blob_service_client.get_container_client(container=self.container_name)
   
        try:
            blob_list = container_client.list_blobs(name_starts_with=dossier_path)
            return len(list(blob_list)) > 0
        except Exception as e:
            print("Échec de la vérification de l'existence du stockage blob :", e)
            return False
        
    def get_level_info(self):
        level_info = []
        levels = self.collection.find({}, {"_id": 0}) 
        for level in levels:
            for course in level.get("courses", []):
                for topic in course.get("topics", []):
                    if isinstance(topic, dict):  # Vérifiez si topic est un dictionnaire
                        status = bool(topic.get("status", False))
                        stats_count = topic.get("stars", [])
                        level_info.append({
                            "level": level["title"],
                            "course": course["name"],
                            "topic": topic["name"],
                            "status": status,
                            "stars": stats_count
                        })
                    else:
                        print("Topic is not a dictionary:", topic)  # Affichez un message pour identifier les problèmes
        return level_info

    def get_nbreVS(self):
        try:
            levels = self.get_all_levels()  
            nbreVS_par_level = {}
            for level in levels:
                courses = self.get_courses_in_level(level) 
                total_nbreVS_level = 0
                for course in courses:
                    general_path = f"General/{level}/{course}"
                    partial_path = f"Partial/{level}/{course}"
                    nbre_general = self.count_blobs_in_folder(general_path)
                    nbre_partial = self.count_blobs_in_folder(partial_path)
                    total_nbreVS_level += (nbre_general + nbre_partial)
                nbreVS_par_level[level] = total_nbreVS_level
            return nbreVS_par_level
        except Exception as e:
            print(f"An error occurred while retrieving the number of VS for each level: {e}")
            return {}

    def get_all_levels(self):
        container_client = self.blob_service_client.get_container_client(self.container_name)
        levels = set()
        for blob in container_client.list_blobs():
            level_name = blob.name.split("/")[1]
            levels.add(level_name)
        return list(levels)

    def get_courses_in_level(self, level):
        container_client = self.blob_service_client.get_container_client(self.container_name)
        courses = set()
        for blob in container_client.list_blobs(name_starts_with=f"Partial/{level}/"):
            # Parse the course name from the blob path
            course_name = blob.name.split("/")[2]
            courses.add(course_name)
        return list(courses)

    def count_blobs_in_folder(self, folder_path):
        container_client = self.blob_service_client.get_container_client(self.container_name)
        blobs = container_client.list_blobs(name_starts_with=folder_path)
        count = sum(1 for _ in blobs)
        return count

    