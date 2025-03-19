import sqlite3
import requests
from app.dependencies import GOOGLE_SPREADSHEET_API_URL
from app.models.products import ProductsModel


class ProductsAdapter:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row

    def sync_products(self):
        response = requests.get(f"{self.GOOGLE_SPREADSHEET_API_URL}?action=getProducts")
        if response.status_code == 200:
            products = response.json().get('products', [])
            ProductsModel(self.db_connection).insert_products(products)
            return {"success": "Products data synchronized successfully"}
        else:
            return {"error": "Unable to sync the products data from the API"}
