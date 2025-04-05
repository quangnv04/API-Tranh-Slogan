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
            orders_model = OrdersModel(self.db_connection)  
            success_count = 0
            error_count = 0
            
            for order in orders: 
                try:
                    orders_model.insert_orders(order) 
                    success_count += 1
                except Exception as e:
                    print(f"Lỗi khi chèn đơn hàng: {e}")
                    print(f"Dữ liệu đơn hàng: {order}")
                    error_count += 1
                    
            return {
                "success": f"Đã đồng bộ thành công {success_count} đơn hàng, {error_count} lỗi",
                "total": len(orders),
                "success_count": success_count,
                "error_count": error_count
            }
        else:
            return {"error": f"Không thể đồng bộ dữ liệu đơn hàng từ API. Mã lỗi: {response.status_code}"}

