import time
from fastapi import Request
from starlette.responses import HTMLResponse
from app.dependencies import router, templates, DEBUG

@router.get("/terms-of-use", response_class=HTMLResponse)
async def get_terms_us(request: Request):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("terms-of-use.html", {"request": request, "time": time_debug})
