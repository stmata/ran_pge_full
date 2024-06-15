from typing import Dict, List
from fastapi import APIRouter, File, Form, UploadFile, HTTPException
from app.services.home_service import ContentHandler
from app.services.settings_service import SettingsManager

home_router = APIRouter()
content_handler = ContentHandler()
settings_manager = SettingsManager()

@home_router.post('/home/pdf_pptx_upload')
async def handle_pdf_pptx_upload(
    level: str = Form(...),
    course_name: str = Form(...),
    topic: str = Form(...),
    title: str = Form(...),
    file: UploadFile = File(...)
):
    if not all([level, course_name, topic, title, file]):
        raise HTTPException(status_code=400, detail="Missing parameters in the request")

    try:
        print(file)
        response, status_code = await content_handler.handle_pdf_pptx_upload(file, level, course_name, title, topic)
        if status_code == 200:
            return response
        elif status_code == 400:
            raise HTTPException(status_code=400, detail=response)
        elif status_code == 409:
            raise HTTPException(status_code=409, detail=response)
        else:
            raise HTTPException(status_code=500, detail=response)
    except FileNotFoundError as file_not_found_error:
        print('File Not Found Error:', file_not_found_error)
        raise HTTPException(status_code=500, detail="File Not Found Error", message=str(file_not_found_error))
    except Exception as e:
        print('Unhandled Exception:', e)
        raise HTTPException(status_code=500, detail="Internal Server Error", message=str(e))

@home_router.post('/home/youtube_link')
async def handle_youtube_link(
    level: str = Form(...),
    course_name: str = Form(...),
    title: str = Form(...),
    topic: str = Form(...),
    link: str = Form(...)
):
    try:
        response, status_code = await content_handler.handle_youtube_link(link, level, course_name, title, topic)
        if status_code == 200:
            return response
        elif status_code == 400:
            raise HTTPException(status_code=400, detail=response)
        elif status_code == 409:
            raise HTTPException(status_code=409, detail=response)
        else:
            raise HTTPException(status_code=500, detail=response)
    except FileNotFoundError as file_not_found_error:
        print('File Not Found Error:', file_not_found_error)
        raise HTTPException(status_code=500, detail="File Not Found Error", message=str(file_not_found_error))
    except Exception as e:
        print('Unhandled Exception:', e)
        raise HTTPException(status_code=500, detail="Internal Server Error", message=str(e))

@home_router.get('/home/get_modules', response_model=List[str])
async def get_modules(level: str, course_name: str):
    if level and course_name:
        topics = await content_handler.get_modules(level, course_name)
        return topics
    else:
        raise HTTPException(status_code=400, detail="Missing parameters in the request URL")

@home_router.get('/home/get_courses', response_model=List[str])
async def get_courses(level: str):
    courses = await settings_manager.get_courses_by_level(level)
    return courses
