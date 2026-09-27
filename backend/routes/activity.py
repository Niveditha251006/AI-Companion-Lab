from flask import Blueprint, jsonify, request
from database.connection import get_db_connection
from datetime import date, timedelta
from middleware.auth_middleware import token_required

activity = Blueprint("activity", __name__)


# =========================================================
# RECORD ACTIVITY
# =========================================================

@activity.route("/activity/<activity_type>", methods=["POST"])
@token_required
def record_activity(activity_type):

    db = None
    cursor = None

    try:

        # =====================================================
        # GET AUTHENTICATED USER
        # =====================================================

        user_id = request.user["user_id"]

        if activity_type not in ["lesson", "prompt"]:
            return jsonify({
                "message": "Invalid activity type"
            }), 400

        user_id = int(user_id)


        # =====================================================
        # DATABASE
        # =====================================================

        db = get_db_connection()

        if not db:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = db.cursor(dictionary=True)

        # =====================================================
        # VERIFY USER
        # =====================================================

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

        # =====================================================
        # GET CURRENT PROGRESS
        # =====================================================

        cursor.execute(
            """
            SELECT
                xp,
                streak,
                last_active_date
            FROM user_progress
            WHERE user_id = %s
            """,
            (user_id,)
        )

        progress = cursor.fetchone()

        if not progress:

            cursor.execute(
                """
                INSERT INTO user_progress
                    (user_id, xp, streak, last_active_date)
                VALUES
                    (%s, 0, 0, NULL)
                """,
                (user_id,)
            )

            db.commit()

            progress = {
                "xp": 0,
                "streak": 0,
                "last_active_date": None
            }

        # =====================================================
        # XP
        # =====================================================

        current_xp = int(
            progress["xp"] or 0
        )

        new_xp = current_xp + 10

        # =====================================================
        # STREAK
        # =====================================================

        today = date.today()

        last_active_date = (
            progress["last_active_date"]
        )

        current_streak = int(
            progress["streak"] or 0
        )

        if last_active_date == today:

            # Already active today
            new_streak = current_streak

        elif (
            last_active_date ==
            today - timedelta(days=1)
        ):

            # Active yesterday
            new_streak = current_streak + 1

        else:

            # New streak
            new_streak = 1

        # =====================================================
        # SAVE PROGRESS
        # =====================================================

        cursor.execute(
            """
            UPDATE user_progress
            SET
                xp = %s,
                streak = %s,
                last_active_date = %s
            WHERE user_id = %s
            """,
            (
                new_xp,
                new_streak,
                today,
                user_id
            )
        )

        db.commit()

        # =====================================================
        # RESPONSE
        # =====================================================

        return jsonify({

            "message":
                "Activity recorded successfully",

            "activity":
                activity_type,

            "xp":
                new_xp,

            "streak":
                new_streak,

            "last_active_date":
                today.isoformat()

        }), 200

    except Exception as error:

        if db:
            db.rollback()

        print(
            "❌ ACTIVITY ERROR:",
            error
        )

        return jsonify({
            "message":
                "Failed to record activity",
            "error":
                str(error)
        }), 500

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()