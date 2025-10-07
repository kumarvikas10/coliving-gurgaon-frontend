import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import styles from "./Portfolio.module.css"; // updated to dedicated file

const ItemType = "PRIORITY_IMAGE";

const DraggableRow = ({ file, index, moveImage, handleRemove }) => {
  const ref = useRef(null);

  const [, drop] = useDrop({
    accept: ItemType,
    hover(item) {
      if (item.index !== index) {
        moveImage(item.index, index);
        item.index = index;
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <tr ref={ref} className={styles.draggableRow} style={{ opacity: isDragging ? 0.5 : 1 }}>
      <td><img src={file.url} alt={file.alt} className={styles.imageThumb} /></td>
      <td>{file.alt}</td>
      <td>
        <button className={styles.removeButton} onClick={() => handleRemove(file)}>Remove</button>
      </td>
    </tr>
  );
};

const Portfolio = () => {
  const [allImages, setAllImages] = useState([]);
  const [priorityImages, setPriorityImages] = useState([]);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const res = await axios.get("https://coliving-gurgaon-backend.onrender.com/api/media");
    if (res.data.success) {
      const files = res.data.files;
      const priority = files.filter(f => f.isPriority).sort((a, b) => a.priorityOrder - b.priorityOrder);
      const remaining = files.filter(f => !f.isPriority);
      setPriorityImages(priority);
      setAllImages(remaining);
    }
  };

  const handleSelect = (file) => {
    setPriorityImages([...priorityImages, { ...file, isPriority: true, priorityOrder: priorityImages.length }]);
    setAllImages(allImages.filter((f) => f.public_id !== file.public_id));
  };

  const handleRemove = (file) => {
    setAllImages([...allImages, { ...file, isPriority: false, priorityOrder: null }]);
    setPriorityImages(priorityImages.filter((f) => f.public_id !== file.public_id));
  };

  const moveImage = useCallback((fromIndex, toIndex) => {
    const updated = [...priorityImages];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    setPriorityImages(updated);
  }, [priorityImages]);

  const [saveMessage, setSaveMessage] = useState("");

  const savePriority = async () => {
    try {
      const updates = priorityImages.map((img, index) => ({
        public_id: img.public_id,
        isPriority: true,
        priorityOrder: index
      }));

      await axios.post("https://coliving-gurgaon-backend.onrender.com/api/media/save-priority", { updates });

      setSaveMessage("Priority order saved!");
      setTimeout(() => setSaveMessage(""), 3000); // message disappears after 3 seconds
    } catch (err) {
      console.error("Failed to save priority", err);
      setSaveMessage("Error saving priority.");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className={styles.wrapper}>
        <div className={styles.section}>
          <div className={styles.headerRow}>
            <h2 className={styles.sectionHeading}>Priority Images</h2>
            <button className={styles.saveButton} onClick={savePriority}>Save Priority</button>
            {saveMessage && <p className={styles.statusMessage}>{saveMessage}</p>}
          </div>
          <table className={styles.table}>
            <thead>
              <tr><th>Image</th><th>Alt</th><th>Action</th></tr>
            </thead>
            <tbody>
              {priorityImages.map((file, index) => (
                <DraggableRow
                  key={file.public_id}
                  file={file}
                  index={index}
                  moveImage={moveImage}
                  handleRemove={handleRemove}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionHeading}>All Images</h2>
          <table className={styles.table}>
            <thead>
              <tr><th>Image</th><th>Alt</th><th>Action</th></tr>
            </thead>
            <tbody>
              {allImages.map(file => (
                <tr key={file.public_id}>
                  <td><img src={file.url} alt={file.alt} className={styles.imageThumb} /></td>
                  <td>{file.alt}</td>
                  <td>
                    <button className={styles.addButton} onClick={() => handleSelect(file)}>
                      Add to Priority
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DndProvider>
  );
};

export default Portfolio;
