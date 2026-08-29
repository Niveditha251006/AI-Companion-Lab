from flask import Blueprint, request, jsonify
from database.connection import get_db_connection


chat_analysis = Blueprint("chat_analysis", __name__)


# =========================================================
# SAVE CHAT ANALYSIS
# =========================================================

@chat_analysis.route(
    "/chat-analysis",
    methods=["POST"]
)
def save_chat_analysis():

    data = request.get_json(silent=True)

    if not data:
        return jsonify({
            "message": "Request data is required"
        }), 400

    user_id = data.get("user_id")

    words = data.get("words")
    characters = data.get("characters")
    sentences = data.get("sentences")
    questions = data.get("questions")
    paragraphs = data.get("paragraphs")
    readability = data.get("readability")
    longest_word = data.get("longest_word", "")
    reading_time = data.get("reading_time")

    # =====================================================
    # VALIDATE USER ID
    # =====================================================

    if user_id is None:
        return jsonify({
            "message": "User ID is required"
        }), 400

    # =====================================================
    # VALIDATE ANALYSIS DATA
    # =====================================================

    required_values = [
        words,
        characters,
        sentences,
        questions,
        paragraphs,
        readability,
        reading_time
    ]

    if any(value is None for value in required_values):
        return jsonify({
            "message": "Analysis data is incomplete"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # =================================================
        # CHECK USER EXISTS
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
        # SAVE ANALYSIS
        # =================================================

        cursor.execute(
            """
            INSERT INTO chat_analysis
            (
                user_id,
                words,
                characters,
                sentences,
                questions,
                paragraphs,
                readability,
                longest_word,
                reading_time
            )
            VALUES
            (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                words,
                characters,
                sentences,
                questions,
                paragraphs,
                readability,
                longest_word,
                reading_time
            )
        )

        db.commit()

        analysis_id = cursor.lastrowid

        # =================================================
        # GET SAVED ANALYSIS
        # =================================================

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                words,
                characters,
                sentences,
                questions,
                paragraphs,
                readability,
                longest_word,
                reading_time,
                created_at
            FROM chat_analysis
            WHERE id = %s
            AND user_id = %s
            """,
            (
                analysis_id,
                user_id
            )
        )

        saved_analysis = cursor.fetchone()

        return jsonify({
            "message": "Chat analysis saved successfully",
            "analysis": saved_analysis
        }), 201

    except Exception as error:

        db.rollback()

        print(
            "❌ CHAT ANALYSIS SAVE ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to save chat analysis",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================================
# GET USER ANALYSIS HISTORY
# =========================================================

@chat_analysis.route(
    "/chat-analysis/<int:user_id>",
    methods=["GET"]
)
def get_chat_analysis_history(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # =================================================
        # CHECK USER EXISTS
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
        # GET USER'S HISTORY
        # =================================================

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                words,
                characters,
                sentences,
                questions,
                paragraphs,
                readability,
                longest_word,
                reading_time,
                created_at
            FROM chat_analysis
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,)
        )

        history = cursor.fetchall()

        return jsonify({
            "history": history
        }), 200

    except Exception as error:

        print(
            "❌ CHAT ANALYSIS GET ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to load analysis history",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================================
# DELETE ONE ANALYSIS
# =========================================================

@chat_analysis.route(
    "/chat-analysis/<int:analysis_id>",
    methods=["DELETE"]
)
def delete_chat_analysis(analysis_id):

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")

    # =====================================================
    # VALIDATE USER ID
    # =====================================================

    if user_id is None:
        return jsonify({
            "message": "User ID is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # =================================================
        # CHECK ANALYSIS BELONGS TO USER
        # =================================================

        cursor.execute(
            """
            SELECT id
            FROM chat_analysis
            WHERE id = %s
            AND user_id = %s
            """,
            (
                analysis_id,
                user_id
            )
        )

        analysis = cursor.fetchone()

        if not analysis:
            return jsonify({
                "message": "Analysis not found for this user"
            }), 404

        # =================================================
        # DELETE ANALYSIS
        # =================================================

        cursor.execute(
            """
            DELETE FROM chat_analysis
            WHERE id = %s
            AND user_id = %s
            """,
            (
                analysis_id,
                user_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Analysis deleted successfully"
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ CHAT ANALYSIS DELETE ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to delete analysis",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================================
# CLEAR ALL ANALYSIS HISTORY FOR ONE USER
# =========================================================

@chat_analysis.route(
    "/chat-analysis/clear/<int:user_id>",
    methods=["DELETE"]
)
def clear_chat_analysis_history(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # =================================================
        # CHECK USER EXISTS
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
        # DELETE USER'S ENTIRE HISTORY
        # =================================================

        cursor.execute(
            """
            DELETE FROM chat_analysis
            WHERE user_id = %s
            """,
            (user_id,)
        )

        deleted_count = cursor.rowcount

        db.commit()

        return jsonify({
            "message": "Analysis history cleared successfully",
            "deleted": deleted_count
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ CHAT ANALYSIS CLEAR ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to clear analysis history",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()