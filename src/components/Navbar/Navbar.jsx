// src/components/Navbar/Navbar.jsx
import { NavLink, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./Navbar.module.css";
import Logo from "../../assets/logo.svg";

const API_BASE = process.env.REACT_APP_API_BASE;

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const fetchCities = async (controller) => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get(`${API_BASE}/api/cities?all=true`, {
        signal: controller.signal,
      });
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Normalize cities from backend
      const normalizedAll = data
        .map((c) => {
          const cityName = c.name ?? c.city ?? "";
          if (!cityName) return null;

          // Use backend slug if present; otherwise derive a slug from city field
          const slug =
            c.slug || cityName.toLowerCase().trim().replace(/\s+/g, "-");

          return {
            name: c.displayCity || cityName, // label in UI (Gurgaon/Gurugram)
            slug, // route segment (/coliving/<slug>)
            apiCity: (c.city || cityName).toLowerCase(),
          };
        })
        .filter(Boolean);

      // Keep only the Gurgaon/Gurugram city from backend
      const gurgaonCity =
        normalizedAll.find(
          (c) => c.apiCity === "gurgaon" || c.apiCity === "gurugram"
        ) || normalizedAll[0]; // fallback to first if needed

      setCities(gurgaonCity ? [gurgaonCity] : []);
    } catch (e) {
      if (e.name !== "CanceledError" && e.name !== "AbortError") {
        setErr(e.message || "Failed to load cities");
        setCities([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    fetchCities(controller);
    return () => controller.abort(); // cancel request on unmount
  }, []);

  const toggleDropdown = () => setIsDropdownOpen((v) => !v);
  const closeDropdown = () => setIsDropdownOpen(false);

  const menuItems = useMemo(() => {
    if (loading) return <li className="px-3 py-2 text-muted">Loading…</li>;
    if (err) return <li className="px-3 py-2 text-danger">Failed to load</li>;
    if (!cities.length)
      return <li className="px-3 py-2 text-muted">No cities</li>;
    return (
      <>
        {cities.map((city) => (
          <li key={city.slug}>
            <Link
              to={`/coliving/${city.slug}`}
              className="dropdown-item"
              onClick={closeDropdown}
            >
              {city.name}
            </Link>
          </li>
        ))}
      </>
    );
  }, [cities, loading, err]);

  return (
    <section>
      <nav
        className={`${styles.navbar} navbar navbar-expand-lg bg-body-tertiary`}
      >
        <div className="container-fluid">
          <div>
            <NavLink
              to="/"
              className="nav-link active nav-item"
              aria-current="page"
            >
              <img className={styles.logo} src={Logo} alt="logo" />
            </NavLink>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `${styles.navbarItem} nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Home
                </NavLink>
              </li>

              {/* Dynamic Locations */}
              <li
                className={`nav-item dropdown ${isDropdownOpen ? "show" : ""}`}
              >
                <button
                  className={`${styles.navbarItem} nav-link dropdown-toggle`}
                  onClick={toggleDropdown}
                  style={{ background: "none", border: "none" }}
                  aria-expanded={isDropdownOpen}
                >
                  Locations
                </button>
                <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                  {menuItems}
                </ul>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/about"
                  className={({ isActive }) =>
                    `${styles.navbarItem} nav-link ${isActive ? "active" : ""}`
                  }
                >
                  About Us
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink
                  to="/contact"
                  className={({ isActive }) =>
                    `${styles.navbarItem} nav-link ${isActive ? "active" : ""}`
                  }
                >
                  Contact
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </section>
  );
}

export default Navbar;
