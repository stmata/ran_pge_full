from fastapi import APIRouter, HTTPException, Body
from datetime import datetime
from app.services import database_services

router = APIRouter()

click_collection = database_services.get_collection('click')
featured_collection = database_services.get_collection('featured')

@router.post("/click_checkandsave")
async def click_checkandsave(data: dict = Body(...)):
    try:
        user_id = data.get('user_id')
        target_type = data.get('target_type')  # 'course' ou 'topic'
        target_id = data.get('target_id')  # ID du cours ou du topic

        if not user_id or not target_type or not target_id:
            raise HTTPException(status_code=400, detail="Informations insuffisantes fournies")

        # Vérifiez si un clic existe déjà pour cet utilisateur et cette cible
        existing_click = click_collection.find_one({"user_id": user_id, "target_id": target_id})

        if existing_click and existing_click.get('clicked'):
            return {"message": "Déjà existant"}

        # Enregistrement du clic dans la collection des clics
        click_collection.insert_one({
            "user_id": user_id,
            "target_id": target_id,
            "clicked": True,
            "date": datetime.now()
        })

        # Mise à jour du compteur de stars
        if target_type == "course":
            update_result = featured_collection.update_one(
                {"courses._id": target_id},
                {"$inc": {"courses.$.stars": 1}}
            )
        elif target_type == "topic":
            # Pour les topics, on doit d'abord trouver le bon cours, ensuite le bon topic à mettre à jour
            update_result = featured_collection.update_one(
                {"courses.topics._id": target_id},
                {"$inc": {"courses.$[course].topics.$[topic].stars": 1}},
                array_filters=[{"course.topics._id": target_id}, {"topic._id": target_id}]
            )

        if update_result.modified_count > 0:
            return {"message": "Clic enregistré et contenu mis à jour dans featured"}
        else:
            raise HTTPException(status_code=404, detail="Impossible de mettre à jour le contenu dans featured")

    except Exception as e:
        error_message = f"Une erreur générale est survenue : {e}"
        print(error_message)
        raise HTTPException(status_code=500, detail=error_message)
