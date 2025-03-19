from starlette.responses import RedirectResponse
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from app.routers.tokenManager import TokenManager

class AuthMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, token_manager):
        super().__init__(app)
        self.token_manager = token_manager

    async def dispatch(self, request: Request, call_next):
        public_routes = ["/api/auth/register", "/api/auth/google", "/admin/login", "api/auth/login"]
        if not request.url.path.startswith("/admin") or request.url.path in public_routes:
            return await call_next(request)

        token = request.cookies.get("access_token")
        
        # if token and token.startswith("Bearer "):
        #     token = token.replace("Bearer ", "").strip()
        # else:
        #     print("Token is missing or invalid. Redirecting to /admin/login")
        #     return RedirectResponse(url="/admin/login")
        
        if not token:
            print("Token is missing or invalid. Redirecting to /admin/login")
            return RedirectResponse(url="/admin/login")

        try:
            payload = self.token_manager.decode_token(token)
            request.state.user = payload
        except Exception as e:
            print(f"Token decoding failed: {e}")
            return RedirectResponse(url="/admin/login")

        return await call_next(request)
