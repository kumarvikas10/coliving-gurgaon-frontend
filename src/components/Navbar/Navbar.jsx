// src/components/Navbar/Navbar.jsx
import { NavLink, Link } from "react-router-dom";
import { useState } from "react";
import styles from "./Navbar.module.css";
import Logo from "../../assets/logo.svg";

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const cities = [
    { name: "Gurgaon", slug: "gurugram" },
    { name: "Delhi", slug: "delhi" },
    { name: "Mumbai", slug: "mumbai" },
    { name: "Bangalore", slug: "bangalore" },
    { name: "Noida", slug: "noida" },
    { name: "Pune", slug: "pune" }
  ];

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  return (
    <section>
      <nav className={`${styles.navbar} navbar navbar-expand-lg bg-body-tertiary`}>
        <div className="container-fluid">
          <div>
            <NavLink to="/" className="nav-link active nav-item" aria-current="page">
              <img className={`${styles.logo}`} src={Logo} alt="logo" />
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
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink to="/" className={`${styles.navbarItem} nav-link`}>
                  Home
                </NavLink>
              </li>

              {/* Custom Dropdown */}
              <li className={`nav-item dropdown ${isDropdownOpen ? 'show' : ''}`}>
                <button
                  className={`${styles.navbarItem} nav-link dropdown-toggle`}
                  onClick={toggleDropdown}
                  style={{ background: 'none', border: 'none' }}
                >
                  Locations
                </button>
                <ul className={`dropdown-menu ${isDropdownOpen ? 'show' : ''}`}>
                  {cities.map((city, index) => (
                    <li key={index}>
                      <Link
                        to={`/coliving/${city.slug}`}
                        className="dropdown-item"
                        onClick={closeDropdown}
                      >
                        {city.name}
                      </Link>
                    </li>
                  ))}
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <Link
                      to="/coliving"
                      className="dropdown-item"
                      onClick={closeDropdown}
                    >
                      <strong>View All Cities</strong>
                    </Link>
                  </li>
                </ul>
              </li>

              <li className="nav-item">
                <NavLink to="/about" className={`${styles.navbarItem} nav-link`}>
                  About Us
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/contact" className={`${styles.navbarItem} nav-link`}>
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
