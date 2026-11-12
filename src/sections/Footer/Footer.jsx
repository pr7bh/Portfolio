import styles from './FooterStyles.module.css';
import { motion } from "motion/react";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <section id="footer" className={styles.container}>
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        &copy; {currentYear} Prabhjot Singh.
        <br />
        All rights reserved.
      </motion.p>
    </section>
  );
}

export default Footer;

