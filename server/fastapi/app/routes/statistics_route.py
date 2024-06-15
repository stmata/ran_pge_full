from fastapi import APIRouter, HTTPException
from typing import Optional
from app.services.statistics_service import ContentManagement

content_management = ContentManagement()

statistics_router = APIRouter()

@statistics_router.get("/statistics/{type}", status_code=200)
async def statistics(type: str, level: str = None, cours: str = None, topic: str = None):
    if type == 'levelInfos':
        level_info = content_management.get_level_info()
        return level_info
    elif type == 'nbreVS':
        try:
            nbre = content_management.get_nbreVS()
            return nbre
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
    elif type == 'show_pie':
        count_pdf, count_local_video, count_youtube_url = content_management.pie()
        return {
            "pdf_count": count_pdf,
            "local_video_count": count_local_video,
            "youtube_url_count": count_youtube_url
        }
    elif type == 'show_vs':
        if level:
            trait_data = content_management.list_vs(level)
            return trait_data
    else:
        raise HTTPException(status_code=400, detail="Invalid statistics type")

@statistics_router.delete("/statistics/{type}", status_code=200)
async def delete_statistics(type: str, niveau_selected: Optional[str] = None, cours: Optional[str] = None, topic: Optional[str] = None):
    if type == 'delete_vs_gen':
        success = content_management.delete_vs_gen(niveau_selected, cours)
        if success:
            return {"message": "Les ressources ont été supprimées avec succès."}
        else:
            raise HTTPException(status_code=500, detail="Une erreur s'est produite lors de la suppression des ressources.")
    elif type == 'delete_vs':
        success = content_management.delete_vs(niveau_selected, cours, topic)
        if success:
            return {"message": "Les ressources ont été supprimées avec succès."}
        else:
            raise HTTPException(status_code=500, detail="Une erreur s'est produite lors de la suppression des ressources.")
    else:
        raise HTTPException(status_code=400, detail="Invalid statistics type")
