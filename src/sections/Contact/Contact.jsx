import { useState } from "react";
import Swal from "sweetalert2";
import { IconArrowUpRight } from "@tabler/icons-react";
import { motion } from "motion/react";
import SpecularButton from "../../common/SpecularButton";
import SectionHeading from "../../common/SectionHeading";
import Strands from "../../common/Strands";
import { Magnetic } from "../../common/Interactive";
import { useMediaQuery } from "../../common/hooks";

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

function Field({ id, label, as: Tag = "input", delay, ...props }) {
  return (
    <motion.div {...reveal(delay)} className="group relative">
      <label
        htmlFor={id}
        className="mb-2 block text-[0.68rem] uppercase tracking-[0.2em] text-white/45 transition-colors duration-300 group-focus-within:text-white"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {label}
      </label>
      <Tag
        id={id}
        name={id}
        {...props}
        className="w-full resize-none border-0 border-b border-white/15 bg-transparent px-0 pb-3 pt-1 text-base text-white outline-none transition-colors duration-300 placeholder:text-white/25 hover:border-white/30 md:text-lg"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-700 ease-out group-focus-within:scale-x-100"
        style={{ background: "linear-gradient(90deg, var(--cool), #fff, var(--warm))" }}
      />
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

function Contact() {
  const [isSending, setIsSending] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const onSubmit = async (event) => {
    event.preventDefault();
    if (isSending) return;

    const form = event.target;
    const formData = new FormData(form);

    const name = formData.get("name")?.trim();
    const email = formData.get("email")?.trim();
    const phone = formData.get("phone")?.trim();
    const message = formData.get("message")?.trim();

    // ==========================================
    // EMAIL VALIDATION
    // ==========================================

    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

    if (!email || !emailRegex.test(email)) {
      Swal.fire({
        ...glassAlert,
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    // ==========================================
    // PHONE VALIDATION
    // ==========================================

    const cleanPhone = phone?.replace(/[\s()-]/g, "");

    const phoneRegex = /^\+?[1-9]\d{7,14}$/;

    if (!phone || !phoneRegex.test(cleanPhone)) {
      Swal.fire({
        ...glassAlert,
        title: "Invalid Contact Number",
        text: "Please enter a valid contact number with country code.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    // ==========================================
    // NAME VALIDATION
    // ==========================================

    if (!name || name.length < 2) {
      Swal.fire({
        ...glassAlert,
        title: "Invalid Name",
        text: "Please enter your name.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    // ==========================================
    // MESSAGE VALIDATION
    // ==========================================

    if (!message || message.length < 10) {
      Swal.fire({
        ...glassAlert,
        title: "Message Too Short",
        text: "Please enter at least 10 characters in your message.",
        icon: "error",
        confirmButtonText: "OK",
      });

      return;
    }

    // ==========================================
    // WEB3FORMS
    // ==========================================

    formData.set("name", name);
    formData.set("email", email);
    formData.set("phone", cleanPhone);
    formData.set("message", message);

    formData.append(
      "access_key",
      "0a976b54-1248-45d7-a387-526d23afc9f0"
    );

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    setIsSending(true);
    try {
      const response = await fetch(
        "https://api.web3forms.com/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: json,
        }
      );

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

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-9">
          <Field id="name" label="Name" type="text" placeholder="Your name" required minLength={2} autoComplete="name" delay={0.05} />
          <Field id="email" label="Email" type="email" placeholder="you@example.com" required autoComplete="email" delay={0.1} />
          <Field
            id="phone"
            label="Contact Number"
            type="tel"
            placeholder="+91 9876543210"
            required
            inputMode="tel"
            autoComplete="tel"
            delay={0.15}
          />
          <Field
            id="message"
            label="Message"
            as="textarea"
            placeholder="Tell me about your project..."
            required
            minLength={10}
            rows={5}
            delay={0.2}
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
