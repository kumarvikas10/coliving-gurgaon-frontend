// src/components/Footer/Footer.jsx
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import footerImage from "../../assets/footer-person.png"; // The person with headphones

const Footer = () => {
  return (
    <footer className={styles.footer}>
      {/* Center Image */}
      <div className={styles.centerImage}>
        <img src={footerImage} alt="Happy coliving resident" />
      </div>
      <div className={styles.container}>
        {/* Top Section */}
        <div className={styles.footerContent}>
          {/* Left Contact Info */}
          <div className={styles.contactSection}>
            <h3 className={styles.sectionTitle}>Contact</h3>
            <div className={styles.contactInfo}>
              <p className={styles.phone}>
                <a href="tel:+918527613659">+91-7827063300</a>
              </p>
              <p className={styles.email}>
                <a href="mailto:Hello@colivingspacegurgaon.com">
                  hello@colivingspacegurgaon.com
                </a>
              </p>
            </div>
          </div>
          {/* Right Address Info */}
          <div className={styles.addressSection}>
            <h3 className={styles.sectionTitle}>India</h3>
            <div className={styles.addressInfo}>
              <p>
                Tower-B, UNITECH CYBER PARK, Sector 39,
                <br />
                Gurugram, Haryana 122003
              </p>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <div className={styles.mainHeading}>
          <h2>Coliving Space in Gurgaon</h2>
        </div>

        {/* Bottom Section */}
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>
            Copyright © 2025. All rights reserved.
          </p>
          <Link to="/terms" className={styles.termsLink}>
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
