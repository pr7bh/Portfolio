import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { AnimatePresence, motion } from "motion/react";
import {
  IconArrowUp,
  IconArrowUpRight,
  IconMaximize,
  IconMinimize,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import Strands from "./Strands";

const API_BASE = "https://portfolio-h5kk.onrender.com";
const MAX_LENGTH = 500;
const ease = [0.22, 1, 0.36, 1];

const SUGGESTIONS = [
  "Tell me about his experience",
  "What are his skills?",
  "Tell me about his projects",
];

const ERROR_MESSAGES = {
  429: "You're sending messages too quickly. Please wait a moment and try again.",
  422: "Your message couldn't be processed. Please try a shorter question.",
  503: "The AI is briefly unavailable. Please try again in a moment.",
};

const markdown = {
  p: ({ children }) => <div className="mb-2.5 last:mb-0">{children}</div>,
  ul: ({ children }) => <ul className="my-2 list-disc space-y-1.5 pl-5 marker:text-white/30">{children}</ul>,
  ol: ({ children }) => <ol className="my-2 list-decimal space-y-1.5 pl-5 marker:text-white/40">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-(--warm) underline decoration-white/20 underline-offset-2">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded-md bg-white/10 px-1.5 py-0.5 text-[0.8em]" style={{ fontFamily: "var(--font-mono)" }}>
      {children}
    </code>
  ),
};

function SignalBars() {
  return (
    <span className="flex h-4 items-center gap-[3px]" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="block h-full w-[3px] origin-center rounded-full"
          style={{
            background: i % 2 ? "var(--cool)" : "var(--warm)",
            animation: `signalBar 1s ease-in-out ${i * 0.12}s infinite`,
          }}
        />
      ))}
    </span>
  );
}

