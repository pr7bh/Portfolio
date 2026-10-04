import Swal from "sweetalert2";
import SpecularButton from "../../common/SpecularButton";

function Contact() {
  const onSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);

    const email = formData.get("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      Swal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "error",
        confirmButtonText: "OK",
        background: "rgba(20, 20, 20, 0.9)",
        color: "#fff",
        confirmButtonColor: "#5227FF",
      });

      return;
    }

    formData.append(
      "access_key",
      "0a976b54-1248-45d7-a387-526d23afc9f0"
    );

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: json,
      }).then((res) => res.json());

      if (res.success) {
        Swal.fire({
          title: "Message Sent!",
          text: "Thanks for reaching out. I'll get back to you soon.",
          icon: "success",
          confirmButtonText: "Awesome",
          background: "rgba(20, 20, 20, 0.9)",
          color: "#fff",
          confirmButtonColor: "#5227FF",
        });

        event.target.reset();
      } else {
        Swal.fire({
          title: "Something went wrong",
          text: "Unable to send your message. Please try again.",
          icon: "error",
          confirmButtonText: "OK",
          background: "rgba(20, 20, 20, 0.9)",
          color: "#fff",
          confirmButtonColor: "#5227FF",
        });
      }
    } catch {
      Swal.fire({
        title: "Error",
        text: "Unable to send your message right now.",
        icon: "error",
        confirmButtonText: "OK",
        background: "rgba(20, 20, 20, 0.9)",
        color: "#fff",
        confirmButtonColor: "#5227FF",
      });
    }
  };

  return (
    <section
      id="contact"
      className="flex w-full flex-col items-center px-5 py-24 md:px-10"
    >
      <h1 className="sectionTitle mb-12 text-center">Contact</h1>

      <form
        onSubmit={onSubmit}
        className="flex w-full max-w-2xl flex-col gap-7"
      >
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
              backdrop-blur-sm
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

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
              backdrop-blur-sm
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

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
              backdrop-blur-sm
              transition-all
              duration-300
              focus:border-white/50
              focus:ring-1
              focus:ring-white/20
            "
          />
        </div>

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