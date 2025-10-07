import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../Cities/Cities.module.css";
import { ClipLoader } from "react-spinners";

const Microlocations = () => {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [micros, setMicros] = useState([]);
  const [newMicro, setNewMicro] = useState("");
  const [editingMicro, setEditingMicro] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch cities
  const fetchCities = async () => {
    try {
      const res = await axios.get(
        "https://coliving-gurgaon-backend.onrender.com/api/cities"
      );
      setCities(res.data);
    } catch (err) {
      console.error("Error fetching cities:", err);
      setCities([]);
    }
  };

  // Fetch microlocations for selected city
  const fetchMicros = async (city) => {
    if (!city) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `https://coliving-gurgaon-backend.onrender.com/api/microlocations/${city}`
      );
      setMicros(res.data);
    } catch (err) {
      console.error("Error fetching microlocations:", err);
      setMicros([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchMicros(selectedCity);
  }, [selectedCity]);

  // Add or update microlocation
  const handleAddOrSaveMicro = async () => {
    if (!newMicro.trim() || !selectedCity) {
      alert("Enter microlocation name and select city");
      return;
    }

    setLoading(true);
    try {
      if (editingMicro) {
        await axios.post(
          "https://coliving-gurgaon-backend.onrender.com/api/microlocations/update",
          {
            city: selectedCity,
            slug: editingMicro.slug,
            name: newMicro, // frontend sends the new name
            footerTitle: editingMicro.footerTitle || "",
            footerDescription: editingMicro.footerDescription || "",
            metaTitle: editingMicro.metaTitle || "",
            metaDescription: editingMicro.metaDescription || "",
            schemaMarkup: editingMicro.schemaMarkup || "",
          }
        );
        setEditingMicro(null);
      } else {
        // Add new microlocation
        await axios.post(
          "https://coliving-gurgaon-backend.onrender.com/api/microlocations",
          {
            name: newMicro,
            city: selectedCity,
          }
        );
      }
      fetchMicros(selectedCity);
      setNewMicro("");
      setEditingMicro(null);
    } catch (err) {
      console.error("Error adding/updating microlocation:", err);
      alert(err.response?.data?.error || "Server error");
    } finally {
      setLoading(false);
    }
  };

  // Delete microlocation
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this microlocation?"))
      return;

    setLoading(true);
    try {
      await axios.delete(
        `https://coliving-gurgaon-backend.onrender.com/api/microlocations/${id}`
      );
      setMicros(micros.filter((m) => m._id !== id));
    } catch (err) {
      console.error("Error deleting microlocation:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (micro) => {
    setNewMicro(micro.name);
    setEditingMicro(micro);
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Manage Microlocations</h2>

      {/* City select */}
      <div className={styles.inputRow}>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className={styles.input}
        >
          <option value="">-- Select City --</option>
          {cities.map((c) => (
            <option key={c.city} value={c.city}>
              {c.displayCity || c.city}
            </option>
          ))}
        </select>
      </div>

      {selectedCity && (
        <>
          {/* Add / Edit microlocation */}
          <div className={styles.inputRow}>
            <input
              type="text"
              placeholder="New microlocation"
              value={newMicro}
              onChange={(e) => setNewMicro(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={handleAddOrSaveMicro}
              className={styles.addButton}
              disabled={loading}
            >
              {editingMicro ? "Save" : "Add"}
            </button>
            {editingMicro && (
              <button
                onClick={() => {
                  setEditingMicro(null);
                  setNewMicro("");
                }}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            )}
          </div>

          {/* Microlocations table */}
          <div className={styles.contentWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Microlocation</th>
                  <th>Actions</th>
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
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(m._id)}
                        className={styles.deleteButton}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {loading && (
              <div className={styles.loaderOverlay}>
                <ClipLoader color="#222" size={60} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Microlocations;
