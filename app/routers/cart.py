import time
from fastapi import Request
from starlette.responses import HTMLResponse
from app.dependencies import router, templates, DEBUG

@router.get("/cart", response_class=HTMLResponse)
async def get_cart(request: Request):
    time_debug = "0.3"
    if DEBUG == 'True':
        time_debug = time.time()
    return templates.TemplateResponse("cart.html", {"request": request, "time": time_debug})
