import time
from fastapi import Request
from starlette.responses import HTMLResponse
from app.dependencies import router, templates, DEBUG


@router.get("/refund-cancellation-policy", response_class=HTMLResponse)
async def get_refund_cancellation_policy(request: Request):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("refund-cancellation-policy.html", {"request": request, "time": time_debug})

@router.get("/privacy-policy", response_class=HTMLResponse)
async def get_privacy_policy(request: Request):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("privacy-policy.html", {"request": request, "time": time_debug})
