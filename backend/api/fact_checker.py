from flask import Blueprint, request, jsonify
import requests
import mysql.connector
import os
import json
from google import genai

from middleware.auth_middleware import token_required


fact_checker = Blueprint("fact_checker", __name__)

load_dotenv = None

# Gemini client
client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("DB_HOST"),
        port=int(os.getenv("DB_PORT", 3306)),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )


def get_wikipedia_evidence(claim):
    """
    Search Wikipedia for a relevant page and return its summary.
    """

    headers = {
        "User-Agent": "AI-Companion-Lab/1.0"
    }

    search_url = "https://en.wikipedia.org/w/api.php"

    search_params = {
        "action": "query",
        "list": "search",
        "srsearch": claim,
        "format": "json",
        "srlimit": 3,
    }

    response = requests.get(
        search_url,
        params=search_params,
        headers=headers,
        timeout=10,
    )

    response.raise_for_status()

    search_data = response.json()
    results = search_data.get("query", {}).get("search", [])

    if not results:
        return None

    page_title = results[0]["title"]

    summary_url = (
        "https://en.wikipedia.org/api/rest_v1/page/summary/"
        + requests.utils.quote(page_title.replace(" ", "_"))
    )

    summary_response = requests.get(
        summary_url,
        headers=headers,
        timeout=10,
    )

    summary_response.raise_for_status()

    summary_data = summary_response.json()

    return {
        "title": summary_data.get("title"),
        "extract": summary_data.get("extract"),
        "url": summary_data.get("content_urls", {})
        .get("desktop", {})
        .get("page"),
    }


@fact_checker.route("/fact-check", methods=["POST"])
@token_required
def fact_check():

    data = request.get_json() or {}

    claim = data.get("claim", "").strip()

    if not claim:
        return jsonify({
            "message": "Claim is required"
        }), 400

    user_id = request.user["user_id"]

    try:
        evidence = get_wikipedia_evidence(claim)

        if not evidence:
            return jsonify({
                "message": "No relevant evidence was found."
            }), 404

        evidence_text = evidence.get("extract", "")

        prompt = f"""
You are a careful fact-checking assistant.

Evaluate the user's claim using ONLY the evidence provided below.

USER CLAIM:
{claim}

EVIDENCE:
{evidence_text}

Return ONLY valid JSON in this exact structure:

{{
  "verdict": "Supported",
  "confidence": 0,
  "explanation": "Brief explanation based on the evidence."
}}

Rules:

- verdict must be exactly one of:
  Supported
  Contradicted
  Uncertain

- confidence must be an integer from 0 to 100.

- Use Supported when the evidence clearly supports the claim.

- Use Contradicted when the evidence clearly conflicts with the claim.

- Use Uncertain when the evidence is insufficient, ambiguous,
  incomplete, or does not directly establish the claim.

- Do not invent information that is not present in the evidence.
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=prompt,
        )

        raw_response = response.text.strip()

        if raw_response.startswith("```"):
            raw_response = raw_response.replace("```json", "")
            raw_response = raw_response.replace("```", "")
            raw_response = raw_response.strip()

        result = json.loads(raw_response)

        verdict = result.get("verdict", "Uncertain")
        confidence = int(result.get("confidence", 0))
        explanation = result.get("explanation", "")

        if verdict not in [
            "Supported",
            "Contradicted",
            "Uncertain",
        ]:
            verdict = "Uncertain"

        confidence = max(0, min(confidence, 100))

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO fact_checks
            (
                user_id,
                claim,
                verdict,
                confidence,
                explanation,
                evidence,
                source_url
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                claim,
                verdict,
                confidence,
                explanation,
                evidence_text,
                evidence.get("url"),
            ),
        )

        connection.commit()

        fact_check_id = cursor.lastrowid

        cursor.close()
        connection.close()

        return jsonify({
            "id": fact_check_id,
            "claim": claim,
            "verdict": verdict,
            "confidence": confidence,
            "explanation": explanation,
            "evidence": evidence_text,
            "source_url": evidence.get("url"),
        }), 200

    except requests.RequestException:
        return jsonify({
            "message": "Unable to retrieve evidence right now."
        }), 502

    except json.JSONDecodeError:
        return jsonify({
            "message": "The AI returned an invalid fact-check response."
        }), 502

    except Exception as error:
        print("Fact checker error:", error)

        return jsonify({
            "message": "Fact checking failed."
        }), 500


@fact_checker.route("/fact-check/<int:fact_check_id>", methods=["DELETE"])
@token_required
def delete_fact_check(fact_check_id):

    user_id = request.user["user_id"]

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM fact_checks
            WHERE id = %s AND user_id = %s
            """,
            (fact_check_id, user_id),
        )

        connection.commit()

        deleted = cursor.rowcount

        cursor.close()
        connection.close()

        if deleted == 0:
            return jsonify({
                "message": "Fact check not found."
            }), 404

        return jsonify({
            "message": "Fact check deleted successfully."
        }), 200

    except Exception as error:
        print("Delete fact check error:", error)

        return jsonify({
            "message": "Failed to delete fact check."
        }), 500


@fact_checker.route("/fact-check/history", methods=["GET"])
@token_required
def fact_check_history():

    user_id = request.user["user_id"]

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT
                id,
                claim,
                verdict,
                confidence,
                explanation,
                evidence,
                source_url,
                created_at
            FROM fact_checks
            WHERE user_id = %s
            ORDER BY created_at DESC
            """,
            (user_id,),
        )

        history = cursor.fetchall()

        cursor.close()
        connection.close()

        return jsonify(history), 200

    except Exception as error:
        print("Fact check history error:", error)

        return jsonify({
            "message": "Failed to load fact-check history."
        }), 500