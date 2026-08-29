from flask import Blueprint, jsonify
from database.connection import get_db_connection


dashboard = Blueprint("dashboard", __name__)


# =========================================================
# GET DASHBOARD DATA
# =========================================================

@dashboard.route("/dashboard/<int:user_id>", methods=["GET"])
def get_dashboard_data(user_id):

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