import time
from fastapi import Request
from starlette.responses import HTMLResponse
from app.dependencies import router, templates, DEBUG

@router.get("/contact-us", response_class=HTMLResponse)
async def get_contact_us(request: Request):
    time_debug = "0.4"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("contact-us.html", {"request": request, "time": time_debug})
