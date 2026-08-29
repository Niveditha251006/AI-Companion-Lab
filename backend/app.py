from flask import Flask
from flask_cors import CORS

from api.auth import auth
from api.chat_analysis import chat_analysis
from api.insights import insights
from api.prompt_history import prompt_history
from routes.learning import learning
from routes.dashboard import dashboard
from api.ai_chat import ai_chat

app = Flask(__name__)

# Allow React frontend to communicate with Flask
CORS(app)

# =========================
# REGISTER API BLUEPRINTS
# =========================

app.register_blueprint(
    auth,
    url_prefix="/api"
)

app.register_blueprint(
    chat_analysis,
    url_prefix="/api"
)

app.register_blueprint(
    insights,
    url_prefix="/api"
)

app.register_blueprint(
    prompt_history,
    url_prefix="/api"
)

app.register_blueprint(
    learning,
    url_prefix="/api"
)

app.register_blueprint(
    dashboard,
    url_prefix="/api"
)

app.register_blueprint(
    ai_chat,
    url_prefix="/api"
)

# =========================
# RUN FLASK SERVER
# =========================

if __name__ == "__main__":
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )