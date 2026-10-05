import os
import time

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

Answer naturally and concisely.

Use Markdown when it improves readability:
- Use bullet points for lists.
- Use bold for important categories or technologies.
- Use short paragraphs.
- Do not repeat "Based on Prabhjot's CV" unless necessary.
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

    # Primary model + fallback models
    models_to_try = [
        PRIMARY_MODEL,
        *[
            model
            for model in FALLBACK_MODELS
            if model != PRIMARY_MODEL
        ],
    ]

    last_error = None

    # Try each model
    for model in models_to_try:

        # Retry the same model up to 3 times
        for attempt in range(3):

            try:

                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )

                return response.text

            except Exception as error:

                last_error = error

                # Retry only for temporary 503 errors
                if "503" not in str(error):
                    break

                # Exponential backoff:
                # attempt 0 -> 1 second
                # attempt 1 -> 2 seconds
                # attempt 2 -> no more retry
                if attempt < 2:
                    time.sleep(2 ** attempt)

    # All models and retries failed
    raise last_error