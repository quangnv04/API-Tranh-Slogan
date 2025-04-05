import json
import time
from fastapi import Depends, Request
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlite3 import Connection as SQLite3Connection
from app.dependencies import DEBUG, get_db, router, get_db_for_new_thread, templates
from app.adapters.orders import OrdersAdapter
from app.models.orders import OrdersModel

@router.get("/order", response_class=HTMLResponse)
async def get_orders(request: Request):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("order.html", {"request": request, "time": time_debug})

@router.get("/order/{id}", response_class=HTMLResponse)
async def get_order_detail(request: Request, id: str, db: SQLite3Connection = Depends(get_db)):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()

    order = await run_in_threadpool(OrdersModel(db).get_orders_by_id, id)

    if order is None:
        return RedirectResponse(url='/orders', status_code=303)

    return templates.TemplateResponse("orders-detail.html", {
        "request": request,
        "order": order,
        "time": time_debug
    })
