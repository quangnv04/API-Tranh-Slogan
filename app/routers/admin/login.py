import time
from fastapi import Request, Depends
from starlette.responses import HTMLResponse, RedirectResponse
from app.dependencies import router, templates, get_db, DEBUG
from app.models.blogs import BlogsModel
from sqlite3 import Connection as SQLite3Connection
from starlette.concurrency import run_in_threadpool


@router.get("/admin/login", response_class=HTMLResponse)
async def admin_login(request: Request):
    time_debug = "0.1.57"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("/admin/login.html", {"request": request, "time": time_debug})
