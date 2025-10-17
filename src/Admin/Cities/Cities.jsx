// src/admin/Cities/Cities.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Cities.module.css";
import { ClipLoader } from "react-spinners";

const API_BASE = process.env.REACT_APP_API_BASE || "https://coliving-gurgaon-backend.onrender.com";

export default function Cities() {
  const [cities, setCities] = useState([]);
  const [states, setStates] = useState([]);     // [{ _id, displayState, state }]
  const [newCity, setNewCity] = useState("");
  const [stateId, setStateId] = useState("");   // selected state for add/edit
  const [editingCity, setEditingCity] = useState(""); // current city slug
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchStates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/states?enabled=true`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setStates(list);
    } catch (e) {
      console.error("Error fetching states:", e);
      setStates([]);
    }
  };

  const fetchCities = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/cities`, { params: { withState: true } });
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setCities(list);
    } catch (e) {
      console.error("Error fetching cities:", e);
      setErr("Failed to load cities");
      setCities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  const resetForm = () => {
    setNewCity("");
    setStateId("");
    setEditingCity("");
  };

  const handleAddOrSaveCity = async () => {
    const name = newCity.trim();
    if (!name) return alert("Please enter city name");
    if (!stateId) return alert("Please select a state");

    setLoading(true);
    setErr("");
    try {
      if (editingCity) {
        await axios.put(`${API_BASE}/api/cities/${encodeURIComponent(editingCity)}`, {
          newCity: name,
          state: stateId,
        });
      } else {
        await axios.post(`${API_BASE}/api/cities`, {
          city: name,
          state: stateId,
        });
      }
      resetForm();
      await fetchCities();
    } catch (e) {
      console.error("Error adding/updating city:", e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? "City already exists" : "Failed to save city");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCity = async (citySlug) => {
    if (!window.confirm(`Delete "${citySlug}"?`)) return;
    setLoading(true);
    setErr("");
    try {
      await axios.delete(`${API_BASE}/api/cities/${encodeURIComponent(citySlug)}`);
      await fetchCities();
    } catch (e) {
      console.error("Error deleting city:", e);
      setErr("Failed to delete city");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setNewCity(row.displayCity || row.city);
    setEditingCity(row.city);
    setStateId(row?.state?._id || "");
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Manage Cities</h2>

      <div className={styles.inputRow} style={{ flexWrap: "wrap", gap: 10 }}>
        <input
          type="text"
          placeholder="City name (e.g., Gurgaon)"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          className={styles.input}
          style={{ minWidth: 220 }}
        />
        <select
          className={styles.input}
          value={stateId}
          onChange={(e) => setStateId(e.target.value)}
          style={{ minWidth: 220 }}
        >
          <option value="">Select state</option>
          {states.map((s) => (
            <option key={s._id} value={s._id}>
              {s.displayState || s.state}
            </option>
          ))}
        </select>
        <button onClick={handleAddOrSaveCity} className={styles.addButton} disabled={loading}>
          {editingCity ? "Save" : "Add City"}
        </button>
        {editingCity && (
          <button onClick={resetForm} className={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
        )}
      </div>

      <div className={styles.contentWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>City</th>
              <th style={{ width: "40%" }}>State</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities.map((c) => (
              <tr key={c.city}>
                <td>{c.displayCity || c.city}</td>
                <td>{c?.state?.displayState || c?.state?.state || "-"}</td>
                <td>
                  <button onClick={() => handleEditClick(c)} className={styles.editButton} disabled={loading}>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCity(c.city)}
                    className={styles.deleteButton}
                    disabled={loading}
                    style={{ marginLeft: 8 }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {!cities.length && !loading && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", color: "#777" }}>No cities found</td>
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
    </div>
  );
}
