from datetime import datetime, date, time
from .database_service import MongoDBManager

class ActivateManager:
    def __init__(self):
        self.db_manager = MongoDBManager()
        self.collection = self.db_manager.get_collection("featured")

    def activate_chapter(self, level: str, course_name: str, doc_name: str, chapter_title: str, new_start_date: date) -> bool:
        # Conversion de new_start_date en datetime si nécessaire
        if isinstance(new_start_date, date) and not isinstance(new_start_date, datetime):
            new_start_datetime = datetime.combine(new_start_date, time())
        else:
            new_start_datetime = new_start_date

        try:
            # Chemin de mise à jour dynamique pour atteindre la date de début du chapitre spécifique
            update_query = {
                "title": level,
                "courses.name": course_name,
                "courses.documents.name": doc_name,
                "courses.documents.chapters.name": chapter_title
            }
            update_path = f"courses.$[course].documents.$[document].chapters.$[chapter].start_date"
            update_result = self.collection.update_one(
                update_query,
                {"$set": {update_path: new_start_datetime}},
                array_filters=[
                    {"course.name": course_name},
                    {"document.name": doc_name},
                    {"chapter.name": chapter_title}
                ]
            )
            if update_result.modified_count > 0:
                print("Mise à jour réussie.")
                return True
            else:
                print("Aucune mise à jour effectuée.")
                return False
        except Exception as e:
            print(f"Erreur lors de la mise à jour: {e}")
            return False

    def update_course_toggle_status(self, level: str, course_name: str, toggle_status: bool) -> bool:
        """
        Met à jour l'état du toggle pour un cours donné dans la base de données.

        Args:
            course_name (str): Le nom du cours à mettre à jour.
            toggle_status (bool): L'état du toggle à mettre à jour (True ou False).
        Returns:
            bool: True si la mise à jour a réussi, False sinon.
        """
        try:
            course = self.collection.find_one({"title": level, "courses.name": course_name})
            if course:
                # Mise à jour de l'état du cours
                self.collection.update_one({"title": level, "courses.name": course_name}, {"$set": {"courses.$.status": toggle_status}})
                return True
            else:
                print(f"Course '{course_name}' not found in the database.")
                return False
        except Exception as e:
            print(f"An error occurred while updating the status for course '{course_name}': {e}")
            return False
