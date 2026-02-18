import React from "react";
import styles from './Contact.module.css'
import ContactForm from "../../components/ContactForm/ContactForm";

const Contact = () => {
  return (
    <>
      <section className={styles.contactUs}>
        <div className={`container ${styles.aboutContainer}`}>
          <div className={styles.aboutHeading}>
            <h2>
              Contact <span>Us</span>
            </h2>
            <p>
              Coliving Gurgaon was created to redefine modern living in one of India’s fastest-growing corporate cities. Built on the idea of providing fully furnished, thoughtfully designed spaces that combine comfort, flexibility, and community, we make it easy for working professionals and students to feel at home from day one. Located in prime areas near Gurgaon’s major business hubs, our coliving spaces offer fully managed services, high-speed Wi-Fi, housekeeping, and secure living environments. At Coliving Gurgaon, it’s not just about finding accommodation — it’s about experiencing convenient, community-driven living in the heart of Gurgaon.
            </p>
          </div>
          <div className={styles.contactDiv}>
            <ContactForm city="Gurgaon" />
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
