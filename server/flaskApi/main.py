# from flask import Flask
# from app.routes import receive_vector_route , chat_route, verify_routes, user_routes , message_routes, conversation_routes,course_routes, textToSpeech_routes,evalution_route,click_routes
# from flask_cors import CORS
# import os
# from opencensus.ext.azure.trace_exporter import AzureExporter
# from opencensus.trace.samplers import ProbabilitySampler
# from opencensus.trace.tracer import Tracer
# from opencensus.ext.flask.flask_middleware import FlaskMiddleware

# app = Flask(__name__)

# # Configurez Application Insights
# middleware = FlaskMiddleware(
#     app,
#     exporter=AzureExporter(connection_string="InstrumentationKey=0f615612-6cce-4c0b-903e-fe53e8a0a719"),
#     sampler=ProbabilitySampler(rate=1.0),
# )

# CORS(app)
# app.register_blueprint(receive_vector_route)
# app.register_blueprint(chat_route)
# app.register_blueprint(verify_routes)
# app.register_blueprint(user_routes)
# app.register_blueprint(message_routes)
# app.register_blueprint(conversation_routes)
# app.register_blueprint(course_routes)
# app.register_blueprint(textToSpeech_routes)
# app.register_blueprint(evalution_route)
# app.register_blueprint(click_routes)

# if __name__ == "__main__":
#     app.run(host='0.0.0.0', port=8000)

from flask import Flask
from app.routes import receive_vector_route , chat_route, verify_routes, user_routes , message_routes, conversation_routes,course_routes, textToSpeech_routes,evalution_route, click_routes,statistics_blueprint, settings_blueprint, home_blueprint
from flask_cors import CORS
import os
from waitress import serve


app = Flask(__name__)


CORS(app)
app.register_blueprint(receive_vector_route)
app.register_blueprint(chat_route)
app.register_blueprint(verify_routes)
app.register_blueprint(user_routes)
app.register_blueprint(message_routes)
app.register_blueprint(conversation_routes)
app.register_blueprint(course_routes)
app.register_blueprint(textToSpeech_routes)
app.register_blueprint(evalution_route)
app.register_blueprint(click_routes)
app.register_blueprint(statistics_blueprint)
app.register_blueprint(settings_blueprint)
app.register_blueprint(home_blueprint)

if __name__ == "__main__":
    app.run(host='localhost', port=5002, debug=False)



