// src/pages/microlocation/MicroLocationPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./MicroLocationPage.module.css";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";

const API_BASE =
  process.env.REACT_APP_API_BASE || "https://coliving-gurgaon-backend.onrender.com";

// Map app route slugs -> API slugs (backend expects "gurgaon" not "gurugram")
const toApiSlug = (slug) => {
  const s = (slug || "").toLowerCase();
  if (s === "gurugram") return "gurgaon";
  return s;
};

// Display names for headings
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

const humanize = (slug) =>
  (slug || "").split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");

export default function MicroLocationPage() {
  const { citySlug, locationSlug } = useParams(); // e.g., /coliving/:citySlug/:locationSlug [web:314]
  const apiCity = toApiSlug(citySlug);
  const cityName = displayCity(citySlug);
  const locationName = humanize(locationSlug);

  const [locationData, setLocationData] = useState(null);          // header/stat card
  const [properties, setProperties] = useState([]);                // cards grid (sample until API)
  const [nearbyLocations, setNearbyLocations] = useState([]);      // chips
  const [microContent, setMicroContent] = useState({               // footer/title/desc/meta
    title: "",
    description: "",
    footerTitle: "",
    footerDescription: "",
    metaTitle: "",
    metaDescription: "",
    schemaMarkup: "",
    displayLocation: "",
    displayCity: "",
  });
  const [loading, setLoading] = useState(true);

  const hasFooterTitle = useMemo(
    () => microContent.footerTitle?.trim().length > 0,
    [microContent.footerTitle]
  );
  const hasFooterDescription = useMemo(
    () => microContent.footerDescription?.replace(/<[^>]+>/g, "").trim().length > 0,
    [microContent.footerDescription]
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      // 1) Microlocation content
      const contentPromise = axios.get(
        `${API_BASE}/api/microlocations/${apiCity}/${locationSlug}`,
        { signal: controller.signal } // AbortController for cleanup [web:306][web:308]
      );

      // 2) Chips: all microlocations for this city
      const chipsPromise = axios.get(
        `${API_BASE}/api/microlocations/${apiCity}`,
        { signal: controller.signal } // AbortController for cleanup [web:306][web:308]
      );

      // 3) Properties placeholder (replace with real endpoint later)
      const propsPromise = Promise.resolve({
        data: [
          {
            id: 1,
            name: "Kommune",
            location: `${locationName}, ${cityName}`,
            rating: 4.5,
            price: 17000,
            image: propertyImage1,
            tags: ["Digital Nomads", "Entrepreneur"],
            badge: "Popular",
          },
          {
            id: 2,
            name: `COVIE ${cityName} 70 - Near Metro`,
            location: `Sector 46, ${cityName}`,
            rating: 4.5,
            price: 17000,
            image: propertyImage2,
            tags: ["Digital Nomads", "Entrepreneur"],
            badge: "Trending",
          },
          {
            id: 3,
            name: `COVIE ${cityName} 42`,
            location: `Sector 46, ${cityName}`,
            rating: 4.0,
            price: 17000,
            image: propertyImage1,
            tags: ["Digital Nomads", "Entrepreneur"],
            badge: "Premium",
          },
          {
            id: 4,
            name: "Covie 108",
            location: `Medicity, ${cityName}`,
            rating: 4.3,
            price: 17000,
            image: propertyImage2,
            tags: ["Digital Nomads", "Entrepreneur"],
            badge: "Special Offer",
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
        ],
      });

      // Use allSettled so one failing call doesn’t blank the whole page [web:315][web:321]
      const [contentRes, chipsRes, propsRes] = await Promise.allSettled([
        contentPromise,
        chipsPromise,
        propsPromise,
      ]);

      if (cancelled) return;

      // Microlocation content
      if (contentRes.status === "fulfilled") {
        const d = contentRes.value?.data || {};
        setMicroContent({
          title: d.title || `Coliving Space in ${humanize(locationSlug)}`,
          description: d.description || "",
          footerTitle: d.footerTitle || "",
          footerDescription: d.footerDescription || "",
          metaTitle:
            d.metaTitle ||
            `Coliving Spaces in ${d.displayLocation || humanize(locationSlug)}, ${d.displayCity || cityName}`,
          metaDescription:
            d.metaDescription ||
            `Find coliving in ${d.displayLocation || humanize(locationSlug)}, ${d.displayCity || cityName}.`,
          schemaMarkup: d.schemaMarkup || "",
          displayLocation: d.displayLocation || humanize(locationSlug),
          displayCity: d.displayCity || cityName,
        });
      } else {
        // Minimal fallback if content call fails
        setMicroContent((prev) => ({
          ...prev,
          title: prev.title || `Coliving Space in ${humanize(locationSlug)}`,
          metaTitle:
            prev.metaTitle ||
            `Coliving Spaces in ${humanize(locationSlug)}, ${cityName}`,
          metaDescription:
            prev.metaDescription ||
            `Find coliving in ${humanize(locationSlug)}, ${cityName}.`,
        }));
      }

      // Chips list
      if (chipsRes.status === "fulfilled") {
        const raw = chipsRes.value?.data;
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
              ml?.slug ??
              name.toLowerCase().trim().replace(/\s+/g, "-");
            return name && slug ? { name, slug } : null;
          })
          .filter(Boolean);
        setNearbyLocations(normalized);
      } else {
        setNearbyLocations([]);
      }

      // Properties (placeholder)
      if (propsRes.status === "fulfilled") {
        const list = Array.isArray(propsRes.value?.data)
          ? propsRes.value?.data
          : [];
        setProperties(list);
      } else {
        setProperties([]);
      }

      // Simple header/stat info
      setLocationData({
        name: humanize(locationSlug),
        city: cityName,
        totalProperties: (propsRes.status === "fulfilled" && propsRes.value?.data?.length) || 0,
        averagePrice: 17000,
      });

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
      controller.abort(); // cancel pending axios calls on unmount [web:306][web:313]
    };
  }, [citySlug, locationSlug, apiCity, cityName]);

  if (!locationData || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.microLocationPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={styles.container}>
          <Link to="/" className={styles.breadcrumbLink}>Home</Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to={`/coliving/${citySlug}`} className={styles.breadcrumbLink}>
            {cityName}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>
            {microContent.displayLocation || locationData.name}
          </span>
        </div>
      </div>

      {/* Page Header */}
      <section className={styles.pageHeader}>
        <div className={styles.container}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>
              Coliving Space in {microContent.displayLocation || locationData.name}
            </h1>
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
            {nearbyLocations.map((loc) => (
              <Link
                key={loc.slug}
                to={`/coliving/${citySlug}/${loc.slug}`}
                className={`${styles.locationTag} ${
                  loc.slug === locationSlug ? styles.active : ""
                }`}
              >
                {loc.name}
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

      {(hasFooterTitle || hasFooterDescription) && (
        <section className={`${styles.footer_div} mt-100 -mb-100`}>
          <div className={styles.container}>
            <div className={`${styles.footer_heading} row`}>
              {hasFooterTitle && <h2>{microContent.footerTitle}</h2>}
              {hasFooterDescription && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: microContent.footerDescription,
                  }}
                />
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}