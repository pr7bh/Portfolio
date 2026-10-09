import Swal from "sweetalert2";
import SpecularButton from "../../common/SpecularButton";
const glassAlert = {
  background: "rgba(20, 20, 20, 0.55)",
  color: "#fff",
  confirmButtonColor: "#5227FF",
  backdrop: "rgba(0, 0, 0, 0.45)",
  customClass: {
    popup: "glass-swal-popup",
    title: "glass-swal-title",
    htmlContainer: "glass-swal-text",
    confirmButton: "glass-swal-button",
  },
};

function Contact() {
  const onSubmit = async (event) => {
    event.preventDefault();

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
    } catch (error) {
      Swal.fire({
        ...glassAlert,
        title: "Error",
        text: "Unable to send your message right now.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <section
      id="contact"
      className="flex w-full flex-col items-center px-5 py-24 md:px-10"
    >
      <h1 className="sectionTitle mb-12 text-center">
        Contact
      </h1>

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-6xl flex-col gap-7"
      >
        {/* NAME */}
        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-medium text-white/60"
          >
            Name
          </label>

          <input
            type="text"
            name="name"
            id="name"
            placeholder="Your name"
            required
            minLength={2}
            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-transparent
              px-4
              py-3.5
              text-white
              outline-none
              placeholder:text-white/30
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

        {/* EMAIL */}
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-white/60"
          >
            Email
          </label>

          <input
            type="email"
            name="email"
            id="email"
            placeholder="you@example.com"
            required
            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-transparent
              px-4
              py-3.5
              text-white
              outline-none
              placeholder:text-white/30
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

        {/* PHONE */}
        <div>
          <label
            htmlFor="phone"
            className="mb-2 block text-sm font-medium text-white/60"
          >
            Contact Number
          </label>

          <input
            type="tel"
            name="phone"
            id="phone"
            placeholder="+91 9876543210"
            required
            inputMode="tel"
            autoComplete="tel"
            className="
              w-full
              rounded-xl
              border
              border-white/20
              bg-transparent
              px-4
              py-3.5
              text-white
              outline-none
              placeholder:text-white/30
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

        {/* MESSAGE */}
        <div>
          <label
            htmlFor="message"
            className="mb-2 block text-sm font-medium text-white/60"
          >
            Message
          </label>

          <textarea
            name="message"
            id="message"
            placeholder="Tell me about your project..."
            required
            minLength={10}
            rows={6}
            className="
              w-full
              resize-none
              rounded-xl
              border
              border-white/20
              bg-transparent
              px-4
              py-3.5
              text-white
              outline-none
              placeholder:text-white/30
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

        {/* BUTTON */}
        <div className="flex justify-center pt-2">
          <div className="custom-cursor--action">
            <SpecularButton
              type="submit"
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
              Send Message
            </SpecularButton>
          </div>
        </div>
      </form>
    </section>
  );
}

export default Contact;