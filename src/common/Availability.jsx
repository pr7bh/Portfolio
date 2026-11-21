import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { IconCalendarEvent, IconX } from "@tabler/icons-react";
import { AVAILABILITY, CALL_REQUEST, goToContact } from "./profile";

const ease = [0.22, 1, 0.36, 1];

/* "● Open to roles · Replies in ~24h": a live status pill. */
export function AvailabilityBadge({ className = "", compact = false }) {
  if (!AVAILABILITY.open) return null;
  return (
    <span
      className={`inline-flex items-center gap-2.5 rounded-full border border-emerald-300/25 bg-emerald-400/[0.07] py-1.5 pl-2.5 pr-3.5 text-white/85 backdrop-blur-md ${className}`}
      style={{ fontFamily: "var(--font-mono)" }}
    >
      <span className="relative flex h-2 w-2" aria-hidden="true">
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/70" />
        <span className="relative h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]" />
      </span>
      <span className="text-[0.64rem] uppercase tracking-[0.18em]">
        {AVAILABILITY.status}
        {!compact && <span className="text-white/60"> · {AVAILABILITY.reply}</span>}
      </span>
    </span>
  );
}

/* Opens the booking calendar in a sheet, or (with no booking link set)
   takes the visitor to the contact form with a call request drafted. */
export function BookCallButton({ className = "", children = "Book a call" }) {
  const [open, setOpen] = useState(false);
  const hasCalendar = Boolean(AVAILABILITY.bookingUrl);

  return (
    <>
      <button
        type="button"
        data-sfx="open"
        data-magnetic="0.3"
        onClick={() => (hasCalendar ? setOpen(true) : goToContact(CALL_REQUEST))}
        className={`group inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white/85 transition-colors duration-300 hover:border-white/35 hover:bg-white/[0.08] hover:text-white ${className}`}
      >
        <IconCalendarEvent size={17} stroke={1.6} className="text-(--cool)" />
        {children}
      </button>
      {hasCalendar && <BookingSheet open={open} onClose={() => setOpen(false)} />}
    </>
  );
}

function bookingSrc(url) {
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("cal.com")) {
      u.searchParams.set("embed", "true");
      u.searchParams.set("theme", "dark");
    }
    if (u.hostname.endsWith("calendly.com")) {
      u.searchParams.set("embed_type", "Inline");
      u.searchParams.set("background_color", "050506");
      u.searchParams.set("text_color", "f4f2ee");
      u.searchParams.set("primary_color", "93f1ff");
    }
    return u.toString();
  } catch {
    return url;
  }
}

function BookingSheet({ open, onClose }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="booking"
          className="fixed inset-0 z-10010 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Book a call"
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.5, ease }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88dvh] w-full max-w-4xl flex-col overflow-hidden rounded-t-3xl border border-white/12 bg-[#08080a] shadow-[0_30px_120px_-20px_rgba(0,0,0,1)] md:h-[80vh] md:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <span className="meta text-white/60">Book a call · {AVAILABILITY.detail}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close booking"
                className="grid h-9 w-9 place-items-center rounded-full text-white/60 hover:bg-white/10 hover:text-white"
              >
                <IconX size={18} />
              </button>
            </div>
            {!loaded && (
              <div className="meta absolute inset-0 top-14 grid place-items-center text-white/40">
                Loading calendar…
              </div>
            )}
            <iframe
              title="Booking calendar"
              src={bookingSrc(AVAILABILITY.bookingUrl)}
              onLoad={() => setLoaded(true)}
              className="h-full w-full flex-1 border-0"
              style={{ colorScheme: "dark" }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
