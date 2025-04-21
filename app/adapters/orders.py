from datetime import datetime
import hashlib
import json
import sqlite3
import requests
from app.dependencies import GOOGLE_SPREADSHEET_API_URL
from app.models.orders import OrdersModel

class OrdersAdapter:
    def __init__(self, db_connection):
        self.GOOGLE_SPREADSHEET_API_URL = GOOGLE_SPREADSHEET_API_URL
        self.db_connection = db_connection
        self.db_connection.row_factory = sqlite3.Row
    
    def sync_orders(self):
        response = requests.get(f"{self.GOOGLE_SPREADSHEET_API_URL}?action=getOrders")
        if response.status_code == 200:
            orders = response.json().get('orders', [])
            OrdersModel(self.db_connection).insert_multiple_orders(orders)
            return {"success": "Orders data synchronized successfully"}
        else:
            return {"error": "Unable to sync the orders data from the API"}
        
    def send_order_to_sheets(self, order_data):
        try:
            current_time = datetime.now().strftime('%d-%m-%Y %H:%M:%S')
            hash_string = f"{order_data['name']}|{order_data['phone']}|{order_data['address']}|{order_data['product']}|{current_time}"
            order_hash = hashlib.md5(hash_string.encode('utf-8')).hexdigest()
            
            order_data['hash'] = order_hash
            
            OrdersModel(self.db_connection).insert_orders(order_data)
            response = requests.post(f"{self.GOOGLE_SPREADSHEET_API_URL}?action=doPost",
                json=order_data,
                headers={'Content-Type': 'application/json'},
                timeout=10 
            )
            
            try:
                json_response = response.json()
                if json_response.get('success', False):
                    return {
                        "success": True,
                        "message": "Đơn hàng đã được gửi thành công đến Google Sheets",
                        "data": json_response
                    }
            except ValueError:
                print("Response không phải là JSON hợp lệ")
                
        except Exception as e:
            return {
                "success": False,
                "error": f"Lỗi xử lý đơn hàng: {str(e)}"
            }
 
   