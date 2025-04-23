import time
from fastapi import Request, Depends
from starlette.responses import HTMLResponse, RedirectResponse
from app.dependencies import router, templates, get_db, DEBUG
from sqlite3 import Connection as SQLite3Connection
from starlette.concurrency import run_in_threadpool


@router.get("/menu", response_class=HTMLResponse)
async def get_menus(request: Request):
    time_debug = "0.4"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("menu.html", {"request": request, "time": time_debug})
