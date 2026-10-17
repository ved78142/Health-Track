from fastapi import APIRouter

from app.api.routes import health

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
# Register new route modules here, e.g.:
# api_router.include_router(items.router, prefix="/items", tags=["items"])
