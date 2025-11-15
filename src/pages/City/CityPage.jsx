// src/pages/city/CityPage.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import styles from "./CityPage.module.css";
import rating from "../../assets/star.svg";
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

      try {
        // 1. Get city details by slug (this returns city _id and more info)
        const cityContentRes = await axios.get(
          `${API_BASE}/api/cities/${apiCity}`,
          {
            signal: controller.signal,
          }
        );
        if (cancelled) return;

        const cityContentData = cityContentRes.data;

        // 2. Get microlocations based on apiCity slug (like before)
        const microRes = await axios.get(
          `${API_BASE}/api/microlocations/${apiCity}`,
          {
            signal: controller.signal,
          }
        );
        if (cancelled) return;

        const rawMicroList = microRes.data || [];
        const normalizedMicros = rawMicroList
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

        setMicrolocations(normalizedMicros);

        // 3. Get properties using city _id from cityContent API
        const propertiesRes = await axios.get(
          `${API_BASE}/api/properties?city=${cityContentData._id}&status=approved`,
          { signal: controller.signal }
        );
        if (cancelled) return;

        const propertyList = propertiesRes.data?.data || [];
        setProperties(propertyList);

        // 4. Set cityContent for display, SEO, etc
        setCityContent({
          city: cityContentData.city || apiCity,
          displayCity: cityContentData.displayCity || cityName,
          title:
            cityContentData.title ||
            `Explore Coliving in ${cityContentData.displayCity || cityName}`,
          description: cityContentData.description || "",
          footerTitle: cityContentData.footerTitle || "",
          footerDescription: cityContentData.footerDescription || "",
          metaTitle:
            cityContentData.metaTitle ||
            `Coliving Spaces in ${cityContentData.displayCity || cityName}`,
          metaDescription:
            cityContentData.metaDescription ||
            `Find the best coliving spaces in ${
              cityContentData.displayCity || cityName
            }.`,
          schemaMarkup: cityContentData.schemaMarkup || "",
        });
      } catch (error) {
        if (!cancelled) {
          // Fallbacks in case of error
          setMicrolocations([]);
          setProperties([]);
          setCityContent({
            city: apiCity,
            displayCity: cityName,
            title: `Explore Coliving in ${cityName}`,
            metaTitle: `Coliving Spaces in ${cityName}`,
            metaDescription: `Find the best coliving spaces in ${cityName}.`,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
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

  if (loading) {
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
                <Link
                  key={property._id}
                  to={`/${citySlug}/${property.slug}`}
                  className={styles.propertyCard}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div className={styles.propertyImage}>
                    <img
                      src={property.images?.[0]?.secureUrl || ""}
                      alt={property.name}
                    />
                    <div className={styles.rating}>
                      <span>
                        <img src={rating} alt="rating" />
                      </span>
                      <span>{property.rating ?? "N/A"}</span>
                    </div>
                  </div>

                  <div className={styles.propertyInfo}>
                    <h4 className={styles.propertyName}>{property.name}</h4>
                    <p className={styles.propertyLocation}>
                      {property.location?.address}
                    </p>

                    <div className={styles.propertyTags}>
                      {property.tags?.map((tag, index) => (
                        <span key={index} className={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className={styles.propertyFooter}>
                      <div className={styles.price}>
                        <span className={styles.amount}>
                          ₹{property.startingPrice?.toLocaleString() || "-"} /
                        </span>
                        <span className={styles.period}>month</span>
                      </div>
                      <button
                        className={styles.enquireBtn}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          // TODO: open enquiry modal or route to property detail
                        }}
                      >
                        Enquire Now
                      </button>
                    </div>
                  </div>
                </Link>
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
