import logging
import warnings

# langchain-google-genai still ships google-generativeai internally;
# silence the FutureWarning until they fully migrate to google.genai.
warnings.filterwarnings("ignore", category=FutureWarning, module="google")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat import router as chat_router
from app.services.rag import build_retriever

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="Prabhjot Portfolio AI",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://prabhjotsinghrainu.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat_router, prefix="/api")


@app.on_event("startup")
def startup():
    # Pre-build FAISS index on cold start so first request is fast
    build_retriever()


@app.get("/")
def root():
    return {"message": "Prabhjot Portfolio AI Backend is running"}


@app.get("/health")
def health():
    return {"status": "ok"}
