import { useState } from "react";
import styles from "./Home.module.css";
import location from "../../assets/Location.svg";
import HeroBanner1 from "../../assets/Hero-banner-1.png";
import HeroBanner2 from "../../assets/Hero-banner-2.png";
import HeroBanner3 from "../../assets/Hero-banner-3.png";
import HeroBanner4 from "../../assets/Hero-banner-4.png";
import selectIcon from "../../assets/select-icon.svg";
import submitIcon from "../../assets/submit-icon.svg";
import operatorIcon from "../../assets/operator-icon.svg";
import rating from "../../assets/star.svg";
import { Link } from "react-router-dom";
import propertyImage1 from "../../assets/propertyImage1.png";
import propertyImage2 from "../../assets/propertyImage2.png";
import monthlyBreakfast from "../../assets/monthly-breakfast.png";
import movieNights from "../../assets/movie-nights.png";
import sportsFitness from "../../assets/sports-fitness.png";
import communityEvents from "../../assets/community-events.png";
import communityImage from "../../assets/community-hero.png";
import userAvatar1 from "../../assets/ananya.png";
import userAvatar2 from "../../assets/ananya.png";
import userAvatar3 from "../../assets/ananya.png";
import userAvatar4 from "../../assets/ananya.png";
import userAvatar5 from "../../assets/ananya.png";
import userAvatar6 from "../../assets/ananya.png";
import reviewImage1 from "../../assets/review-image-1.png";
import reviewImage2 from "../../assets/review-image-2.png";

