from fastapi.testclient import TestClient

from app.main import app


def test_chat_returns_reply():
    with TestClient(app) as client:
        res = client.post("/api/chat", json={"message": "hello"})
    assert res.status_code == 200
    assert res.json()["reply"]


def test_chat_rejects_empty_message():
    with TestClient(app) as client:
        res = client.post("/api/chat", json={"message": ""})
    assert res.status_code == 422
