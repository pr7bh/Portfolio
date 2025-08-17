import styles from './FooterStyles.module.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <section id="footer" className={styles.container}>
      <p>
        &copy; {currentYear} Prabhjot Singh.
        <br />
        All rights reserved.
      </p>
    </section>
  );
}

export default Footer;

