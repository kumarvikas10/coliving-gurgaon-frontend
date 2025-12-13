// src/admin/Microlocations/Microlocations.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../Cities/Cities.module.css";
import { ClipLoader } from "react-spinners";
import Edit from '../../assets/Edit.svg'
import Delete from '../../assets/Delete.svg'

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Microlocations() {
  const [cities, setCities] = useState([]);           // [{ _id, city, displayCity, state }]
  const [selectedCityId, setSelectedCityId] = useState("");
  const [micros, setMicros] = useState([]);           // [{ _id, name, slug, city }]
  const [newMicro, setNewMicro] = useState("");
  const [editing, setEditing] = useState(null);       // full micro doc when editing
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Load cities with ids for the dropdown
  const fetchCities = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/cities`, { params: { withState: true } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCities(list);
    } catch (e) {
      console.error("Error fetching cities:", e);
      setCities([]);
    }
  };

  // Load microlocations for selected city (server accepts id or slug; send id)
  const fetchMicros = async (cityId) => {
    if (!cityId) return;
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/microlocations`, {
        params: { city: cityId, withCity: true },
      });
      const list = res.data?.data ?? res.data ?? [];
      setMicros(list);
    } catch (e) {
      console.error("Error fetching microlocations:", e);
      setErr("Failed to load microlocations");
      setMicros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchMicros(selectedCityId);
  }, [selectedCityId]);

  const resetForm = () => {
    setNewMicro("");
    setEditing(null);
  };

  // Create or update a microlocation
  const handleAddOrSave = async () => {
    const name = newMicro.trim();
    if (!selectedCityId || !name) {
      alert("Enter microlocation name and select a city");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      if (editing) {
        // PATCH by id; server will enforce per-city slug uniqueness
        await axios.patch(`${API_BASE}/api/microlocations/${editing._id}`, {
          name,
          city: selectedCityId,
          // keep existing SEO if you want to edit later in a modal
          footerTitle: editing.footerTitle || "",
          footerDescription: editing.footerDescription || "",
          metaTitle: editing.metaTitle || "",
          metaDescription: editing.metaDescription || "",
          schemaMarkup: editing.schemaMarkup || "",
        });
      } else {
        await axios.post(`${API_BASE}/api/microlocations`, {
          name,
          city: selectedCityId, // ObjectId
        });
      }
      resetForm();
      await fetchMicros(selectedCityId);
    } catch (e) {
      console.error("Error saving microlocation:", e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? "Microlocation already exists for this city" : "Failed to save");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this microlocation?")) return;
    setLoading(true);
    setErr("");
    try {
      await axios.delete(`${API_BASE}/api/microlocations/${id}`);
      setMicros((prev) => prev.filter((m) => m._id !== id));
    } catch (e) {
      console.error("Error deleting:", e);
      setErr("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (m) => {
    setEditing(m);
    setNewMicro(m.name);
    // If a micro belongs to a different city than currently selected, sync the city dropdown
    const microCityId = typeof m.city === "object" ? m.city?._id : m.city;
    if (microCityId && microCityId !== selectedCityId) {
      setSelectedCityId(String(microCityId));
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Manage Microlocations</h2>

      {/* City select */}
      <div className={styles.inputRow} style={{ flexWrap: "wrap", gap: 10 }}>
        <select
          value={selectedCityId}
          onChange={(e) => setSelectedCityId(e.target.value)}
          className={styles.input}
          style={{ minWidth: 260 }}
        >
          <option value="">-- Select City --</option>
          {cities.map((c) => (
            <option key={c._id} value={c._id}>
              {c.displayCity || c.city}
            </option>
          ))}
        </select>
      </div>

      {selectedCityId && (
        <>
          {/* Add / Edit */}
          <div className={styles.inputRow} style={{ flexWrap: "wrap", gap: 10 }}>
            <input
              type="text"
              placeholder="Microlocation name (e.g., Udyog Vihar)"
              value={newMicro}
              onChange={(e) => setNewMicro(e.target.value)}
              className={styles.input}
              style={{ minWidth: 260 }}
            />
            <button onClick={handleAddOrSave} className="btn secondaryBtn" disabled={loading}>
              {editing ? "Save" : "Add"}
            </button>
            {editing && (
              <button
                onClick={resetForm}
                className="btn primaryBtn"
                disabled={loading}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Table */}
          <div className={styles.contentWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "60%" }}>Microlocation</th>
                  <th style={{ width: "40%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {micros.map((m) => (
                  <tr key={m._id}>
                    <td>{m.name}</td>
                    <td>
                      <button
                        onClick={() => handleEditClick(m)}
                        className={styles.editButton}
                        disabled={loading}
                      >
                        <img src={Edit} />
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className={styles.deleteButton}
                        disabled={loading}
                        style={{ marginLeft: 8 }}
                      >
                        <img src={Delete} />
                      </button>
                    </td>
                  </tr>
                ))}
                {!micros.length && !loading && (
                  <tr>
                    <td colSpan={2} style={{ textAlign: "center", color: "#777" }}>
                      No microlocations found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {loading && (
              <div className={styles.loaderOverlay}>
                <ClipLoader color="#222" size={60} />
              </div>
            )}
            {err && <div style={{ marginTop: 10, color: "crimson" }}>{err}</div>}
          </div>
        </>
      )}
    </div>
  );
}
