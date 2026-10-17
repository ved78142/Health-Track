from fastapi import APIRouter

from app.api.routes import chat, health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(chat.router, tags=["chat"])
# Register new route modules here, e.g.:
# api_router.include_router(items.router, prefix="/items", tags=["items"])
