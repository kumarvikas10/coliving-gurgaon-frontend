// src/admin/Plans/Plans.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "../Cities/Cities.module.css";
import PlanModal from "./PlanModal";
import Edit from '../../assets/Edit.svg'
import Delete from '../../assets/Delete.svg'

const API_BASE = process.env.REACT_APP_API_BASE;

const Plans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false); // list/edit state (unchanged)

  const [editingId, setEditingId] = useState("");
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [enabled, setEnabled] = useState(true);

  // list/edit state (unchanged)
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editImageFile, setEditImageFile] = useState(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState("");
  const lastEditPreviewUrl = useRef("");

  const onEdit = (p) => {
    setEditingId(p._id);
    setType(p.type || "");
    setDescription(p.description || "");
    setEnabled(!!p.enabled);
    setImageUrl(p.image?.secureUrl || "");
    setEditImageFile(null);
    if (lastEditPreviewUrl.current) {
      URL.revokeObjectURL(lastEditPreviewUrl.current);
      lastEditPreviewUrl.current = "";
    }
    setEditPreviewUrl("");
    setIsEditOpen(true);
  };

  // local file change for edit modal
  const handleEditFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file && !/^image\/(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.type)) {
      alert("Please choose a valid image file");
      return;
    }
    if (lastEditPreviewUrl.current) {
      URL.revokeObjectURL(lastEditPreviewUrl.current);
      lastEditPreviewUrl.current = "";
    }
    setEditImageFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setEditPreviewUrl(url);
      lastEditPreviewUrl.current = url;
    } else {
      setEditPreviewUrl("");
    }
  };

  // save edit with FormData (optional new image)
  const saveEditPlan = async () => {
    if (!type.trim()) {
      alert("Please enter plan type");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", type.trim());
      fd.append("description", description);
      fd.append("enabled", String(enabled));
      if (editImageFile) fd.append("image", editImageFile);
      await axios.put(`${API_BASE}/api/plans/${editingId}`, fd);
      setIsEditOpen(false);
      await fetchPlans();
    } catch (e) {
      console.error(e);
      alert("Failed to save plan");
    } finally {
      setLoading(false);
    }
  };

  // add modal form state
  const [formType, setFormType] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEnabled, setFormEnabled] = useState(true);
  const [formImageFile, setFormImageFile] = useState(null); // File | null
  const [previewUrl, setPreviewUrl] = useState(""); // object URL
  const lastPreviewUrl = useRef("");

  const handleClose = useCallback(() => {
    setIsAddOpen(false);
  }, []);

  const openAdd = () => {
    setFormType("");
    setFormDescription("");
    setFormEnabled(true);
    setFormImageFile(null);
    if (lastPreviewUrl.current) {
      URL.revokeObjectURL(lastPreviewUrl.current);
      lastPreviewUrl.current = "";
    }
    setPreviewUrl("");
    setIsAddOpen(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    // optional client checks (type/size)
    if (file && !/^image\/(png|jpe?g|webp|gif|bmp|tiff)$/i.test(file.type)) {
      alert("Please choose a valid image file");
      return;
    }
    if (lastPreviewUrl.current) {
      URL.revokeObjectURL(lastPreviewUrl.current);
      lastPreviewUrl.current = "";
    }
    setFormImageFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      lastPreviewUrl.current = url;
    } else {
      setPreviewUrl("");
    }
  };

  useEffect(() => {
    return () => {
      // cleanup when component unmounts
      if (lastPreviewUrl.current) URL.revokeObjectURL(lastPreviewUrl.current);
    };
  }, []);

  const createPlan = async () => {
    if (!formType.trim()) {
      alert("Please enter plan type");
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("type", formType.trim());
      fd.append("description", formDescription);
      fd.append("enabled", String(formEnabled));
      if (formImageFile) fd.append("image", formImageFile); // field name “image” for multer

      // Do not manually set Content-Type; let Axios/browser set the boundary
      await axios.post(`${API_BASE}/api/plans`, fd);

      setIsAddOpen(false);
      await fetchPlans();
    } catch (e) {
      console.error(e);
      alert("Failed to create plan");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId("");
    setType("");
    setDescription("");
    setImageUrl("");
    setEnabled(true);
  };

  const fetchPlans = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/plans?all=true`);
      const list = res.data?.data ?? res.data ?? [];
      setPlans(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load plans");
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  // const onSubmit = async () => {
  //   if (!type.trim()) {
  //     alert("Please enter plan type");
  //     return;
  //   }
  //   setLoading(true);
  //   setErr("");
  //   try {
  //     const payload = { type: type.trim(), description, enabled };
  //     await axios.put(`${API_BASE}/api/plans/${editingId}`, payload);
  //     resetForm();
  //     fetchPlans();
  //   } catch (e) {
  //     console.error(e);
  //     setErr("Failed to save plan");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onToggleEnabled = async (p) => {
  //   setLoading(true);
  //   setErr("");
  //   try {
  //     await axios.patch(`${API_BASE}/api/plans/${p._id}/enable`, {
  //       enabled: !p.enabled,
  //     });
  //     await fetchPlans();
  //   } catch (e) {
  //     console.error(e);
  //     setErr("Failed to toggle plan");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const onEdit = (p) => {
  //   setEditingId(p._id);
  //   setType(p.type || "");
  //   setDescription(p.description || "");
  //   setImageUrl(p.image?.secureUrl || "");
  //   setEnabled(!!p.enabled);
  // };

  // const onToggleEnabled = async (p) => {
  //   setLoading(true);
  //   setErr("");
  //   try {
  //     await axios.patch(`${API_BASE}/api/plans/${p._id}/enable`, {
  //       enabled: !p.enabled,
  //     });
  //     fetchPlans();
  //   } catch (e) {
  //     console.error(e);
  //     setErr("Failed to toggle plan");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete plan "${p.type}"?`)) return;
    setLoading(true);
    setErr("");
    try {
      await axios.delete(`${API_BASE}/api/plans/${p._id}`); // soft delete
      fetchPlans();
    } catch (e) {
      console.error(e);
      setErr("Failed to delete plan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
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
        <h2 className={styles.heading}>Manage Coliving Plans</h2>
        <button
          className={styles.addButton}
          onClick={openAdd}
          disabled={loading}
        >
          + Add Plan
        </button>
      </div>

      <div className={styles.contentWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "30%" }}>Type</th>
              <th style={{ width: "50%" }}>Description</th>
              <th style={{ width: "10%" }}>Enabled</th>
              <th style={{ width: "10%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {plans.map((p) => (
              <tr key={p._id}>
                <td>{p.type}</td>
                <td style={{ whiteSpace: "pre-wrap" }}>
                  {p.description?.slice(0, 140) || "-"}
                  {p.description?.length > 140 ? "…" : ""}
                </td>
                <td>{p.enabled ? "Yes" : "No"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      onClick={() => onEdit(p)}
                      className={styles.editButton}
                      disabled={loading}
                    >
                      <img src={Edit} alt="Edit" />
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className={styles.deleteButton}
                      disabled={loading}
                    >
                      <img src={Delete} alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!plans.length && !loading && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", color: "#777" }}>
                  No plans found
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

      {/* Add Plan Modal */}
      <PlanModal open={isAddOpen} onClose={handleClose} title="Add Plan">
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Type</span>
            <input
              type="text"
              value={formType}
              onChange={(e) => setFormType(e.target.value)}
              placeholder='e.g., "Private Room"'
              className={styles.input}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description</span>
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={4}
              className={styles.input}
              placeholder="Comfortable Private Room Designed for You"
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.input}
            />
          </label>

          {previewUrl ? (
            <div>
              <img
                src={previewUrl}
                alt="Plan preview"
                style={{
                  maxWidth: 240,
                  border: "1px solid #eee",
                  borderRadius: 8,
                }}
                onLoad={() => {
                  // Not strictly necessary, but you could revoke here if you clone the image
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
                    setFormImageFile(null);
                  }}
                >
                  Remove Image
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
              onClick={createPlan}
              disabled={loading}
            >
              Save Plan
            </button>
            <button className="btn secondaryBtn" onClick={handleClose}>
              Cancel
            </button>
          </div>
        </div>
      </PlanModal>
      <PlanModal
        open={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Plan"
      >
        <div style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Type</span>
            <input
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className={styles.input}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.input}
            />
          </label>

          {imageUrl && !editPreviewUrl && (
            <div>
              <span style={{ display: "block", marginBottom: 6 }}>
                Current Image
              </span>
              <img
                src={imageUrl}
                alt="Current plan"
                style={{
                  maxWidth: 240,
                  border: "1px solid #eee",
                  borderRadius: 8,
                }}
              />
            </div>
          )}

          <label style={{ display: "grid", gap: 6 }}>
            <span>Replace Image</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleEditFileChange}
              className={styles.input}
            />
          </label>

          {editPreviewUrl && (
            <div>
              <img
                src={editPreviewUrl}
                alt="New preview"
                style={{
                  maxWidth: 240,
                  border: "1px solid #eee",
                  borderRadius: 8,
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
                    setEditImageFile(null);
                  }}
                >
                  Remove New Image
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
              onClick={saveEditPlan}
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

export default Plans;
