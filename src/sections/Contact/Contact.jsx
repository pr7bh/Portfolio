import { useState } from "react";
import Swal from "sweetalert2";
import { IconAlertCircle, IconArrowUpRight, IconCheck, IconSparkles } from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import SpecularButton from "../../common/SpecularButton";
import SectionHeading from "../../common/SectionHeading";
import Strands from "../../common/Strands";
import { Magnetic } from "../../common/Interactive";
import { useMediaQuery } from "../../common/hooks";
import { MESSAGE_MAX, VALIDATORS } from "./validation";

const ease = [0.22, 1, 0.36, 1];

const LINKS = [
  { label: "GitHub", href: "https://github.com/pr7bh", external: true },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/prabhjot-singh-40301b243/", external: true },
  { label: "Call", href: "tel:+917056952556", external: false },
];

const reveal = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.3 },
  transition: { duration: 0.8, ease, delay },
});

function Field({ id, label, as: Tag = "input", delay, error, valid, hint, onApplyHint, counter, ...props }) {
  const messageId = `${id}-message`;
  return (
    <motion.div {...reveal(delay)} className="group relative">
      <div className="mb-2 flex items-center justify-between">
        <label
          htmlFor={id}
          className={`block text-[0.68rem] uppercase tracking-[0.2em] transition-colors duration-300 ${
            error ? "text-(--danger)" : "text-white/45 group-focus-within:text-white"
          }`}
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {label}
        </label>
        {counter}
      </div>
      <div className="relative">
        <Tag
          id={id}
          name={id}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error || hint ? messageId : undefined}
          {...props}
          className={`w-full resize-none border-0 border-b bg-transparent px-0 pb-3 pr-8 pt-1 text-base text-white outline-none transition-colors duration-300 placeholder:text-white/25 md:text-lg ${
            error ? "border-(--danger)/70" : "border-white/15 hover:border-white/30"
          }`}
        />
        <AnimatePresence>
          {valid && !error && (
            <motion.span
              key="ok"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.3, ease }}
              aria-hidden="true"
              className="absolute right-0 top-1.5 text-(--cool)"
            >
              <IconCheck size={18} stroke={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left transition-transform duration-700 ease-out ${
          error ? "hidden" : "scale-x-0 group-focus-within:scale-x-100"
        }`}
        style={{ background: "linear-gradient(90deg, var(--cool), #fff, var(--warm))" }}
      />
      <AnimatePresence initial={false}>
        {(error || hint) && (
          <motion.div
            key={error ? `e-${error}` : `h-${hint.text}`}
            id={messageId}
            role={error ? "alert" : "status"}
            initial={{ opacity: 0, height: 0, y: -4 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -4 }}
            transition={{ duration: 0.3, ease }}
            className="absolute left-0 right-0 top-full overflow-hidden"
          >
            <p
              className={`flex items-center gap-2 pt-2 text-[0.72rem] leading-5 ${error ? "text-(--danger)" : "text-(--warm)"}`}
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {error ? <IconAlertCircle size={14} stroke={1.75} className="shrink-0" /> : <IconSparkles size={14} stroke={1.75} className="shrink-0" />}
              <span>{error || hint.text}</span>
              {!error && hint && (
                <button
                  type="button"
                  onClick={onApplyHint}
                  className="ml-1 rounded-full border border-(--warm)/40 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-(--warm) transition-colors hover:bg-(--warm)/10"
                >
                  Use it
                </button>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const glassAlert = {
  background: "rgba(20, 20, 20, 0.55)",
  color: "#fff",
  confirmButtonColor: "#f4f2ee",
  backdrop: "rgba(0, 0, 0, 0.45)",
  customClass: {
    popup: "glass-swal-popup",
    title: "glass-swal-title",
    htmlContainer: "glass-swal-text",
    confirmButton: "glass-swal-button",
  },
};

const FIELD_ORDER = ["name", "email", "phone", "message"];

function Contact() {
  const [isSending, setIsSending] = useState(false);
  const [errors, setErrors] = useState({});
  const [valid, setValid] = useState({});
  const [hints, setHints] = useState({});
  const [messageLength, setMessageLength] = useState(0);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Validate one field and record the outcome. Errors appear once a field
  // is left (blur) or on submit; after that they update live while typing.
  const check = (name, value) => {
    const result = VALIDATORS[name](value);
    setErrors((prev) => ({ ...prev, [name]: result.error || null }));
    setValid((prev) => ({ ...prev, [name]: !result.error }));
    setHints((prev) => ({ ...prev, [name]: result.hint || null }));
    return result;
  };

  const onBlur = (event) => {
    const { name, value } = event.target;
    if (!VALIDATORS[name]) return;
    // Don't nag about an empty field the visitor merely tabbed through.
    if (!value.trim() && !errors[name]) return;
    const result = check(name, value);
    if (!result.error && result.display) event.target.value = result.display;
  };

  const onChange = (event) => {
    const { name, value } = event.target;
    if (name === "message") setMessageLength(value.trim().length);
    if (errors[name] || valid[name]) check(name, value);
  };

  const applyHint = (name) => {
    const input = document.getElementById(name);
    if (!input || !hints[name]) return;
    input.value = hints[name].apply;
    check(name, input.value);
    input.focus();
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isSending) return;

    const form = event.target;
    const formData = new FormData(form);

    // Spam honeypot: real visitors never see or tick this.
    if (formData.get("botcheck")) return;

    const results = {};
    let firstInvalid = null;
    FIELD_ORDER.forEach((name) => {
      results[name] = check(name, String(formData.get(name) || ""));
      if (results[name].error && !firstInvalid) firstInvalid = name;
    });

    if (firstInvalid) {
      document.getElementById(firstInvalid)?.focus();
      return;
    }

    if (results.phone.display) form.elements.phone.value = results.phone.display;

    const payload = {
      access_key: "0a976b54-1248-45d7-a387-526d23afc9f0",
      subject: `New portfolio message from ${results.name.value}`,
      from_name: "Portfolio contact form",
      name: results.name.value,
      email: results.email.value,
      phone: results.phone.value,
      message: results.message.value,
    };

    setIsSending(true);
    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const res = await response.json();

      if (res.success) {
        Swal.fire({
          ...glassAlert,
          title: "Message Sent!",
          text: "Thanks for reaching out. I'll get back to you soon.",
          icon: "success",
          confirmButtonText: "Awesome",
        });

        form.reset();
        setErrors({});
        setValid({});
        setHints({});
        setMessageLength(0);
      } else {
        Swal.fire({
          ...glassAlert,
          title: "Something went wrong",
          text: "Unable to send your message. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } catch {
      Swal.fire({
        ...glassAlert,
        title: "Error",
        text: "Unable to send your message right now.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setIsSending(false);
    }
  };

  const fieldState = (name) => ({
    error: errors[name],
    valid: valid[name],
    hint: hints[name],
    onApplyHint: () => applyHint(name),
    onBlur,
    onChange,
  });

  return (
    <section
      id="contact"
      className="relative flex w-full flex-col items-center overflow-hidden px-5 pb-16 pt-24 md:px-10"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-6 h-[340px] opacity-55 md:top-0 md:h-[460px]"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 30%, black 52%, transparent 82%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 30%, black 52%, transparent 82%)",
        }}
      >
        <Strands
          glass={false}
          energy={0.5}
          intensity={0.85}
          interactive={false}
          clickPulse={false}
          maxDevicePixelRatio={isDesktop ? 1.5 : 1}
        />
      </div>

      <div className="relative w-full">
        <SectionHeading index="05" kicker="Final chapter" title="Contact" />
      </div>

      <div className="relative grid w-full max-w-6xl grid-cols-1 gap-16 lg:grid-cols-[1fr_1.15fr] lg:gap-24">
        <div className="flex flex-col">
          <motion.div
            {...reveal(0)}
            style={{ fontSize: "clamp(2.1rem, 4.4vw, 3.75rem)", lineHeight: 1.02, letterSpacing: "-0.035em", fontWeight: 700 }}
            className="text-white"
          >
            Have an idea?
            <br />
            <span className="text-white/35">Let&rsquo;s build it together.</span>
          </motion.div>

          <motion.div {...reveal(0.1)} className="mt-6 max-w-md text-base leading-7 text-white/55">
            Send a message and I&rsquo;ll get back to you soon.
          </motion.div>

          <motion.ul {...reveal(0.2)} className="mt-12 border-t border-white/10">
            {LINKS.map((link) => (
              <li key={link.label} className="border-b border-white/10">
                <a
                  href={link.href}
                  {...(link.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group flex items-center justify-between py-5 text-white/75 transition-colors duration-300 hover:text-white"
                >
                  <span className="text-lg transition-transform duration-500 ease-out group-hover:translate-x-2 md:text-xl">
                    {link.label}
                  </span>
                  <IconArrowUpRight
                    size={20}
                    stroke={1.5}
                    className="transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:rotate-45"
                  />
                </a>
              </li>
            ))}
          </motion.ul>
        </div>

        <form onSubmit={onSubmit} noValidate className="flex w-full flex-col gap-11">
          {/* Honeypot (hidden from people, tempting to bots) */}
          <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

          <Field
            id="name"
            label="Name"
            type="text"
            placeholder="Your name"
            required
            maxLength={80}
            autoComplete="name"
            delay={0.05}
            {...fieldState("name")}
          />
          <Field
            id="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            required
            maxLength={254}
            autoComplete="email"
            autoCapitalize="off"
            spellCheck={false}
            delay={0.1}
            {...fieldState("email")}
          />
          <Field
            id="phone"
            label="Contact Number"
            type="tel"
            placeholder="+91 98765 43210"
            required
            maxLength={24}
            inputMode="tel"
            autoComplete="tel"
            delay={0.15}
            {...fieldState("phone")}
          />
          <Field
            id="message"
            label="Message"
            as="textarea"
            placeholder="Tell me about your project..."
            required
            maxLength={MESSAGE_MAX}
            rows={5}
            delay={0.2}
            counter={
              <span
                className={`text-[0.62rem] tabular-nums tracking-widest transition-colors ${
                  messageLength > MESSAGE_MAX * 0.9 ? "text-(--warm)" : "text-white/30"
                }`}
                style={{ fontFamily: "var(--font-mono)" }}
                aria-hidden="true"
              >
                {messageLength}/{MESSAGE_MAX}
              </span>
            }
            {...fieldState("message")}
          />

          <motion.div {...reveal(0.25)} className="flex justify-start pt-2">
            <Magnetic strength={0.25}>
              <SpecularButton
                type="submit"
                disabled={isSending}
                size="lg"
                radius={18}
                tint="#ffffff"
                tintOpacity={0}
                blur={0}
                textColor="#f5f5f5"
                lineColor="#ffffff"
                baseColor="transparent"
                intensity={1}
                shineSize={10}
                shineFade={40}
                thickness={1}
                speed={0.35}
                followMouse
                proximity={250}
                autoAnimate={false}
              >
                {isSending ? "Sending…" : "Send Message"}
              </SpecularButton>
            </Magnetic>
          </motion.div>
        </form>
      </div>
    </section>
  );
}

export default Contact;
