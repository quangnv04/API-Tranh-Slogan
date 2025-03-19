from fastapi import APIRouter
from fastapi.templating import Jinja2Templates
from fastapi.requests import Request

templates = Jinja2Templates(directory="app/templates/admin")

admin_router = APIRouter()


@admin_router.get("/")
async def admin_dashboard(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})
