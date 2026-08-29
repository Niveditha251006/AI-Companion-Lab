from flask import Blueprint, request, jsonify
from database.connection import get_db_connection
from werkzeug.security import generate_password_hash, check_password_hash


auth = Blueprint("auth", __name__)


# =========================
# REGISTER
# =========================

@auth.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({
            "message": "All fields are required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor()

    cursor.execute(
        "SELECT id FROM users WHERE email = %s",
        (email,)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        db.close()

        return jsonify({
            "message": "Email already registered"
        }), 409

    hashed_password = generate_password_hash(password)

    cursor.execute(
        """
        INSERT INTO users (name, email, password)
        VALUES (%s, %s, %s)
        """,
        (name, email, hashed_password)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "Registration successful"
    }), 201


# =========================
# LOGIN
# =========================

@auth.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "message": "Email and password are required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name, email, password
        FROM users
        WHERE email = %s
        """,
        (email,)
    )

    user = cursor.fetchone()

    if not user:
        cursor.close()
        db.close()

        return jsonify({
            "message": "Invalid email or password"
        }), 401

    if not check_password_hash(
        user["password"],
        password
    ):
        cursor.close()
        db.close()

        return jsonify({
            "message": "Invalid email or password"
        }), 401

    cursor.close()
    db.close()

    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }), 200


# =========================
# GET PROFILE
# =========================

@auth.route("/profile/<int:user_id>", methods=["GET"])
def get_profile(user_id):

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    cursor.execute(
        """
        SELECT id, name, email
        FROM users
        WHERE id = %s
        """,
        (user_id,)
    )

    user = cursor.fetchone()

    cursor.close()
    db.close()

    if not user:
        return jsonify({
            "message": "User not found"
        }), 404

    return jsonify({
        "user": user
    }), 200


# =========================
# UPDATE PROFILE
# =========================

@auth.route("/profile/<int:user_id>", methods=["PUT"])
def update_profile(user_id):

    data = request.get_json()

    name = data.get("name")
    email = data.get("email")

    if not name or not email:
        return jsonify({
            "message": "Name and email are required"
        }), 400

    db = get_db_connection()

    if not db:
        return jsonify({
            "message": "Database connection failed"
        }), 500

    cursor = db.cursor(dictionary=True)

    # Check whether user exists
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
        cursor.close()
        db.close()

        return jsonify({
            "message": "User not found"
        }), 404

    # Check whether another account uses this email
    cursor.execute(
        """
        SELECT id
        FROM users
        WHERE email = %s AND id != %s
        """,
        (email, user_id)
    )

    existing_user = cursor.fetchone()

    if existing_user:
        cursor.close()
        db.close()

        return jsonify({
            "message": "Email already registered"
        }), 409

    # Update database
    cursor.execute(
        """
        UPDATE users
        SET name = %s, email = %s
        WHERE id = %s
        """,
        (name, email, user_id)
    )

    db.commit()

    cursor.close()
    db.close()

    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user_id,
            "name": name,
            "email": email
        }
    }), 200