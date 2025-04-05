import json
from fastapi import Depends
from app.dependencies import router, get_db_for_new_thread
from app.adapters.orders import OrdersAdapter
from app.models.orders import OrdersModel


@router.get("/api/sync-orders")
def sync_orders(db=Depends(get_db_for_new_thread)):
    orders_adapter = OrdersAdapter(db)
    return orders_adapter.sync_orders()


@router.get("/api/orders")
def read_orders(page: int = 1, limit: int = 2, db=Depends(get_db_for_new_thread)):
    orders = OrdersModel(db).get_orders(page, limit)
    total_orders = OrdersModel(db).count_orders()
    total_pages = (total_orders + limit - 1) // limit 

    return {
        "orders": orders,
        "totalPages": total_pages
    }

