from fastapi import APIRouter, HTTPException
from app.services import download_services

router = APIRouter()

@router.post("/download_video")
async def download_video(video_link: str):
    try:
        if not video_link:
            raise HTTPException(status_code=400, detail="Le lien de la vidéo est requis")

        response =await download_services.download_video(video_link)
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Une erreur est survenue : {e}")