const Home = () => {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All");

  const FAQItem = ({ question, answer, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggleFAQ = () => {
      setIsOpen(!isOpen);
    };

    return (
      <div className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ""}`}>
        <button className={styles.faqQuestion} onClick={toggleFAQ}>
          <span>{question}</span>
          <svg
            className={`${styles.faqIcon} ${
              isOpen ? styles.faqIconRotated : ""
            }`}
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="#666666"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          className={`${styles.faqAnswer} ${
            isOpen ? styles.faqAnswerOpen : ""
          }`}
        >
          <div className={styles.faqAnswerContent}>
            <p>{answer}</p>
          </div>
        </div>
      </div>
    );
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchLocation);
  };

  // Location data with proper slug mapping
  const locations = [
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
  ];

  const properties = [
    {
      id: 1,
      name: "The Executive Center DLF Downtown",
      location: "Sector 44, Gurgaon",
      locationSlug: "sector-44", // Add location slug for linking
      rating: 4.1,
      price: 16000,
      image: propertyImage1,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 2,
      name: "Covie 108",
      location: "Medicity, Gurgaon",
      locationSlug: "medicity", // Add location slug
      rating: 4.1,
      price: 16000,
      image: propertyImage2,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 3,
      name: "COVIE Gurgaon 42",
      location: "Sector 44, Gurgaon",
      locationSlug: "sector-44",
      rating: 4.1,
      price: 16000,
      image: propertyImage1,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 4,
      name: "Covie 108",
      location: "Medicity, Gurgaon",
      locationSlug: "medicity",
      rating: 4.1,
      price: 16000,
      image: propertyImage2,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 5,
      name: "COVIE Gurgaon 42",
      location: "Sector 44, Gurgaon",
      locationSlug: "sector-44",
      rating: 4.1,
      price: 16000,
      image: propertyImage1,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 6,
      name: "Covie 108",
      location: "Medicity, Gurgaon",
      locationSlug: "medicity",
      rating: 4.1,
      price: 16000,
      image: propertyImage2,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 7,
      name: "COVIE Gurgaon 42",
      location: "Sector 44, Gurgaon",
      locationSlug: "sector-44",
      rating: 4.1,
      price: 16000,
      image: propertyImage1,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
    {
      id: 8,
      name: "Covie 108",
      location: "Medicity, Gurgaon",
      locationSlug: "medicity",
      rating: 4.1,
      price: 16000,
      image: propertyImage2,
      tags: ["Digital Nomads", "Entrepreneur"],
    },
  ];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          {/* Main Heading */}
          <div className={styles.titleSection}>
            <h1 className={styles.mainTitle}>
              Coliving Space in{" "}
              <span className={styles.locationHighlight}>Gurgaon</span>
            </h1>
            <p className={styles.subtitle}>
              Find your perfect coliving home with fully furnished private or
              shared rooms in modern shared suites.
            </p>
          </div>

          {/* Search Section */}
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <div className={styles.searchContainer}>
              <div className={styles.inputWrapper}>
                <div className={styles.locationIcon}>
                  <img src={location} />
                </div>
                <span>Location</span>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder="Where do you want your co-living space?"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </div>
          </form>

          {/* Property Images Grid */}
          <div className={styles.propertyGrid}>
            <div className={`${styles.propertyCard} ${styles.card1}`}>
              <img src={HeroBanner1} alt="Coliving workspace" />
            </div>
            <div className={`${styles.propertyCard} ${styles.card2}`}>
              <img src={HeroBanner2} alt="Private bedroom" />
            </div>
            <div className={`${styles.propertyCard} ${styles.card3}`}>
              <img src={HeroBanner3} alt="Common dining area" />
            </div>
            <div className={`${styles.propertyCard} ${styles.card4}`}>
              <img src={HeroBanner4} alt="Modern bedroom" />
            </div>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className={styles.processSection}>
        <div className={styles.container}>
          <div className={styles.processGrid}>
            {/* Step 1 */}
            <div className={styles.processCard}>
              <div className={styles.processIcon}>
                <img src={selectIcon} alt="Select space icon" />
              </div>
              <div className={styles.processContent}>
                <h3 className={styles.processTitle}>
                  Select your preferred coliving space
                </h3>
                <p className={styles.processDescription}>
                  Browse from a wide range of fully furnished shared and private
                  rooms tailored to your needs.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className={styles.processCard}>
              <div className={styles.processIcon}>
                <img src={submitIcon} alt="Submit enquiry icon" />
              </div>
              <div className={styles.processContent}>
                <h3 className={styles.processTitle}>
                  Submit your enquiry with ease
                </h3>
                <p className={styles.processDescription}>
                  Simply share your details and requirements through our quick
                  enquiry form.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className={styles.processCard}>
              <div className={styles.processIcon}>
                <img src={operatorIcon} alt="Operator icon" />
              </div>
              <div className={styles.processContent}>
                <h3 className={styles.processTitle}>
                  Our verified operator will connect with you
                </h3>
                <p className={styles.processDescription}>
                  A trusted operator will reach out to assist you with
                  availability, pricing, and bookings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Coliving Spaces Section */}
      <section className={styles.spacesSection}>
        <div className={styles.container}>
          {/* Section Header */}
          <div className={styles.spacesHeader}>
            <div className={styles.spacesTitle}>
              <h2>Explore Coliving Spaces in Gurgaon</h2>
              <p>
                Fully furnished spaces designed for comfort, community, and
                convenience in Gurgaon
              </p>
            </div>
            <Link to="/coliving/gurugram" className={styles.exploreBtn}>
              Explore Gurgaon Spaces
            </Link>
          </div>

          {/* Location Filters - Updated with proper micro-location links */}
          <div className={styles.locationFilters}>
            {locations.map((location, index) => (
              <Link
                key={index}
                to={`/coliving/gurugram/${location.slug}`}
                className={`${styles.locationTag} ${
                  selectedLocation === location.name ? styles.active : ""
                }`}
                onClick={() => setSelectedLocation(location.name)}
              >
                {location.name}
              </Link>
            ))}
          </div>

          {/* Properties Grid - Updated with proper property links */}
          <div className={styles.propertiesGrid}>
            {properties.map((property) => (
              <Link
                key={property.id}
                to={`/property/${property.id}`}
                className={styles.propertyCard}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className={styles.propertyImage}>
                  <img src={property.image} alt={property.name} />
                  <div className={styles.rating}>
                    <span>
                      <img src={rating} alt="rating" />
                    </span>
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
                    <button
                      className={styles.enquireBtn}
                      onClick={(e) => {
                        e.preventDefault(); // Prevent link navigation
                        e.stopPropagation();
                        // Handle enquiry logic here
                        console.log(`Enquiry for property ${property.id}`);
                      }}
                    >
                      Enquire Now
                    </button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* View More Button */}
          <div className={styles.viewMoreContainer}>
            <Link to="/coliving/gurugram" className={styles.viewMoreBtn}>
              View More Spaces
            </Link>
          </div>
        </div>
      </section>
      {/* Amenities Section */}
      <section className={styles.amenitiesSection}>
        <div className={styles.container}>
          {/* Section Header */}
          <div className={styles.amenitiesHeader}>
            <h2 className={styles.amenitiesTitle}>
              Amenities That Go Beyond Living
            </h2>
            <p className={styles.amenitiesSubtitle}>
              From movie nights to fitness sessions, enjoy curated experiences
              that bring people together.
            </p>
          </div>

          {/* Amenities Grid */}
          <div className={styles.amenitiesGrid}>
            <div className={styles.amenityCard}>
              <div className={styles.amenityImage}>
                <img src={monthlyBreakfast} alt="Monthly Breakfast" />
              </div>
              <div className={styles.amenityContent}>
                <h3 className={styles.amenityTitle}>Monthly Breakfast</h3>
                <p className={styles.amenityDescription}>
                  Kickstart every month with fresh food, open conversations, and
                  laughter over hot parathas, fruits, and morning chai.
                </p>
              </div>
            </div>

            <div className={styles.amenityCard}>
              <div className={styles.amenityImage}>
                <img src={movieNights} alt="Movie Nights" />
              </div>
              <div className={styles.amenityContent}>
                <h3 className={styles.amenityTitle}>Movie Nights</h3>
                <p className={styles.amenityDescription}>
                  From cult classics to new releases movies, enjoy a cozy cinema
                  setup with popcorn and your fellow colivers.
                </p>
              </div>
            </div>

            <div className={styles.amenityCard}>
              <div className={styles.amenityImage}>
                <img src={sportsFitness} alt="Sports & Fitness" />
              </div>
              <div className={styles.amenityContent}>
                <h3 className={styles.amenityTitle}>Sports & Fitness</h3>
                <p className={styles.amenityDescription}>
                  Join weekend cricket matches, yoga mornings, or late-night
                  party whatever keeps your body active and spirit energized.
                </p>
              </div>
            </div>

            <div className={styles.amenityCard}>
              <div className={styles.amenityImage}>
                <img src={communityEvents} alt="Community Events" />
              </div>
              <div className={styles.amenityContent}>
                <h3 className={styles.amenityTitle}>Community Events</h3>
                <p className={styles.amenityDescription}>
                  Celebrate birthdays, festivals, or just Friday evenings. These
                  gatherings turn strangers into roommates, and into friends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Community Section */}
      <section className={styles.communitySection}>
        <div className={styles.container}>
          <div className={styles.communityGrid}>
            {/* Left Content */}
            <div className={styles.communityContent}>
              <h2 className={styles.communityTitle}>
                Find Your Community, Away From Home
              </h2>
              <p className={styles.communityDescription}>
                In Gurgaon, enjoy access to thoughtfully designed community
                spaces where you can relax, work, or socialize. Take part in
                weekly gatherings that bring residents together over shared
                interests, from movie nights to networking sessions. Stay
                connected through our thriving online community, making it easy
                to meet like-minded people, build lasting friendships, and
                create a strong support system that feels like family—right here
                in the city.
              </p>
              <Link to="/coliving/gurugram" className={styles.joinBtn}>
                Join Us Coliving Spaces
              </Link>
            </div>
            {/* Right Image */}
            <div className={styles.communityImageContainer}>
              <img src={communityImage} alt="Community members connecting" />
            </div>
          </div>
        </div>
      </section>
      {/* Reviews Section */}
      <section className={styles.reviewsSection}>
        <div className={styles.container}>
          {/* Section Header */}
          <div className={styles.reviewsHeader}>
            <h2 className={styles.reviewsTitle}>
              What <span className={styles.highlight}>People Say</span> About
              Us?
            </h2>
            <p className={styles.reviewsSubtitle}>
              Hear from the people who've lived the Vista experience, where
              community, comfort, and connection come together.
            </p>
          </div>

          {/* First Row of Reviews */}
          <div className={styles.reviewsRow}>
            <div className={styles.scrollableContainer}>
              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "Vista Urban Living made moving to a new city feel effortless.
                  The rooms are beautifully designed, but what really stands out
                  is the warmth of the people here. From weekend meetups to
                  shared meals, it truly feels like a home — not just a rental."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar1}
                    alt="Ananya Rathi"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Ananya Rathi</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "I was nervous about coliving, but Vista changed my
                  perspective completely. The common areas are lively yet
                  peaceful, and the events are a great way to meet new people.
                  I've formed genuine friendships here that I wouldn't have
                  found living alone."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar2}
                    alt="Kunal Mehra"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Kunal Mehra</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.reviewCardWithImage}>
                <div className={styles.reviewImageContainer}>
                  <img src={reviewImage1} alt="Community interaction" />
                </div>
              </div>
              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "Vista feels like a very peaceful coliving space escape from
                  the city. Everything from cleanliness to security is
                  top-notch. I wish there were more locations like this. Whether
                  you're new to Gurugram or just want better living — this is
                  it."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar4}
                    alt="Farhan Ali"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Farhan Ali</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "Relocating for work was stressful, but Vista made it
                  seamless. I had Wi-Fi, a work desk, and even casual networking
                  events within the community. It's more than coliving — it's
                  where I found motivation, comfort, and like-minded people
                  under one roof."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar3}
                    alt="Siddharth Desai"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Siddharth Desai</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row of Reviews */}
          <div className={styles.reviewsRow}>
            <div className={styles.scrollableContainer}>
              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "Vista feels like a very peaceful coliving space escape from
                  the city. Everything from cleanliness to security is
                  top-notch. I wish there were more locations like this. Whether
                  you're new to Gurugram or just want better living — this is
                  it."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar4}
                    alt="Farhan Ali"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Farhan Ali</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "Vista feels like a very peaceful coliving space escape from
                  the city. Everything from cleanliness to security is
                  top-notch. I wish there were more locations like this. Whether
                  you're new to Gurugram or just want better living — this is
                  it."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar4}
                    alt="Farhan Ali"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Farhan Ali</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.reviewCardWithImage}>
                <div className={styles.reviewImageContainer}>
                  <img src={reviewImage2} alt="Relaxing together" />
                </div>
              </div>

              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "What stood out to me was the balance between personal space
                  and shared energy. You can chill alone or join in game nights
                  and rooftop dinners. I've grown both socially and personally
                  here — Vista isn't just accommodation, it's an experience."
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar5}
                    alt="Naveen Joshi"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Naveen Joshi</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.reviewCard}>
                <p className={styles.reviewText}>
                  "The attention to detail at Vista is amazing — from the
                  interior aesthetic to how thoughtfully they build community. I
                  moved in not knowing anyone and now I'm surrounded by friends,
                  support, and daily joy. Highly recommended for remote workers
                  and creatives!"
                </p>
                <div className={styles.reviewerInfo}>
                  <img
                    src={userAvatar6}
                    alt="Priyanka Sharma"
                    className={styles.avatar}
                  />
                  <div className={styles.reviewerDetails}>
                    <h4 className={styles.reviewerName}>Priyanka Sharma</h4>
                    <div className={styles.reviewrating}>
                      <span>⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <div className={styles.faqGrid}>
            {/* Left Content */}
            <div className={styles.faqContent}>
              <h2 className={styles.faqTitle}>
                Frequently Asked Questions (FAQ)
              </h2>
              <p className={styles.faqDescription}>
                From bookings to community living — here are answers to the most
                common things people ask about Vista Urban Living.
              </p>
              <Link to="/contact" className={styles.contactBtn}>
                Contact Us
              </Link>
            </div>

            {/* Right FAQ Accordion */}
            <div className={styles.faqAccordion}>
              <FAQItem
                question="What are the popular locations for co-living in Gurgaon?"
                answer="Some of the most in-demand areas include Cyber City, Udyog Vihar, Golf Course Road, Sohna Road, DLF Phases 1-5, and sectors like 38, 45, 46, 47, and 52. These locations are preferred due to their proximity to office hubs, metro connectivity, and lifestyle amenities."
                defaultOpen={true}
              />

              <FAQItem
                question="What is included in the rent for a Gurgaon co-living space?"
                answer="Our co-living spaces include fully furnished rooms, high-speed Wi-Fi, housekeeping services, utilities (electricity, water), security, common area access, and community events. Some locations also include meals and laundry services."
              />

              <FAQItem
                question="What is the average rent for a co-living space in Gurgaon?"
                answer="Rent typically ranges from ₹12,000 to ₹25,000 per month depending on the location, room type (shared or private), and amenities included. Premium locations like Golf Course Road tend to be on the higher end."
              />

              <FAQItem
                question="Are meals included in Gurgaon co-living spaces?"
                answer="Meal inclusion varies by property. Some spaces offer optional meal plans, while others have fully equipped kitchens for self-cooking. We also organize monthly community breakfasts and social dining events."
              />

              <FAQItem
                question="Is there flexibility in lease terms?"
                answer="Yes, we offer flexible lease terms ranging from 1 month to 12+ months. We understand that work and life situations change, so we provide options for early termination with reasonable notice periods."
              />

              <FAQItem
                question="How safe are co-living spaces in Gurgaon?"
                answer="Safety is our top priority. All properties have 24/7 security, CCTV monitoring, secure entry systems, and background-verified residents. We also have on-site support staff and emergency protocols in place."
              />

              <FAQItem
                question="What kind of community activities can I expect?"
                answer="We organize movie nights, fitness sessions, networking events, monthly breakfasts, festival celebrations, skill workshops, and weekend outings. Activities are designed to build connections and create a vibrant community atmosphere."
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;
