from flask import Blueprint, jsonify
from database.connection import get_db_connection


insights = Blueprint("insights", __name__)


# =========================================================
# GET CONVERSATION INSIGHTS
# =========================================================

@insights.route("/insights/<int:user_id>", methods=["GET"])
def get_insights(user_id):

    db = None
    cursor = None

    try:

        # =====================================================
        # DATABASE CONNECTION
        # =====================================================

        db = get_db_connection()

        if not db:
            return jsonify({
                "message": "Database connection failed"
            }), 500

        cursor = db.cursor(dictionary=True)

        # =====================================================
        # CHECK USER
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
        # TOTAL STATISTICS
        # =====================================================

        cursor.execute(
            """
            SELECT
                COUNT(*) AS total_analyses,

                COALESCE(
                    SUM(words),
                    0
                ) AS total_words,

                COALESCE(
                    SUM(characters),
                    0
                ) AS total_characters,

                COALESCE(
                    SUM(sentences),
                    0
                ) AS total_sentences,

                COALESCE(
                    SUM(questions),
                    0
                ) AS total_questions,

                COALESCE(
                    SUM(paragraphs),
                    0
                ) AS total_paragraphs,

                COALESCE(
                    AVG(readability),
                    0
                ) AS average_readability,

                COALESCE(
                    AVG(reading_time),
                    0
                ) AS average_reading_time,

                COALESCE(
                    AVG(words),
                    0
                ) AS average_words

            FROM chat_analysis
            WHERE user_id = %s
            """,
            (user_id,)
        )

        statistics = cursor.fetchone()

        # =====================================================
        # RECENT ANALYSES
        # =====================================================

        cursor.execute(
            """
            SELECT
                id,
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

            LIMIT 10
            """,
            (user_id,)
        )

        recent_analyses = cursor.fetchall()

        # =====================================================
        # READABILITY TREND
        # =====================================================

        cursor.execute(
            """
            SELECT
                created_at,
                readability

            FROM chat_analysis

            WHERE user_id = %s

            ORDER BY created_at ASC

            LIMIT 20
            """,
            (user_id,)
        )

        readability_trend = cursor.fetchall()

        # =====================================================
        # WORD COUNT TREND
        # =====================================================

        cursor.execute(
            """
            SELECT
                created_at,
                words

            FROM chat_analysis

            WHERE user_id = %s

            ORDER BY created_at ASC

            LIMIT 20
            """,
            (user_id,)
        )

        word_trend = cursor.fetchall()

        # =====================================================
        # BEST ANALYSIS
        # =====================================================

        cursor.execute(
            """
            SELECT
                id,
                words,
                readability,
                questions,
                reading_time,
                created_at

            FROM chat_analysis

            WHERE user_id = %s

            ORDER BY readability DESC

            LIMIT 1
            """,
            (user_id,)
        )

        best_analysis = cursor.fetchone()

        # =====================================================
        # LONGEST ANALYSIS
        # =====================================================

        cursor.execute(
            """
            SELECT
                id,
                words,
                readability,
                questions,
                reading_time,
                created_at

            FROM chat_analysis

            WHERE user_id = %s

            ORDER BY words DESC

            LIMIT 1
            """,
            (user_id,)
        )

        longest_analysis = cursor.fetchone()

        # =====================================================
        # RESPONSE
        # =====================================================

        return jsonify({

            "user": user,

            "statistics": {

                "total_analyses":
                    int(
                        statistics["total_analyses"]
                        or 0
                    ),

                "total_words":
                    int(
                        statistics["total_words"]
                        or 0
                    ),

                "total_characters":
                    int(
                        statistics["total_characters"]
                        or 0
                    ),

                "total_sentences":
                    int(
                        statistics["total_sentences"]
                        or 0
                    ),

                "total_questions":
                    int(
                        statistics["total_questions"]
                        or 0
                    ),

                "total_paragraphs":
                    int(
                        statistics["total_paragraphs"]
                        or 0
                    ),

                "average_readability":
                    round(
                        float(
                            statistics[
                                "average_readability"
                            ] or 0
                        ),
                        2
                    ),

                "average_reading_time":
                    round(
                        float(
                            statistics[
                                "average_reading_time"
                            ] or 0
                        ),
                        2
                    ),

                "average_words":
                    round(
                        float(
                            statistics[
                                "average_words"
                            ] or 0
                        ),
                        2
                    )
            },

            "recent_analyses":
                recent_analyses,

            "readability_trend":
                readability_trend,

            "word_trend":
                word_trend,

            "best_analysis":
                best_analysis,

            "longest_analysis":
                longest_analysis

        }), 200

    # =========================================================
    # ERROR HANDLING
    # =========================================================

    except Exception as error:

        print(
            "❌ INSIGHTS ERROR:",
            error
        )

        return jsonify({
            "message":
                "Failed to load conversation insights",
            "error":
                str(error)
        }), 500

    # =========================================================
    # CLEANUP
    # =========================================================

    finally:

        if cursor:
            cursor.close()

        if db:
            db.close()