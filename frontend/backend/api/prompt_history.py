from flask import Blueprint, request, jsonify
from database.connection import get_db_connection


prompt_history = Blueprint("prompt_history", __name__)


# =========================================
# GET PROMPT HISTORY
# =========================================

@prompt_history.route(
    "/prompt-history/<int:user_id>",
    methods=["GET"]
)
def get_prompt_history(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                prompt,
                favorite,
                created_at
            FROM prompt_history
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
            "PROMPT HISTORY GET ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to load prompt history",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================
# SAVE PROMPT
# =========================================

@prompt_history.route(
    "/prompt-history",
    methods=["POST"]
)
def save_prompt():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request data is required"
        }), 400

    user_id = data.get("user_id")
    prompt = data.get("prompt")
    favorite = data.get(
        "favorite",
        False
    )

    # -------------------------------
    # VALIDATE USER ID
    # -------------------------------

    if not user_id:
        return jsonify({
            "message": "User ID is required"
        }), 400

    # -------------------------------
    # VALIDATE PROMPT
    # -------------------------------

    if not prompt or not prompt.strip():
        return jsonify({
            "message": "Prompt is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # -------------------------------
        # CHECK USER EXISTS
        # -------------------------------

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

        # -------------------------------
        # INSERT PROMPT
        # -------------------------------

        cursor.execute(
            """
            INSERT INTO prompt_history
            (
                user_id,
                prompt,
                favorite
            )
            VALUES
            (
                %s,
                %s,
                %s
            )
            """,
            (
                user_id,
                prompt.strip(),
                bool(favorite)
            )
        )

        db.commit()

        prompt_id = cursor.lastrowid

        # -------------------------------
        # GET SAVED PROMPT
        # -------------------------------

        cursor.execute(
            """
            SELECT
                id,
                user_id,
                prompt,
                favorite,
                created_at
            FROM prompt_history
            WHERE id = %s
            """,
            (prompt_id,)
        )

        saved_prompt = cursor.fetchone()

        return jsonify({
            "message": "Prompt saved successfully",
            "prompt": saved_prompt
        }), 201

    except Exception as error:

        db.rollback()

        print(
            "PROMPT SAVE ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to save prompt",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================
# UPDATE FAVORITE
# =========================================

@prompt_history.route(
    "/prompt-history/<int:prompt_id>/favorite",
    methods=["PUT"]
)
def toggle_favorite(prompt_id):

    data = request.get_json() or {}

    user_id = data.get("user_id")
    favorite = data.get("favorite")

    # -------------------------------
    # VALIDATE USER ID
    # -------------------------------

    if user_id is None:
        return jsonify({
            "message": "User ID is required"
        }), 400

    # -------------------------------
    # VALIDATE FAVORITE
    # -------------------------------

    if favorite is None:
        return jsonify({
            "message": "Favorite value is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # -------------------------------
        # CHECK PROMPT BELONGS TO USER
        # -------------------------------

        cursor.execute(
            """
            SELECT
                id
            FROM prompt_history
            WHERE id = %s
            AND user_id = %s
            """,
            (
                prompt_id,
                user_id
            )
        )

        prompt = cursor.fetchone()

        if not prompt:
            return jsonify({
                "message": "Prompt not found for this user"
            }), 404

        # -------------------------------
        # UPDATE FAVORITE
        # -------------------------------

        cursor.execute(
            """
            UPDATE prompt_history
            SET favorite = %s
            WHERE id = %s
            AND user_id = %s
            """,
            (
                bool(favorite),
                prompt_id,
                user_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Favorite updated successfully",
            "favorite": bool(favorite)
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "FAVORITE UPDATE ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to update favorite",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================
# DELETE ONE PROMPT
# =========================================

@prompt_history.route(
    "/prompt-history/<int:prompt_id>",
    methods=["DELETE"]
)
def delete_prompt(prompt_id):

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")

    # -------------------------------
    # VALIDATE USER ID
    # -------------------------------

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

        # -------------------------------
        # CHECK PROMPT BELONGS TO USER
        # -------------------------------

        cursor.execute(
            """
            SELECT
                id
            FROM prompt_history
            WHERE id = %s
            AND user_id = %s
            """,
            (
                prompt_id,
                user_id
            )
        )

        prompt = cursor.fetchone()

        if not prompt:
            return jsonify({
                "message": "Prompt not found for this user"
            }), 404

        # -------------------------------
        # DELETE PROMPT
        # -------------------------------

        cursor.execute(
            """
            DELETE FROM prompt_history
            WHERE id = %s
            AND user_id = %s
            """,
            (
                prompt_id,
                user_id
            )
        )

        db.commit()

        return jsonify({
            "message": "Prompt deleted successfully"
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "PROMPT DELETE ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to delete prompt",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================
# CLEAR ALL PROMPTS FOR ONE USER
# =========================================

@prompt_history.route(
    "/prompt-history/user/<int:user_id>",
    methods=["DELETE"]
)
def clear_prompt_history(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor()

    try:

        # -------------------------------
        # DELETE ALL USER PROMPTS
        # -------------------------------

        cursor.execute(
            """
            DELETE FROM prompt_history
            WHERE user_id = %s
            """,
            (user_id,)
        )

        deleted_count = cursor.rowcount

        db.commit()

        return jsonify({
            "message": "Prompt history cleared successfully",
            "deleted": deleted_count
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "CLEAR HISTORY ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to clear prompt history",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()
        # =========================================
# CLEAR ALL PROMPTS FOR USER
# =========================================

@prompt_history.route(
    "/prompt-history/clear/<int:user_id>",
    methods=["DELETE"]
)
def clear_prompt_history(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # Check user exists
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

        # Delete all prompts belonging to this user
        cursor.execute(
            """
            DELETE FROM prompt_history
            WHERE user_id = %s
            """,
            (user_id,)
        )

        deleted = cursor.rowcount

        db.commit()

        return jsonify({
            "message": "Prompt history cleared successfully",
            "deleted": deleted
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ CLEAR PROMPT HISTORY ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to clear prompt history",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()