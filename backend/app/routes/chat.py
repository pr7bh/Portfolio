import threading
import time
from collections import defaultdict

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.services.llm import LLMUnavailableError, generate_response


router = APIRouter()

# ============================================================
# RATE LIMITER  (10 requests / 60 s per IP)
# ============================================================

_RATE_LIMIT = 10
_RATE_WINDOW = 60  # seconds

_rate_lock = threading.Lock()
_request_log: dict[str, list[float]] = defaultdict(list)


def _check_rate_limit(ip: str) -> None:
    now = time.time()
    cutoff = now - _RATE_WINDOW
    with _rate_lock:
        _request_log[ip] = [t for t in _request_log[ip] if t > cutoff]
        if len(_request_log[ip]) >= _RATE_LIMIT:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait a moment before trying again.",
            )
        _request_log[ip].append(now)


# ============================================================
# SCHEMA
# ============================================================

class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


# ============================================================
# ROUTE
# ============================================================

@router.post("/chat")
def chat(req: Request, body: ChatRequest):
    _check_rate_limit(req.client.host)
    try:
        answer = generate_response(body.question)
    except LLMUnavailableError:
        raise HTTPException(
            status_code=503,
            detail="The AI assistant is temporarily unavailable. Please try again shortly.",
        )
    return {
        "answer": answer
    }