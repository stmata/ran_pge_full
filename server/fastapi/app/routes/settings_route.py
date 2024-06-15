from fastapi import APIRouter, HTTPException, Request
from app.services.settings_service import SettingsManager

settings_blueprint = APIRouter()
settings_manager = SettingsManager()

@settings_blueprint.get('/settings/{type}')
async def get_settings(type: str, level: str = None, course_name: str = None, module_names: str = None):
    if type == 'courses':
        if level:
            courses = await settings_manager.get_courses_by_level(level)
            return courses
        else:
            raise HTTPException(status_code=400, detail="Level parameter is missing")
    elif type == 'courses_status':
        if level:
            courses_status = await settings_manager.get_courses_and_status(level)
            return courses_status
        else:
            raise HTTPException(status_code=400, detail="Level parameter is missing")
    elif type == 'add_update_documents':
        if level and course_name and module_names:
            result_message = await settings_manager.add_or_update_modules(level, course_name, module_names.split(','))
            return {"message": result_message}
        else:
            raise HTTPException(status_code=400, detail="Missing parameters in the request URL")
    else:
        raise HTTPException(status_code=400, detail="Invalid settings type")

@settings_blueprint.post('/settings/{type}')
async def update_settings(type: str, data: dict):
    if type == 'update_course_status':
        if 'level' in data and 'courses' in data:
            level = data['level']
            courses = data['courses']
            result_messages = []
            for course in courses:
                course_name = course.get('name')
                status = course.get('status')
                result_message = await settings_manager.update_course_status(level, course_name, status)
                result_messages.append(result_message)
            return {"messages": result_messages}
        else:
            raise HTTPException(status_code=400, detail="Missing level or courses in the request body")
    else:
        raise HTTPException(status_code=405, detail="Unsupported method, use POST")
