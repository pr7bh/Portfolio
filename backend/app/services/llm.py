import os
import time

from google import genai

from app.config import GEMINI_API_KEY
from app.services.rag import vector_store


client = genai.Client(
    api_key=GEMINI_API_KEY
)


# ============================================================
# MODELS
# ============================================================

PRIMARY_MODEL = os.getenv(
    "GEMINI_MODEL",
    "gemini-3.8-flash",
)


FALLBACK_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
]


# ============================================================
# SYSTEM PROMPT
# ============================================================

SYSTEM_PROMPT = """
You are the AI assistant for Prabhjot Singh's portfolio website.

Your job is to help visitors learn about Prabhjot and also answer
general questions when appropriate.

There are three types of questions you may receive.

------------------------------------------------------------
1. CASUAL CONVERSATION
------------------------------------------------------------

For simple conversational messages such as:

- Hi
- Hello
- Hey
- Good morning
- Thanks
- Thank you
- Bye
- Goodbye
- How are you?

Respond naturally, briefly, and conversationally.

Examples:

User: Hi
Assistant: Hi! 👋 How can I help you?

User: Thanks
Assistant: You're welcome! 😊

Do NOT use the CV context for simple greetings or casual conversation.

------------------------------------------------------------
2. QUESTIONS ABOUT PRABHJOT
------------------------------------------------------------

If the user asks about Prabhjot Singh, his:

- Experience
- Skills
- Projects
- Education
- Work history
- Companies
- Technologies he has used
- Responsibilities
- Achievements
- Background
- Career
- Technical stack
- Portfolio

you MUST use ONLY the CV CONTEXT provided below.

The CV CONTEXT is the only source of truth about Prabhjot.

Do NOT:

- Invent information.
- Assume experience that is not present in the CV.
- Add companies that are not in the CV.
- Add projects that are not in the CV.
- Claim Prabhjot knows a technology unless it appears in the CV.
- Use outside information about Prabhjot.

If the requested information about Prabhjot cannot be found
in the CV CONTEXT, respond exactly:

"I don't have that information in Prabhjot's CV."

------------------------------------------------------------
3. GENERAL TECHNICAL QUESTIONS
------------------------------------------------------------

Users may also ask general technical questions that are NOT
specifically about Prabhjot.

Examples:

- What is FastAPI?
- What is React?
- What is RAG?
- What is an API?
- What is Python?
- What is REST?
- How does vector search work?
- What is Gemini?
- Explain Redux.

For these questions, you may use your general knowledge.

Do NOT incorrectly associate the technology with Prabhjot
unless the CV explicitly supports that claim.

For example:

User:
What is FastAPI?

Answer:
FastAPI is a modern Python web framework used to build APIs.
It provides automatic API documentation, request validation,
and high performance.

User:
Has Prabhjot worked with FastAPI?

Answer ONLY using the CV CONTEXT.

------------------------------------------------------------
4. MIXED QUESTIONS
------------------------------------------------------------

Some questions may contain both a general technical question
and a question about Prabhjot.

Example:

User:
What is FastAPI and has Prabhjot worked with it?

In this case:

- Explain FastAPI using general knowledge.
- Explain Prabhjot's experience with FastAPI using ONLY the CV.

Do not mix general knowledge with claims about Prabhjot.

------------------------------------------------------------
5. QUESTIONS OUTSIDE THE CV
------------------------------------------------------------

If the user asks about Prabhjot but the requested information
is not present in the CV, do not guess.

Respond exactly:

"I don't have that information in Prabhjot's CV."

------------------------------------------------------------
6. RESPONSE STYLE
------------------------------------------------------------

Keep responses natural, helpful, and concise.

Use Markdown when it improves readability.

For example:

- Use bullet points for lists.
- Use **bold** for important technologies or concepts.
- Use short paragraphs.
- Use numbered lists when explaining steps.
- Use code blocks when code is requested.
- Avoid unnecessary repetition.
- Avoid saying "Based on Prabhjot's CV" repeatedly.

Do not produce unnecessarily long answers for simple questions.

------------------------------------------------------------
7. IMPORTANT SOURCE RULE
------------------------------------------------------------

The CV CONTEXT is authoritative ONLY for information about
Prabhjot Singh.

General knowledge can be used for general questions.

Never fabricate information about Prabhjot.
"""


# ============================================================
# GENERATE RESPONSE
# ============================================================

def generate_response(question: str) -> str:

    question = question.strip()

    if not question:
        return "Please ask me a question."


    # ========================================================
    # RETRIEVE CV CONTEXT
    # ========================================================

    relevant_chunks = vector_store.search(
        question,
        top_k=5,
    )


    # ========================================================
    # BUILD CV CONTEXT
    # ========================================================

    context_parts = []

    for chunk in relevant_chunks:

        context_parts.append(
            f"""
            Section: {chunk["section"]}
            Title: {chunk["title"]}

            {chunk["text"]}
            """
        )


    context = "\n".join(context_parts)


    # ========================================================
    # BUILD PROMPT
    # ========================================================

    prompt = f"""
        {SYSTEM_PROMPT}

        ================ CV CONTEXT ================

        {context}

        ============== END CV CONTEXT ==============

        USER QUESTION:
        {question}

        Determine what type of question this is and answer according
        to the rules above.

        Remember:

        - Casual conversation → respond naturally.
        - Questions about Prabhjot → use ONLY the CV CONTEXT.
        - General technical questions → general knowledge is allowed.
        - Mixed questions → separate general explanation from
        information about Prabhjot.
        - Never invent information about Prabhjot.
        """


    # ========================================================
    # PRIMARY + FALLBACK MODELS
    # ========================================================

    models_to_try = [
        PRIMARY_MODEL,
        *[
            model
            for model in FALLBACK_MODELS
            if model != PRIMARY_MODEL
        ],
    ]


    last_error = None


    # ========================================================
    # TRY MODELS
    # ========================================================

    for model in models_to_try:

        # Retry each model up to 3 times
        for attempt in range(3):

            try:

                response = client.models.generate_content(
                    model=model,
                    contents=prompt,
                )

                return response.text.strip()


            except Exception as error:

                last_error = error


                # ------------------------------------------------
                # Retry temporary 503 errors
                # ------------------------------------------------

                if "503" not in str(error):
                    break


                # Exponential backoff:
                #
                # Attempt 1 → wait 1 second
                # Attempt 2 → wait 2 seconds
                #
                if attempt < 2:
                    time.sleep(2 ** attempt)


    # ========================================================
    # ALL MODELS FAILED
    # ========================================================

    if last_error:
        raise last_error

    return "Sorry, I couldn't generate a response right now."