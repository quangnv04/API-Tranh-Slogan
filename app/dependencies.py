import os
from dotenv import load_dotenv
from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from app.database import Database

load_dotenv()
router = APIRouter()
templates = Jinja2Templates(directory="app/templates")
GOOGLE_SPREADSHEET_API_URL = os.getenv("GOOGLE_SPREADSHEET_API_URL")

# Secret Key
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")
DEBUG = os.getenv("DEBUG")
db = Database(DATABASE_URL)


def get_db():
    try:
        conn = db.connect()
        yield conn
    finally:
        db.close()


def get_db_for_new_thread():
    conn = db.create_connection()
    try:
        yield conn
    finally:
        db.close_connection(conn)
