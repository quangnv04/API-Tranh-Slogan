import json
from fastapi import Depends, HTTPException
import requests
from app.dependencies import GOOGLE_SPREADSHEET_API_URL, router, get_db_for_new_thread
from app.adapters.orders import OrdersAdapter
from app.models.orders import OrdersModel
# from app.models.orders import OrdersModel


@router.get("/api/sync-orders")
def sync_orders(db=Depends(get_db_for_new_thread)):
    orders_adapter = OrdersAdapter(db)
    return orders_adapter.sync_orders()

@router.post("/api/orders")
def create_order(order_data: dict, db=Depends(get_db_for_new_thread)):
    result = OrdersAdapter(db).send_order_to_sheets(order_data)
    if isinstance(result, dict) and "success" in result:
        return result
    else:
        return{
            "success": True,
            "message": "Đơn hàng đã được gửi thành công đến Google Sheets",
            "data": result
        }
    