import random

from fastapi import APIRouter

from app.schemas.chat import ChatRequest, ChatResponse

router = APIRouter()

REPLIES = [
    "Thanks for sharing that. Tell me more.",
    "Got it! Keep your water intake up today.",
    "Interesting. How has that been affecting your routine?",
    "A short walk can do wonders. Have you moved around today?",
    "Noted. Consistency matters more than perfection.",
    "That sounds like progress. Keep going!",
    "Remember to get enough sleep tonight.",
    "Good question. Let's look into it together.",
]


@router.post("/chat", response_model=ChatResponse)
async def chat(body: ChatRequest) -> ChatResponse:
    return ChatResponse(reply=random.choice(REPLIES))
