from flask import Blueprint, request, jsonify
from database.connection import get_db_connection


learning = Blueprint("learning", __name__)


# =========================================================
# GET USER LEARNING DATA
# =========================================================

@learning.route("/learning/<int:user_id>", methods=["GET"])
def get_learning_data(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # Check user
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

        # Get learning data
        cursor.execute(
            """
            SELECT
                course_id,
                progress,
                favorite,
                updated_at
            FROM learning_courses
            WHERE user_id = %s
            ORDER BY course_id
            """,
            (user_id,)
        )

        courses = cursor.fetchall()

        return jsonify({
            "courses": courses
        }), 200

    except Exception as error:

        print("❌ LEARNING GET ERROR:", error)

        return jsonify({
            "message": "Failed to load learning data",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================================
# SAVE / UPDATE COURSE PROGRESS
# =========================================================

@learning.route("/learning/progress", methods=["POST"])
def update_course_progress():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request data is required"
        }), 400

    user_id = data.get("user_id")
    course_id = data.get("course_id")
    progress = data.get("progress")

    if user_id is None:
        return jsonify({
            "message": "User ID is required"
        }), 400

    if course_id is None:
        return jsonify({
            "message": "Course ID is required"
        }), 400

    if progress is None:
        return jsonify({
            "message": "Progress is required"
        }), 400

    if not 0 <= int(progress) <= 100:
        return jsonify({
            "message": "Progress must be between 0 and 100"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # Check user
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

        # Insert or update
        cursor.execute(
            """
            INSERT INTO learning_courses
            (
                user_id,
                course_id,
                progress
            )
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                progress = VALUES(progress)
            """,
            (
                user_id,
                course_id,
                progress
            )
        )

        db.commit()

        return jsonify({
            "message": "Course progress updated successfully",
            "course_id": course_id,
            "progress": progress
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ LEARNING PROGRESS ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to update course progress",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()


# =========================================================
# UPDATE FAVORITE
# =========================================================

@learning.route("/learning/favorite", methods=["POST"])
def update_course_favorite():

    data = request.get_json()

    if not data:
        return jsonify({
            "message": "Request data is required"
        }), 400

    user_id = data.get("user_id")
    course_id = data.get("course_id")
    favorite = data.get("favorite")

    if user_id is None:
        return jsonify({
            "message": "User ID is required"
        }), 400

    if course_id is None:
        return jsonify({
            "message": "Course ID is required"
        }), 400

    if favorite is None:
        return jsonify({
            "message": "Favorite status is required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    try:

        # Check user
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

        # Insert or update favorite
        cursor.execute(
            """
            INSERT INTO learning_courses
            (
                user_id,
                course_id,
                favorite
            )
            VALUES (%s, %s, %s)
            ON DUPLICATE KEY UPDATE
                favorite = VALUES(favorite)
            """,
            (
                user_id,
                course_id,
                favorite
            )
        )

        db.commit()

        return jsonify({
            "message": "Favorite updated successfully",
            "course_id": course_id,
            "favorite": bool(favorite)
        }), 200

    except Exception as error:

        db.rollback()

        print(
            "❌ LEARNING FAVORITE ERROR:",
            error
        )

        return jsonify({
            "message": "Failed to update favorite",
            "error": str(error)
        }), 500

    finally:

        cursor.close()
        db.close()