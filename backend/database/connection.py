import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()


def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=os.getenv("DB_HOST", "localhost"),
            port=int(os.getenv("DB_PORT", "3307")),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD", ""),
            database=os.getenv(
                "DB_NAME",
                "ai_companion_lab"
            )
        )

        if connection.is_connected():
            print("✅ MySQL database connected successfully!")
            return connection

    except Error as error:
        print(f"❌ MySQL connection error: {error}")

    return None