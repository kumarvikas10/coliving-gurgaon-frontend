import React from "react";
import styles from "./About.module.css";
import AboutImg from "../../assets/about.png";
import ResidentImg from "../../assets/ResidentImg.svg";
import LocationImg from "../../assets/LocationImg.svg";
import SupportImg from "../../assets/SupportImg.svg";
import FullyFurnishedImg from "../../assets/FullyFurnishedImg.svg";
import BannerImg from "../../assets/Banner.png";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <>
      <section className={styles.aboutUs}>
        <div className={`container ${styles.aboutContainer}`}>
          <div className={styles.aboutHeading}>
            <h2>
              Our <span>Story</span>
            </h2>
            <p>
              Coliving Gurgaon was built to simplify urban living in one of
              India’s fastest-growing corporate hubs. Created with the vision of
              offering thoughtfully designed spaces that blend comfort,
              convenience, and community, we make it easy for working
              professionals and students to settle in from day one. Located in
              prime areas of Gurgaon with fully managed services, modern
              amenities, and a vibrant community of like-minded residents,
              Coliving Gurgaon is not just a place to stay — it’s a smarter way
              to live.
            </p>
            <img src={AboutImg} alt="" />
          </div>
          <div className={styles.aboutStatSection}>
            <h3>
              Our mission is to create a world where everyone can design and
              live their best lives, with the freedom to live and work anywhere.
            </h3>
            <div className={styles.aboutStatGrid}>
              <div className={styles.aboutStat}>
                <img src={ResidentImg} />
                <h4>500+</h4>
                <p>Happy Residents</p>
              </div>
              <div className={styles.aboutStat}>
                <img src={LocationImg} />
                <h4>Prime Locations</h4>
                <p>Across Gurgaon</p>
              </div>
              <div className={styles.aboutStat}>
                <img src={SupportImg} />
                <h4>24/7</h4>
                <p>Security & Support</p>
              </div>
              <div className={styles.aboutStat}>
                <img src={FullyFurnishedImg} />
                <h4>Fully Furnished</h4>
                <p>Move In Ready Rooms</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.Banner}>
        <div className={`container ${styles.BannerContainer}`}>
          <img className={styles.BannerImg} src={BannerImg} />
          <div className={styles.BannerContent}>
            <h3>Ready to find your next home in Gurgaon?</h3>
            <p>
              Whether you're looking for a short stay or long-term comfort,
              we're here to help you settle in effortlessly. Let’s find the
              perfect space for you.
            </p>
            <Link to="/contact" className={`btn ${styles.ContactBtn}`}>Contact Us</Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