function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [slowBackend, setSlowBackend] = useState(false);
  const retryQuestionRef = useRef("");
  const windowRef = useRef(null);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  // The backend sleeps when idle (free hosting); wake it early so the first
  // question doesn't pay the full cold-start delay.
  useEffect(() => {
    const id = setTimeout(() => {
      fetch(`${API_BASE}/health`, { mode: "cors" }).catch(() => {});
    }, 4000);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (windowRef.current) windowRef.current.inert = !isOpen;
    if (!isOpen) return;
    if (window.matchMedia("(pointer: fine)").matches) {
      inputRef.current?.focus({ preventScroll: true });
    }
    const onKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setIsMaximized(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    const el = messagesRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading, slowBackend]);

  const askQuestion = async (userQuestion) => {
    const trimmedQuestion = userQuestion.trim();

    if (!trimmedQuestion || isLoading) {
      return;
    }

    retryQuestionRef.current = trimmedQuestion;
    setQuestion("");
    setIsLoading(true);
    setSlowBackend(false);

    setMessages((prev) => [...prev, { role: "user", content: trimmedQuestion }]);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);
    const slowTimerId = setTimeout(() => setSlowBackend(true), 6000);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmedQuestion }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        const content =
          ERROR_MESSAGES[response.status] ?? "The AI assistant encountered an error. Please try again.";
        setMessages((prev) => [...prev, { role: "assistant", content, isError: true }]);
      }
    } catch (error) {
      clearTimeout(timeoutId);
      const content =
        error.name === "AbortError"
          ? "The request timed out. The AI assistant may be waking up — please try again in a moment."
          : "Unable to connect. Please check your connection and try again.";
      setMessages((prev) => [...prev, { role: "assistant", content, isError: true }]);
    } finally {
      clearTimeout(slowTimerId);
      setSlowBackend(false);
      setIsLoading(false);
    }
  };

  const close = () => {
    setIsOpen(false);
    setIsMaximized(false);
  };

  const hasConversation = messages.length > 0;

  return (
    <>
      {/* =========================================================
          AI CHAT WINDOW
      ========================================================= */}
      <div
        ref={windowRef}
        role="dialog"
        aria-label="AI assistant"
        aria-hidden={!isOpen}
        className={`
          fixed z-[10000] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${
            isMaximized
              ? "inset-3 origin-center md:inset-8"
              : "inset-x-3 bottom-24 h-[min(74vh,620px)] origin-bottom-right md:inset-x-auto md:right-6 md:bottom-26 md:h-[600px] md:w-[400px]"
          }
          ${
            isOpen
              ? "translate-y-0 scale-100 opacity-100 blur-0"
              : "pointer-events-none translate-y-6 scale-[0.85] opacity-0 blur-sm"
          }
        `}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/10 bg-[#08080a]/92 shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
          {/* Aurora */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-56 overflow-hidden">
            <div className="absolute -left-16 -top-24 h-56 w-56 rounded-full bg-[rgba(255,162,76,0.16)] blur-[70px]" />
            <div className="absolute -right-12 -top-28 h-56 w-56 rounded-full bg-[rgba(147,241,255,0.14)] blur-[70px]" />
          </div>

          {/* ================= HEADER ================= */}
          <div className="relative flex items-center justify-between px-5 pb-4 pt-5">
            <div className="flex items-center gap-3.5">
              <div className="relative h-11 w-11 shrink-0">
                {isOpen && (
                  <Strands glass energy={0.6} listening={isLoading} interactive={false} intro={false} maxDevicePixelRatio={1.5} />
                )}
              </div>
              <div>
                <div className="text-[0.95rem] font-bold tracking-tight text-white">Prabh&apos;s AI</div>
                <div
                  className="mt-0.5 flex items-center gap-1.5 text-[0.6rem] uppercase tracking-[0.18em] text-white/45"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isLoading ? "animate-pulse bg-(--cool)" : "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    }`}
                  />
                  {isLoading ? (slowBackend ? "Waking up" : "Thinking") : "Online · RAG on CV"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setIsMaximized((prev) => !prev)}
                aria-label={isMaximized ? "Restore AI assistant" : "Maximize AI assistant"}
                className="hidden h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors duration-200 hover:bg-white/10 hover:text-white md:flex"
              >
                {isMaximized ? <IconMinimize size={16} stroke={1.75} /> : <IconMaximize size={16} stroke={1.75} />}
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Close AI assistant"
                className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors duration-200 hover:bg-white/10 hover:text-white"
              >
                <IconX size={17} stroke={1.75} />
              </button>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="relative mx-5 h-px"
            style={{ background: "linear-gradient(90deg, transparent, rgba(147,241,255,0.35), rgba(255,162,76,0.35), transparent)" }}
          />

          {/* ================= MESSAGES ================= */}
          <div ref={messagesRef} aria-live="polite" className="relative flex-1 overflow-y-auto px-4 py-5">
            {!hasConversation && (
              <div className="flex h-full flex-col justify-end px-1 pb-1">
                <div className="text-[1.6rem] font-bold leading-[1.1] tracking-tight text-white">
                  Hi, I&apos;m Prabh&apos;s AI.
                  <span className="block text-white/35">Ask me anything.</span>
                </div>
                <div className="mt-3 text-sm leading-relaxed text-white/50">
                  Ask me about his experience, skills, projects, education, or technologies.
                </div>

                <div
                  className="mb-3 mt-7 text-[0.6rem] uppercase tracking-[0.2em] text-white/30"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Try asking
                </div>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s, i) => (
                    <motion.button
                      key={s}
                      type="button"
                      onClick={() => askQuestion(s)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                      transition={{ duration: 0.5, ease, delay: isOpen ? 0.15 + i * 0.07 : 0 }}
                      className="group flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left text-sm text-white/75 transition-colors duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                    >
                      {s}
                      <IconArrowUpRight
                        size={16}
                        stroke={1.75}
                        className="shrink-0 text-white/35 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-(--warm)"
                      />
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.35, ease }}
                    className="mt-4 flex justify-end first:mt-0"
                  >
                    <div className="max-w-[82%] rounded-[20px] rounded-br-md bg-white px-4 py-2.5 text-sm font-medium leading-relaxed text-[#050506]">
                      {message.content}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease }}
                    className="mt-4 flex items-start gap-2.5"
                  >
                    <span className="ai-orb-mini mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
                    <div
                      className={`max-w-[86%] rounded-[20px] rounded-tl-md border px-4 py-3 text-sm leading-relaxed text-white/85 ${
                        message.isError ? "border-[rgba(255,162,76,0.3)] bg-[rgba(255,162,76,0.06)]" : "border-white/8 bg-white/[0.04]"
                      }`}
                    >
                      <ReactMarkdown components={markdown}>{message.content}</ReactMarkdown>
                      {message.isError && (
                        <button
                          type="button"
                          onClick={() => askQuestion(retryQuestionRef.current)}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70 transition-colors duration-200 hover:border-white/30 hover:text-white"
                        >
                          <IconRefresh size={12} stroke={2} />
                          Try again
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              )}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-start gap-2.5"
              >
                <span className="ai-orb-mini ai-orb-mini--thinking mt-1 h-6 w-6 shrink-0" aria-hidden="true" />
                <div className="flex items-center gap-3 rounded-[20px] rounded-tl-md border border-white/8 bg-white/[0.04] px-4 py-3">
                  <SignalBars />
                  <span className="text-xs text-white/50">
                    {slowBackend ? "Waking up the AI — the first reply can take up to a minute…" : "Thinking…"}
                  </span>
                </div>
              </motion.div>
            )}
          </div>

          {/* ================= INPUT ================= */}
          <div className="relative px-4 pb-4 pt-2">
            {hasConversation && !isLoading && (
              <div className="-mx-4 mb-2.5 flex gap-2 overflow-x-auto px-4">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => askQuestion(s)}
                    className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[11px] text-white/55 transition-colors duration-200 hover:border-white/25 hover:text-white"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                askQuestion(question);
              }}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pl-5 transition-[border-color,box-shadow] duration-300 focus-within:border-[rgba(147,241,255,0.4)] focus-within:shadow-[0_0_30px_-10px_rgba(147,241,255,0.5)]"
            >
              <input
                ref={inputRef}
                type="text"
                aria-label="Ask the AI assistant a question"
                value={question}
                maxLength={MAX_LENGTH}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about Prabhjot…"
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent py-2 text-sm text-white outline-none placeholder:text-white/30 disabled:opacity-50"
              />
              {question.length > MAX_LENGTH - 100 && (
                <span className="text-[10px] text-white/35" style={{ fontFamily: "var(--font-mono)" }}>
                  {MAX_LENGTH - question.length}
                </span>
              )}
              <button
                type="submit"
                disabled={isLoading || !question.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#050506] transition-all duration-200 hover:scale-105 hover:bg-(--warm) active:scale-95 disabled:scale-100 disabled:bg-white/10 disabled:text-white/30"
              >
                <IconArrowUp size={18} stroke={2.2} />
              </button>
            </form>

            <div
              className="mt-2.5 text-center text-[0.58rem] uppercase tracking-[0.18em] text-white/25"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Answers are generated from Prabhjot&apos;s CV
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
        aria-label={isOpen ? "Close AI assistant" : "Open AI assistant"}
        aria-expanded={isOpen}
        className="group fixed bottom-2 right-0 z-10001 flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-110 active:scale-95"
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute right-[86%] top-1/2 hidden -translate-y-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-md transition-all duration-300 md:block ${
            isOpen ? "translate-x-2 opacity-0" : "opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Ask my AI
        </span>
        <div className="h-20 w-20">
          <Strands glass energy={isOpen ? 0.85 : 0.65} listening={isLoading} clickPulse maxDevicePixelRatio={1.5} />
        </div>
      </button>
    </>
  );
}

export default AIChatbot;
