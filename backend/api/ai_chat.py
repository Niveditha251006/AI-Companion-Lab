from flask import Blueprint, request, jsonify
from database.connection import get_db_connection
from dotenv import load_dotenv
from google import genai
import os


load_dotenv(override=True)

ai_chat = Blueprint("ai_chat", __name__)


# =========================================================
# GEMINI CLIENT
# =========================================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# =========================================================
# AI CHAT
# =========================================================

@ai_chat.route("/ai-chat", methods=["POST"])
def chat():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "message": "Request data is required"
        }), 400

    user_id = data.get("user_id")
    user_message = data.get("message", "").strip()

    # =====================================================
    # VALIDATION
    # =====================================================

    if user_id is None:
        return jsonify({
            "message": "User ID is required"
        }), 400

    if not user_message:
        return jsonify({
            "message": "Message is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # =================================================
        # CHECK USER
        # =================================================

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "message": "User not found"
            }), 404

        # =================================================
        # GET RECENT CONVERSATION HISTORY
        # =================================================

        cursor.execute(
            """
            SELECT
                role,
                message
            FROM chat_messages
            WHERE user_id = %s
            ORDER BY id DESC
            LIMIT 20
            """,
            (user_id,)
        )

        history = cursor.fetchall()

        # Reverse so messages are in chronological order
        history.reverse()

        # =================================================
        # SAVE USER MESSAGE
        # =================================================

        cursor.execute(
            """
            INSERT INTO chat_messages
            (
                user_id,
                role,
                message
            )
            VALUES (%s, %s, %s)
            """,
            (
                user_id,
                "user",
                user_message
            )
        )

        db.commit()

        # =================================================
        # BUILD GEMINI CONVERSATION
        # =================================================

        contents = []

        for item in history:

            role = item["role"]

            # Gemini accepts "user" and "model"
            gemini_role = (
                "model"
                if role == "assistant"
                else "user"
            )

            contents.append({
                "role": gemini_role,
                "parts": [
                    {
                        "text": item["message"]
                    }
                ]
            })

        # Add current user message
        contents.append({
            "role": "user",
            "parts": [
                {
                    "text": user_message
                }
            ]
        })

        # =================================================
        # SYSTEM INSTRUCTIONS
        # =================================================

        system_instruction = """
You are the AI assistant for AI Companion Lab.

Your job is to be a helpful, intelligent and friendly
AI companion.

Follow these rules:

1. Give clear and accurate answers.
2. Explain difficult technical concepts in simple language.
3. Use examples when they improve understanding.
4. Use Markdown formatting when useful.
5. For programming questions, provide clean and readable code.
6. When the user asks a follow-up question, use the
   previous conversation to understand what they mean.
7. Do not unnecessarily repeat information that has
   already been explained.
8. If the user's question is ambiguous, use the
   conversation context to determine the most likely meaning.
9. Keep answers reasonably concise unless the user asks
   for a detailed explanation.
"""

        # =================================================
        # GEMINI AI RESPONSE
        # =================================================

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=contents,
            config={
                "system_instruction":
                    system_instruction
            }
        )

        ai_response = (
            response.text
            if response.text
            else "⚠️ No response received from AI."
        )

        # =================================================
        # SAVE AI RESPONSE
        # =================================================

        cursor.execute(
            """
            INSERT INTO chat_messages
            (
                user_id,
                role,
                message
            )
            VALUES (%s, %s, %s)
            """,
            (
                user_id,
                "assistant",
                ai_response
            )
        )

        db.commit()

        # =================================================
        # RESPONSE
        # =================================================

        return jsonify({
            "reply": ai_response
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ AI CHAT ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to process chat",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================================
# GET USER CHAT HISTORY
# =========================================================

@ai_chat.route(
    "/ai-chat/<int:user_id>",
    methods=["GET"]
)
def get_chat_history(user_id):

    db = None
    cursor = None

    try:

        db = get_db_connection()

        if not db:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = db.cursor(dictionary=True)

        # =================================================
        # CHECK USER
        # =================================================

        cursor.execute(
            """
            SELECT id
            FROM users
            WHERE id = %s
            """,
            (user_id,)
        )

        user = cursor.fetchone()

        if not user:
            return jsonify({
                "message": "User not found"
            }), 404

        # =================================================
        # GET CHAT HISTORY
        # =================================================

        cursor.execute(
            """
            SELECT
                id,
                role,
                message,
                created_at
            FROM chat_messages
            WHERE user_id = %s
            ORDER BY id ASC
            """,
            (user_id,)
        )

        messages = cursor.fetchall()

        return jsonify({
            "messages": messages
        }), 200

    except Exception as error:

        print(
            "❌ CHAT HISTORY ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to load chat history",
            "error": str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()
