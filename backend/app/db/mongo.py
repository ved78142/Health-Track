import logging

from fastapi import Request
from pymongo import AsyncMongoClient
from pymongo.asynchronous.database import AsyncDatabase

from app.core.config import Settings

logger = logging.getLogger(__name__)


async def connect(settings: Settings) -> AsyncMongoClient:
    """Create a client and verify the server is reachable. Raises if it isn't."""
    client: AsyncMongoClient = AsyncMongoClient(
        settings.mongo_uri, serverSelectionTimeoutMS=settings.mongo_timeout_ms
    )
    try:
        await client.admin.command("ping")
    except Exception:
        await client.close()
        logger.error("Could not connect to MongoDB at %s", settings.mongo_uri)
        raise
    logger.info("Connected to MongoDB, database '%s'", settings.mongo_db)
    return client


def get_client(request: Request) -> AsyncMongoClient:
    return request.app.state.mongo_client


def get_db(request: Request) -> AsyncDatabase:
    """FastAPI dependency: inject the database into a route."""
    return request.app.state.db
