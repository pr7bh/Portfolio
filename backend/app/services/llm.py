import logging

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from google import genai
from google.genai import types as genai_types

from app.config import GEMINI_API_KEY
from app.services.rag import get_retriever

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=GEMINI_API_KEY)
_MODEL = "models/gemini-3.8-flash"

_SYSTEM = """
You are the AI assistant for Prabhjot Singh's portfolio website.

There are four question types:

1. CASUAL CONVERSATION (hi, thanks, bye, how are you)
   → Respond naturally and briefly. Do NOT use CV context.

2. QUESTIONS ABOUT PRABHJOT (experience, skills, projects, education, stack,
   companies, achievements, background)
   → Answer using ONLY the CV CONTEXT below. Never invent information.
   → If the answer is not in the CV, say exactly:
      "I don't have that information in Prabhjot's CV."

3. GENERAL TECHNICAL QUESTIONS (what is FastAPI, explain RAG, etc.)
   → Answer from general knowledge. Do not falsely link it to Prabhjot
     unless the CV confirms it.

4. MIXED QUESTIONS (e.g. "What is RAG and has Prabhjot used it?")
   → Answer the general part from knowledge, the Prabhjot-specific part
     from the CV only.

RESPONSE STYLE:
- Be concise and helpful.
- Use Markdown (bullets, bold, code blocks) when it aids readability.
- Do not repeat "Based on Prabhjot's CV" in every sentence.
- Never fabricate details about Prabhjot.
"""


@retry(
    retry=retry_if_exception_type(Exception),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    reraise=True,
)
def _call_llm(prompt: str) -> str:
    response = _client.models.generate_content(
        model=_MODEL,
        contents=prompt,
        config=genai_types.GenerateContentConfig(
            temperature=0.1,
            max_output_tokens=1024,
        ),
    )
    return response.text.strip()


def generate_response(question: str) -> str:
    question = question.strip()
    if not question:
        return "Please ask me a question."

    retriever = get_retriever()
    docs = retriever.invoke(question)
    context = "\n\n".join(doc.page_content for doc in docs)

    prompt = f"""{_SYSTEM}

════════════════ CV CONTEXT ════════════════
{context}
════════════════ END CONTEXT ════════════════

USER QUESTION:
{question}

Determine the question type and answer according to the rules above.
"""

    return _call_llm(prompt)
