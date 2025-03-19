import sqlite3
import requests
from app.dependencies import GOOGLE_SPREADSHEET_API_URL
from app.models.blogs import BlogsModel


class BlogsAdapter:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row

    def sync_blogs(self):
        response = requests.get(f"{self.GOOGLE_SPREADSHEET_API_URL}?action=getBlogs")
        if response.status_code == 200:
            blogs = response.json().get('blogs', [])
            BlogsModel(self.db_connection).insert_blogs(blogs)
            return {"success": "Blogs data synchronized successfully"}
        else:
            return {"error": "Unable to sync the blogs data from the API"}
