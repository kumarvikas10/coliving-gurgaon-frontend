import React, { useState } from "react";
import styles from "./BookingForm.module.css";

const BookingForm = ({ property }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roomType: "",
    moveInDate: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Add your form submission logic here
  };

  return (
    <div className={styles.rightContent}>
      <div className={styles.bookingForm}>
        <div className={styles.formHeader}>
          <h3 className={styles.formTitle}>Book Your Stay Today</h3>
          <p className={styles.formSubtitle}>
            Fill out the form and our team will get back to you shortly.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input 
              type="text" 
              name="name"
              placeholder="Name" 
              className={styles.formInput}
              value={formData.name}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className={styles.formInput}
              value={formData.email}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className={styles.formGroup}>
            <input 
              type="tel" 
              name="phone"
              placeholder="Phone" 
              className={styles.formInput}
              value={formData.phone}
              onChange={handleInputChange}
              required 
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <select 
                name="roomType"
                className={styles.formInput}
                value={formData.roomType}
                onChange={handleInputChange}
              >
                <option value="">Room Type</option>
                {property?.roomTypes?.map((room, index) => (
                  <option key={index} value={room.type}>
                    {room.type} - ₹{room.price.toLocaleString()}/month
                  </option>
                ))}
              </select>
            </div>
            
            <div className={styles.formGroup}>
              <input 
                type="date" 
                name="moveInDate"
                placeholder="Move In Date" 
                className={styles.formInput}
                value={formData.moveInDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          
          <button type="submit" className={styles.enquireBtn}>
            Enquire Now
          </button>
        </form>

        {/* Guarantee Badges */}
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
    </div>
  );
};

export default BookingForm;
