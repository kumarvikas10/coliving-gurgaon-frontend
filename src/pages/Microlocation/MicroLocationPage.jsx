// src/pages/microlocation/MicroLocationPage.jsx
import { useParams, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import styles from "./MicroLocationPage.module.css";
import rating from "../../assets/star.svg";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://coliving-gurgaon-backend.onrender.com";

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
  (slug || "")
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

export default function MicroLocationPage() {
  const { citySlug, locationSlug } = useParams(); // e.g., /coliving/:citySlug/:locationSlug [web:314]
  const apiCity = toApiSlug(citySlug);
  const cityName = displayCity(citySlug);
  const locationName = humanize(locationSlug);

  const [locationData, setLocationData] = useState(null); // header/stat card
  const [properties, setProperties] = useState([]); // cards grid (sample until API)
  const [nearbyLocations, setNearbyLocations] = useState([]); // chips
  const [microContent, setMicroContent] = useState({
    // footer/title/desc/meta
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
    () =>
      microContent.footerDescription?.replace(/<[^>]+>/g, "").trim().length > 0,
    [microContent.footerDescription]
  );

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const load = async () => {
      setLoading(true);

      try {
        // 1) Microlocation content with _id
        const contentRes = await axios.get(
          `${API_BASE}/api/microlocations/${apiCity}/${locationSlug}`,
          { signal: controller.signal }
        );
        if (cancelled) return;
        const microlocationData = contentRes.data;

        // 2) All microlocations for chips UI
        const chipsRes = await axios.get(
          `${API_BASE}/api/microlocations/${apiCity}`,
          {
            signal: controller.signal,
          }
        );
        if (cancelled) return;

        const rawChips = chipsRes.data || [];
        const normalizedChips = rawChips
          .map((ml) =>
            typeof ml === "string"
              ? { name: ml, slug: ml.toLowerCase().trim().replace(/\s+/g, "-") }
              : { name: ml?.name ?? "", slug: ml?.slug ?? "" }
          )
          .filter((i) => i.name && i.slug);

        setNearbyLocations(normalizedChips);

        // 3) — real properties API with microlocation filter
        const cityId = microlocationData.city?._id || ""; // make sure you have city reference on microlocation
        const microlocationId = microlocationData._id;

        const propsRes = await axios.get(
          `${API_BASE}/api/properties?city=${cityId}&micro=${microlocationId}&status=approved`,
          { signal: controller.signal }
        );
        if (cancelled) return;

        const propertyList = propsRes.data?.data || [];
        setProperties(propertyList);

        // 4) Update microContent state (title etc)
        setMicroContent({
          title:
            microlocationData.title ||
            `Coliving Space in ${humanize(locationSlug)}`,
          description: microlocationData.description || "",
          footerTitle: microlocationData.footerTitle || "",
          footerDescription: microlocationData.footerDescription || "",
          metaTitle:
            microlocationData.metaTitle ||
            `Coliving Spaces in ${
              microlocationData.displayLocation || humanize(locationSlug)
            }, ${microlocationData.displayCity || cityName}`,
          metaDescription:
            microlocationData.metaDescription ||
            `Find coliving in ${
              microlocationData.displayLocation || humanize(locationSlug)
            }, ${microlocationData.displayCity || cityName}.`,
          schemaMarkup: microlocationData.schemaMarkup || "",
          displayLocation:
            microlocationData.displayLocation || humanize(locationSlug),
          displayCity: microlocationData.displayCity || cityName,
        });

        // 5) Update locationData with stats
        setLocationData({
          name: humanize(locationSlug),
          city: cityName,
          totalProperties: propertyList.length,
          averagePrice: propertyList.length
            ? propertyList.reduce((acc, p) => acc + (p.startingPrice || 0), 0) /
              propertyList.length
            : 0,
        });
      } catch (error) {
        if (!cancelled) {
          setNearbyLocations([]);
          setProperties([]);
          setLocationData({
            name: humanize(locationSlug),
            city: cityName,
            totalProperties: 0,
            averagePrice: 0,
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
  }, [citySlug, locationSlug, apiCity, cityName]);


  if (!locationData || loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <>
      <div className={styles.microLocationPage}>
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <div className={`container ${styles.container}`}>
            <Link to="/" className={styles.breadcrumbLink}>
              Home
            </Link>
            <span className={styles.breadcrumbSeparator}>/</span>
            <Link
              to={`/coliving/${citySlug}`}
              className={styles.breadcrumbLink}
            >
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
          <div className={`container ${styles.container}`}>
            <div className={styles.headerContent}>
              <h1 className={styles.pageTitle}>
                Coliving Space in{" "}
                {microContent.displayLocation || locationData.name}
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
          <div className={`container ${styles.container}`}>
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
          </div>
        </section>
      </div>
      {(hasFooterTitle || hasFooterDescription) && (
        <section className={`${styles.footer_div} mt-100 -mb-100`}>
          <div className={`container ${styles.container}`}>
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
    </>
  );
}
