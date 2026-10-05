from fastapi import APIRouter
from pydantic import BaseModel

from app.services.llm import generate_response


router = APIRouter()


class ChatRequest(BaseModel):
    question: str


@router.post("/chat")
async def chat(request: ChatRequest):
    answer = generate_response(request.question)

    return {
        "answer": answer
    }