import { useState, useEffect } from "react";
import Login from "../Login/Login";
import Cities from "../Cities/Cities";
import CityContent from "../City Content/CityContent";
import Media from "../Media/Media";
import styles from "./AdminPanel.module.css";
import Portfolio from "../Portfolio/Portfolio";
import Microlocations from "../Microlocations/Microlocations";
import MicrolocationContent from "../Microlocation Content/MicrolocationContent";
import Plans from "../Plans/Plans";

const AdminPanel = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("cities");

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      setLoggedIn(true);
    } else {
      setLoggedIn(false);
    }
  }, []);

  if (!loggedIn) {
    return <Login setLoggedIn={setLoggedIn} />;
  }

  return (
    <div className={styles.adminPanel}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <div>
          <h3 className={styles.sidebarTitle}>Admin Panel</h3>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "cities" ? styles.active : ""
            }`}
            onClick={() => setActivePage("cities")}
          >
            Cities
          </button>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "content" ? styles.active : ""
            }`}
            onClick={() => setActivePage("content")}
          >
            City Content
          </button>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "microlocations" ? styles.active : ""
            }`}
            onClick={() => setActivePage("microlocations")}
          >
            Microlocations
          </button>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "microlocationContent" ? styles.active : ""
            }`}
            onClick={() => setActivePage("microlocationContent")}
          >
            Microlocation Content
          </button>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "plans" ? styles.active : ""
            }`}
            onClick={() => setActivePage("plans")}
          >
            Plans
          </button>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "media" ? styles.active : ""
            }`}
            onClick={() => setActivePage("media")}
          >
            Media
          </button>
          <button
            className={`${styles.sidebarButton} ${
              activePage === "portfolio" ? styles.active : ""
            }`}
            onClick={() => setActivePage("portfolio")}
          >
            Portfolio
          </button>
        </div>

        {/* Logout */}
        <div>
          <button
            className={`${styles.sidebarButton} ${styles.logout}`}
            onClick={() => {
              localStorage.removeItem("adminToken");
              setLoggedIn(false);
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activePage === "cities" && <Cities />}
        {activePage === "content" && <CityContent />}
        {activePage === "microlocations" && <Microlocations />}
        {activePage === "microlocationContent" && <MicrolocationContent />}
        {activePage === "plans" && <Plans />}
        {activePage === "media" && <Media />}
        {activePage === "portfolio" && <Portfolio />}
      </div>
    </div>
  );
};

export default AdminPanel;
