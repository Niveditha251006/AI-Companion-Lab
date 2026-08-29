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
            "❌ PROMPT HISTORY GET ERROR:",
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
# ADD PROMPT
# =========================================

@prompt_history.route(
    "/prompt-history",
    methods=["POST"]
)
def add_prompt_history():

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        data = request.get_json(silent=True) or {}

        user_id = data.get("user_id")
        prompt = data.get("prompt")
        favorite = data.get("favorite", False)

        if user_id is None or not prompt:
            return jsonify({
                "message": "user_id and prompt are required"
            }), 400

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
                prompt,
                favorite
            )
        )

        db.commit()

        return jsonify({
            "message": "Prompt saved successfully",
            "id": cursor.lastrowid
        }), 201

    except Exception as error:

        db.rollback()

        print(
            "❌ ADD PROMPT ERROR:",
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
    "/prompt-history/<int:prompt_id>",
    methods=["PUT"]
)
def update_prompt_history(prompt_id):

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")
    favorite = data.get("favorite")

    if user_id is None:
        return jsonify({
            "message": "user_id is required"
        }), 400

    if favorite is None:
        return jsonify({
            "message": "favorite is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # Update only if prompt belongs to this user
        cursor.execute(
            """
            UPDATE prompt_history
            SET favorite = %s
            WHERE id = %s
            AND user_id = %s
            """,
            (
                favorite,
                prompt_id,
                user_id
            )
        )

        db.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "message":
                    "Prompt not found for this user"
            }), 404

        return jsonify({
            "message": "Prompt updated successfully"
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ UPDATE PROMPT ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to update prompt",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================
# DELETE PROMPT
# =========================================

@prompt_history.route(
    "/prompt-history/<int:prompt_id>",
    methods=["DELETE"]
)
def delete_prompt_history(prompt_id):

    data = request.get_json(silent=True) or {}

    user_id = data.get("user_id")

    if user_id is None:
        return jsonify({
            "message": "user_id is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # Delete only this user's prompt
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

        if cursor.rowcount == 0:
            return jsonify({
                "message":
                    "Prompt not found for this user"
            }), 404

        return jsonify({
            "message": "Prompt deleted successfully"
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ DELETE PROMPT ERROR:",
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
# CLEAR ALL PROMPT HISTORY FOR ONE USER
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

    cursor = db.cursor(dictionary=True)

    try:

        # -----------------------------------------
        # CHECK USER EXISTS
        # -----------------------------------------

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

        # -----------------------------------------
        # DELETE THIS USER'S PROMPT HISTORY
        # -----------------------------------------

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