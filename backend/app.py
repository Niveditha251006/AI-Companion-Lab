from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create Flask application FIRST
app = Flask(__name__)

# Enable CORS
CORS(app)

# =========================
# HEALTH CHECK
# =========================

@app.route("/")
def home():
    return {
        "status": "success",
        "message": "AI Companion Lab API is live 🚀"
    }

# =========================
# IMPORT BLUEPRINTS
# =========================

from api.auth import auth
from api.chat_analysis import chat_analysis
from api.insights import insights
from api.prompt_history import prompt_history
from routes.learning import learning
from routes.dashboard import dashboard
from api.ai_chat import ai_chat
from routes.activity import activity
from api.fact_checker import fact_checker
from api.prompt_analysis import prompt_analysis

# =========================
# REGISTER API BLUEPRINTS
# =========================

app.register_blueprint(auth, url_prefix="/api")
app.register_blueprint(chat_analysis, url_prefix="/api")
app.register_blueprint(insights, url_prefix="/api")
app.register_blueprint(prompt_history, url_prefix="/api")
app.register_blueprint(learning, url_prefix="/api")
app.register_blueprint(dashboard, url_prefix="/api")
app.register_blueprint(activity, url_prefix="/api")
app.register_blueprint(ai_chat, url_prefix="/api")
app.register_blueprint(fact_checker, url_prefix="/api")
app.register_blueprint(prompt_analysis, url_prefix="/api")

# =========================
# LOCAL RUN
# =========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )