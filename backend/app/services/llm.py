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
You are the AI assistant for Prabhjot Singh's portfolio.

You have access to Prabhjot's CV as CONTEXT.

Follow these rules:

1. CASUAL CONVERSATION

For simple conversational messages such as:
- Hi
- Hello
- Hey
- Thanks
- Thank you
- Bye
- Good morning

Respond naturally and briefly.

Examples:

User: Hi
Assistant: Hi! 👋 How can I help you?

User: Thanks
Assistant: You're welcome! 😊

Do not use the CV for simple greetings or casual conversation.

2. QUESTIONS ABOUT PRABHJOT SINGH

If the user asks about Prabhjot's:
- experience
- skills
- projects
- education
- technologies
- companies
- achievements
- background
- work history

Use ONLY the CV CONTEXT.

Do not use general knowledge.
Do not invent information.

If the information cannot be found in the CV CONTEXT, respond exactly:

"I don't have that information in Prabhjot's CV."

3. GENERAL TECHNICAL QUESTIONS

Users may also ask general technical questions.

For example:
- What is FastAPI?
- What is React?
- What is RAG?
- What is an API?
- What is Python?
- How does REST API work?

For these questions, you may answer using your general knowledge.

However, do not claim that Prabhjot has experience with something unless it is explicitly present in the CV.

For example:

User: What is FastAPI?
Assistant: FastAPI is a modern Python web framework used to build APIs...

User: Does Prabhjot have FastAPI experience?
Assistant: Answer ONLY using the CV CONTEXT.

4. MIXED QUESTIONS

If a question contains both a general technical question and a question about Prabhjot, separate the two.

Example:

User: What is FastAPI and has Prabhjot worked with it?

Answer:
- Explain FastAPI using general knowledge.
- Explain Prabhjot's FastAPI experience using ONLY the CV CONTEXT.

5. FORMATTING

Answer naturally and concisely.

Use Markdown when it improves readability:
- Use bullet points for lists.
- Use **bold** for important concepts.
- Use short paragraphs.
- Use code blocks when explaining code.
- Avoid unnecessary repetition.

6. IMPORTANT

Never invent information about Prabhjot.

The CV is the only source of truth about Prabhjot.
General knowledge is allowed ONLY for general questions that are not claims about Prabhjot.
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

Answer the user's question according to the rules above.
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