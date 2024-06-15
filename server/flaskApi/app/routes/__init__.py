from flask import Blueprint
from app.routes.chat_routes import chat
from app.routes.verify_routes import send_verifyMail,verify_code,update_verification_code, send_ContactMail, refresh_token
from app.routes.user_routes import get_user, choiceLevel, get_super_user_status, update_super_user_status
from app.routes.messages_routes import load_messages, save_messages
from app.routes.conversation_routes import load_conversations, delete_conversation, add_new_conversation,update_conversation_title
from app.routes.course_routes import get_all_featured , get_courses_by_level
from app.routes.textToSpeech_routes import textToSpeech
from app.routes.evalution_routes import (
    evalution,
    evalutionwithprompt,
    save_evaluation,
    get_user_evaluations,
    qcm_with_dataframe,
    qouverte_with_dataframe,
    get_evaluations_general,
    get_evaluation_initiale,
    update_evaluation_initiale,
    add_evaluation_initiale,
    get_references_with_dataframe,
    compare_answers,
    getPlans,
    get_status,
    update_status
)
from app.routes.click_routes import click_checkandsave
from app.routes.statistics_route import statistics
from app.routes.settings_route import settings
from app.routes.home_route import home


statistics_blueprint = Blueprint('statistics', __name__)
settings_blueprint = Blueprint('settings', __name__)
home_blueprint = Blueprint('home', __name__)
receive_vector_route = Blueprint('receive_vector', __name__)
chat_route = Blueprint('chat', __name__)
verify_routes = Blueprint('verify_routes', __name__)
user_routes = Blueprint('user', __name__)
message_routes = Blueprint('message_routes', __name__)
conversation_routes = Blueprint('conversation_routes', __name__)
traitement_video_blueprint = Blueprint('traitement_video_routes', __name__)
traitement_lienYT_blueprint = Blueprint('traitement_lien', __name__)
traitement_pdf_pptx_blueprint = Blueprint('traitement_pdf', __name__)
course_routes = Blueprint('course_routes', __name__)
textToSpeech_routes = Blueprint('textToSpeech_routes', __name__)
evalution_route = Blueprint('evalution_route', __name__)
click_routes = Blueprint('click_routes', __name__)


# chat_route.add_url_rule('/chat', view_func=chat, methods=['POST'])
chat_route.add_url_rule('/chat/<store_id>', view_func=chat, methods=['POST'])
evalution_route.add_url_rule('/evalution', view_func=evalution, methods=['POST'])
evalution_route.add_url_rule('/evalutionwithprompt', view_func=evalutionwithprompt, methods=['POST'])
evalution_route.add_url_rule('/users/<userId>/evaluation', view_func=save_evaluation, methods=['POST'])
evalution_route.add_url_rule('/users/<userId>/evaluation', view_func=get_user_evaluations, methods=['GET'])
evalution_route.add_url_rule('/qcmwithdatafram', view_func=qcm_with_dataframe, methods=['POST'])
evalution_route.add_url_rule('/qouvertewithdatafram', view_func=qouverte_with_dataframe, methods=['POST'])
evalution_route.add_url_rule('/evalgeneralwithdatafram/<subfolder_name>', view_func=get_evaluations_general, methods=['POST'])
evalution_route.add_url_rule('/getReferenceswithdatafram', view_func=get_references_with_dataframe, methods=['POST'])
evalution_route.add_url_rule('/users/<userId>/add_evaluation_initiale', view_func=add_evaluation_initiale, methods=['POST'])
evalution_route.add_url_rule('/users/<userId>/up_evaluation_initiale', view_func=update_evaluation_initiale, methods=['PUT'])
evalution_route.add_url_rule('/users/<userId>/get_evaluation_initiale', view_func=get_evaluation_initiale, methods=['GET'])
evalution_route.add_url_rule('/compare_answers', view_func=compare_answers, methods=['POST'])
evalution_route.add_url_rule('/getPlans', view_func=getPlans, methods=['POST'])
evalution_route.add_url_rule('/checkstatusofdatafram/<course>/<level>/<evaluation_type>', view_func=get_status, methods=['GET'])
evalution_route.add_url_rule('/addorupdatestatusofdatafram/<course>/<level>/<evaluation_type>', view_func=update_status, methods=['PUT'])

verify_routes.add_url_rule('/send_verifyMail',view_func=send_verifyMail,methods=['POST'])
verify_routes.add_url_rule('/send_ContactMail',view_func=send_ContactMail,methods=['POST'])
verify_routes.add_url_rule('/verify_code',view_func=verify_code,methods=['POST'])
verify_routes.add_url_rule('/refresh',view_func=refresh_token,methods=['POST'])
verify_routes.add_url_rule('/users/<user_id>/update_verification_code',view_func=update_verification_code,methods=['PATCH'])

user_routes.add_url_rule('/users/<user_id>',view_func=get_user,methods=['GET'])
user_routes.add_url_rule('/user/<userId>/choiceLevel',view_func=choiceLevel,methods=['PATCH'])
user_routes.add_url_rule('/user/<user_id>/superUser',view_func=get_super_user_status,methods=['GET'])
user_routes.add_url_rule('/user/<email>/superUser',view_func=update_super_user_status,methods=['PATCH'])

message_routes.add_url_rule('/users/<userId>/messages',view_func=load_messages,methods=['GET'])
message_routes.add_url_rule('/users/<userId>/conversations/<conversationId>',view_func=save_messages,methods=['PUT'])

conversation_routes.add_url_rule('/users/<userId>/conversations',view_func=load_conversations,methods=['GET'])
conversation_routes.add_url_rule('/users/<userId>/conversations/<conversationId>',view_func=delete_conversation,methods=['DELETE'])
conversation_routes.add_url_rule('/users/<userId>/conversations',view_func=add_new_conversation,methods=['PATCH'])
conversation_routes.add_url_rule('/users/<userId>/conversations/<conversationId>/title',view_func=update_conversation_title,methods=['PATCH'])

course_routes.add_url_rule('/featured',view_func=get_all_featured,methods=['GET'])
course_routes.add_url_rule('/get_user_courses/<level>',view_func=get_courses_by_level,methods=['POST'])

textToSpeech_routes.add_url_rule('/textToSpeech',view_func=textToSpeech,methods=['POST'])

click_routes.add_url_rule('/click_checkandsave',view_func=click_checkandsave,methods=['POST'])

statistics_blueprint.add_url_rule('/statistics/<type>', view_func=statistics, methods=['GET','POST', 'DELETE'])
settings_blueprint.add_url_rule('/settings/<type>', view_func=settings, methods=['GET', 'POST'])
home_blueprint.add_url_rule('/home/<type>', view_func=home, methods=['GET','POST'])