// src/admin/Properties/PropertyAdd.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "./PropertyAdd.module.css";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://coliving-gurgaon-backend.onrender.com";

export default function PropertyAdd({ goBack, editId }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [spaceType, setSpaceType] = useState("co-living");
  const [tags, setTags] = useState([]);
  const [tagText, setTagText] = useState("");
  const [status, setStatus] = useState("pending"); // NEW
  const [featured, setFeatured] = useState(false); // NEWeditIdeditId
  const [verified, setVerified] = useState(false); // NEW
  const [startingPrice, setStartingPrice] = useState(""); // NEW (optional)
  const [rating, setRating] = useState(""); // NEW
  const [reviewCount, setReviewCount] = useState(""); // NEW
  const [states, setStates] = useState([]);

  const commitTags = () => {
    const pieces = tagText
      .split(/[,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (pieces.length) {
      setTags((prev) => Array.from(new Set([...prev, ...pieces])));
      setTagText("");
    }
  };

  // contact
  const [contact, setContact] = useState({
    name: "",
    email: "",
    phone: "",
    show_on_website: true,
  });

  // location
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [cityId, setCityId] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [countryVal, setCountryVal] = useState("India");
  const [stateVal, setStateVal] = useState("");
  const [micro, setMicro] = useState("");
  const [isNearMetro, setIsNearMetro] = useState(false);
  const [metroStation, setMetroStation] = useState("");
  const [metroDistance, setMetroDistance] = useState("");
  const [nearby, setNearby] = useState([]);

  const INDIAN_STATES = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",
    "Delhi",
    "Jammu and Kashmir",
    "Ladakh",
    "Puducherry",
    "Chandigarh",
    "Andaman and Nicobar Islands",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Lakshadweep",
  ];

  // dynamic selects
  const [cities, setCities] = useState([]);
  const [microOptions, setMicroOptions] = useState([]);
  const [amenityOptions, setAmenityOptions] = useState([]);
  const [planOptions, setPlanOptions] = useState([]);

 const adaptCities = (raw) => {
  const list = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw)
    ? raw
    : raw?.data?.data || [];
  
  return list
    .map((c) => ({
      id: c._id || c.id || c.city_id,
      name: c.displayCity || c.name || c.city,
      slug: c.city || c.slug || c.city_slug,
      // Extract state from populated object
      state: c.state?.displayState || c.state?.state || c.state_name || c.state || "",
      stateId: c.state?._id || null,
    }))
    .filter((x) => x.id && x.name);
};

  const adaptMicros = (raw) => {
    const list = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
      ? raw
      : raw?.data?.data || [];
    return list
      .map((m) => ({
        id: m._id || m.id,
        name: m.name || m.slug,
        slug: m.slug || "",
      }))
      .filter((x) => x.id && x.name);
  };

  // selections
  const [amenities, setAmenities] = useState([]);
  const [planPrices, setPlanPrices] = useState([]); // [{plan, price, duration}]

  // seo (extended)
  const [seo, setSeo] = useState({
    status: true,
    title: "",
    description: "",
    keywords: [],
    robots: "index, follow",
    twitter: { image: "", title: "", description: "" },
    open_graph: { image: "", title: "", description: "" },
  });

  // images
  const [imageList, setImageList] = useState([]);
  const [files, setFiles] = useState([]);

  const handleFilesChange = (e) => {
    const list = e.target.files || [];
    const newFiles = Array.from(list);

    // Add new files to imageList with default values
    const newImages = newFiles.map((file, index) => ({
      id: Date.now() + index, // temp id for new files
      file: file,
      url: URL.createObjectURL(file),
      name: file.name,
      alt: file.name, // default alt to filename
      order: imageList.length + index,
      isNew: true, // flag for new files
    }));

    setImageList([...imageList, ...newImages]);

    // Keep existing files array for form submission
    setFiles([...files, ...newFiles]);
  };

  const ItemType = "PROPERTY_IMAGE";

  const DraggableImageRow = ({
    image,
    index,
    moveImage,
    handleRemove,
    handleUpdate,
  }) => {
    const ref = useRef(null);

    const [, drop] = useDrop({
      accept: ItemType,
      hover(item) {
        if (item.index !== index) {
          moveImage(item.index, index);
          item.index = index;
        }
      },
    });

    const [{ isDragging }, drag] = useDrag({
      type: ItemType,
      item: { index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    });

    drag(drop(ref));

    return (
      <tr ref={ref} style={{ opacity: isDragging ? 0.5 : 1 }}>
        <td style={{ textAlign: "center" }}>{index + 1}</td>
        <td>
          <img
            src={image.url}
            alt={image.alt}
            style={{
              width: 80,
              height: 60,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        </td>
        <td>
          <input
            type="text"
            value={image.name}
            onChange={(e) => handleUpdate(image.id, "name", e.target.value)}
            className={styles.input}
            style={{ minWidth: 200 }}
          />
        </td>
        <td>
          <input
            type="text"
            value={image.alt}
            onChange={(e) => handleUpdate(image.id, "alt", e.target.value)}
            className={styles.input}
            style={{ minWidth: 200 }}
            placeholder="Enter alt text"
          />
        </td>
        <td>
          <button
            type="button"
            className={styles.deleteButton}
            onClick={() => handleRemove(image.id)}
          >
            Delete
          </button>
        </td>
      </tr>
    );
  };

  const moveImage = useCallback(
    (fromIndex, toIndex) => {
      const updatedList = [...imageList];
      const [moved] = updatedList.splice(fromIndex, 1);
      updatedList.splice(toIndex, 0, moved);

      // Update order values
      const reorderedList = updatedList.map((img, idx) => ({
        ...img,
        order: idx,
      }));

      setImageList(reorderedList);
    },
    [imageList]
  );

  // Update image properties (name, alt)
  const handleImageUpdate = (imageId, field, value) => {
    setImageList((prev) =>
      prev.map((img) => (img.id === imageId ? { ...img, [field]: value } : img))
    );
  };

  const handleImageRemove = (imageId) => {
    setImageList((prev) => {
      const filtered = prev.filter((img) => img.id !== imageId);

      // Clean up object URLs for removed images
      const removed = prev.find((img) => img.id === imageId);
      if (removed && removed.url.startsWith("blob:")) {
        URL.revokeObjectURL(removed.url);
      }

      // Update files array for form submission
      const remainingFiles = filtered
        .filter((img) => img.isNew && img.file)
        .map((img) => img.file);
      setFiles(remainingFiles);

      return filtered;
    });
  };

  useEffect(() => {
  const loadStates = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/states?enabled=true`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log('✅ States loaded:', list);
      setStates(list);
    } catch (e) {
      console.error('❌ Failed to load states:', e);
      setStates([]);
    }
  };
  loadStates();
}, []);


useEffect(() => {
  const loadCities = async () => {
    try {
      // Build URL with state filter and all=true to populate state
      const url = stateVal 
        ? `${API_BASE}/api/cities?state=${encodeURIComponent(stateVal)}&all=true`
        : `${API_BASE}/api/cities?all=true`;
      
      console.log('🔄 Fetching cities:', url);
      const res = await axios.get(url);
      
      console.log('📦 Raw cities response:', res.data);
      
      const adapted = adaptCities(res.data || res);
      console.log('✅ Adapted cities:', adapted);
      
      setCities(adapted);
      
      if (adapted.length) {
        setCityId(adapted[0].id);
        setCitySlug(adapted[0].slug || "");
      } else {
        setCityId("");
        setCitySlug("");
      }
    } catch (e) {
      console.error('❌ Error loading cities:', e);
      setCities([]);
    }
  };
  
  loadCities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [stateVal]); // Re-fetch when state changes



  useEffect(() => {
    const loadMicros = async () => {
      if (!citySlug && !cityId) {
        setMicroOptions([]);
        return;
      }

      try {
        // Use city-scoped route like MicrolocationContent
        const res = await axios.get(
          `${API_BASE}/api/microlocations/${encodeURIComponent(
            citySlug || cityId
          )}`
        );
        setMicroOptions(adaptMicros(res.data || res));
      } catch (e) {
        console.error(e);
        setMicroOptions([]);
      }
    };

    loadMicros();
  }, [citySlug, cityId]);

  const onCityChange = (e) => {
    const id = e.target.value;
    setCityId(id);
    const meta = cities.find((c) => String(c.id) === String(id));
    setCitySlug(meta?.slug);
    if (meta?.state) setStateVal(meta.state);
    setMicro(""); // clear previous selection when city changes
  };

  useEffect(() => {
    if (!micro && microOptions.length) {
      setMicro(microOptions[0].id);
    }
  }, [microOptions, micro]);

  const adaptAmenities = (raw) => {
    const list = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
      ? raw
      : raw?.data?.data || [];
    return list
      .filter((a) => a && a.enabled !== false)
      .map((a) => ({
        id: String(a._id ?? a.id),
        name: a.name || "",
        icon: a.icon || null,
      }));
  };

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/amenities?all=true`);
        setAmenityOptions(adaptAmenities(res.data || res));
      } catch (e) {
        console.error("Failed to load amenities:", e);
        setAmenityOptions([]);
      }
    };
    loadAmenities();
  }, []);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/plans?all=true`);
        const list = res.data?.data ?? res.data ?? [];

        // Only show enabled plans
        const enabledPlans = Array.isArray(list)
          ? list.filter((p) => p && p.enabled !== false)
          : [];

        setPlanOptions(enabledPlans);
      } catch (e) {
        console.error("Failed to load plans:", e);
        setPlanOptions([]);
      }
    };

    loadPlans();
  }, []);

  // dynamic rows
  const addPlanPrice = () =>
    setPlanPrices((a) => [...a, { plan: "", price: "", duration: "month" }]);
  const updatePlanPrice = (i, patch) =>
    setPlanPrices((a) =>
      a.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
    );
  const removePlanPrice = (i) =>
    setPlanPrices((a) => a.filter((_, idx) => idx !== i));

  const addNearby = () =>
    setNearby((a) => [...a, { name: "", distance: "", type: "" }]); // NEW
  const updateNearby = (i, patch) =>
    setNearby((a) =>
      a.map((row, idx) => (idx === i ? { ...row, ...patch } : row))
    ); // NEW
  const removeNearby = (i) => setNearby((a) => a.filter((_, idx) => idx !== i)); // NEW

  // other details
  const [other, setOther] = useState({
    breakfast: { is_include: false, price: "" },
    lunch: { is_include: false, price: "" },
    dinner: { is_include: false, price: "" },
    is_electricity_bill_included: false,
    beds: "",
    rent_per_bed: "",
    food_and_beverage: "",
    type_of_co_living: "",
  });

  const onSubmit = async () => {
    if (!name.trim() || !slug.trim()) {
      alert("Please provide name and slug");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      // 1) Build the full payload FIRST
      const location = {
        address,
        latitude: latitude !== "" ? Number(latitude) : undefined,
        longitude: longitude !== "" ? Number(longitude) : undefined,
        city: cityId || undefined,
        state: stateVal || "",
        country: countryVal || "",
        micro_locations: micro ? [micro] : [],
        location_slug: slug,
        metro_detail: {
          is_near_metro: !!isNearMetro,
          station_name: metroStation,
          distance_km: metroDistance ? Number(metroDistance) : 0,
        },
        nearby_places: nearby
          .filter((n) => n.name || n.distance || n.type)
          .map((n) => ({
            name: n.name || "",
            distance: n.distance || "",
            type: n.type || "",
          })),
      };

      const fd = new FormData();
      fd.append("name", name.trim());
      fd.append("slug", slug.trim());
      fd.append("space_type", spaceType);
      if (startingPrice)
        fd.append("startingPrice", String(Number(startingPrice)));
      if (rating) fd.append("rating", String(Number(rating)));
      if (reviewCount) fd.append("reviewCount", String(Number(reviewCount)));
      fd.append("status", status);
      fd.append("featured", String(!!featured));
      fd.append("verified", String(!!verified));
      fd.append("tags", JSON.stringify(tags.filter(Boolean)));
      fd.append("space_contact_details", JSON.stringify(contact));
      fd.append("location", JSON.stringify(location));
      fd.append("amenities", JSON.stringify(amenities));
      fd.append(
        "coliving_plans",
        JSON.stringify(
          planPrices
            .filter((r) => r.plan && r.price)
            .map((r) => ({
              plan: r.plan,
              price: Number(r.price),
              duration: r.duration || "month",
            }))
        )
      );

      // SEO + Other details BEFORE submit
      const seoPayload = {
        status: !!seo.status,
        title: seo.title || "",
        description: seo.description || "",
        keywords: (seo.keywords || []).filter(Boolean),
        robots: seo.robots || "index, follow",
        twitter: {
          image: seo.twitter?.image || "",
          title: seo.twitter?.title || "",
          description: seo.twitter?.description || "",
        },
        open_graph: {
          image: seo.open_graph?.image || "",
          title: seo.open_graph?.title || "",
          description: seo.open_graph?.description || "",
        },
      };
      fd.append("seo", JSON.stringify(seoPayload));

      const otherPayload = {
        breakfast: {
          is_include: !!other.breakfast.is_include,
          price: Number(other.breakfast.price || 0),
        },
        lunch: {
          is_include: !!other.lunch.is_include,
          price: Number(other.lunch.price || 0),
        },
        dinner: {
          is_include: !!other.dinner.is_include,
          price: Number(other.dinner.price || 0),
        },
        is_electricity_bill_included: !!other.is_electricity_bill_included,
        beds: Number(other.beds || 0),
        rent_per_bed: Number(other.rent_per_bed || 0),
        food_and_beverage: other.food_and_beverage || "",
        type_of_co_living: other.type_of_co_living || "",
      };
      fd.append("other_detail", JSON.stringify(otherPayload));

      // Description
      fd.append("description", description || "");

      // Images
      imageList.forEach((img, index) => {
        if (img.file) {
          fd.append("images", img.file);
          // optional meta (server currently ignores this field)
          fd.append(
            "imageData",
            JSON.stringify({
              originalName: img.file.name,
              alt: img.alt,
              order: index,
            })
          );
        }
      });

      if (editId) {
        // PUT /api/properties/:id for edit
        await axios.put(`${API_BASE}/api/properties/${editId}`, fd);
      } else {
        // POST /api/properties for create
        await axios.post(`${API_BASE}/api/properties`, fd);
      }

      // 3) Navigate back and STOP
      if (goBack) goBack();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.status === 409 ? "Duplicate name or slug" : "") ||
        "Failed to create property";
      setErr(msg);
    } finally {
      setLoading(false);
    }

    console.log("PropertyAdd submit:", { editId, isEdit: !!editId });
    console.log("Will call:", editId ? "PUT" : "POST");
  };

  useEffect(() => {
    if (!cityId || !cities.length) return;
    const meta = cities.find((c) => String(c.id) === String(cityId));
    setCitySlug(meta?.slug || "");
    if (meta?.state && !stateVal) setStateVal(meta.state);
  }, [cities, cityId]);

  const isEdit = !!editId;

  useEffect(() => {
    const nums = planPrices
      .map((r) => Number(r.price))
      .filter((n) => Number.isFinite(n) && n > 0);
    if (nums.length) {
      const min = Math.min(...nums);
      setStartingPrice(String(min));
    } else {
      setStartingPrice(""); // clear if no valid prices
    }
  }, [planPrices]);

  useEffect(() => {
    if (!editId) {
      return;
    }
    const load = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_BASE}/api/properties/${editId}`);
        const d = res.data?.data || {};
        // Basics
        setName(d.name || "");
        setSlug(d.slug || "");
        setDescription(d.description || "");
        setSpaceType(d.space_type || "co-living");
        setTags(Array.isArray(d.tags) ? d.tags : []);
        setStatus(d.status || "pending");
        setFeatured(!!d.featured);
        setVerified(!!d.verified);
        setStartingPrice(d.startingPrice ? String(d.startingPrice) : "");
        setRating(d.rating ? String(d.rating) : "");
        setReviewCount(d.reviewCount ? String(d.reviewCount) : "");
        // Contact
        const c = d.space_contact_details || {};
        setContact({
          name: c.name || "",
          email: c.email || "",
          phone: c.phone || "",
          show_on_website: c.show_on_website !== false,
        });

        // Location
        const loc = d.location || {};
        setAddress(loc.address || "");
        setLatitude(
          typeof loc.latitude === "number" ? String(loc.latitude) : ""
        );
        setLongitude(
          typeof loc.longitude === "number" ? String(loc.longitude) : ""
        );
        // City could be object {_id,name,slug} or raw id/string
        const cityVal = loc.city;
        const cityIdStr =
          cityVal && typeof cityVal === "object"
            ? String(cityVal._id)
            : cityVal
            ? String(cityVal)
            : "";
        setCityId(cityIdStr);
        setStateVal(loc.state || "");
        setCountryVal(loc.country || "India");

        // Metro
        const md = loc.metro_detail || {};
        setIsNearMetro(!!md.is_near_metro);
        setMetroStation(md.station_name || "");
        setMetroDistance(
          typeof md.distance_km === "number" ? String(md.distance_km) : ""
        );

        // Nearby
        setNearby(Array.isArray(loc.nearby_places) ? loc.nearby_places : []);

        // Micro (single select)
        const micros = Array.isArray(loc.micro_locations)
          ? loc.micro_locations
          : [];
        const firstMicro = micros.length
          ? String(typeof micros[0] === "object" ? micros[0]._id : micros[0])
          : "";
        setMicro(firstMicro);

        // Amenities
        const amen = Array.isArray(d.amenities)
          ? d.amenities.map((x) => String(typeof x === "object" ? x._id : x))
          : [];
        setAmenities(amen);

        // Plans
        const plans = Array.isArray(d.coliving_plans)
          ? d.coliving_plans.map((p) => ({
              plan: p.plan
                ? String(typeof p.plan === "object" ? p.plan._id : p.plan)
                : "",
              price: typeof p.price === "number" ? String(p.price) : "",
              duration: p.duration || "month",
            }))
          : [];
        setPlanPrices(plans);

        // SEO
        const seoObj = {
          status: !!d.seo?.status,
          title: d.seo?.title || "",
          description: d.seo?.description || "",
          keywords: Array.isArray(d.seo?.keywords) ? d.seo.keywords : [],
          robots: d.seo?.robots || "index, follow",
          twitter: {
            image: d.seo?.twitter?.image || "",
            title: d.seo?.twitter?.title || "",
            description: d.seo?.twitter?.description || "",
          },
          open_graph: {
            image: d.seo?.open_graph?.image || "",
            title: d.seo?.open_graph?.title || "",
            description: d.seo?.open_graph?.description || "",
          },
        };
        setSeo(seoObj);

        // Images
        const imgs = Array.isArray(d.images) ? d.images : [];
        const mapped = imgs
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((img) => ({
            id: String(img._id),
            file: null,
            url: img.secureUrl,
            name: (img.publicId || "").split("/").pop() || "image",
            alt: img.alt || "",
            order: img.order || 0,
            isNew: false,
          }));
        setImageList(mapped);
      } catch (e) {
        console.error("[PropertyAdd] load error:", e?.response?.data || e);
        setErr("Failed to load property for edit");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [editId]);

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.toolbar}>
        <h2 className={styles.heading}>Add Coliving Property</h2>
        <div className={styles.toolbar}>
          <button
            className={styles.cancelButton}
            onClick={goBack}
            disabled={loading}
          >
            Back
          </button>
          <button
            className={styles.addButton}
            onClick={onSubmit}
            disabled={loading}
          >
            Save Property
          </button>
        </div>
      </div>

      {err && <div className={styles.error}>{err}</div>}

      <div className={styles.contentWrapper}>
        {/* Basics */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>Basics</h3>
          <label className={styles.labelRow}>
            <span>Name</span>
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <label className={styles.labelRow}>
            <span>Slug</span>
            <input
              className={styles.input}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </label>
          <label className={styles.labelRow}>
            <span>Description</span>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter detailed description of the property..."
            />
          </label>

          <div className={styles.grid3}>
            <label className={styles.labelRow}>
              <span>Space Type</span>
              <select
                className={styles.input}
                value={spaceType}
                onChange={(e) => setSpaceType(e.target.value)}
              >
                <option value="co-living">co-living</option>
                <option value="co-working">co-working</option>
              </select>
            </label>
            <label className={styles.labelRow}>
              <span>Tags</span>
              <input
                className={styles.input}
                value={tagText}
                onChange={(e) => setTagText(e.target.value)}
                onKeyDown={(e) => {
                  // Enter always commits
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitTags();
                    return;
                  }
                  // Comma commits
                  if (e.key === ",") {
                    e.preventDefault();
                    commitTags();
                    return;
                  }
                  // Space commits only with Ctrl/Cmd (to allow two-word tags)
                  if (e.key === " " && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    commitTags();
                    return;
                  }
                }}
                onBlur={() => {
                  // Commit on blur only if the user ended with a comma (optional)
                  if (/,/.test(tagText)) commitTags();
                }}
                placeholder="Type tag; press Enter"
              />
            </label>

            {/* show current tags */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              {tags.map((t) => (
                <span key={t} className={styles.tagPill}>
                  {t}
                  <button
                    type="button"
                    onClick={() =>
                      setTags((prev) => prev.filter((x) => x !== t))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>

            <label className={styles.labelRow}>
              <span>Rating</span>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                className={styles.input}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
              />
            </label>
          </div>
          <div className={styles.grid2}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
              />{" "}
              Featured
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={verified}
                onChange={(e) => setVerified(e.target.checked)}
              />{" "}
              Verified
            </label>
          </div>
        </section>

        {/* Contact */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>Space Contact Details</h3>
          <label className={styles.labelRow}>
            <span>Name</span>
            <input
              className={styles.input}
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
            />
          </label>
          <label className={styles.labelRow}>
            <span>Email</span>
            <input
              className={styles.input}
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
            />
          </label>
          <label className={styles.labelRow}>
            <span>Phone</span>
            <input
              type="tel"
              pattern="[0-9]*"
              className={styles.input}
              value={contact.phone}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, "");
                setContact({ ...contact, phone: value });
              }}
              placeholder="1234567890"
            />
          </label>

          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={contact.show_on_website}
              onChange={(e) =>
                setContact({ ...contact, show_on_website: e.target.checked })
              }
            />{" "}
            Show on website
          </label>
        </section>

        {/* Location */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>Location</h3>
          <label className={styles.labelRow}>
            <span>Address</span>
            <input
              className={styles.input}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          {/* Country first */}
          <div className={styles.grid2}>
            <label className={styles.labelRow}>
              <span>Country</span>
              <select
                className={styles.input}
                value={countryVal}
                onChange={(e) => setCountryVal(e.target.value)}
              >
                <option value="India">India</option>
              </select>
            </label>
            <label className={styles.labelRow}>
              <span>State</span>
              <select
                className={styles.input}
                value={stateVal}
                onChange={(e) => {
                  setStateVal(e.target.value);
                  setCityId(""); // Reset city when state changes
                  setMicro(""); // Reset microlocation when state changes
                }}
              >
                <option value="">Select state</option>
                {states.map((s) => (
                  <option key={s._id} value={s.displayState}>
                     {s.displayState}  
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* City and Microlocation */}
          <div className={styles.grid2}>
            <label className={styles.labelRow}>
              <span>City</span>
              <select
                className={styles.input}
                value={cityId}
                onChange={onCityChange}
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className={styles.labelRow}>
              <span>Microlocation</span>
              <select
                className={styles.input}
                value={micro}
                onChange={(e) => setMicro(e.target.value)}
              >
                <option value="">Select microlocation</option>
                {microOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Lat/Long */}
          <div className={styles.grid2}>
            <label className={styles.labelRow}>
              <span>Latitude</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.000001"
                min="-90"
                max="90"
                className={styles.input}
                value={latitude}
                onChange={(e) => {
                  // allow digits, one dot, and leading minus
                  const v = e.target.value.replace(/[^0-9.-]/g, "");
                  // collapse multiple dots/minus
                  const cleaned = v
                    .replace(/(?!^)-/g, "") // only leading -
                    .replace(/(\..*)\./g, "$1"); // only one dot
                  setLatitude(cleaned);
                }}
                placeholder="e.g. 28.459497"
              />
            </label>
            <label className={styles.labelRow}>
              <span>Longitude</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.000001"
                min="-180"
                max="180"
                className={styles.input}
                value={longitude}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.-]/g, "");
                  const cleaned = v
                    .replace(/(?!^)-/g, "")
                    .replace(/(\..*)\./g, "$1");
                  setLongitude(cleaned);
                }}
                placeholder="e.g. 77.026638"
              />
            </label>
          </div>

          {/* Metro section */}
          <div className={styles.grid3}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={isNearMetro}
                onChange={(e) => setIsNearMetro(e.target.checked)}
              />
              Near Metro
            </label>
            {/* Show station and distance only when near metro is checked */}
            {isNearMetro && (
              <>
                <label className={styles.labelRow}>
                  <span>Station</span>
                  <input
                    className={styles.input}
                    value={metroStation}
                    onChange={(e) => setMetroStation(e.target.value)}
                  />
                </label>
                <label className={styles.labelRow}>
                  <span>Distance (km)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    className={styles.input}
                    value={metroDistance}
                    onChange={(e) => setMetroDistance(e.target.value)}
                  />
                </label>
              </>
            )}
          </div>

          <div>
            <h4 className={styles.subheading} style={{ marginTop: 10 }}>
              Nearby Places
            </h4>
            {nearby.map((n, i) => (
              <div key={i} className={styles.planRow}>
                <input
                  className={styles.input}
                  placeholder="Name"
                  value={n.name}
                  onChange={(e) => updateNearby(i, { name: e.target.value })}
                />
                <input
                  className={styles.input}
                  placeholder="Distance (e.g., 0.5 km)"
                  value={n.distance}
                  onChange={(e) =>
                    updateNearby(i, { distance: e.target.value })
                  }
                />
                <input
                  className={styles.input}
                  placeholder="Type (e.g., Metro Station)"
                  value={n.type}
                  onChange={(e) => updateNearby(i, { type: e.target.value })}
                />
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => removeNearby(i)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div className={styles.addInline}>
              <button
                type="button"
                className={styles.addButton}
                onClick={addNearby}
              >
                + Add Nearby Place
              </button>
            </div>
          </div>
        </section>

        {/* Amenities section */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>Select Amenities</h3>

          <div className={styles.amenitiesGrid}>
            {amenityOptions.map((a) => {
              const id = String(a._id ?? a.id); // unify to a string id
              const isChecked = amenities.includes(id); // compare same type
              return (
                <label key={id} className={styles.amenityCheckbox}>
                  <input
                    type="checkbox"
                    value={id}
                    checked={isChecked}
                    onChange={(e) => {
                      const { checked } = e.target;
                      setAmenities((prev) =>
                        checked
                          ? Array.from(new Set([...prev, id]))
                          : prev.filter((x) => x !== id)
                      );
                    }}
                  />
                  <span>{a.name}</span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Plans + prices */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>Coliving Plans & Prices</h3>
          <div className={styles.plansWrap}>
            {planPrices.map((row, i) => (
              <div key={i} className={styles.planRow}>
                <select
                  className={styles.input}
                  value={row.plan}
                  onChange={(e) => updatePlanPrice(i, { plan: e.target.value })}
                >
                  <option value="">Select plan</option>
                  {planOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.type}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className={styles.input}
                  placeholder="Price"
                  value={row.price}
                  onChange={(e) =>
                    updatePlanPrice(i, { price: e.target.value })
                  }
                />
                <select
                  className={styles.input}
                  value={row.duration}
                  onChange={(e) =>
                    updatePlanPrice(i, { duration: e.target.value })
                  }
                >
                  <option value="month">month</option>
                  <option value="week">week</option>
                </select>
                <button
                  className={styles.deleteButton}
                  type="button"
                  onClick={() => removePlanPrice(i)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
          <div className={styles.addInline}>
            <button
              type="button"
              className={styles.addButton}
              onClick={addPlanPrice}
            >
              + Add Plan Price
            </button>
          </div>
        </section>

        {/* SEO */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>SEO</h3>
          <label className={styles.labelRow}>
            <span>Title</span>
            <input
              className={styles.input}
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
            />
          </label>
          <label className={styles.labelRow}>
            <span>Description</span>
            <textarea
              className={`${styles.input} ${styles.textarea}`}
              rows={3}
              value={seo.description}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
            />
          </label>
          <div className={styles.grid3}>
            <label className={styles.labelRow}>
              <span>Robots</span>
              <input
                className={styles.input}
                value={seo.robots}
                onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
              />
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={!!seo.status}
                onChange={(e) => setSeo({ ...seo, status: e.target.checked })}
              />{" "}
              Index
            </label>
          </div>

          <h4 className={styles.subheading} style={{ marginTop: 10 }}>
            Twitter
          </h4>
          <div className={styles.grid3}>
            <input
              className={styles.input}
              placeholder="Twitter title"
              value={seo.twitter.title}
              onChange={(e) =>
                setSeo({
                  ...seo,
                  twitter: { ...seo.twitter, title: e.target.value },
                })
              }
            />
            <input
              className={styles.input}
              placeholder="Twitter description"
              value={seo.twitter.description}
              onChange={(e) =>
                setSeo({
                  ...seo,
                  twitter: { ...seo.twitter, description: e.target.value },
                })
              }
            />
          </div>

          <h4 className={styles.subheading} style={{ marginTop: 10 }}>
            Open Graph
          </h4>
          <div className={styles.grid3}>
            <input
              className={styles.input}
              placeholder="OG title"
              value={seo.open_graph.title}
              onChange={(e) =>
                setSeo({
                  ...seo,
                  open_graph: { ...seo.open_graph, title: e.target.value },
                })
              }
            />
            <input
              className={styles.input}
              placeholder="OG description"
              value={seo.open_graph.description}
              onChange={(e) =>
                setSeo({
                  ...seo,
                  open_graph: {
                    ...seo.open_graph,
                    description: e.target.value,
                  },
                })
              }
            />
          </div>
        </section>

        {/* Other details */}
        <section className={styles.card}>
          <h3 className={styles.subheading}>Other Details</h3>
          <div className={styles.grid3}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={other.breakfast.is_include}
                onChange={(e) =>
                  setOther({
                    ...other,
                    breakfast: {
                      ...other.breakfast,
                      is_include: e.target.checked,
                    },
                  })
                }
              />{" "}
              Breakfast
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={other.lunch.is_include}
                onChange={(e) =>
                  setOther({
                    ...other,
                    lunch: { ...other.lunch, is_include: e.target.checked },
                  })
                }
              />{" "}
              Lunch
            </label>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={other.dinner.is_include}
                onChange={(e) =>
                  setOther({
                    ...other,
                    dinner: { ...other.dinner, is_include: e.target.checked },
                  })
                }
              />{" "}
              Dinner
            </label>
          </div>
          <div className={styles.grid3}>
            <input
              className={styles.input}
              placeholder="Breakfast price"
              value={other.breakfast.price}
              onChange={(e) =>
                setOther({
                  ...other,
                  breakfast: { ...other.breakfast, price: e.target.value },
                })
              }
            />
            <input
              className={styles.input}
              placeholder="Lunch price"
              value={other.lunch.price}
              onChange={(e) =>
                setOther({
                  ...other,
                  lunch: { ...other.lunch, price: e.target.value },
                })
              }
            />
            <input
              className={styles.input}
              placeholder="Dinner price"
              value={other.dinner.price}
              onChange={(e) =>
                setOther({
                  ...other,
                  dinner: { ...other.dinner, price: e.target.value },
                })
              }
            />
          </div>
          <div className={styles.grid3}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={other.is_electricity_bill_included}
                onChange={(e) =>
                  setOther({
                    ...other,
                    is_electricity_bill_included: e.target.checked,
                  })
                }
              />{" "}
              Electricity included
            </label>
            <input
              className={styles.input}
              placeholder="Beds"
              value={other.beds}
              onChange={(e) => setOther({ ...other, beds: e.target.value })}
            />
            <input
              className={styles.input}
              placeholder="Rent per bed"
              value={other.rent_per_bed}
              onChange={(e) =>
                setOther({ ...other, rent_per_bed: e.target.value })
              }
            />
          </div>
          <div className={styles.grid2}>
            <input
              className={styles.input}
              placeholder="Food & beverage"
              value={other.food_and_beverage}
              onChange={(e) =>
                setOther({ ...other, food_and_beverage: e.target.value })
              }
            />
            <input
              className={styles.input}
              placeholder="Type of co-living"
              value={other.type_of_co_living}
              onChange={(e) =>
                setOther({ ...other, type_of_co_living: e.target.value })
              }
            />
          </div>
        </section>

        {/* Images */}
        <section className={styles.card}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 className={styles.subheading}>Images</h3>
            <label className={styles.addButton} style={{ cursor: "pointer" }}>
              📁 Upload Images
              <input
                type="file"
                multiple
                accept="image/svg+xml,image/png,image/jpeg,image/webp"
                onChange={handleFilesChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {imageList.length > 0 && (
            <DndProvider backend={HTML5Backend}>
              <div style={{ marginTop: 16 }}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Order</th>
                      <th style={{ width: "100px" }}>Image</th>
                      <th style={{ width: "250px" }}>Name</th>
                      <th style={{ width: "250px" }}>Alt Text</th>
                      <th style={{ width: "100px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {imageList.map((image, index) => (
                      <DraggableImageRow
                        key={image.id}
                        image={image}
                        index={index}
                        moveImage={moveImage}
                        handleRemove={handleImageRemove}
                        handleUpdate={handleImageUpdate}
                      />
                    ))}
                  </tbody>
                </table>
                <div style={{ marginTop: 12, fontSize: 14, color: "#666" }}>
                  💡 Drag rows to reorder images. First image will be the main
                  image.
                </div>
              </div>
            </DndProvider>
          )}

          {imageList.length === 0 && (
            <div
              style={{
                padding: 40,
                textAlign: "center",
                border: "2px dashed #ddd",
                borderRadius: 8,
                color: "#666",
              }}
            >
              No images uploaded. Click "Upload Images" to add property photos.
            </div>
          )}
        </section>
      </div>

      {loading && (
        <div className={styles.loaderOverlay}>
          <ClipLoader color="#222" size={60} />
        </div>
      )}
    </div>
  );
}
