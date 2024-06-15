from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import uvicorn
#from app.routes.receive_vector_route import router as receive_vector_router
from app.routes.chat_routes import chat_route 
from app.routes.click_routes import router as click_router
from app.routes.conversation_routes import router as conversation_router
from app.routes.course_routes import course_routes
from app.routes.download_video import router as download_video
from app.routes.verify_routes import router as verify_router
from app.routes.user_routes import router as user_router
from app.routes.messages_routes import message_routes
from app.routes.textToSpeech_routes import router as textToSpeech_router
from app.routes.evalution_routes import evalution_router
from app.routes.statistics_route import statistics_router
from app.routes.settings_route import settings_blueprint
from app.routes.home_route import home_router

app = FastAPI()

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(chat_route)
app.include_router(download_video)
app.include_router(verify_router)
app.include_router(user_router)
app.include_router(message_routes)
app.include_router(conversation_router)
app.include_router(course_routes)
app.include_router(textToSpeech_router)
app.include_router(evalution_router)
app.include_router(click_router)
app.include_router(statistics_router)
app.include_router(settings_blueprint)
app.include_router(home_router)

if __name__ == "__main__":
    uvicorn.run(app, host='localhost', port=5002, reload=False)
