// src/pages/microlocation/MicroLocationPage.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./MicroLocationPage.module.css";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";

const MicroLocationPage = () => {
  const { citySlug, locationSlug } = useParams();
  const [locationData, setLocationData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [nearbyLocations, setNearbyLocations] = useState([]);

  // Map slugs to display names
  const cityNameMapping = {
    gurugram: "Gurgaon",
    gurgaon: "Gurgaon",
    delhi: "Delhi",
    mumbai: "Mumbai",
    bangalore: "Bangalore",
    noida: "Noida",
    pune: "Pune",
  };

  const locationNameMapping = {
    "udyog-vihar": "Udyog Vihar",
    "golf-course-road": "Golf Course Road",
    "cyber-city": "Cyber City",   
    "sector-44": "Sector 44",
    "golf-course-extension-road": "Golf Course Extension Road",
    "mg-road": "Mg Road",
    "sohna-road": "Sohna Road",
    "dlf-phase-3": "DLF Phase 3",
    "cyber-park": "Cyber Park",
    "sector-49": "Sector 49",
    "sector-30": "Sector 30",
  };

  const cityName = cityNameMapping[citySlug] || citySlug;
  const locationName = locationNameMapping[locationSlug] || locationSlug.replace('-', ' ');

  // Nearby locations for the current city
  const nearbyLocationsList = {
    gurugram: [
      { name: "Udyog Vihar", slug: "udyog-vihar" },
      { name: "Golf Course Road", slug: "golf-course-road" },
      { name: "Cyber City", slug: "cyber-city" },
      { name: "Sector 44", slug: "sector-44" },
      { name: "Golf Course Extension Road", slug: "golf-course-extension-road" },
      { name: "Mg Road", slug: "mg-road" },
      { name: "Sohna Road", slug: "sohna-road" },
      { name: "DLF Phase 3", slug: "dlf-phase-3" },
      { name: "Cyber Park", slug: "cyber-park" },
      { name: "Sector 49", slug: "sector-49" },
      { name: "Sector 30", slug: "sector-30" },
    ],
  };

  useEffect(() => {
    fetchLocationData();
    fetchLocationProperties();
    setNearbyLocations(nearbyLocationsList[citySlug] || []);
  }, [citySlug, locationSlug]);

  const fetchLocationData = () => {
    setLocationData({
      name: locationName,
      city: cityName,
      totalProperties: 25,
      averagePrice: 17000,
    });
  };

  const fetchLocationProperties = () => {
    // Location-specific properties
    const locationProperties = [
      {
        id: 1,
        name: "Kommune",
        location: `${locationName}, ${cityName}`,
        rating: 4.5,
        price: 17000,
        image: propertyImage1,
        tags: ["Digital Nomads", "Entrepreneur"],
        badge: "Popular"
      },
      {
        id: 2,
        name: `COVIE ${cityName} 70 - Near Metro`,
        location: `Sector 46, ${cityName}`,
        rating: 4.5,
        price: 17000,
        image: propertyImage2,
        tags: ["Digital Nomads", "Entrepreneur"],
        badge: "Trending"
      },
      {
        id: 3,
        name: `COVIE ${cityName} 42`,
        location: `Sector 46, ${cityName}`,
        rating: 4.0,
        price: 17000,
        image: propertyImage1,
        tags: ["Digital Nomads", "Entrepreneur"],
        badge: "Premium"
      },
      {
        id: 4,
        name: "Covie 108",
        location: `Medicity, ${cityName}`,
        rating: 4.3,
        price: 17000,
        image: propertyImage2,
        tags: ["Digital Nomads", "Entrepreneur"],
        badge: "Special Offer"
      },
      {
        id: 5,
        name: `COVIE ${cityName} 42`,
        location: `${locationName}, ${cityName}`,
        rating: 4.1,
        price: 17000,
        image: propertyImage1,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
      {
        id: 6,
        name: `Covie 108`,
        location: `Medicity, ${cityName}`,
        rating: 4.1,
        price: 17000,
        image: propertyImage2,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
    ];
    setProperties(locationProperties);
  };

  if (!locationData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.microLocationPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to={`/coliving/${citySlug}`} className={styles.breadcrumbLink}>
            {cityName}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{locationName}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Coliving Space in {locationName}</h1>
            <button className={styles.filtersBtn}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 4.5H21V6H3V4.5Z" fill="currentColor" />
                <path d="M3 11.25H15V12.75H3V11.25Z" fill="currentColor" />
                <path d="M3 18H9V19.5H3V18Z" fill="currentColor" />
              </svg>
              Filter
            </button>
          </div>
        </div>
      </section>

      {/* Nearby Location Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.locationFilters}>
            {nearbyLocations.map((location, index) => (
              <Link
                key={index}
                to={`/coliving/${citySlug}/${location.slug}`}
                className={`${styles.locationTag} ${
                  location.slug === locationSlug ? styles.active : ""
                }`}
              >
                {location.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className={styles.propertiesSection}>
        <div className={styles.container}>
          <div className={styles.propertiesGrid}>
            {properties.map((property) => (
              <div key={property.id} className={styles.propertyCard}>
                <div className={styles.propertyImage}>
                  <img src={property.image} alt={property.name} />
                  {/* {property.badge && (
                    <div className={`${styles.badge} ${styles[property.badge.toLowerCase().replace(' ', '')]}`}>
                      ⭐ {property.badge}
                    </div>
                  )} */}
                  <div className={styles.rating}>
                    <span>⭐</span>
                    <span>{property.rating}</span>
                  </div>
                </div>

                <div className={styles.propertyInfo}>
                  <h4 className={styles.propertyName}>{property.name}</h4>
                  <p className={styles.propertyLocation}>{property.location}</p>

                  <div className={styles.propertyTags}>
                    {property.tags.map((tag, index) => (
                      <span key={index} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className={styles.propertyFooter}>
                    <div className={styles.price}>
                      <span className={styles.amount}>
                        ₹{property.price.toLocaleString()}
                      </span>
                      <span className={styles.period}> / month</span>
                    </div>
                    <button className={styles.viewBtn}>View Number</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default MicroLocationPage;
