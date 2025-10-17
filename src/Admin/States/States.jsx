// src/admin/States/States.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import styles from "../Cities/Cities.module.css";
import { ClipLoader } from "react-spinners";

const API_BASE = process.env.REACT_APP_API_BASE || "https://coliving-gurgaon-backend.onrender.com";

export default function States() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // form state
  const [formDisplayState, setFormDisplayState] = useState("");
  const [formStateSlug, setFormStateSlug] = useState("");
  const [editingId, setEditingId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [order, setOrder] = useState("");

  // utils
  const slugify = (s) =>
    String(s || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const resetForm = () => {
    setFormDisplayState("");
    setFormStateSlug("");
    setEditingId("");
    setEnabled(true);
    setOrder("");
  };

  const fetchRows = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/states?enabled=true`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      setRows(list);
    } catch (e) {
      console.error(e);
      setErr("Failed to load states");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, []);

  const onAddOrSave = async () => {
    const name = formDisplayState.trim();
    const slug = (formStateSlug || slugify(name)).trim();
    if (!name || !slug) {
      alert("Please provide state name");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      if (editingId) {
        await axios.put(`${API_BASE}/api/states/${editingId}`, {
          displayState: name,
          state: slug,
          enabled,
          order: order === "" ? 0 : Number(order),
        });
      } else {
        await axios.post(`${API_BASE}/api/states`, {
          displayState: name,
          state: slug,
          enabled,
          order: order === "" ? 0 : Number(order),
        });
      }
      resetForm();
      await fetchRows();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? "State already exists" : "Failed to save state");
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Delete state "${row.displayState}"?`)) return;
    setLoading(true);
    setErr("");
    try {
      await axios.delete(`${API_BASE}/api/states/${row._id}`);
      await fetchRows();
    } catch (e) {
      console.error(e);
      setErr("Failed to delete state");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (row) => {
    setEditingId(row._id);
    setFormDisplayState(row.displayState || "");
    setFormStateSlug(row.state || "");
    setEnabled(!!row.enabled);
    setOrder(typeof row.order === "number" ? String(row.order) : "");
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Manage States</h2>

      {/* Form row */}
      <div className={styles.inputRow} style={{ flexWrap: "wrap", gap: 10 }}>
        <input
          type="text"
          placeholder="Display name (e.g., Haryana)"
          value={formDisplayState}
          onChange={(e) => setFormDisplayState(e.target.value)}
          className={styles.input}
          style={{ minWidth: 220 }}
        />
        <input
          type="text"
          placeholder="Slug (auto if empty)"
          value={formStateSlug}
          onChange={(e) => setFormStateSlug(e.target.value)}
          className={styles.input}
          style={{ minWidth: 200 }}
        />
        <input
          type="number"
          placeholder="Order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={styles.input}
          style={{ width: 120 }}
        />
        <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Enabled
        </label>
        <button onClick={onAddOrSave} className={styles.addButton} disabled={loading}>
          {editingId ? "Save" : "Add State"}
        </button>
        {editingId && (
          <button onClick={resetForm} className={styles.cancelButton} disabled={loading}>
            Cancel
          </button>
        )}
      </div>

      {/* Table */}
      <div className={styles.contentWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Display</th>
              <th style={{ width: "30%" }}>Slug</th>
              <th style={{ width: "10%" }}>Enabled</th>
              <th style={{ width: "10%" }}>Order</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r._id}>
                <td>{r.displayState}</td>
                <td>{r.state}</td>
                <td>{r.enabled ? "Yes" : "No"}</td>
                <td>{typeof r.order === "number" ? r.order : "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={styles.editButton}
                      onClick={() => onEdit(r)}
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => onDelete(r)}
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#777" }}>
                  No states found
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
    </div>
  );
}
