import time
from fastapi import APIRouter, Request, Depends
from fastapi.templating import Jinja2Templates
from starlette.responses import HTMLResponse, RedirectResponse
from app.dependencies import router, templates, get_db, DEBUG
from app.models.orders import OrdersModel
from sqlite3 import Connection as SQLite3Connection
from starlette.concurrency import run_in_threadpool

# templates = Jinja2Templates(directory="app/templates/admin")
# admin_router = APIRouter()

@router.get("/admin/orders-management", response_class=HTMLResponse)
async def ordersManagement(request: Request):
    time_debug = "0.1.57"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("/admin/orders-management.html", {"request": request, "time": time_debug})
