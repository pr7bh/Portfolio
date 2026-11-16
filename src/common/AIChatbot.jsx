import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import Strands from "./Strands";
function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slowBackend, setSlowBackend] = useState(false);
  const retryQuestionRef = useRef("");

  const askQuestion = async (userQuestion) => {
    const trimmedQuestion = userQuestion.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    retryQuestionRef.current = trimmedQuestion;
    setQuestion("");
    setIsLoading(true);
    setSlowBackend(false);

    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmedQuestion },
    ]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);
    const slowTimerId = setTimeout(() => setSlowBackend(true), 8000);

    try {
      const response = await fetch(
        "https://portfolio-h5kk.onrender.com/api/chat",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmedQuestion }),
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.answer },
        ]);
      } else {
        const errorMessages = {
          429: "You're sending messages too quickly. Please wait a moment and try again.",
          422: "Your message couldn't be processed. Please try a shorter question.",
        };
        const content =
          errorMessages[response.status] ??
          "The AI assistant encountered an error. Please try again.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content, isError: true },
        ]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const content =
        error.name === "AbortError"
          ? "The request timed out. The AI assistant may be waking up — please try again in a moment."
          : "Unable to connect. Please check your connection and try again.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content, isError: true },
      ]);
    } finally {
      clearTimeout(slowTimerId);
      setSlowBackend(false);
      setIsLoading(false);
    }
  };
  return (
    <>
      {/* =========================================================
          AI CHAT WINDOW
      ========================================================= */}
      <div
        className={`
    fixed
    z-[10000]

    transition-all
    duration-500
    ease-[cubic-bezier(0.16,1,0.3,1)]

    ${
      isMaximized
        ? `
          inset-4
          w-auto
          max-w-none
          md:inset-6
          m-25
        `
        : `
          bottom-25
          right-4
          w-[360px]
          max-w-[calc(100vw-2rem)]
        `
    }

    ${
      isOpen
        ? "translate-y-0 scale-100 opacity-100"
        : "pointer-events-none translate-y-5 scale-95 opacity-0"
    }
  `}
      >
        <div
          className={`
  relative
  flex
  flex-col
  overflow-hidden

  ${isMaximized ? "h-full" : "h-[500px]"}

  rounded-[24px]

  border
  border-white/15

  bg-white/[0.07]

  backdrop-blur-[30px]
  backdrop-saturate-150

  shadow-[0_25px_80px_rgba(0,0,0,0.55)]
`}
        >
          {/* =====================================================
              GLASS GLOW
          ===================================================== */}

          <div
            className="
              pointer-events-none
              absolute
              -top-24
              left-1/2
              h-48
              w-48
              -translate-x-1/2
              rounded-full
              bg-white/[0.08]
              blur-[70px]
            "
          />

          {/* =====================================================
              HEADER
          ===================================================== */}

          <div
            className="
              relative
              flex
              items-center
              justify-between

              border-b
              border-white/10

              bg-white/[0.04]

              px-5
              py-4
            "
          >
            <div className="flex items-center gap-3">
              {/* AI Avatar */}
              <div
                className="
                  relative
                  h-15
                  w-15
                  rounded-xl
                  overflow-hidden
                "
              >
                <Strands glass energy={0.65} interactive={false} intro={false} />

                {/* Online indicator */}
                <span
                  className="
                    absolute
                    -right-1
                    -top-1
                    h-2.5
                    w-2.5
                    rounded-full
                    border
                    border-black
                    bg-emerald-400
                    shadow-[0_0_8px_rgba(52,211,153,0.8)]
                  "
                />
              </div>

              {/* Title */}
              <div>
                <h3
                  className="
                    text-sm
                    font-semibold
                    tracking-wide
                    text-white
                  "
                >
                  AI Assistant
                </h3>

                <div className="mt-0.5 flex items-center gap-1.5">
                  <span className="text-[11px] text-white/40">
                    Ask me about Prabhjot
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* MAXIMIZE / RESTORE - Desktop only */}
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                aria-label={
                  isMaximized ? "Restore AI assistant" : "Maximize AI assistant"
                }
                className="
      hidden
      md:flex
      h-8
      w-8
      items-center
      justify-center
      rounded-full
      border
      border-transparent
      text-white/40
      transition-all
      duration-200
      hover:border-white/10
      hover:bg-white/10
      hover:text-white
    "
              >
                {isMaximized ? (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <rect x="5" y="9" width="10" height="10" rx="1" />
                    <path d="M9 9V6a1 1 0 0 1 1-1h8a2 2 0 0 1 2 2v8a1 1 0 0 1-1 1h-3" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
                    <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                    <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                )}
              </button>

              {/* CLOSE */}
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  setIsMaximized(false);
                }}
                aria-label="Close AI assistant"
                className="
      flex
      h-8
      w-8
      items-center
      justify-center
      rounded-full
      border
      border-transparent
      text-lg
      text-white/40
      transition-all
      duration-200
      hover:border-white/10
      hover:bg-white/10
      hover:text-white
    "
              >
                ×
              </button>
            </div>
          </div>

          {/* =====================================================
              MESSAGES
          ===================================================== */}

          <div
            className="
              relative
              flex-1
              overflow-y-auto
              px-4
              py-5

              [scrollbar-width:none]
              [-ms-overflow-style:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {/* Welcome message */}
            <div className="flex items-start gap-2.5">
              {/* AI mini avatar */}
              <div
                className="
                  mt-1
                  flex
                  h-7
                  w-7
                  shrink-0
                  items-center
                  justify-center
                  rounded-lg

                  border
                  border-white/10

                  bg-white/[0.06]
                "
              >
                <Strands glass energy={0.65} interactive={false} intro={false} />
              </div>

              {/* Message */}
              <div
                className="
                  max-w-[85%]

                  rounded-2xl
                  rounded-tl-md

                  border
                  border-white/10

                  bg-white/[0.06]

                  px-4
                  py-3

                  shadow-[0_8px_25px_rgba(0,0,0,0.12)]
                "
              >
                <p
                  className="
                    text-sm
                    leading-relaxed
                    text-white/85
                  "
                >
                  Hi! I'm Prabh's AI assistant.
                </p>

                <p
                  className="
                    mt-1.5
                    text-xs
                    leading-relaxed
                    text-white/45
                  "
                >
                  Ask me about his experience, skills, projects, education, or
                  technologies.
                </p>
              </div>
            </div>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mt-4 flex items-start gap-2.5 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div
                    className="
          mt-1
          flex
          h-7
          w-7
          shrink-0
          items-center
          justify-center
          rounded-lg
          border
          border-white/10
          bg-white/[0.06]
        "
                  >
                    <img
                      src={AILogo}
                      alt="AI"
                      className="h-6 w-6 object-contain"
                    />
                  </div>
                )}

                <div
                  className={`
        max-w-[85%]
        rounded-2xl
        px-4
        py-3
        ${
          message.role === "user"
            ? "rounded-tr-md bg-white/10"
            : "rounded-tl-md border border-white/10 bg-white/[0.06]"
        }
      `}
                >
                  <div className="text-sm leading-relaxed text-white/85">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 last:mb-0">{children}</p>
                        ),

                        ul: ({ children }) => (
                          <ul className="my-2 list-disc space-y-1 pl-5">
                            {children}
                          </ul>
                        ),

                        ol: ({ children }) => (
                          <ol className="my-2 list-decimal space-y-1 pl-5">
                            {children}
                          </ol>
                        ),

                        li: ({ children }) => (
                          <li className="pl-1">{children}</li>
                        ),

                        strong: ({ children }) => (
                          <strong className="font-semibold text-white">
                            {children}
                          </strong>
                        ),
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  {message.isError && (
                    <button
                      type="button"
                      onClick={() => askQuestion(retryQuestionRef.current)}
                      className="mt-2 text-[11px] text-white/40 underline transition-colors duration-150 hover:text-white/70"
                    >
                      Try again
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="mt-4 flex items-start gap-2.5">
                <div
                  className="
        mt-1
        flex
        h-7
        w-7
        shrink-0
        items-center
        justify-center
        rounded-lg
        border
        border-white/10
        bg-white/[0.06]
      "
                >
                  <img
                    src={AILogo}
                    alt="AI"
                    className="h-6 w-6 object-contain"
                  />
                </div>

                <div
                  className="
        rounded-2xl
        rounded-tl-md
        border
        border-white/10
        bg-white/[0.06]
        px-4
        py-3
      "
                >
                  {slowBackend ? (
                    <p className="text-xs leading-relaxed text-white/50">
                      Waking up the AI assistant...
                    </p>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.3s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50 [animation-delay:-0.15s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" />
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Suggested questions */}
            <div className="mt-5">
              <p className="mb-2 px-1 text-[10px] uppercase tracking-[0.15em] text-white/30">
                Try asking
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "Tell me about his experience",
                  "What are his skills?",
                  "Tell me about his projects",
                ].map((question) => (
                  <button
                    key={question}
                    type="button"
                    onClick={() => askQuestion(question)}
                    className="
                      rounded-full

                      border
                      border-white/10

                      bg-white/4

                      px-3
                      py-1.5

                      text-[11px]
                      text-white/55

                      transition-all
                      duration-200

                      hover:border-white/20
                      hover:bg-white/9
                      hover:text-white/80
                    "
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* =====================================================
              INPUT
          ===================================================== */}

          <div
            className="
              relative

              border-t
              border-white/10

              bg-black/15

              p-3
            "
          >
            <div
              className="
                flex
                items-center
                gap-2

                rounded-2xl

                border
                border-white/10

                bg-white/5

                p-1.5

                backdrop-blur-xl

                transition-all
                duration-200

                focus-within:border-white/20
                focus-within:bg-white/[0.07]
              "
            >
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    askQuestion(question);
                  }
                }}
                placeholder="Ask something..."
                disabled={isLoading}
                className="
    min-w-0
    flex-1
    bg-transparent
    px-3
    py-2
    text-sm
    text-white
    outline-none
    placeholder:text-white/25
    disabled:opacity-50
  "
              />

              {/* Send button */}
              <button
                type="button"
                onClick={() => askQuestion(question)}
                disabled={isLoading || !question.trim()}
                aria-label="Send message"
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center

                  rounded-xl

                  border
                  border-white/15

                  bg-white/10

                  text-white

                  backdrop-blur-md

                  transition-all
                  duration-200

                  hover:scale-105
                  hover:border-white/25
                  hover:bg-white/18

                  active:scale-95
                "
              >
                <span className="text-base">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          AI BUTTON
      ========================================================= */}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open AI assistant"
        className="
          group

          fixed
          bottom-2
          right-0
          z-10001

          flex
          h-20
          w-20
          items-center
          justify-center


          transition-all
          duration-300

          hover:scale-120

          active:scale-95
        "
      >
        <div className="h-20 w-20">
          <Strands glass energy={0.65} clickPulse />
        </div>
      </button>
    </>
  );
}

export default AIChatbot;
