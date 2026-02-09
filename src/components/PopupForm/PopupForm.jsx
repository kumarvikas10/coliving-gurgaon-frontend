import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import styles from "./PopupForm.module.css";

const PopupForm = ({ open, onClose, property, roomTypes = [] }) => {
  const API_BASE = process.env.REACT_APP_API_BASE || "https://coliving-gurgaon-backend.onrender.com";
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    roomType: "",
    moveInDate: "",
    budget: "",
    message: ""
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});
  
  const formRef = useRef(null);
  const timeoutRef = useRef(null);

  // ✅ Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormData({
        name: "",
        email: "",
        phone: "",
        roomType: "",
        moveInDate: "",
        budget: property?.startingPrice ? `₹${property.startingPrice.toLocaleString()}+` : "",
        message: ""
      });
      setSuccess(false);
      setError("");
      setErrors({});
    }
  }, [open, property]);

  // ✅ Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/g)) newErrors.email = "Valid email required";
    if (!formData.phone.match(/^\+?[\d\s-]{10,15}$/)) newErrors.phone = "Valid phone number required";
    if (!formData.roomType) newErrors.roomType = "Please select room type";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear field error
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  }, [errors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");

    const leadData = {
      ...formData,
      propertyId: property?._id,
      propertyName: property?.name,
      city: property?.city?.displayCity || property?.location?.city,
      location: property?.location?.address,
      startingPrice: property?.startingPrice,
      url: window.location.href,
      source: "property_page_popup",
      createdAt: new Date().toISOString()
    };

    try {
      const response = await axios.post(`${API_BASE}/api/leads`, leadData, {
        timeout: 10000 // 10s timeout
      });

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          roomType: "",
          moveInDate: "",
          budget: "",
          message: ""
        });

        // Auto close after 3s
        timeoutRef.current = setTimeout(() => {
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error("Lead submission failed:", err);
      
      if (err.code === 'ECONNABORTED') {
        setError("Request timeout. Please try again.");
      } else if (err.response?.status >= 500) {
        setError("Server error. We'll fix it soon!");
      } else {
        setError("Failed to submit. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = useCallback((e) => {
    if (e.target === e.currentTarget || e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Don't render if not open
  if (!open) return null;

  return (
    <div 
      className={`${styles.backdrop} ${success ? styles.successBackdrop : ""}`}
      onClick={handleClose}
      onKeyDown={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="popup-title"
    >
      <div className={`${styles.modal} ${success ? styles.successModal : ""}`}>
        <button 
          className={styles.close} 
          onClick={onClose}
          aria-label="Close form"
        >
          ×
        </button>

        {!success ? (
          <>
            {/* Header */}
            <div className={styles.rightContent}>
              <div className={styles.bookingForm}>
                <div className={styles.formHeader}>
                  <h3 id="popup-title" className={styles.formTitle}>
                    Book {property?.name}
                  </h3>
                  <p className={styles.formSubtitle}>
                    Starting ₹{property?.startingPrice?.toLocaleString()} / month
                  </p>
                </div>

                <form ref={formRef} className={styles.form} onSubmit={handleSubmit}>
                  {/* Name */}
                  <div className={styles.formGroup}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name *"
                      className={`${styles.formInput} ${errors.name ? styles.errorInput : ""}`}
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.name && <span className={styles.errorText}>{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address *"
                      className={`${styles.formInput} ${errors.email ? styles.errorInput : ""}`}
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.email && <span className={styles.errorText}>{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className={styles.formGroup}>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Phone Number *"
                      className={`${styles.formInput} ${errors.phone ? styles.errorInput : ""}`}
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                    {errors.phone && <span className={styles.errorText}>{errors.phone}</span>}
                  </div>

                  {/* Row: Room Type + Move-in */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <select
                        name="roomType"
                        className={`${styles.formInput} ${errors.roomType ? styles.errorInput : ""}`}
                        value={formData.roomType}
                        onChange={handleInputChange}
                      >
                        <option value="">Select Room Type *</option>
                        {roomTypes.map((room, index) => (
                          <option key={room._id || index} value={room.type}>
                            {room.type} - ₹{room.price?.toLocaleString()}
                          </option>
                        ))}
                      </select>
                      {errors.roomType && <span className={styles.errorText}>{errors.roomType}</span>}
                    </div>

                    <div className={styles.formGroup}>
                      <input
                        type="date"
                        name="moveInDate"
                        className={styles.formInput}
                        value={formData.moveInDate}
                        onChange={handleInputChange}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className={`${styles.enquireBtn} ${loading ? styles.loadingBtn : ""}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className={styles.spinner}></span>
                        Sending
                      </>
                    ) : (
                      "Enquire Now"
                    )}
                  </button>
                </form>
              </div>
            </div>
          </>
        ) : (
          /* ✅ Success State */
          <div className={styles.successContent}>
            <div className={styles.successIcon}>✅</div>
            <h3 className={styles.successTitle}>Enquiry Sent Successfully!</h3>
            <p className={styles.successMessage}>
              Our team will contact you within 2 hours to discuss {property?.name} availability.
            </p>
            <p className={styles.successContact}>
              Or call us: <strong>+91 98765 43210</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PopupForm;
