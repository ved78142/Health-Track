"""Runs against a real MongoDB (defaults to localhost:27017). Start one with `docker compose up -d mongo`."""

from fastapi.testclient import TestClient

from app.main import app


def test_health():
    with TestClient(app) as client:  # `with` runs the startup/shutdown lifespan
        res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["mongo"] == "connected"
