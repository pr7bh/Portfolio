import styles from './ContactStyles.module.css';
import Swal from 'sweetalert2';

function Contact() {
  const onSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    // --- Email Validation ---
    const email = formData.get("email");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Swal.fire({
        title: "Invalid Email",
        text: "Please enter a valid email address.",
        icon: "error",
        customClass: {
          popup: styles.swalPopup,
          title: styles.swalTitle,
          confirmButton: styles.swalButton
        }
      });
      return;
    }

    // Add access key
    formData.append("access_key", "0a976b54-1248-45d7-a387-526d23afc9f0");

    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    const res = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json"
      },
      body: json
    }).then((res) => res.json());

    if (res.success) {
      Swal.fire({
        title: "Success!",
        text: "Mail sent successfully!",
        icon: "success",
        customClass: {
          popup: styles.swalPopup,
          title: styles.swalTitle,
          confirmButton: styles.swalButton
        }
      });
      event.target.reset();
    }
  };

  return (
    <section id="contact" className={styles.container}>
      <h1 className="sectionTitle">Contact</h1>
      <form onSubmit={onSubmit}>
        <div className="formGroup">
          <input type="text" name="name" id="name" placeholder="Name" required />
        </div>
        <div className="formGroup">
          <input type="text" name="email" id="email" placeholder="Email" required />
        </div>
        <div className="formGroup">
          <textarea name="message" id="message" placeholder="Message" required></textarea>
        </div>
        <input className="hover btn" type="submit" value="SUBMIT" />
      </form>
    </section>
  );
}

export default Contact;
