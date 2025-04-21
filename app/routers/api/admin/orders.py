from fastapi import Depends, HTTPException, Request, Response
from app.models.orders import OrdersModel
from app.dependencies import router, get_db_for_new_thread


@router.get('/api/admin/orders')
async def orders(db=Depends(get_db_for_new_thread)):
    order_model = OrdersModel(db)
    orders = order_model.get_all_orders()
    return orders


@router.get('/api/admin/order/{order_hash}')
async def get_order(order_hash: str, db=Depends(get_db_for_new_thread)):
    order_model = OrdersModel(db)
    order = order_model.get_orders_by_hash(order_hash)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/api/admin/order/{order_hash}")
async def update_order(order_hash: str, request: Request, db=Depends(get_db_for_new_thread)):
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON format")

    if not data:
        raise HTTPException(status_code=400, detail="No data provided for update")

    if "status" in data:
        new_status = data["status"]
        if new_status not in ("active", "inactive"):
            raise HTTPException(status_code=400, detail="Invalid status value")

    order_model = OrdersModel(db)

    existing_order = order_model.get_orders_by_hash(order_hash)
    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    success = order_model.update_order(order_hash, data)

    if success:
        return {"message": "Order updated successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to update order")


@router.patch('/api/admin/order/{order_id}/delete')
async def delete_order(order_id: int, db=Depends(get_db_for_new_thread)):
    order_model = OrdersModel(db)
    existing_order = order_model.get_orders_by_id(order_id)

    if not existing_order:
        raise HTTPException(status_code=404, detail="Order not found")

    if existing_order.get('status') == 'deleted':
        raise HTTPException(status_code=400, detail="Order already deleted")

    success = order_model.delete_order(order_id)
    if success:
        return {"message": "Order deleted successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete order")