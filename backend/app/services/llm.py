from google import genai

from app.config import GEMINI_API_KEY
from app.services.rag import vector_store


client = genai.Client(
    api_key=GEMINI_API_KEY
)


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

    # Build structured CV context
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

    # Build the final prompt
    prompt = f"""
{SYSTEM_PROMPT}

================ CV CONTEXT ================

{context}

============== END CV CONTEXT ==============

USER QUESTION:
{question}

Answer the user's question using ONLY the CV CONTEXT.
"""

    # Generate answer using Gemini
    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=prompt,
    )

    return response.text