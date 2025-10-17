import React from "react";
import styles from "./PropertyPage.module.css";
import { Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import location from "../../assets/Location.svg";
import rating from "../../assets/star.svg";
import price from "../../assets/price.svg";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";
import propertyImage3 from "../../assets/propertyImage3.png";
import propertyImage4 from "../../assets/propertyImage4.png";
import propertyImage5 from "../../assets/propertyImage4.png";
import propertyImage6 from "../../assets/propertyImage4.png";
import BookingForm from "../../components/BookingForm/BookingForm";
import LocationSection from "../../components/LocationSection/LocationSection";

// Import Yet Another React Lightbox
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Updated propertyData with 6 images
const propertyData = {
  "covie-gurgaon-42-sector-44-gurgaon": {
    id: 1,
    name: "COVIE Gurgaon 42",
    locationSlug: "sector-44",
    propertySlug: "covie-gurgaon-42-sector-44-gurgaon",
    rating: 4.1,
    reviewCount: 25,
    images: [
      propertyImage1,
      propertyImage2,
      propertyImage3,
      propertyImage4,
      propertyImage5,
      propertyImage6,
    ],
    tags: ["Digital Nomads", "Entrepreneur"],
    startingPrice: 16000,
    roomTypes: [
      {
        id: 1,
        type: "Private Room",
        description: "Comfortable Private Room Designed for You",
        price: 32000,
        originalPrice: null,
        image: propertyImage1,
        features: [
          "Chair",
          "Closet/Drawers",
          "Desk/Workspace",
          "Essentials",
          "Heating",
          "Iron",
          "WiFi",
        ],
        availability: "Available",
        maxOccupancy: 1,
      },
      {
        id: 2,
        type: "Double Sharing",
        description:
          "Spacious Double Sharing Room for a Balanced Living Experience",
        price: 16000,
        originalPrice: null,
        image: propertyImage2,
        features: [
          "Chair",
          "Closet/Drawers",
          "Desk/Workspace",
          "Essentials",
          "Heating",
          "Iron",
          "WiFi",
        ],
        availability: "Available",
        maxOccupancy: 2,
      },
    ],
    about: `COVIE Gurgaon 42 is a co-living space offering fully furnished Standard and Deluxe rooms for students & working professionals. It is designed to inspire you to create and collaborate, all while aiming for you to be independent and secure. The co-living space boasts premium amenities including High-Speed Wifi, Nutritious Homemade Food, Smart TV, 24-hour Power Backup, a Washing Machine, a Refrigerator, Modern Kitchen, and a parking Space. Come and experience a new living style at COVIE from CoFynd.
    
    COVIE Gurgaon 42 is a co-living space offering fully furnished Standard and Deluxe rooms for students & working professionals. It is designed to inspire you to create and collaborate, all while aiming for you to be independent and secure. The co-living space boasts premium amenities including High-Speed Wifi, Nutritious Homemade Food, Smart TV, 24-hour Power Backup, a Washing Machine, a Refrigerator, Modern Kitchen, and a parking Space. Come and experience a new living style at COVIE from CoFynd.
    
    `,
    amenities: [
      { icon: "🍽️", label: "Hot & Delicious Meals", category: "Food" },
      { icon: "🧹", label: "Housekeeping", category: "Services" },
      { icon: "📶", label: "Wi Fi", category: "Technology" },
      { icon: "📺", label: "TV", category: "Entertainment" },
      { icon: "🔌", label: "Power Backup", category: "Utilities" },
      { icon: "🔒", label: "24x7 Security", category: "Safety" },
      { icon: "❄️", label: "Air Conditioning", category: "Comfort" },
      { icon: "📹", label: "CCTV", category: "Safety" },
      { icon: "🏠", label: "Fully Furnished", category: "Furniture" },
      { icon: "🚿", label: "Geyser", category: "Utilities" },
      { icon: "🅿️", label: "Parking", category: "Convenience" },
      { icon: "🎬", label: "Netflix/Amazon", category: "Entertainment" },
      { icon: "🍽️", label: "Dining Area", category: "Food" },
      { icon: "🧺", label: "Washing Machine", category: "Services" },
      { icon: "🏓", label: "Table Tennis", category: "Recreation" },
      { icon: "🧺", label: "Dryer", category: "Services" },
      { icon: "📿", label: "Almirah", category: "Storage" },
      { icon: "🏋️", label: "Gym/Fitness Studio", category: "Recreation" },
    ],
    location: {
      address: "Sector 44, Gurgaon",
      city: "Gurgaon",
      state: "Haryana",
      pincode: "122001",
      latitude: 28.466223,
      longitude: 77.092038,
      nearbyPlaces: [
        {
          name: "HUDA City Centre Metro",
          distance: "0.5 km",
          type: "Metro Station",
        },
        { name: "Cyber Hub", distance: "1.2 km", type: "IT Hub" },
        { name: "Ambience Mall", distance: "2.0 km", type: "Shopping" },
      ],
    },
    // ... rest of your property data
    propertyDetails: {
      buildingType: "Apartment",
      totalFloors: 8,
      totalRooms: 42,
      totalBeds: 84,
      establishedYear: 2019,
      propertyAge: "5 years",
      furnishingStatus: "Fully Furnished",
      depositAmount: 10000,
      maintenanceIncluded: true,
      electricityIncluded: true,
      internetIncluded: true,
    },
    seo: {
      title: "COVIE Gurgaon 42 - Premium Coliving Space in Sector 44",
      description:
        "Fully furnished coliving rooms in Gurgaon with modern amenities, high-speed WiFi, and 24x7 security. Perfect for professionals and students.",
      keywords: [
        "coliving gurgaon",
        "pg in sector 44",
        "furnished rooms gurgaon",
        "covie",
      ],
    },
    createdAt: "2024-01-15",
    updatedAt: "2024-09-10",
    status: "active",
    featured: true,
    verified: true,
  },
};

const PropertyPage = () => {
  const { citySlug, propertySlug } = useParams();
  const [cityData, setCityData] = useState(null);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const WORD_LIMIT = 80;
  const { isLong, previewText } = useMemo(() => {
    if (!property?.about) {
      return { isLong: false, previewText: "" };
    }

    // Normalize whitespace and split by words
    const words = property.about.trim().split(/\s+/);
    const long = words.length > WORD_LIMIT;

    // Join the first 80 words as preview
    const preview = long
      ? words.slice(0, WORD_LIMIT).join(" ")
      : property.about;

    return { isLong: long, previewText: preview };
  }, [property?.about]);
  // Constants for gallery display
  const MAX_THUMBNAILS = 4; // Show only 4 thumbnails

  // City name mapping
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
    fetchCityData(citySlug);
    fetchPropertyData(propertySlug);
  }, [citySlug, propertySlug]);

  const fetchCityData = (slug) => {
    setCityData({
      name: cityName,
      totalProperties: 150,
      averagePrice: 16000,
    });
  };

  const fetchPropertyData = (slug) => {
    setLoading(true);
    setTimeout(() => {
      const foundProperty = propertyData[slug];
      setProperty(foundProperty || null);
      setLoading(false);
    }, 300);
  };

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
        <div className={styles.container}>
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
        <div className={styles.container}>
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
        <div className={styles.container}>
          <div className={styles.imageGallery}>
            {/* Large Main Image - Always shows first image */}
            <div className={styles.largeImage} onClick={() => openLightbox(0)}>
              <img src={property.images[0]} alt="Property Main Image" />
              <div className={styles.viewAllPhotos}>
                View all {property.images.length} photos
              </div>
            </div>

            {/* Small Thumbnail Images - Show only 4 thumbnails */}
            <div className={styles.smallImages}>
              {thumbnailsToShow.map((img, index) => {
                const actualIndex = index + 1; // Since we're showing images 1-4
                const isLastThumbnail = index === thumbnailsToShow.length - 1;

                return (
                  <div
                    key={index}
                    className={`${styles.smallImage} ${
                      selectedImage === actualIndex ? styles.active : ""
                    } ${
                      isLastThumbnail && remainingImagesCount > 0
                        ? styles.lastThumbnail
                        : ""
                    }`}
                    onClick={() => handleThumbnailClick(actualIndex)}
                  >
                    <img src={img} alt={`Property Image ${actualIndex + 1}`} />

                    {/* Show +X more overlay on last thumbnail if there are more images */}
                    {isLastThumbnail && remainingImagesCount > 0 && (
                      <div className={styles.moreImagesOverlay}>
                        <span>+{remainingImagesCount} more</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Lightbox Component - Shows ALL images */}
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={property.images.map((img, index) => ({
              src: img,
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
        <div className={styles.container}>
          <div className={styles.contentGrid}>
            <div className={styles.leftContent}>
              <section className={styles.propertyAbout}>
                <div className={styles.propertyDescription}>
                  <p className={styles.descriptionText}>
                    {showFullDescription
                      ? property.about
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
                  <div className={styles.amenitiesGrid}>
                    {property.amenities.map((amenity, index) => (
                      <div key={index} className={styles.amenityItem}>
                        <span className={styles.amenityIcon}>
                          {amenity.icon}
                        </span>
                        <span className={styles.amenityLabel}>
                          {amenity.label}
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
                    {property.roomTypes.map((room) => (
                      <article
                        key={room.id}
                        className={styles.roomCard}
                        role="group"
                        aria-labelledby={`room-${room.id}-title`}
                      >
                        {/* Left: Image */}
                        <div className={styles.roomImage}>
                          <img
                            src={resolveRoomImage(room.image, property)}
                            alt={room.type}
                          />
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
                            {/* <div className={styles.availability}>
                              <span
                                className={
                                  room.availability === "Available"
                                    ? styles.available
                                    : styles.unavailable
                                }
                              >
                                {room.availability}
                              </span>
                              <span className={styles.occupancy}>
                                Max {room.maxOccupancy}{" "}
                                {room.maxOccupancy > 1 ? "people" : "person"}
                              </span>
                            </div> */}
                          </div>

                          <p className={styles.roomDescription}>
                            {room.description}
                          </p>

                          {/* Feature chips */}
                          <div className={styles.featureChips}>
                            {room.features.map((feat, i) => (
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
              <BookingForm property={property} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyPage;
