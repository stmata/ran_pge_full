from .database_service import MongoDBManager
from functools import cache
import uuid
 
class SettingsManager:
    def __init__(self):
        self.db_manager = MongoDBManager()
        self.collection = self.db_manager.get_collection("featured")
 
    @cache
    def get_courses_by_level(self, level):
        """
        Fetches courses of a specific level from the database.
 
        Args:
            level (str): The level for which to retrieve the courses.
 
        Returns:
            list: A list containing the name of each course.
        """
        try:
            courses = self.collection.find({"title": level})
            cour = list(course["name"] for doc in courses for course in doc.get("courses",[]))
            print(cour)
            return cour
        except Exception as e:
            print(f"An error occurred while retrieving courses for level '{level}': {e}")
            return []
 
    def get_courses_and_status(self, level):
        """
        Fetches courses of a specific level along with their status from the database.
 
        Args:
            level (str): The level for which to retrieve the courses.
 
        Returns:
            list: A list of dictionaries containing the name of the course and its status.
        """
        try:
       
            return [{"name": course["name"], "status": course.get('status', False)} for doc in self.collection.find({"title": level}) for course in doc.get('courses', [])]
        except Exception as e:
            print(f"An error occurred while retrieving courses for level '{level}': {e}")
            return []
    
    def update_course_status(self, level, course_name, status):
        try:
            course_document = self.collection.find_one({"title": level})
            if not course_document:
                print("Level document not found.")
                return "Level document not found."

            courses = course_document.get("courses", [])
            course_found = False
            for course in courses:
                if course["name"] == course_name:
                    course_found = True
                    course["status"] = status
                    break

            if not course_found:
                print("Course not found")
                return "Course not found."

            # Mise à jour du document dans la collection MongoDB en se concentrant uniquement sur le champ de statut
            update_result = self.collection.update_one(
                {"_id": course_document["_id"], "courses.name": course_name},
                {"$set": {"courses.$.status": status}}
            )

            if update_result.modified_count > 0:
                print("Course status updated successfully!")
                return "Course status updated successfully!"
            else:
                print("No changes were made.")
                return "No changes were made."

        except Exception as e:
            print(f"An error occurred while updating course status for level '{level}' and course '{course_name}': {e}")
            return "Failed to update course status."

    
    def add_or_update_modules(self, level, course_name, module_names):
        course_document = self.collection.find_one({"title": level})
        if not course_document:
            return "Level document not found."
        
        courses = course_document.get("courses", [])
        course_found = False

        for course in courses:
            if course["name"] == course_name:
                course_found = True
                existing_topics = course.get("topics", [])
                if not isinstance(existing_topics, list):
                    existing_topics = []
                
                for module_name in module_names:
                    if module_name not in existing_topics:
                        # Add new module with additional properties
                        new_module = {
                            "_id": str(uuid.uuid4()),
                            "name": module_name,
                            "image": "../../assets/images/skema_test.jpg",
                            "description":"Understand the structure of web pages with HTML.",
                            "stars": 0,
                            "status": False
                        }
                        existing_topics.append(new_module)

                course["topics"] = existing_topics
                break

        if not course_found:
            return "Course not found."

        update_result = self.collection.update_one(
            {"_id": course_document["_id"]},
            {"$set": {"courses": courses}}
        )

        if update_result.modified_count > 0:
            return "Level document updated successfully!"
        else:
            return "No changes were made."
