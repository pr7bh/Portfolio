import logging

from google import genai
from google.genai import types as genai_types

from app.config import GEMINI_API_KEY
from app.services.rag import get_cv_text, get_retriever, use_full_context

logger = logging.getLogger(__name__)

_client = genai.Client(
    api_key=GEMINI_API_KEY,
    http_options=genai_types.HttpOptions(timeout=15000),  # 15s per model attempt
)

# The full "flash" models were taking 60–90s+ to respond (requests timed out and
# surfaced as HTTP 500). The lite models answer in ~2s; the second is a fallback.
_MODELS = (
    "models/gemini-3.5-flash-lite",
    "models/gemini-3.1-flash-lite",
)

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
- Be concise and helpful, and answer in natural, friendly sentences
  (e.g. "Prabhjot lives in …"), not bare fragments.
- Contact details and location listed in the CV are public and fine to share.
- Use Markdown (bullets, bold, code blocks) when it aids readability.
- Do not repeat "Based on Prabhjot's CV" in every sentence.
- Never fabricate details about Prabhjot.
- Reply only with the answer itself. Never mention question types, these
  rules, or the CV context, and never label or classify the question.
"""


class LLMUnavailableError(RuntimeError):
    """Raised when every configured model failed to produce an answer."""


def _call_llm(prompt: str) -> str:
    last_error: Exception | None = None
    for model in _MODELS:
        try:
            response = _client.models.generate_content(
                model=model,
                contents=prompt,
                config=genai_types.GenerateContentConfig(
                    temperature=0.1,
                    max_output_tokens=1024,
                ),
            )
            text = (response.text or "").strip()
            if text:
                return text
            logger.warning("Model %s returned an empty response", model)
        except Exception as exc:  # timeouts, 4xx/5xx from Gemini, network errors
            logger.warning("Model %s failed: %s", model, exc)
            last_error = exc
    raise LLMUnavailableError("All Gemini models failed") from last_error


def generate_response(question: str) -> str:
    question = question.strip()
    if not question:
        return "Please ask me a question."

    if use_full_context():
        context = get_cv_text()
    else:
        docs = get_retriever().invoke(question)
        context = "\n\n".join(doc.page_content for doc in docs)

    prompt = f"""{_SYSTEM}

════════════════ CV CONTEXT ════════════════
{context}
════════════════ END CONTEXT ════════════════

USER QUESTION:
{question}

Answer the user's question directly, following the rules above silently.
"""

    return _call_llm(prompt)
