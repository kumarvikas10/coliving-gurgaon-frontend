import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../City Content/CityContent.module.css";
import { ClipLoader } from "react-spinners";
import { useQuill } from 'react-quilljs';
import 'quill/dist/quill.snow.css';

const MicrolocationContent = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [microlocations, setMicrolocations] = useState([]);
  const [selectedMicro, setSelectedMicro] = useState("");

  const [footerTitle, setFooterTitle] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [schemaMarkup, setSchemaMarkup] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { quill, quillRef } = useQuill({ theme: 'snow' });

  // Fetch cities
  const fetchCities = async () => {
    setLoading(true);
    try {
      const res = await axios.get("https://coliving-gurgaon-backend.onrender.com/api/cities");
      setCities(res.data);
      if (res.data.length > 0) setSelectedCity(res.data[0].city);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch microlocations for selected city
  const fetchMicrolocations = async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://coliving-gurgaon-backend.onrender.com/api/microlocations/${city}`);
      setMicrolocations(res.data);
      if (res.data.length > 0) setSelectedMicro(res.data[0].slug);
    } catch (err) {
      console.error(err);
      setMicrolocations([]);
      setSelectedMicro("");
    } finally {
      setLoading(false);
    }
  };

  // Fetch microlocation content
  const fetchMicroContent = async (city, microSlug) => {
    if (!city || !microSlug) return;
    setLoading(true);
    try {
      const res = await axios.get(`https://coliving-gurgaon-backend.onrender.com/api/microlocations/${city}/${microSlug}`);
      setFooterTitle(res.data.footerTitle || "");
      setFooterDescription(res.data.footerDescription || "");
      setMetaTitle(res.data.metaTitle || "");
      setMetaDescription(res.data.metaDescription || "");
      setSchemaMarkup(res.data.schemaMarkup || "");
    } catch (err) {
      setFooterTitle("");
      setFooterDescription("");
      setMetaTitle("");
      setMetaDescription("");
      setSchemaMarkup("");
    } finally {
      setLoading(false);
    }
  };

  // Save microlocation content
  const handleSave = async () => {
  if (!selectedCity || !selectedMicro) return;
  setLoading(true);
  try {
    await axios.post(`https://coliving-gurgaon-backend.onrender.com/api/microlocations/update`, {
      city: selectedCity,
      slug: selectedMicro,
      footerTitle,
      footerDescription,
      metaTitle,
      metaDescription,
      schemaMarkup
    });
    alert("Saved!");
    setIsEditing(false);
  } catch (err) {
    console.error(err);
    alert(err.response?.data?.error || "Server error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchCities(); }, []);
  useEffect(() => { fetchMicrolocations(selectedCity); }, [selectedCity]);
  useEffect(() => { fetchMicroContent(selectedCity, selectedMicro); setIsEditing(false); }, [selectedCity, selectedMicro]);

  // Sync Quill editor
  useEffect(() => {
    if (quill && footerDescription !== quill.root.innerHTML) {
      quill.root.innerHTML = footerDescription || '';
    }
  }, [quill, selectedMicro, footerDescription]);

  useEffect(() => {
    if (quill) {
      const handler = () => setFooterDescription(quill.root.innerHTML);
      quill.on('text-change', handler);
      return () => quill.off('text-change', handler);
    }
  }, [quill]);

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Edit Microlocation Content</h2>

      <div className={styles.formGroup}>
        <label>City:</label>
        <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={loading}>
          {cities.map(c => <option key={c.city} value={c.city}>{c.city}</option>)}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Microlocation:</label>
        <select value={selectedMicro} onChange={e => setSelectedMicro(e.target.value)} disabled={loading}>
          {microlocations.map(m => <option key={m.slug} value={m.slug}>{m.name}</option>)}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Footer Title:</label>
        <input type="text" value={footerTitle} onChange={e => setFooterTitle(e.target.value)} disabled={!isEditing || loading}/>
      </div>

      <div className={styles.formGroup}>
        <label>Footer Description:</label>
        <div style={{border: '1px solid #ccc', borderRadius: '5px', minHeight: '200px', padding: '10px', backgroundColor: !isEditing ? '#f9f9f9' : '#fff'}}>
          <div ref={quillRef} style={{height: '180px'}} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Meta Title:</label>
        <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} disabled={!isEditing || loading}/>
      </div>

      <div className={styles.formGroup}>
        <label>Meta Description:</label>
        <textarea value={metaDescription} onChange={e => setMetaDescription(e.target.value)} disabled={!isEditing || loading}/>
      </div>

      <div className={styles.formGroup}>
        <label>Schema Markup (JSON-LD):</label>
        <textarea value={schemaMarkup} onChange={e => setSchemaMarkup(e.target.value)} disabled={!isEditing || loading}/>
      </div>

      {!isEditing && <button className={styles.btn} onClick={() => setIsEditing(true)} disabled={loading}>Edit</button>}
      {isEditing && <button className={styles.btn} onClick={handleSave} disabled={loading}>Save Changes</button>}

      {loading && <div className={styles.loaderOverlay}><ClipLoader color="#222" size={60} /></div>}
    </div>
  );
};

export default MicrolocationContent;
