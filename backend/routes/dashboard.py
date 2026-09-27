from flask import Blueprint, jsonify, request
from database.connection import get_db_connection
from middleware.auth_middleware import token_required

dashboard = Blueprint("dashboard", __name__)


# =========================================================
# GET DASHBOARD DATA
# =========================================================

@dashboard.route("/dashboard", methods=["GET"])
@token_required
def get_dashboard():
    user_id = request.user["user_id"]

    db = None
    cursor = None

    try:

        db = get_db_connection()

        if not db:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = db.cursor(dictionary=True)

        # =====================================================
        # USER
        # =====================================================

        cursor.execute(
            """
            SELECT
                id,
                name,
                email
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

        # =====================================================
        # PROMPTS
        # =====================================================

        cursor.execute(
            """
            SELECT COUNT(*) AS prompt_count
            FROM prompt_history
            WHERE user_id = %s
            """,
            (user_id,)
        )

        prompt_result = cursor.fetchone()

        prompt_count = int(
            prompt_result["prompt_count"] or 0
        )

        # =====================================================
        # COURSES
        # =====================================================

        cursor.execute(
            """
            SELECT
                course_id,
                progress
            FROM learning_courses
            WHERE user_id = %s
            """,
            (user_id,)
        )

        courses = cursor.fetchall()

        completed_courses = sum(
            1
            for course in courses
            if int(course["progress"] or 0) >= 100
        )

        if courses:
            overall_progress = (
                sum(
                    int(course["progress"] or 0)
                    for course in courses
                )
                / len(courses)
            )
        else:
            overall_progress = 0

        # =====================================================
        # XP
        # =====================================================

        xp = 0

        try:

            cursor.execute(
                """
                SELECT xp
                FROM user_progress
                WHERE user_id = %s
                """,
                (user_id,)
            )

            xp_result = cursor.fetchone()

            if xp_result:
                xp = int(
                    xp_result["xp"] or 0
                )

        except Exception:

            # XP table may not exist yet
            xp = 0

        # =====================================================
        # STREAK
        # =====================================================

        streak = 0

        try:

            cursor.execute(
                """
                SELECT streak
                FROM user_progress
                WHERE user_id = %s
                """,
                (user_id,)
            )

            streak_result = cursor.fetchone()

            if streak_result:
                streak = int(
                    streak_result["streak"] or 0
                )

        except Exception:

            # Streak system will be connected later
            streak = 0

        # =====================================================
        # RESPONSE
        # =====================================================

        return jsonify({

            "user": user,

            "statistics": {

                "prompt_count":
                    prompt_count,

                "completed_courses":
                    completed_courses,

                "overall_progress":
                    round(
                        overall_progress,
                        2
                    ),

                "xp":
                    xp,

                "streak":
                    streak
            }

        }), 200

    except Exception as error:

        print(
            "❌ DASHBOARD ERROR:",
            error
        )

        return jsonify({
            "message":
                "Failed to load dashboard data",
            "error":
                str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()
@dashboard.route("/dashboard/progress", methods=["POST"])
def update_user_progress():

    data = request.get_json()

    if not data:
        return jsonify({"message": "Request data is required"}), 400

    user_id = data.get("user_id")
    xp = data.get("xp")
    streak = data.get("streak")
    last_active_date = data.get("last_active_date")

    if user_id is None:
        return jsonify({"message": "User ID is required"}), 400

    if xp is None:
        return jsonify({"message": "XP is required"}), 400

    if streak is None:
        return jsonify({"message": "Streak is required"}), 400

    db = get_db_connection()

    if not db:
        return jsonify({"message": "Database connection failed"}), 500

    cursor = db.cursor(dictionary=True)

    try:
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
            return jsonify({"message": "User not found"}), 404

        cursor.execute(
            """
            INSERT INTO user_progress
            (
                user_id,
                xp,
                streak,
                last_active_date
            )
            VALUES (%s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                xp = VALUES(xp),
                streak = VALUES(streak),
                last_active_date = VALUES(last_active_date)
            """,
            (
                user_id,
                int(xp),
                int(streak),
                last_active_date
            )
        )

        db.commit()

        return jsonify({
            "message": "User progress updated successfully",
            "xp": int(xp),
            "streak": int(streak)
        }), 200

    except Exception as error:
        db.rollback()
        print("❌ USER PROGRESS ERROR:", error)

        return jsonify({
            "message": "Failed to update user progress",
            "error": str(error)
        }), 500

    finally:
        cursor.close()
        db.close()
