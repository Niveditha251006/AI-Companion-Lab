from functools import wraps
from flask import request, jsonify
import jwt
import os


JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")


def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        # Get Authorization header
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({
                "message": "Authorization token is missing"
            }), 401

        # Check Bearer format
        parts = auth_header.split()

        if len(parts) != 2 or parts[0] != "Bearer":
            return jsonify({
                "message": "Invalid authorization header"
            }), 401

        token = parts[1]

        try:

            # Verify JWT
            decoded_token = jwt.decode(
                token,
                JWT_SECRET_KEY,
                algorithms=["HS256"]
            )

            # Store decoded user information
            request.user = decoded_token

        except jwt.ExpiredSignatureError:

            return jsonify({
                "message": "Token has expired"
            }), 401

        except jwt.InvalidTokenError:

            return jsonify({
                "message": "Invalid token"
            }), 401

        return f(*args, **kwargs)

    return decorated