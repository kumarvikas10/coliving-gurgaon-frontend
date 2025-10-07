import { useState, useEffect } from "react";
import axios from "axios";
import styles from "../Cities/Cities.module.css"; // use the same CSS as Cities

const Media = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const res = await axios.get("https://sandy-photography-backend-production.up.railway.app/api/media");
      if (res.data.success) {
        setUploadedFiles(res.data.files);
      }
    } catch (err) {
      console.error("Failed to load media:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(droppedFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    try {
      setLoading(true);

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(
          "https://sandy-photography-backend-production.up.railway.app/api/media/upload",
          formData
        );

        if (res.data.success) {
          setUploadedFiles((prev) => [...prev, res.data.file]);
        }
      }

      setFiles([]);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (public_id) => {
    try {
      setLoading(true);
      await axios.delete(`https://sandy-photography-backend-production.up.railway.app/api/media/delete/${encodeURIComponent(public_id)}`);
      setUploadedFiles(uploadedFiles.filter((f) => f.public_id !== public_id));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Media Upload</h2>

      <div
        className={styles.inputRow}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: "2px dashed #888",
          borderRadius: "6px",
          padding: "20px",
          textAlign: "center",
          marginBottom: "20px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <p>Drag & Drop files here or select below</p>
        <input type="file" multiple onChange={handleFileChange} />
        <p>{files.length > 0 && `${files.length} file(s) selected`}</p>
        <button
          className={styles.addButton}
          style={{ marginTop: "12px" }}
          onClick={handleUpload}
        >
          Upload Files
        </button>
      </div>

      <h3 className={styles.heading}>File Details</h3>

      <div className={styles.contentWrapper}>
        {loading && (
          <div className={styles.loaderOverlay}>
            <div className="loader">Loading...</div>
          </div>
        )}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {uploadedFiles.map((file) => (
              <tr key={file.public_id}>
                <td>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    {file.original_filename || file.url}
                  </a>
                </td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDelete(file.public_id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Media;