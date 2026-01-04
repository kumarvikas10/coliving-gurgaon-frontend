// src/admin/Properties/Properties.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "../Cities/Cities.module.css";
import View from "../../assets/Eye.svg";
import Edit from "../../assets/Edit.svg";
import Delete from "../../assets/Delete.svg";
import Enable from "../../assets/Enable.svg";
import Disable from "../../assets/Disable.svg";

const API_BASE = process.env.REACT_APP_API_BASE;
const FRONTEND_BASE = process.env.REACT_APP_FRONTEND_BASE;

export default function Properties({ goToAdd, goToEdit }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filters
  const [searchText, setSearchText] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [filterMicro, setFilterMicro] = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "", draft, pending, approved, rejected, archived

  // Options
  const [cities, setCities] = useState([]);
  const [micros, setMicros] = useState([]);

  // Adapt helpers reused from PropertyAdd
  const adaptCities = (raw) => {
    const list = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw)
      ? raw
      : raw?.data?.data || [];
    return list
      .map((c) => ({
        id: c._id || c.id || c.city_id,
        name: c.name || c.city,
        slug: c.slug || c.city_slug || c.city,
        state: c.state || c.state_name || "",
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

  // Debounce search
  const [searchDebounced, setSearchDebounced] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // Load cities once
  useEffect(() => {
    const loadCities = async () => {
      try {
        let res;
        try {
          res = await axios.get(`${API_BASE}/api/cities?all=true`);
        } catch {
          res = await axios.get(`${API_BASE}/api/cities`);
        }
        setCities(adaptCities(res.data || res));
      } catch (e) {
        console.error(e);
        setCities([]);
      }
    };
    loadCities();
  }, []);

  // Load microlocations when city changes
  useEffect(() => {
    const loadMicros = async () => {
      setMicros([]);
      setFilterMicro("");
      if (!filterCity) return;
      try {
        // Same pattern as PropertyAdd: supports citySlug or cityId
        const cityMeta = cities.find(
          (c) => String(c.id) === String(filterCity)
        );
        const key = cityMeta?.slug || filterCity;
        const res = await axios.get(
          `${API_BASE}/api/microlocations/${encodeURIComponent(key)}`
        );
        setMicros(adaptMicros(res.data || res));
      } catch (e) {
        console.error(e);
        setMicros([]);
      }
    };
    loadMicros();
  }, [filterCity, cities]);

  // Build and call list API with filters
  const fetchRows = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      params.set("all", "true"); // keep admin-all
      params.set("deleted", "true"); // include archived in list

      if (searchDebounced) params.set("search", searchDebounced);
      if (filterCity) params.set("city", filterCity);
      if (filterMicro) params.set("micro", filterMicro);
      if (filterStatus) params.set("status", filterStatus);

      const url = `${API_BASE}/api/properties?${params.toString()}`;
      const res = await axios.get(url);
      const list = res.data?.data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load properties");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial + refetch on filters
  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchDebounced, filterCity, filterMicro, filterStatus]);

  const onToggleStatus = async (p) => {
    const next = p.status === "approved" ? "archived" : "approved";
    setLoading(true);
    try {
      await axios.patch(`${API_BASE}/api/properties/${p._id}/status`, {
        status: next,
      });
      await fetchRows();
    } catch (e) {
      console.error(e);
      setErr("Failed to toggle status");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (p) => {
    if (!window.confirm(`Delete property "${p.name}"?`)) return;
    setLoading(true);
    setErr("");
    try {
      await axios.delete(`${API_BASE}/api/properties/${p._id}?hard=true`);
      await fetchRows();
    } catch (e) {
      console.error(e);
      setErr("Failed to delete property");
    } finally {
      setLoading(false);
    }
  };

  // helpers used in table
  const cityName = (p) => {
    const c = p?.location?.city;
    if (!c) return "-";
    if (typeof c === "object") return c.name || c.slug || c._id || "-";
    return String(c);
  };

  const microName = (p) => {
    const arr = p?.location?.micro_locations || [];
    if (!arr.length) return "-";
    const first = arr[0];
    if (typeof first === "object")
      return first.name || first.slug || first._id || "-";
    return String(first);
  };

  const fmtDate = (s) => {
    try {
      return new Date(s).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const clearFilters = () => {
    setSearchText("");
    setFilterCity("");
    setFilterMicro("");
    setFilterStatus("");
  };

  const getCitySlugForRoute = (p) => {
    const c = p?.location?.city;
    if (!c) return "";
    if (typeof c === "object") {
      return c.slug || (c.city || c.name || "").toLowerCase();
    }
    return String(c).toLowerCase();
  };

  const buildFrontendUrl = (p) => {
    const citySlug = getCitySlugForRoute(p);
    if (!citySlug || !p.slug) return FRONTEND_BASE;
    return `${FRONTEND_BASE}/${encodeURIComponent(
      citySlug
    )}/${encodeURIComponent(p.slug)}`;
  };

  return (
    <div className={styles.pageWrapper}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <h2 className={styles.heading}>Coliving Properties</h2>
        <button
          className="btn primaryBtn"
          onClick={goToAdd}
          disabled={loading}
        >
          + Add Coliving
        </button>
      </div>

      {/* Filters toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          margin: "12px 0",
          flexWrap: "wrap",
        }}
      >
        <input
          className={styles.input}
          style={{ minWidth: 220 }}
          placeholder="Search name…"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className={styles.input}
          value={filterCity}
          onChange={(e) => setFilterCity(e.target.value)}
        >
          <option value="">All cities</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className={styles.input}
          value={filterMicro}
          onChange={(e) => setFilterMicro(e.target.value)}
          disabled={!filterCity || micros.length === 0}
        >
          <option value="">All microlocations</option>
          {micros.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <select
          className={styles.input}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All status</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="archived">Archived</option>
        </select>
        <button
          className="btn primaryBtn"
          onClick={fetchRows}
          disabled={loading}
        >
          Apply
        </button>
        <button
          className="btn secondaryBtn"
          onClick={clearFilters}
          disabled={loading}
        >
          Clear
        </button>
      </div>

      <div className={styles.contentWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Id</th>
              <th style={{ width: "22%" }}>Name</th>
              <th style={{ width: "10%" }}>User</th>
              <th style={{ width: "12%" }}>City</th>
              <th style={{ width: "14%" }}>Microlocation</th>
              <th style={{ width: "12%" }}>Added On</th>
              <th style={{ width: "8%" }}>Status</th>
              <th style={{ width: "20%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p._id}>
                <td title={p._id}>{String(p._id).slice(0, 8)}…</td>
                <td>{p.name || "-"}</td>
                <td>{p.user?.role || "ADMIN"}</td>
                <td>{cityName(p)}</td>
                <td>{microName(p)}</td>
                <td>{fmtDate(p.createdAt)}</td>
                <td>{p.status || "-"}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => {
                        const url = buildFrontendUrl(p);
                        window.open(url, "_blank", "noopener,noreferrer");
                      }}
                      className={styles.editButton}
                      disabled={loading}
                    >
                      <img src={View} alt="View" />
                    </button>
                    <button
                      onClick={() => {
                        console.log("[Properties] goToEdit id:", p._id);
                        goToEdit && goToEdit(p._id);
                      }}
                      className={styles.editButton}
                      disabled={loading}
                    >
                      <img src={Edit} alt="Edit" />
                    </button>
                    <button
                      onClick={() => onToggleStatus(p)}
                      className={styles.statusButton}
                      disabled={loading}
                    >
                      {p.status === "approved" ? (
                        <img src={Enable} alt="Enable" />
                      ) : (
                        <img src={Disable} alt="Disable" />
                      )}
                    </button>
                    <button
                      onClick={() => onDelete(p)}
                      className={styles.deleteButton}
                      disabled={loading}
                    >
                      <img src={Delete} alt="Delete" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#777" }}>
                  No properties found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {loading && (
          <div className={styles.loaderOverlay}>
            <ClipLoader color="#222" size={60} />
          </div>
        )}
        {err && <div style={{ marginTop: 10, color: "crimson" }}>{err}</div>}
      </div>
    </div>
  );
}
