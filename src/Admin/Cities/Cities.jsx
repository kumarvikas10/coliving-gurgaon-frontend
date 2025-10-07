import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./Cities.module.css";
import { ClipLoader } from "react-spinners";

const Cities = () => {
    const [cities, setCities] = useState([]);
    const [newCity, setNewCity] = useState("");
    const [editingCity, setEditingCity] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCities = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`https://coliving-gurgaon-backend.onrender.com/api/cities`);
            setCities(res.data);
        } catch (err) {
            console.error("Error fetching cities:", err);
            setCities([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddOrSaveCity = async () => {
        if (!newCity.trim()) {
            alert("Please enter city name");
            return;
        }

        setLoading(true);

        try {
            if (editingCity) {
                await axios.put(
                    `https://coliving-gurgaon-backend.onrender.com/api/admin/cities/${editingCity}`,
                    { newCity }
                );
                setEditingCity("");
            } else {
                await axios.post(
                    `https://coliving-gurgaon-backend.onrender.com/api/admin/cities`,
                    { city: newCity }
                );
            }
            setNewCity("");
            fetchCities();
        } catch (err) {
            console.error("Error adding/updating city:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteCity = async (cityName) => {
        if (!window.confirm(`Are you sure you want to delete "${cityName}"?`)) {
            return;
        }

        setLoading(true);
        try {
            await axios.delete(
                `https://coliving-gurgaon-backend.onrender.com/api/admin/cities/${cityName}`
            );
            fetchCities();
        } catch (err) {
            console.error("Error deleting city:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (cityName) => {
        setNewCity(cityName);
        setEditingCity(cityName);
    };

    useEffect(() => {
        fetchCities();
    }, []);

    return (
        <div className={styles.pageWrapper}>
            <h2 className={styles.heading}>Manage Cities</h2>

            <div className={styles.inputRow}>
                <input
                    type="text"
                    placeholder="New city name"
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className={styles.input}
                />
                <button onClick={handleAddOrSaveCity} className={styles.addButton} disabled={loading}>
                    {editingCity ? "Save" : "Add City"}
                </button>
                {editingCity && (
                    <button
                        onClick={() => {
                            setEditingCity("");
                            setNewCity("");
                        }}
                        className={styles.cancelButton}
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className={styles.contentWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>City Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cities.map((cityObj) => (
                            <tr key={cityObj.city}>
                                <td>{cityObj.city}</td>
                                <td>
                                    <button
                                        onClick={() => handleEditClick(cityObj.city)}
                                        className={styles.editButton}
                                        disabled={loading}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCity(cityObj.city)}
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
        </div>
    );
};

export default Cities;
