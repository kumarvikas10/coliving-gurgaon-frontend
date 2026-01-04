// src/admin/Amenities/Amenities.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "../Cities/Cities.module.css";
import PlanModal from "../Plans/PlanModal"; // reuse the same accessible modal
import Edit from "../../assets/Edit.svg";
import Delete from "../../assets/Delete.svg";
import Enable from "../../assets/Enable.svg";
import Disable from "../../assets/Disable.svg";

const API_BASE = process.env.REACT_APP_API_BASE;

const Amenities = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // add modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formIconFile, setFormIconFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const lastPreviewUrl = useRef("");

  // edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [iconUrl, setIconUrl] = useState(""); // current icon from server
  const [editIconFile, setEditIconFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const lastEditPreviewUrl = useRef("");

  const handleCloseAdd = useCallback(() => setIsAddOpen(false), []);

  const openAdd = () => {
    setFormName("");
    setFormEnabled(true);
    setFormIconFile(null);
    if (lastPreviewUrl.current) {
      URL.revokeObjectURL(lastPreviewUrl.current);
      lastPreviewUrl.current = "";
    }
    setPreviewUrl("");
    setIsAddOpen(true);
  };

  const handleAddFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    // accept SVG and common rasters
    const ok =
      file &&
      (file.type === "image/svg+xml" ||
        /^image\/(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.type));
    if (!ok) {
      alert("Please choose an SVG or image file");
      return;
    }
    if (lastPreviewUrl.current) {
      URL.revokeObjectURL(lastPreviewUrl.current);
      lastPreviewUrl.current = "";
    }
    setFormIconFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      lastPreviewUrl.current = url;
    } else {
      setPreviewUrl("");
    }
  };

  const createAmenity = async () => {
    if (!formName.trim()) {
      alert("Please enter amenity name");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", formName.trim());
      fd.append("enabled", String(formEnabled));
      if (formIconFile) fd.append("icon", formIconFile); // field name “icon”
      await axios.post(`${API_BASE}/api/amenities`, fd); // do not set Content-Type
      setIsAddOpen(false);
      await fetchItems();
    } catch (e) {
      console.error(e);
      alert("Failed to create amenity");
    } finally {
      setLoading(false);
    }
  };

  const onEdit = (a) => {
    setEditingId(a._id);
    setName(a.name || "");
    setEnabled(!!a.enabled);
    setIconUrl(a.icon?.secureUrl || "");
    setEditIconFile(null);
    if (lastEditPreviewUrl.current) {
      URL.revokeObjectURL(lastEditPreviewUrl.current);
      lastEditPreviewUrl.current = "";
    }
    setEditPreviewUrl("");
    setIsEditOpen(true);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    const ok =
      file &&
      (file.type === "image/svg+xml" ||
        /^image\/(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.type));
    if (!ok) {
      alert("Please choose an SVG or image file");
      return;
    }
    if (lastEditPreviewUrl.current) {
      URL.revokeObjectURL(lastEditPreviewUrl.current);
      lastEditPreviewUrl.current = "";
    }
    setEditIconFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
      lastEditPreviewUrl.current = url;
    } else {
      setEditPreviewUrl("");
    }
  };

  const saveEditAmenity = async () => {
    if (!name.trim()) {
      alert("Please enter amenity name");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("enabled", String(enabled));
      if (editIconFile) fd.append("icon", editIconFile); // optional replace
      await axios.put(`${API_BASE}/api/amenities/${editingId}`, fd);
      setIsEditOpen(false);
      await fetchItems();
    } catch (e) {
      console.error(e);
      alert("Failed to save amenity");
    } finally {
      setLoading(false);
    }
  };

  const onToggleEnabled = async (a) => {
    setLoading(true);
    setErr("");
    try {
      await axios.patch(`${API_BASE}/api/amenities/${a._id}/enable`, {
        enabled: !a.enabled,
      });
      await fetchItems();
    } catch (e) {
      console.error(e);
      setErr("Failed to toggle amenity");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (a) => {
    if (!window.confirm(`Delete amenity "${a.name}"?`)) return;
    setLoading(true);
    setErr("");
    try {
      await axios.delete(`${API_BASE}/api/amenities/${a._id}`); // soft delete
      await fetchItems();
    } catch (e) {
      console.error(e);
      setErr("Failed to delete amenity");
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/amenities?all=true`);
      const list = res.data?.data ?? res.data ?? [];
      setItems(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load amenities");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (lastPreviewUrl.current) URL.revokeObjectURL(lastPreviewUrl.current);
      if (lastEditPreviewUrl.current)
        URL.revokeObjectURL(lastEditPreviewUrl.current);
    };
  }, []);

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2 className={styles.heading}>Manage Amenities</h2>
        <button
          className={styles.addButton}
          onClick={openAdd}
          disabled={loading}
        >
          + Add Amenity
        </button>
      </div>

      <div className={styles.contentWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "40%" }}>Name</th>
              <th style={{ width: "30%" }}>Icon</th>
              <th style={{ width: "15%" }}>Enabled</th>
              <th style={{ width: "15%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a._id}>
                <td>{a.name}</td>
                <td>
                  {a.icon?.secureUrl ? (
                    <img
                      src={a.icon.secureUrl}
                      alt={`${a.name} icon`}
                      style={{ maxHeight: 32 }}
                    />
                  ) : (
                    "-"
                  )}
                </td>
                <td>{a.enabled ? "Yes" : "No"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => onEdit(a)}
                      className={styles.editButton}
                      disabled={loading}
                    >
                      <img src={Edit} alt="Edit" />
                    </button>
                    <button
                      onClick={() => onToggleEnabled(a)}
                      className={styles.statusButton}
                      disabled={loading}
                    >
                      {a.enabled ? <img src={Enable} alt="Enable" /> : <img src={Disable} alt="Disable" />}
                    </button>
                    <button
                      onClick={() => onDelete(a)}
                      className={styles.deleteButton}
                      disabled={loading}
                    >
                      <img src={Delete} alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!items.length && !loading && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#777" }}>
                  No amenities found
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

      {/* Add Amenity */}
      <PlanModal open={isAddOpen} onClose={handleCloseAdd} title="Add Amenity">
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name</span>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className={styles.input}
              placeholder='e.g., "Wi‑Fi"'
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Icon</span>
            <input
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              onChange={handleAddFileChange}
              className={styles.input}
            />
          </label>

          {previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt="Icon preview"
                style={{
                  maxHeight: 48,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 4,
                }}
              />
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    if (lastPreviewUrl.current) {
                      URL.revokeObjectURL(lastPreviewUrl.current);
                      lastPreviewUrl.current = "";
                    }
                    setPreviewUrl("");
                    setFormIconFile(null);
                  }}
                >
                  Remove Icon
                </button>
              </div>
            </div>
          ) : null}

          <label
            style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
          >
            <input
              type="checkbox"
              checked={formEnabled}
              onChange={(e) => setFormEnabled(e.target.checked)}
            />
            Enabled
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              className="btn primaryBtn"
              onClick={createAmenity}
              disabled={loading}
            >
              Save Amenity
            </button>
            <button className="btn secondaryBtn" onClick={handleCloseAdd}>
              Cancel
            </button>
          </div>
        </div>
      </PlanModal>

      {/* Edit Amenity */}
      <PlanModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Amenity"
      >
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={styles.input}
            />
          </label>

          {iconUrl && !editPreviewUrl && (
            <div>
              <span style={{ display: "block", marginBottom: 6 }}>
                Current Icon
              </span>
              <img
                src={iconUrl}
                alt="Current icon"
                style={{
                  maxHeight: 48,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 4,
                }}
              />
            </div>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Replace Icon</span>
            <input
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/webp"
              onChange={handleEditFileChange}
              className={styles.input}
            />
          </label>

          {editPreviewUrl && (
            <div>
              <img
                src={editPreviewUrl}
                alt="New icon preview"
                style={{
                  maxHeight: 48,
                  border: "1px solid #eee",
                  borderRadius: 6,
                  padding: 4,
                }}
              />
              <div style={{ marginTop: 8 }}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => {
                    if (lastEditPreviewUrl.current) {
                      URL.revokeObjectURL(lastEditPreviewUrl.current);
                      lastEditPreviewUrl.current = "";
                    }
                    setEditPreviewUrl("");
                    setEditIconFile(null);
                  }}
                >
                  Remove New Icon
                </button>
              </div>
            </div>
          )}

          <label
            style={{ display: "inline-flex", gap: 8, alignItems: "center" }}
          >
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
            Enabled
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <button
              className="btn primaryBtn"
              onClick={saveEditAmenity}
              disabled={loading}
            >
              Save Changes
            </button>
            <button
              className="btn secondaryBtn"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </PlanModal>
    </div>
  );
};

export default Amenities;
