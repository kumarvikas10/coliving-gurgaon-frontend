import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./CityContent.module.css";
import { ClipLoader } from "react-spinners";
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

const CityContent = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [footerTitle, setFooterTitle] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [schemaMarkup, setSchemaMarkup] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { quill, quillRef } = useQuill({
    theme: 'snow',
  });

  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://coliving-gurgaon-backend.onrender.com/api/cities`
      );
      setCities(res.data);

      if (res.data.length > 0) {
        setSelectedCity(res.data[0].city);
      }
    } catch (err) {
      console.error("Error fetching cities:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCityContent = async (city) => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://coliving-gurgaon-backend.onrender.com/api/cities/${city}`
      );

      setTitle(res.data.title || "");
      setDescription(res.data.description || "");
      setFooterTitle(res.data.footerTitle || "");
      setFooterDescription(res.data.footerDescription || "");
      setMetaTitle(res.data.metaTitle || "");
      setMetaDescription(res.data.metaDescription || "");
      setSchemaMarkup(res.data.schemaMarkup || "");
    } catch (err) {
      setTitle("");
      setDescription("");
      setFooterTitle("");
      setFooterDescription("");
      setMetaTitle("");
      setMetaDescription("");
      setSchemaMarkup("");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.post(
        `https://coliving-gurgaon-backend.onrender.com/api/admin/cities`,
        {
          city: selectedCity,
          title,
          description,
          footerTitle,
          footerDescription,
          metaTitle,
          metaDescription,
          schemaMarkup
        }
      );
      alert("Saved!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving city content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      fetchCityContent(selectedCity);
      setIsEditing(false); // Reset editing state when switching city
    }
  }, [selectedCity]);

  // Sync quill editor content only when city changes
useEffect(() => {
  if (quill && footerDescription !== quill.root.innerHTML) {
    quill.root.innerHTML = footerDescription || '';
  }
}, [quill, selectedCity, footerDescription]);

// Update footerDescription state on Quill text change
useEffect(() => {
  if (quill) {
    const handler = () => {
      setFooterDescription(quill.root.innerHTML);
    };
    quill.on('text-change', handler);

    // Cleanup
    return () => {
      quill.off('text-change', handler);
    };
  }
}, [quill]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Edit City Content</h2>

      <div className={styles.formGroup}>
        <label>City:</label>
        <select
          className={styles.select}
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          disabled={loading}
        >
          {cities.map((cityObj) => (
            <option key={cityObj.city} value={cityObj.city}>
              {cityObj.city}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Title:</label>
        <input
          className={styles.input}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Description:</label>
        <textarea
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Footer Title:</label>
        <input
          className={styles.input}
          type="text"
          value={footerTitle}
          onChange={(e) => setFooterTitle(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Footer Description:</label>
        <div
          style={{
            border: '1px solid #ccc',
            borderRadius: '5px',
            minHeight: '200px',
            padding: '10px',
            backgroundColor: !isEditing ? '#f9f9f9' : '#fff'
          }}
        >
          <div ref={quillRef} style={{ height: '180px' }} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Meta Title:</label>
        <input
          className={styles.input}
          type="text"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Meta Description:</label>
        <textarea
          className={styles.textarea}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Schema Markup (JSON-LD):</label>
        <textarea
          className={styles.textarea}
          value={schemaMarkup}
          onChange={(e) => setSchemaMarkup(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      {!isEditing && (
        <button className={styles.btn} onClick={() => setIsEditing(true)} disabled={loading}>
          Edit
        </button>
      )}
      {isEditing && (
        <button className={styles.btn} onClick={handleSave} disabled={loading}>
          Save Changes
        </button>
      )}

      {loading && (
        <div className={styles.loaderOverlay}>
          <ClipLoader color="#222" size={60} />
        </div>
      )}
    </div>
  );
};

export default CityContent;