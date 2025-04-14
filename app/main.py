from fastapi import FastAPI
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles

from app.routers.admin.dashboard import admin_router
from app.routers.admin.login import router as login_router
from app.routers.admin.roomsManagement import router as rooms_management_router
from app.routers.admin.usersManagement import router as users_management_router
from app.routers.admin.rolesManagement import router as roles_management_router
from app.routers.admin.permissionsManagement import router as permissions_management_router
from app.routers.tokenManager import TokenManager

from app.routers.home import router as home_router
from app.routers.menu import router as menu_router
from app.routers.orders import router as orders_router
from app.routers.products import router as products_router
from app.routers.policy import router as policy_router
from app.routers.about import router as about_router
from app.routers.contact import router as contact_router
from app.routers.cart import router as cart_router
from app.routers.terms import router as terms_router
from app.routers.blogs import router as blogs_router

from app.routers.api.products import router as products_api_router
from app.routers.api.blogs import router as blogs_api_router
from app.routers.api.orders import router as orders_api_router
from app.routers.api.auth import router as auth_api_router
from app.routers.api.admin.roles import router as roles_admin_api_router
from app.routers.api.admin.products import router as products_admin_api_router
from app.routers.api.admin.statistics import router as statistics_admin_api_router

from app.routers.authMiddleware import AuthMiddleware

app = FastAPI()

templates = Jinja2Templates(directory="app/templates")

app.mount("/assets", StaticFiles(directory="app/assets"), name="assets")
app.mount("/assets_admin", StaticFiles(directory="app/assets_admin"), name="assets_admin")

app.include_router(login_router)
app.include_router(rooms_management_router)
app.include_router(users_management_router)
app.include_router(roles_management_router)
app.include_router(permissions_management_router)
app.include_router(home_router)
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(products_router)
app.include_router(policy_router)
app.include_router(about_router)
app.include_router(contact_router)
app.include_router(cart_router)
app.include_router(terms_router)
app.include_router(blogs_router)

app.include_router(products_api_router)
app.include_router(blogs_api_router)
app.include_router(orders_api_router)
app.include_router(auth_api_router)
app.include_router(roles_admin_api_router)
app.include_router(products_admin_api_router)
app.include_router(statistics_admin_api_router)
app.include_router(admin_router, prefix="/admin", tags=["Admin"])

app.add_middleware(AuthMiddleware, token_manager=TokenManager())
