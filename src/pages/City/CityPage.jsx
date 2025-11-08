// src/pages/city/CityPage.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./CityPage.module.css";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://coliving-gurgaon-backend.onrender.com";

// Map app route slugs → API slugs (backend expects “gurgaon” not “gurugram”)
const toApiSlug = (slug) => {
  const s = (slug || "").toLowerCase();
  if (s === "gurugram") return "gurgaon";
  return s;
};

// Display mapping only for headings
const displayCity = (slug) => {
  const map = {
    gurugram: "Gurgaon",
    gurgaon: "Gurgaon",
    delhi: "Delhi",
    mumbai: "Mumbai",
    bangalore: "Bangalore",
    noida: "Noida",
    pune: "Pune",
  };
  return map[slug?.toLowerCase()] || slug;
};

export default function CityPage() {
  const { citySlug } = useParams();
  const apiCity = toApiSlug(citySlug);
  const cityName = displayCity(citySlug);

  const [cityData, setCityData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [microlocations, setMicrolocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [cityContent, setCityContent] = useState({
    city: "",
    displayCity: "",
    title: "",
    description: "",
    footerTitle: "",
    footerDescription: "",
    metaTitle: "",
    metaDescription: "",
    schemaMarkup: "",
  });
  const [loading, setLoading] = useState(true);

  const hasFooterTitle = useMemo(
    () => cityContent.footerTitle?.trim().length > 0,
    [cityContent.footerTitle]
  );
  const hasFooterDescription = useMemo(
    () =>
      cityContent.footerDescription?.replace(/<[^>]+>/g, "").trim().length > 0,
    [cityContent.footerDescription]
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      // 1) Content for footer + displayCity
      const cityContentPromise = axios.get(
        `${API_BASE}/api/cities/${apiCity}`,
        { signal: controller.signal }
      );

      // 2) Microlocations
      const microPromise = axios.get(
        `${API_BASE}/api/microlocations/${apiCity}`,
        { signal: controller.signal }
      );

      // 3) Properties (replace with your real endpoint when available)
      const propsPromise = Promise.resolve({
        data: [
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
        ],
      });

      // Use allSettled so one failure doesn’t blank the whole page
      const [contentRes, microRes, propsRes] = await Promise.allSettled([
        cityContentPromise,
        microPromise,
        propsPromise,
      ]);

      if (cancelled) return;

      // City content
      if (contentRes.status === "fulfilled") {
        const c = contentRes.value?.data || {};
        setCityContent({
          city: c.city || apiCity,
          displayCity: c.displayCity || cityName,
          title: c.title || `Explore Coliving in ${c.displayCity || cityName}`,
          description: c.description || "",
          footerTitle: c.footerTitle || "",
          footerDescription: c.footerDescription || "",
          metaTitle:
            c.metaTitle || `Coliving Spaces in ${c.displayCity || cityName}`,
          metaDescription:
            c.metaDescription ||
            `Find the best coliving spaces in ${c.displayCity || cityName}.`,
          schemaMarkup: c.schemaMarkup || "",
        });
      } else {
        // Fallback minimal content if city content API fails
        setCityContent((prev) => ({
          ...prev,
          city: prev.city || apiCity,
          displayCity: prev.displayCity || cityName,
          title: prev.title || `Explore Coliving in ${cityName}`,
          metaTitle: prev.metaTitle || `Coliving Spaces in ${cityName}`,
          metaDescription:
            prev.metaDescription ||
            `Find the best coliving spaces in ${cityName}.`,
        }));
      }

      // Microlocations
      if (microRes.status === "fulfilled") {
        const raw = microRes.value?.data;
        const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.items ?? [];
        const normalized = list
          .map((ml) => {
            if (typeof ml === "string") {
              return {
                name: ml,
                slug: ml.toLowerCase().trim().replace(/\s+/g, "-"),
              };
            }
            const name = ml?.name ?? ml?.title ?? "";
            const slug =
              ml?.slug ?? name.toLowerCase().trim().replace(/\s+/g, "-");
            return name && slug ? { name, slug } : null;
          })
          .filter(Boolean);
        setMicrolocations(normalized);
      } else {
        setMicrolocations([]); // show no chips if API fails
      }

      // Properties (always show sample list even if other APIs fail)
      if (propsRes.status === "fulfilled") {
        const list = Array.isArray(propsRes.value?.data)
          ? propsRes.value?.data
          : [];
        setProperties(list);
        setCityData({
          name: cityName,
          totalProperties: list.length,
          averagePrice: list.length ? 16000 : 0,
        });
      } else {
        // Last-resort fallback
        const list = [];
        setProperties(list);
        setCityData({
          name: cityName,
          totalProperties: 0,
          averagePrice: 0,
        });
      }

      setLoading(false);
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [citySlug, apiCity, cityName]);

  const handleLocationFilter = (location) => {
    setSelectedLocation(location);
    // TODO: apply filtering once properties are served by your backend with microlocation field
  };

  const toggleFilters = () => setShowFilters((v) => !v);

  if (!cityData || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.cityPage}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className={`container ${styles.container}`}>
            <Link to="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <span className={styles.breadcrumbCurrent}>{cityName}</span>
          </div>
        </div>

        {/* Page Header */}
        <section className={styles.pageHeader}>
          <div className={`container ${styles.container}`}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>
                Coliving Spaces in {cityContent.displayCity || cityName}
              </h1>
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
          <div className={`container ${styles.container}`}>
            <div className={styles.locationFilters}>
              {microlocations.map((ml) => (
                <Link
                  key={ml.slug}
                  className={`${styles.locationTag} ${
                    selectedLocation === ml.name ? styles.active : ""
                  }`}
                  to={`/coliving/${citySlug}/${ml.slug}`}
                  onClick={() => handleLocationFilter(ml.name)}
                >
                  {ml.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Properties Grid */}
        <section className={styles.propertiesSection}>
          <div className={`container ${styles.container}`}>
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
                    <p className={styles.propertyLocation}>
                      {property.location}
                    </p>

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

            <div className={styles.viewMoreContainer}>
              <button className={styles.viewMoreBtn}>View More Spaces</button>
            </div>
          </div>
        </section>
      </div>
      {(hasFooterTitle || hasFooterDescription) && (
        <section className={`${styles.footer_div} mt-100 -mb-100`}>
          <div className={`container ${styles.container}`}>
            <div className={`${styles.footer_heading} row`}>
              {hasFooterTitle && <h2>{cityContent.footerTitle}</h2>}
              {hasFooterDescription && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: cityContent.footerDescription,
                  }}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
