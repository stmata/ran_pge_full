from flask import Blueprint, request, jsonify
from services import download_services

download_videos = Blueprint('download_video', __name__)

@download_videos.route('/download_video', methods=['POST'])
def download_video():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Aucune donnée JSON fournie"}), 400

        video_link = data.get('video_link')
        if not video_link:
            return jsonify({"error": "Le lien de la vidéo est requis"}), 400

        response = download_services.download_video(video_link)
        return jsonify(response), 200
        

    except Exception as e:
        return jsonify({"error": f"Une erreur est survenue : {e}"}), 500
