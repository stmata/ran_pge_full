from functools import cache
from fastapi import HTTPException
from .database_service import MongoDBManager
from .traitement_pdf_service import PDF
from .traitement_video_service import Video
from .traitement_lien_route import URL

class ContentHandler:
    def __init__(self):
        self.db_manager = MongoDBManager()
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
            return topics, True
        except Exception as e:
            print(f"An error occurred while retrieving topics for level '{level}' and course '{course_name}': {e}")
            return [], False

    async def handle_pdf_pptx_upload(self, file, level, course_name, title, topic):
        if file is not None:
            document_bytes = await file.read()
            files = {
                'pdf_file': (file.filename, document_bytes),
                'Level': level,
                'course_name': course_name,
                'Title': title,
                'topic': topic,
            }
            res, status_code = self.pdf.traitement_pdf_pptx(files)
            if status_code == 200:
                return {"success": True, status_code : 200}
            elif status_code == 400:
                raise HTTPException(status_code=400, detail="Bad Request")
            elif status_code == 409:
                raise HTTPException(status_code=409, detail="Conflict")
            else:
                raise HTTPException(status_code=500, detail="Internal Server Error")

    async def handle_youtube_link(self, link, level, course_name, title, topic):
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
                return {"success": True, status_code : 200}
            elif status_code == 400:
                raise HTTPException(status_code=400, detail="Bad Request")
            elif status_code == 409:
                raise HTTPException(status_code=409, detail="Conflict")
            else:
                raise HTTPException(status_code=500, detail="Internal Server Error")

    async def get_modules(self, level, course_name):
        course_record = self.collection.find_one({"title": level, "courses.name": course_name})
        if course_record:
            for course in course_record["courses"]:
                if course["name"] == course_name:
                    modules = course.get("topics", []) 
                    modules_names = [module["name"] for module in modules]
                    return modules_names
        raise HTTPException(status_code=404, detail="Modules not found")


    async def get_documents_name(self, level, course_name):
        course_record = self.collection.find_one({"title": level, "courses.name": course_name})
        document_names = []  # Initialiser une liste vide pour stocker les noms des documents
        if course_record:
            courses = course_record.get("courses", [])
            for course in courses:
                if course["name"] == course_name:
                    documents = course.get("documents", [])
                    for doc in documents:
                        document_names.append(doc.get('name'))
            if document_names:
                return document_names
        raise HTTPException(status_code=404, detail="Documents not found")

    async def get_document_details(self, level, course_name, document_name):
        level_document = self.collection.find_one({"title": level, "courses.name": course_name})
        if level_document:
            courses = level_document.get("courses", [])
            for course in courses:
                if course["name"] == course_name:
                    documents = course.get("documents", [])
                    for document in documents:
                        if document["name"] == document_name:
                            chapters = document.get("chapters", [])
                            return chapters
        raise HTTPException(status_code=404, detail="Document details not found")
