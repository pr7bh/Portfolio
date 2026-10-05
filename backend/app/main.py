from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.chat import router as chat_router
from app.services.rag import vector_store


app = FastAPI(
    title="Prabhjot Portfolio AI",
    version="1.0.0",
)


@app.on_event("startup")
def build_resume_vector_store():
    vector_store.build()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://prabhjotsinghrainu.vercel.app/"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    chat_router,
    prefix="/api",
)


@app.get("/")
def root():
    return {
        "message": "Prabhjot Portfolio AI Backend is running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok"
    }