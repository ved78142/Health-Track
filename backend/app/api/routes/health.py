from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pymongo import AsyncMongoClient

from app.core.config import Settings, get_settings
from app.db.mongo import get_client
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health(
    client: Annotated[AsyncMongoClient, Depends(get_client)],
    settings: Annotated[Settings, Depends(get_settings)],
) -> HealthResponse:
    try:
        await client.admin.command("ping")
    except Exception as exc:
        raise HTTPException(status_code=503, detail="MongoDB unreachable") from exc
    return HealthResponse(status="ok", mongo="connected", database=settings.mongo_db)
