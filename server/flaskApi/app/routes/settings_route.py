from flask import Blueprint, jsonify, request
from app.services.settings_service import SettingsManager

settings_blueprint = Blueprint('settings', __name__)
settings_manager = SettingsManager()


@settings_blueprint.route('/settings/<type>', methods=['GET', 'POST'])
def settings(type):
    if type == 'courses':
        if request.method == 'GET':
            level = request.args.get('level')
            if level:
                courses = settings_manager.get_courses_by_level(level)
                return jsonify(courses)
            else:
                return jsonify({"error": "Level parameter is missing"}), 400
        else:
            return jsonify({"error": "Unsupported method, use GET"}), 405
    elif type == 'courses_status':
        if request.method == 'GET':
            level = request.args.get('level')
            if level:
                courses_status = settings_manager.get_courses_and_status(level)
                return jsonify(courses_status)
            else:
                return jsonify({"error": "Level parameter is missing"}), 400
        else:
            return jsonify({"error": "Unsupported method, use GET"}), 405
    elif type == 'add_update_documents':
        if request.method == 'GET':
            level = request.args.get('level')
            course_name = request.args.get('course_name')
            module_names = request.args.get('module_names')

            if level and course_name and module_names:
                result_message = settings_manager.add_or_update_modules(level, course_name, module_names.split(','))
                return jsonify({"message": result_message})
            else:
                return jsonify({"error": "Missing parameters in the request URL"}), 400
        else:
            return jsonify({"error": "Unsupported method, use GET"}), 405
    elif type == 'update_course_status':
        if request.method == 'POST':
            data = request.get_json()
            if 'level' in data and 'courses' in data:
                level = data['level']
                courses = data['courses']
                result_messages = []
                for course in courses:
                    course_name = course.get('name')
                    status = course.get('status')
                    result_message = settings_manager.update_course_status(level, course_name, status)
                    result_messages.append(result_message)
                return jsonify({"messages": result_messages}), 200
            else:
                return jsonify({"error": "Missing level or courses in the request body"}), 400
        else:
            return jsonify({"error": "Unsupported method, use POST"}), 405
    else:
        return jsonify({"error": "Invalid settings type"}), 400
