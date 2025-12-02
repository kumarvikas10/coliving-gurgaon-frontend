import React, { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import styles from "./PropertyPage.module.css";
import location from "../../assets/Location.svg";
import rating from "../../assets/star.svg";
import price from "../../assets/price.svg";
import BookingForm from "../../components/BookingForm/BookingForm";
import LocationSection from "../../components/LocationSection/LocationSection";

// Import Yet Another React Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import "yet-another-react-lightbox/plugins/thumbnails.css";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://coliving-gurgaon-backend.onrender.com";

const PropertyPage = () => {
  const { citySlug, propertySlug } = useParams();
  const [cityData, setCityData] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allAmenities, setAllAmenities] = useState([]);
  const [allPlans, setAllPlans] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const WORD_LIMIT = 80;
  const { isLong, previewText } = useMemo(() => {
    if (!property?.description) {
      return { isLong: false, previewText: "" };
    }
    const words = property.description.trim().split(/\s+/);
    const long = words.length > WORD_LIMIT;
    const preview = long
      ? words.slice(0, WORD_LIMIT).join(" ")
      : property.description;

    return { isLong: long, previewText: preview };
  }, [property?.description]);

  const MAX_THUMBNAILS = 4;

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

  useEffect(() => {
    if (!propertySlug) return;
    const fetchPropertyData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/api/properties/slug/${propertySlug}`
        );
        setProperty(res.data?.data || null);
      } catch (err) {
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };
    fetchPropertyData();
  }, [propertySlug]);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/amenities?all=true`);
        const list = res.data?.data ?? res.data ?? [];
        setAllAmenities(Array.isArray(list) ? list : []);
      } catch (e) {
        setAllAmenities([]);
      }
    };
    fetchAmenities();
  }, []);

  const amenitiesMap = useMemo(() => {
    const map = new Map();
    allAmenities.forEach((a) => {
      map.set(a._id, a);
    });
    return map;
  }, [allAmenities]);

  // Filter only amenities existing on this property
  const propertyAmenitiesDetails = property?.amenities
    ? property.amenities.map((id) => amenitiesMap.get(id)).filter(Boolean)
    : [];

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/plans?all=true`);
        const list = res.data?.data ?? res.data ?? [];
        setAllPlans(Array.isArray(list) ? list : []);
      } catch (error) {
        setAllPlans([]);
        console.error("Failed to fetch plans", error);
      }
    };
    fetchPlans();
  }, []);

  const plansMap = useMemo(() => {
    const map = new Map();
    allPlans.forEach((plan) => {
      map.set(plan._id, plan);
    });
    return map;
  }, [allPlans]);

  const enrichedPlans = property?.coliving_plans
    ? property.coliving_plans.map((cp) => {
        const planDetails = plansMap.get(cp.plan);
        return {
          ...cp,
          planDetails,
          type: planDetails?.type || "Plan",
          description: planDetails?.description || "",
          image: planDetails?.image?.secureUrl || "",
        };
      })
    : [];

  // Function to open lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  // Function to handle thumbnail click
  const handleThumbnailClick = (index) => {
    setSelectedImage(index);
    openLightbox(index);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading property...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className={styles.error}>
        <p>Property not found</p>
        <Link to="/">Go back to Home</Link>
      </div>
    );
  }

  // Get thumbnails to display (images 1-4, skipping the main image at index 0)
  const thumbnailsToShow = property.images.slice(1, MAX_THUMBNAILS + 1);
  const remainingImagesCount = Math.max(
    0,
    property.images.length - MAX_THUMBNAILS - 1
  );
  const formatINR = (n) =>
    n == null
      ? ""
      : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
          Number(n)
        );

  const resolveRoomImage = (img, prop) => {
    const first = prop && prop.images && prop.images ? prop.images : "";

    if (!img) return first;

    if (
      typeof img === "string" &&
      (img.startsWith("http") || img.startsWith("data:") || img.startsWith("/"))
    ) {
      return img;
    }

    const map = {
      "private-room.jpg": first,
      "double-sharing.jpg":
        prop && prop.images && prop.images[17] ? prop.images[17] : first,
    };

    return map[img] ? map[img] : first;
  };

  return (
    <div className={styles.propertyPage}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className={`container ${styles.container}`}>
          <Link to="/" className={styles.breadcrumbLink}>
            Home
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <Link to={`/coliving/${citySlug}`} className={styles.breadcrumbLink}>
            {cityName}
          </Link>
          <span className={styles.breadcrumbSeparator}>/</span>
          <span className={styles.breadcrumbCurrent}>{property.name}</span>
        </div>
      </div>

      {/* Property Header */}
      <div className={styles.propertyHeader}>
        <div className={`container ${styles.container}`}>
          <div className={styles.propertyHead}>
            <div>
              <h1 className={styles.propertyTitle}>{property.name}</h1>
              <p className={styles.propertyLocation}>
                <span>
                  <img src={rating} alt="rating" />
                  {property.rating}
                </span>
                <span>|</span>
                <span>
                  <img src={location} alt="location" />
                  {property.location.address}
                </span>
                <span>|</span>
                <span>
                  <img src={price} alt="price" />
                  Best price guarantee
                </span>
              </p>
            </div>
            <div className={styles.priceSection}>
              <p>
                Starting from
                <span>₹{property.startingPrice.toLocaleString()}/month</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Property Images with Lightbox */}
      <div className={styles.propertyImages}>
        <div className={`container ${styles.container}`}>
          <div className={styles.imageGallery}>
            {property.images?.length > 0 && (
              <div
                className={styles.largeImage}
                onClick={() => openLightbox(0)}
              >
                {property.images && property.images.length > 0 && (
                  <img src={property.images[0].secureUrl} alt={property.name} />
                )}
                <div className={styles.viewAllPhotos}>
                  View all {property.images.length} photos
                </div>
              </div>
            )}
            <div className={styles.smallImages}>
              {property.images?.slice(1, MAX_THUMBNAILS + 1).map((img, idx) => (
                <div
                  key={img.publicId}
                  className={`${styles.smallImage} ${
                    selectedImage === idx + 1 ? styles.active : ""
                  }`}
                  onClick={() => handleThumbnailClick(idx + 1)}
                >
                  <img
                    src={img.secureUrl}
                    alt={`${property.name} Image ${idx + 2}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Lightbox Component - Shows ALL images */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={(property.images || []).map((img, index) => ({
              src: img.secureUrl,
              alt: `${property.name} - Image ${index + 1}`,
              width: 1200,
              height: 800,
            }))}
            plugins={[Thumbnails, Zoom, Fullscreen]}
            thumbnails={{
              position: "bottom",
              width: 120,
              height: 80,
              border: 0,
              borderRadius: 8,
              padding: 4,
              gap: 8,
            }}
            zoom={{
              maxZoomPixelRatio: 3,
              zoomInMultiplier: 2,
              doubleTapDelay: 300,
              doubleClickDelay: 300,
              doubleClickMaxStops: 2,
              keyboardMoveDistance: 50,
              wheelZoomDistanceFactor: 100,
              pinchZoomDistanceFactor: 100,
              scrollToZoom: true,
            }}
            carousel={{
              finite: true,
              preload: 2,
              padding: "16px",
              spacing: "30%",
              imageFit: "contain",
            }}
            render={{
              buttonPrev: property.images.length <= 1 ? () => null : undefined,
              buttonNext: property.images.length <= 1 ? () => null : undefined,
            }}
            controller={{
              closeOnBackdropClick: true,
              closeOnPullDown: true,
              closeOnPullUp: true,
            }}
          />
        </div>
      </div>
      <div className={styles.propertyContent}>
        <div className={`container ${styles.container}`}>
          <div className={styles.contentGrid}>
            <div className={styles.leftContent}>
              <section className={styles.propertyAbout}>
                <div className={styles.propertyDescription}>
                  <p className={styles.descriptionText}>
                    {showFullDescription
                      ? property.description
                      : `${previewText}${isLong ? "..." : ""}`}
                  </p>

                  {isLong && (
                    <button
                      className={styles.showMoreBtn}
                      aria-expanded={showFullDescription}
                      onClick={() => setShowFullDescription((s) => !s)}
                    >
                      {showFullDescription ? "Show Less" : "Show More"}
                    </button>
                  )}
                </div>
                <hr className={styles.headerline} />
                <div className={styles.amenitiesSection}>
                  <h2 className={styles.sectionTitle}>Amenities</h2>
                  {/* <div className={styles.amenitiesGrid}>
                    {Array.isArray(property.amenities) &&
                      property.amenities.map((amenity, index) => (
                        <div key={index} className={styles.amenityItem}>
                          <span className={styles.amenityIcon}>
                            {amenity.icon}
                          </span>
                          <span className={styles.amenityLabel}>
                            {amenity.label}
                          </span>
                        </div>
                      ))}
                  </div> */}
                  <div className={styles.amenitiesGrid}>
                    {propertyAmenitiesDetails
                      .filter((amenity) => amenity && amenity._id)
                      .map((amenity) => (
                        <div key={amenity._id} className={styles.amenityItem}>
                          {amenity.icon?.secureUrl ? (
                            <img
                              className={styles.amenityIcon}
                              src={amenity.icon.secureUrl}
                              alt={amenity.label}
                            />
                          ) : (
                            <span className={styles.amenityIcon}>
                              {amenity.icon}
                            </span> // fallback if icon is string or emoji
                          )}
                          <span className={styles.amenityLabel}>
                            {amenity.name}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </section>
              <section className={styles.roomsSection}>
                <div className={styles.container}>
                  <div className={styles.roomsHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Coliving Rooms</h2>
                      <p className={styles.sectionSubtitle}>
                        Fully furnished private room & sharing room with access
                        to shared amenities
                      </p>
                    </div>
                    <button
                      type="button"
                      className={styles.checkBtn}
                      onClick={() =>
                        document
                          .getElementById("booking-form")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      aria-label="Check availability"
                    >
                      Check availability
                    </button>
                  </div>

                  <div className={styles.roomsList}>
                    {Array.isArray(enrichedPlans) &&
                      enrichedPlans.map((room, index) => (
                        <article
                          key={room._id || room.plan}
                          className={styles.roomCard}
                          role="group"
                          aria-labelledby={`room-${room._id}-title`}
                        >
                          {/* Left: Image */}
                          <div className={styles.roomImage}>
                            {property.images &&
                            property.images.length > index ? (
                              <img
                                src={property.images[index].secureUrl}
                                alt={`${property.name} Image ${index + 1}`}
                              />
                            ) : (
                              <img src="/default-room.jpg" alt="Default Room" />
                            )}
                          </div>

                          {/* Middle: Room info */}
                          <div className={styles.roomInfo}>
                            <div className={styles.roomHead}>
                              <h3
                                id={`room-${room.id}-title`}
                                className={styles.roomType}
                              >
                                {room.type}
                              </h3>
                            </div>

                            <p className={styles.roomDescription}>
                              {room.description}
                            </p>

                            {/* Feature chips */}
                            <div className={styles.featureChips}>
                              {Array.isArray(room.features) &&
                                room.features.map((feat, i) => (
                                  <span key={i} className={styles.chip}>
                                    {feat}
                                  </span>
                                ))}
                            </div>

                            {/* CTA (mobile-first position) */}
                            <div className={styles.mobileCta}>
                              <button
                                type="button"
                                className={styles.enquireBtn}
                                onClick={() =>
                                  document
                                    .getElementById("booking-form")
                                    ?.scrollIntoView({ behavior: "smooth" })
                                }
                              >
                                Enquire Now
                              </button>
                            </div>
                          </div>

                          {/* Right: Price */}
                          <div className={styles.roomPriceWrap}>
                            <span className={styles.priceLabel}>
                              Starting Price
                            </span>
                            <div className={styles.priceRow}>
                              <span className={styles.priceSymbol}>₹</span>
                              <span className={styles.priceValue}>
                                {formatINR(room.price)}
                              </span>
                              <span className={styles.priceUnit}>/ month</span>
                            </div>
                            {room.originalPrice && (
                              <div className={styles.strikeRow}>
                                <span className={styles.strike}>
                                  ₹{formatINR(room.originalPrice)}
                                </span>
                              </div>
                            )}
                            <button
                              type="button"
                              className={styles.enquireBtn}
                              onClick={() =>
                                document
                                  .getElementById("booking-form")
                                  ?.scrollIntoView({ behavior: "smooth" })
                              }
                            >
                              Enquire Now
                            </button>
                          </div>
                        </article>
                      ))}
                  </div>
                </div>
              </section>
              <section className={styles.locationSection}>
                <div className={styles.container}>
                  <div className={styles.roomsHeader}>
                    <div>
                      <h2 className={styles.sectionTitle}>Location</h2>
                      <p className={styles.sectionSubtitle}>
                        Stay connected to everything you need with a central
                        location
                      </p>
                    </div>
                  </div>
                  <LocationSection property={property} />
                </div>
              </section>
            </div>
            <div className={styles.rightContent}>
              <BookingForm property={property} roomTypes={enrichedPlans} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
