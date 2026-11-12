import logging

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage

from app.config import GEMINI_API_KEY
from app.services.rag import get_retriever

logger = logging.getLogger(__name__)

# ─── LLM ──────────────────────────────────────────────────────────────────────

_llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.1,
    max_output_tokens=1024,
)

# ─── System Prompt ────────────────────────────────────────────────────────────

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

# ─── Retry wrapper ────────────────────────────────────────────────────────────

@retry(
    retry=retry_if_exception_type(Exception),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=8),
    reraise=True,
)
def _call_llm(prompt: str) -> str:
    response = _llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

# ─── Main function ────────────────────────────────────────────────────────────

def generate_response(question: str) -> str:
    question = question.strip()
    if not question:
        return "Please ask me a question."

    # Retrieve top-k relevant resume chunks
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
