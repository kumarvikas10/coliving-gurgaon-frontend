import { NavLink, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./Navbar.module.css";
import Logo from "../../assets/logo.svg";
import MobileLogo from "../../assets/Mobilelogo.svg";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Navbar() {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setErr("");

    axios
      .get(`${API_BASE}/api/cities?all=true`, {
        signal: controller.signal,
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data || [];

        const city = data.find((c) => {
          const value = (c.city || c.name || "").toLowerCase();
          return value === "gurgaon" || value === "gurugram";
        });

        if (!city) {
          console.warn("Gurgaon/Gurugram not found in API");
          return;
        }

        setCities([
          {
            name: city.displayCity || city.name,
            slug: city.slug || "gurugram",
          },
        ]);
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          console.error("Cities API error:", error);
          setErr("Failed to load");
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const menuItems = useMemo(() => {
    if (loading) return <li className={styles.dropdownItem}>Loading…</li>;
    if (err) return <li className={styles.dropdownItem}>Error</li>;

    return cities.map((city) => (
      <li key={city.slug}>
        <Link
          to={`/coliving/${city.slug}`}
          onClick={() => setIsDesktopDropdownOpen(false)}
        >
          {city.name}
        </Link>
      </li>
    ));
  }, [cities, loading, err]);

  return (
    <>
      {/* NAVBAR */}
      <nav className={styles.navbar}>
        <div className="container d-flex align-items-center justify-content-between">
          {/* LOGO */}
          <NavLink to="/" className={styles.logoWrap}>
            <img src={Logo} className={styles.logo} alt="Logo" />
            <img src={MobileLogo} className={styles.mobileLogo} alt="Logo" />
          </NavLink>

          {/* DESKTOP MENU */}
          <ul className={styles.desktopMenu}>
            <li>
              <NavLink to="/">Home</NavLink>
            </li>

            <li className={styles.dropdown}>
              <button onClick={() => setIsDesktopDropdownOpen((v) => !v)}>
                Locations
              </button>
              {isDesktopDropdownOpen && (
                <ul className={styles.dropdownMenu}>{menuItems}</ul>
              )}
            </li>

            <li>
              <NavLink to="/about">About</NavLink>
            </li>
            <li>
              <NavLink to="/contact">Contact</NavLink>
            </li>
          </ul>

          {/* MOBILE TOGGLE */}
          <button
            className={styles.hamburger}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      <div
        className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ""}`}
      >
        <div
          className={styles.overlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        <div className={styles.panel}>
          <button
            className={styles.close}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            ✕
          </button>

          <NavLink to="/" onClick={() => setIsMobileMenuOpen(false)}>
            Home
          </NavLink>

          <NavLink
            className={styles.mobileDropdownToggle}
            onClick={() => setIsMobileDropdownOpen((v) => !v)}
          >
            Locations
          </NavLink>

          {isMobileDropdownOpen && (
            <ul className={styles.mobileDropdown}>
              {cities.map((city) => (
                <Link
                  key={city.slug}
                  to={`/coliving/${city.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {city.name}
                </Link>
              ))}
            </ul>
          )}

          <NavLink to="/about" onClick={() => setIsMobileMenuOpen(false)}>
            About
          </NavLink>
          <NavLink to="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            Contact
          </NavLink>
        </div>
      </div>
    </>
  );
}
