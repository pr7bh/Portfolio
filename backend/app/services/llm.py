import os

from google import genai

from app.config import GEMINI_API_KEY
from app.services.rag import vector_store


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# Primary model
PRIMARY_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.8-flash",
)

# Fallback models
FALLBACK_MODELS = [
    "gemini-3.7-flash",
    "gemini-3.6-flash",
    "gemini-3.5-flash",
]


SYSTEM_PROMPT = """
You are the portfolio assistant for Prabhjot Singh.

IMPORTANT RULES:

1. Answer ONLY using the CV CONTEXT provided below.
2. The CV CONTEXT is the only source of truth.
3. Do not use your general knowledge.
4. Do not invent any experience, skills, technologies, companies,
   projects, education, or achievements.
5. Do not search for external information.
6. Do not ask the user to provide Prabhjot's resume.
7. If the answer cannot be found in the CV CONTEXT, respond exactly:

"I don't have that information in Prabhjot's CV."

Answer directly and concisely.
"""


def generate_response(question: str) -> str:

    # Retrieve the most relevant CV chunks
    relevant_chunks = vector_store.search(
        question,
        top_k=5,
    )

    # Build CV context
    context_parts = []

    for chunk in relevant_chunks:

        context_parts.append(
            f"""
Section: {chunk["section"]}
Title: {chunk["title"]}
Similarity: {chunk["similarity"]:.3f}

{chunk["text"]}
"""
        )

    context = "\n".join(context_parts)

    # Build final prompt
    prompt = f"""
{SYSTEM_PROMPT}

================ CV CONTEXT ================

{context}

============== END CV CONTEXT ==============

USER QUESTION:
{question}

Answer the user's question using ONLY the CV CONTEXT.
"""

    # Try primary model first
    models_to_try = [
        PRIMARY_MODEL,
        *[
            model
            for model in FALLBACK_MODELS
            if model != PRIMARY_MODEL
        ],
    ]

    last_error = None

    for model in models_to_try:

        try:

            response = client.models.generate_content(
                model=model,
                contents=prompt,
            )

            return response.text

        except Exception as error:

            last_error = error

            continue

    # All models failed
    raise last_error