import time
from fastapi import Request
from starlette.responses import HTMLResponse
from app.dependencies import router, templates, DEBUG


@router.get("/", response_class=HTMLResponse)
async def get_home(request: Request):
    time_debug = "0.4"
    if DEBUG == 'True':
        time_debug = time.time()

    return templates.TemplateResponse("index.html", {"request": request, "time": time_debug})

@router.get("/sets", response_class=HTMLResponse)
async def get_sets(request: Request):
    time_debug = "0.4"
    if DEBUG == 'True':
        time_debug = time.time()

    return templates.TemplateResponse("sets.html", {"request": request, "time": time_debug})
