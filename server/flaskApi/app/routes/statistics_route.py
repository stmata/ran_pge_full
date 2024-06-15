from flask import Blueprint, jsonify, request
from app.services.statistics_service import ContentManagement

statistics_blueprint = Blueprint('statistics', __name__)
content_management = ContentManagement()

@statistics_blueprint.route('/statistics/<type>', methods=['GET','DELETE'])
def statistics(type):
    if type == 'levelInfos':
        if request.method == 'GET':
            level_info = content_management.get_level_info()
            return jsonify(level_info)
    elif type == 'nbreVS':
        try:
            nbre = content_management.get_nbreVS()
            return jsonify(nbre)
        except Exception as e:
            return jsonify({"error": f"An error occurred: {e}"}), 500
    elif type == 'show_pie':
        count_pdf, count_local_video, count_youtube_url = content_management.pie()
        return jsonify({
            "pdf_count": count_pdf,
            "local_video_count": count_local_video,
            "youtube_url_count": count_youtube_url
        })
    elif type == 'show_vs':
        if request.method == 'GET':
            level = request.args.get('level')
            trait_data = content_management.list_vs(level)
        return jsonify(trait_data)
    elif type == 'delete_vs_gen':
        if request.method == 'DELETE':
            niveau_selected = request.args.get('niveau_selected')
            cours = request.args.get('cours')
            success = content_management.delete_vs_gen(niveau_selected, cours)
            if success:
                return jsonify({"message": "Les ressources ont été supprimées avec succès."})
            else:
                return jsonify({"error": "Une erreur s'est produite lors de la suppression des ressources."}), 500
    elif type =='delete_vs':
        if request.method == 'DELETE':
            niveau_selected = request.args.get('niveau_selected')
            cours = request.args.get('cours')
            topic = request.args.get('topic')
            print(niveau_selected, cours, topic)
            success = content_management.delete_vs(niveau_selected, cours, topic)
            if success:
                print('mzn')
                return jsonify({"message": "Les ressources ont été supprimées avec succès."})
            else:
                return jsonify({"error": "Une erreur s'est produite lors de la suppression des ressources."}), 500
    else:
        return jsonify({"error": "Invalid statistics type"}), 400
    
    
    # elif type == 'showHisto':
    #     moyennes = content_management.trait()
    #     return jsonify(moyennes)
