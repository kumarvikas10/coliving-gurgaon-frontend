// src/admin/Microlocation Content/MicrolocationContent.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../City Content/CityContent.module.css";
import { ClipLoader } from "react-spinners";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

const API_BASE = process.env.REACT_APP_API_BASE || "https://coliving-gurgaon-backend.onrender.com";

export default function MicrolocationContent() {
  const [cities, setCities] = useState([]);              // [{ _id, city, displayCity }]
  const [selectedCityId, setSelectedCityId] = useState("");
  const [microlocations, setMicrolocations] = useState([]); // [{ _id, name, slug, ...seo, city }]
  const [selectedMicroId, setSelectedMicroId] = useState("");

  const [footerTitle, setFooterTitle] = useState("");
  const [footerDescription, setFooterDescription] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [schemaMarkup, setSchemaMarkup] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const { quill, quillRef } = useQuill({ theme: "snow" });

  // Fetch cities with ids
  const fetchCities = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/cities`, { params: { withState: true } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCities(list);
      if (list.length) setSelectedCityId(String(list[0]._id));
    } catch (e) {
      console.error(e);
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch microlocations for city (server accepts id or slug; pass id)
  const fetchMicrolocations = async (cityId) => {
    if (!cityId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/microlocations`, {
        params: { city: cityId, withCity: true },
      });
      const list = res.data?.data ?? res.data ?? [];
      setMicrolocations(list);
      if (list.length) setSelectedMicroId(String(list[0]._id));
      else {
        setSelectedMicroId("");
        setFooterTitle("");
        setFooterDescription("");
        setMetaTitle("");
        setMetaDescription("");
        setSchemaMarkup("");
      }
    } catch (e) {
      console.error(e);
      setMicrolocations([]);
      setSelectedMicroId("");
    } finally {
      setLoading(false);
    }
  };

  // Load cities at start
  useEffect(() => {
    fetchCities();
  }, []);

  // Load microlocations when city changes
  useEffect(() => {
    if (selectedCityId) fetchMicrolocations(selectedCityId);
  }, [selectedCityId]);

  // When a microlocation is selected or the list changes, populate fields
  useEffect(() => {
    const m = microlocations.find((x) => String(x._id) === String(selectedMicroId));
    if (!m) {
      setFooterTitle("");
      setFooterDescription("");
      setMetaTitle("");
      setMetaDescription("");
      setSchemaMarkup("");
      setIsEditing(false);
      return;
    }
    setFooterTitle(m.footerTitle || "");
    setFooterDescription(m.footerDescription || "");
    setMetaTitle(m.metaTitle || "");
    setMetaDescription(m.metaDescription || "");
    setSchemaMarkup(m.schemaMarkup || "");
    setIsEditing(false);
  }, [selectedMicroId, microlocations]);

  // Sync Quill from state
  useEffect(() => {
    if (quill && footerDescription !== quill.root.innerHTML) {
      quill.root.innerHTML = footerDescription || "";
    }
  }, [quill, footerDescription, selectedMicroId]);

  // Sync state from Quill
  useEffect(() => {
    if (!quill) return;
    const handler = () => setFooterDescription(quill.root.innerHTML);
    quill.on("text-change", handler);
    return () => quill.off("text-change", handler);
  }, [quill]);

  // Save changes via PATCH /api/microlocations/:id
  const handleSave = async () => {
    if (!selectedCityId || !selectedMicroId) return;
    setLoading(true);
    setErr("");
    try {
      await axios.patch(`${API_BASE}/api/microlocations/${selectedMicroId}`, {
        footerTitle,
        footerDescription,
        metaTitle,
        metaDescription,
        schemaMarkup,
      });
      // reflect locally
      setMicrolocations((prev) =>
        prev.map((m) =>
          String(m._id) === String(selectedMicroId)
            ? { ...m, footerTitle, footerDescription, metaTitle, metaDescription, schemaMarkup }
            : m
        )
      );
      alert("Saved!");
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Edit Microlocation Content</h2>

      <div className={styles.formGroup}>
        <label>City:</label>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          disabled={loading}
        >
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.displayCity || c.city}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Microlocation:</label>
        <select
          value={selectedMicroId}
          onChange={(e) => setSelectedMicroId(e.target.value)}
          disabled={loading || !microlocations.length}
        >
          {microlocations.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.formGroup}>
        <label>Footer Title:</label>
        <input
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
            border: "1px solid #ccc",
            borderRadius: "5px",
            minHeight: "200px",
            padding: "10px",
            backgroundColor: !isEditing ? "#f9f9f9" : "#fff",
          }}
        >
          <div ref={quillRef} style={{ height: "180px" }} />
        </div>
      </div>

      <div className={styles.formGroup}>
        <label>Meta Title:</label>
        <input
          type="text"
          value={metaTitle}
          onChange={(e) => setMetaTitle(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Meta Description:</label>
        <textarea
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          disabled={!isEditing || loading}
        />
      </div>

      <div className={styles.formGroup}>
        <label>Schema Markup (JSON-LD):</label>
        <textarea
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
      {err && <div style={{ marginTop: 10, color: "crimson" }}>{err}</div>}
    </div>
  );
}