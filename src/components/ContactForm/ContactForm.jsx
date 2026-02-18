import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import styles from "./ContactForm.module.css";
import FormImg from "../../assets/FormImg.png";
import FormIcon from "../../assets/formSubmitIcon.svg";

const ContactForm = ({
  property,
  roomTypes = [],
  city = null,
  microlocation = null,
}) => {
  const API_BASE =
    process.env.REACT_APP_API_BASE ||
    "https://coliving-gurgaon-backend.onrender.com";

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roomType: "",
    moveInDate: "",
    budget: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g))
      newErrors.email = "Valid email required";
    if (!formData.phone.match(/^\+?[\d\s-]{10,15}$/))
      newErrors.phone = "Valid phone required";
    if (!formData.roomType) newErrors.roomType = "Select room type";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE}/api/leads`, formData);
      setSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        roomType: "",
        moveInDate: "",
        budget: "",
        message: "",
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formWrapper}>
      {!success ? (
        <div className={styles.mainFormDiv}>
          {/* LEFT SIDE */}
          <div className={styles.leftContent}>
            <h2>
              Lets Get in <span className={styles.highlight}>Touch!</span>
            </h2>
            <p>
              Whether you're looking for a fully furnished private room, a
              shared coliving space near Gurgaon’s business hubs, or need help
              choosing the right option, our team is here to guide you.
            </p>
            <a href="tel:+917827063300">
              Call us at{" "}
              <span className={styles.highlight}>+91-7827 063 300</span>
            </a>
            <img src={FormImg} alt="" />
          </div>

          {/* RIGHT SIDE */}
          <div className={styles.rightContent}>
            <div className={styles.bookingForm}>
              <h3>Book Your Stay Today</h3>
              <p>
                Fill out the form and our team will get back to you shortly.
              </p>
              {error && <div className={styles.errorMessage}>{error}</div>}

              <form ref={formRef} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    name="name"
                    placeholder="Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formRow}>
                  <select
                    name="roomType"
                    value={formData.roomType}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  >
                    <option value="">Room Type *</option>
                    <option value="private">Private Room</option>
                    <option value="shared">Shared Room</option>
                  </select>

                  <input
                    type="date"
                    name="moveInDate"
                    value={formData.moveInDate}
                    onChange={handleInputChange}
                    className={styles.formInput}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.enquireBtn}
                >
                  {loading ? "Sending..." : "Enquire Now"}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.successContent}>
          <img src={FormIcon} alt="" />
          <h3>Enquiry Sent Successfully!</h3>
          <p>Our team will contact you within 2 hours.</p>
          <div className={styles.guaranteeBadges}>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span>Best price guarantee</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span>No Hidden Charges</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span>Flexible Move-in Dates</span>
            </div>
            <div className={styles.badge}>
              <span className={styles.badgeIcon}>✓</span>
              <span>High-Speed Wi-Fi</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactForm;
