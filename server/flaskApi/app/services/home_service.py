from functools import cache
from .database_service import MongoDBManager
from .traitement_pdf_service import PDF
from .traitement_video_service import Video
from .traitement_lien_route import URL
from flask import jsonify

# from .flaskAPI_service import FlaskAPIHandler
 
class ContentHandler:
    def __init__(self):
        self.db_manager = MongoDBManager()
        # self.apiHandler = FlaskAPIHandler()
        self.collection = self.db_manager.get_collection("featured")
        self.pdf = PDF()
        self.video = Video()
        self.url = URL()

    
    def get_topics(self, level, course_name):
        try:
            topics = []
            course_records = self.collection.find({"title": level, "course": course_name})
            if course_records:
                for doc in course_records:
                    topics.extend(doc.get("topics", []))
            print(topics)
            return topics, True
        except Exception as e:
            print(f"An error occurred while retrieving topics for level '{level}' and course '{course_name}': {e}")
            return [], False

    def handle_pdf_pptx_upload(self, f, level, course_name, title, topic):
        if f is not None:
            document_bytes = f.read()
            files = {
                'pdf_file': (f.filename, document_bytes),
                'Level': level,
                'course_name': course_name,
                'Title': title,
                'topic': topic,
            }
            res, status_code= self.pdf.traitement_pdf_pptx(files)
            if status_code == 200:
                return jsonify({"success": True}), 200
            elif status_code == 400:
                return jsonify({"error": "Bad Request"}), 400
            elif status_code == 409:
                return jsonify({"error": "Conflict"}), 409
            else:
                return jsonify({"error": "Internal Server Error"}), 500
 
    def handle_youtube_link(self, link, level, course_name, title, topic):
        if link:
            res, status_code = self.url.traitement_lienYT(
                {
                    "video_link": link,
                    'Level': level,
                    'course_name': course_name,
                    'Title': title,
                    'topic': topic,
                })

            if status_code == 200:
                return jsonify({"success": True}), 200
            elif status_code == 400:
                return jsonify({"error": "Bad Request"}), 400
            elif status_code == 409:
                return jsonify({"error": "Conflict"}), 409
            else:
                return jsonify({"error": "Internal Server Error"}), 500
       
    def get_modules(self, level, course_name):
        """
        Retrieves module names for a given course and level.

        Args:
            level (str): The level of the course.
            course_name (str): The name of the course.

        Returns:
            tuple: A tuple containing module names and a boolean indicating success.
        """
        course_record = self.collection.find_one({"title": level, "courses.name": course_name})
        if course_record:
            for course in course_record["courses"]:
                if course["name"] == course_name:
                    modules = course.get("topics", []) 
                    modules_names = [module["name"] for module in modules]
                    return modules_names
        return "Please provide valid level and course name information.", False


    @cache
    def get_documents_name(self, level, course_name):
        course_record = self.collection.find_one({"title": level, "courses.name": course_name})
        document_names = []  # Initialiser une liste vide pour stocker les noms des documents
        if course_record:
            courses = course_record.get("courses", [])
            for course in courses:
                if course["name"] == course_name:
                    documents = course.get("documents", [])
                    for doc in documents:
                        document_names.append(doc.get('name'))
            return document_names, True if document_names else ("No documents found.", False)
        return "Please provide valid level and course name information.", False
 
 
   
    def get_document_details(self, level, course_name, document_name):
        # Trouver le niveau qui contient le cours spécifié
        level_document = self.collection.find_one({"title": level, "courses.name": course_name})
        if level_document:
            # Extraire le tableau des cours
            courses = level_document.get("courses", [])
            for course in courses:
                if course["name"] == course_name:
                    # Extraire le tableau des documents
                    documents = course.get("documents", [])
                    for document in documents:
                        # Trouver le document spécifié par son nom
                        if document["name"] == document_name:
                            # Retourner les chapitres du document trouvé
                            chapters = document.get("chapters", [])
                            return chapters, True
        # Retourner un message d'erreur si le document spécifié n'est pas trouvé
        return "Please provide valid level, course name, and document name information.", False
 