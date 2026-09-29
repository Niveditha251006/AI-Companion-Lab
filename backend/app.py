from flask import Flask
from flask_cors import CORS

# Your existing imports
from routes.activity import activity
from api.fact_checker import fact_checker
from api.prompt_analysis import prompt_analysis

app = Flask(__name__)
CORS(app)


# =========================
# HEALTH CHECK
# =========================

@app.route("/")
def home():
    return {
        "status": "success",
        "message": "AI Companion Lab API is live"
    }


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
# LOCAL DEVELOPMENT
# =========================

if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000
    )