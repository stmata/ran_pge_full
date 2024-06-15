from flask import Blueprint, jsonify, request
from app.services.home_service import ContentHandler
from app.services.settings_service import SettingsManager

home_blueprint = Blueprint('home', __name__)
content_handler = ContentHandler()
settings_manager = SettingsManager()

@home_blueprint.route('/home/<type>', methods=['POST','GET'])
def home(type):
    if type == 'pdf_pptx_upload':
        if request.method == 'POST':
            try:
                level = request.form.get('level')
                course_name = request.form.get('course_name')
                topic = request.form.get('topic')
                title = request.form.get('title')
                file = request.files.get('file') 
                if not all([level, course_name, topic, title, file]):
                    return jsonify({"error": "Missing parameters in the request"}), 400
                else:
                    response, status_code = content_handler.handle_pdf_pptx_upload(file, level, course_name, title, topic)
                    if status_code == 200:
                        return response, 200
                    elif status_code == 400:
                        return response, 400
                    elif status_code == 409:
                        return response, 409
                    else:
                        return response, 500
            except FileNotFoundError as file_not_found_error:
                print('File Not Found Error:', file_not_found_error)
                return jsonify({"error": "File Not Found Error", "message": str(file_not_found_error)}), 500

            except Exception as e:
                print('Unhandled Exception:', e)
                return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
    elif type == 'youtube_link':
        if request.method == 'POST':
            try:
                level = request.form.get('level')
                course_name = request.form.get('course_name')
                title = request.form.get('title')
                topic = request.form.get('topic')
                link = request.form.get('link')
                response, status_code =content_handler.handle_youtube_link(link, level, course_name, title, topic)

                if status_code == 200:
                    return response, 200
                elif status_code == 400:
                    return response, 400
                elif status_code == 409:
                    return response, 409
                else:
                    return response, 500
            except FileNotFoundError as file_not_found_error:
                print('File Not Found Error:', file_not_found_error)
                return jsonify({"error": "File Not Found Error", "message": str(file_not_found_error)}), 500

            except Exception as e:
                print('Unhandled Exception:', e)
                return jsonify({"error": "Internal Server Error", "message": str(e)}), 500
        else:
            return jsonify({"error": "Unsupported method, use POST"}), 405
    elif type == 'get_modules':
        if request.method == 'GET':
            level = request.args.get('level')
            course_name = request.args.get('course_name')
            if level and course_name:
                topics = content_handler.get_modules(level, course_name)
                return topics
            else:
                return jsonify({"error": "Missing parameters in the request URL"}), 400
        else:
            return jsonify({"error": "Unsupported method, use GET"}), 405
    elif type == 'get_courses':
        if request.method == 'GET':
            level = request.args.get('level')
            courses = settings_manager.get_courses_by_level(level)
            return jsonify(courses)
        else:
            return jsonify({"error": "Unsupported method, use GET"}), 405
    
    else:
        return jsonify({"error": "Invalid content type"}), 400


