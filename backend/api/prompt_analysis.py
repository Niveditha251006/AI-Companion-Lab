from flask import Blueprint, request, jsonify
import os
import json
from google import genai

from middleware.auth_middleware import token_required


prompt_analysis = Blueprint("prompt_analysis", __name__)

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


@prompt_analysis.route("/prompt-analysis", methods=["POST"])
@token_required
def analyze_prompt():

    data = request.get_json() or {}

    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({
            "message": "Prompt is required."
        }), 400

    try:
        analysis_prompt = f"""
You are an expert prompt engineering teacher.

Analyze the user's prompt and help them understand how to improve it.

USER PROMPT:
{prompt}

Evaluate the prompt using these areas:

1. Clarity
2. Specificity
3. Context
4. Desired output
5. Constraints

Return ONLY valid JSON using exactly this structure:

{{
  "score": 0,
  "strengths": [
    "strength 1",
    "strength 2"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2"
  ],
  "missing_elements": [
    "missing element 1"
  ],
  "improved_prompt": "A significantly improved version of the user's prompt.",
  "explanation": "Briefly explain why the improved prompt is better."
}}

Rules:

- score must be an integer from 0 to 100.
- strengths must contain useful observations about the original prompt.
- weaknesses must identify actual problems in the original prompt.
- missing_elements should identify useful information the user could add.
- improved_prompt must preserve the user's original intent.
- Do not change the task into a different task.
- Do not invent context that the user did not provide.
- explanation should be concise and educational.
- Return ONLY JSON.
"""

        response = client.models.generate_content(
            model="gemini-3.6-flash",
            contents=analysis_prompt,
        )

        raw_response = response.text.strip()

        if raw_response.startswith("```"):
            raw_response = raw_response.replace(
                "```json", ""
            )
            raw_response = raw_response.replace(
                "```", ""
            )
            raw_response = raw_response.strip()

        result = json.loads(raw_response)

        score = int(result.get("score", 0))

        score = max(0, min(score, 100))

        strengths = result.get("strengths", [])
        weaknesses = result.get("weaknesses", [])
        missing_elements = result.get(
            "missing_elements",
            []
        )

        improved_prompt = result.get(
            "improved_prompt",
            ""
        )

        explanation = result.get(
            "explanation",
            ""
        )

        if not isinstance(strengths, list):
            strengths = []

        if not isinstance(weaknesses, list):
            weaknesses = []

        if not isinstance(missing_elements, list):
            missing_elements = []

        return jsonify({
            "score": score,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "missing_elements": missing_elements,
            "improved_prompt": improved_prompt,
            "explanation": explanation
        }), 200

    except json.JSONDecodeError:
        return jsonify({
            "message":
                "The AI returned an invalid analysis response."
        }), 502

    except Exception as error:
        print(
            "Prompt analysis error:",
            error
        )

        return jsonify({
            "message":
                "Prompt analysis failed."
        }), 500