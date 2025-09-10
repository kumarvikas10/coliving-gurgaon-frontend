// src/pages/city/CityPage.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./CityPage.module.css";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";

const CityPage = () => {
  const { citySlug } = useParams();
  const [cityData, setCityData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

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

  const cityName = cityNameMapping[citySlug] || citySlug;

  // Sample locations for each city
  const cityLocations = {
    gurugram: [
      "Udyog Vihar",
      "Golf Course Road",
      "Cyber City",
      "Sector 44",
      "Golf Course Extension Road",
      "Mg Road",
      "Sohna Road",
      "DLF Phase 3",
      "Cyber Park",
      "Sector 49",
      "Sector 30",
    ],
    delhi: ["Connaught Place", "Karol Bagh", "Lajpat Nagar"],
    mumbai: ["Bandra", "Andheri", "Powai"],
  };

  const locations = cityLocations[citySlug] || [];

  useEffect(() => {
    fetchCityData(citySlug);
    fetchCityProperties(citySlug);
  }, [citySlug]);

  const fetchCityData = (slug) => {
    setCityData({
      name: cityName,
      totalProperties: 150,
      averagePrice: 16000,
    });
  };

  const fetchCityProperties = (slug) => {
    // Extended sample data to show more properties
    const sampleProperties = [
      {
        id: 1,
        name: `COVIE ${cityName} 42`,
        location: `Sector 44, ${cityName}`,
        rating: 4.1,
        price: 16000,
        image: propertyImage1,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
      {
        id: 2,
        name: `Covie 108`,
        location: `Medicity, ${cityName}`,
        rating: 4.1,
        price: 16000,
        image: propertyImage2,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
      {
        id: 3,
        name: `COVIE ${cityName} 42`,
        location: `Sector 44, ${cityName}`,
        rating: 4.1,
        price: 16000,
        image: propertyImage1,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
      {
        id: 4,
        name: `Covie 108`,
        location: `Medicity, ${cityName}`,
        rating: 4.1,
        price: 16000,
        image: propertyImage2,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
      {
        id: 5,
        name: `COVIE ${cityName} 42`,
        location: `Sector 44, ${cityName}`,
        rating: 4.1,
        price: 16000,
        image: propertyImage1,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
      {
        id: 6,
        name: `Covie 108`,
        location: `Medicity, ${cityName}`,
        rating: 4.1,
        price: 16000,
        image: propertyImage2,
        tags: ["Digital Nomads", "Entrepreneur"],
      },
    ];
    setProperties(sampleProperties);
  };

  const handleLocationFilter = (location) => {
    setSelectedLocation(location);
    console.log(`Filter properties in ${location}`);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  if (!cityData) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.cityPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{cityName}</span>
        </div>
      </div>

      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Coliving Spaces in {cityName}</h1>
            <button className={styles.filtersBtn} onClick={toggleFilters}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 4.5H21V6H3V4.5Z" fill="currentColor" />
                <path d="M3 11.25H15V12.75H3V11.25Z" fill="currentColor" />
                <path d="M3 18H9V19.5H3V18Z" fill="currentColor" />
              </svg>
              Filters
            </button>
          </div>
        </div>
      </section>

      {/* Location Filters */}
      <section className={styles.filtersSection}>
        <div className={styles.container}>
          <div className={styles.locationFilters}>
            {locations.map((location, index) => (
              <Link
                key={index}
                className={`${styles.locationTag} ${
                  selectedLocation === location ? styles.active : ""
                }`}
                to={`/coliving/${citySlug}/${location
                  .toLowerCase()
                  .replace(" ", "-")}`}
                onClick={() => handleLocationFilter(location)}
              >
                {location}
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
                        ₹{property.price.toLocaleString()}/
                      </span>
                      <span className={styles.period}>month</span>
                    </div>
                    <button className={styles.enquireBtn}>Enquire Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* View More Button */}
          <div className={styles.viewMoreContainer}>
            <button className={styles.viewMoreBtn}>View More Spaces</button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CityPage;
