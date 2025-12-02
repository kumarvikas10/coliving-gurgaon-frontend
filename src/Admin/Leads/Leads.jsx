// src/admin/Leads/Leads.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "../Cities/Cities.module.css";

const API_BASE =
  process.env.REACT_APP_API_BASE ||
  "https://coliving-gurgaon-backend.onrender.com";

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Filters
  const [filterCity, setFilterCity] = useState("");
  const [filterMicro, setFilterMicro] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Options
  const [cities, setCities] = useState([]);
  const [microsAll, setMicrosAll] = useState([]);
  const [microsFilter, setMicrosFilter] = useState([]);

  // Helpers to adapt city/microlocation response
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

  useEffect(() => {
    const loadAllMicrolocations = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/microlocations?all=true`);
        setMicrosAll(adaptMicros(res.data || res));
      } catch (e) {
        console.error(e);
        setMicrosAll([]);
      }
    };
    loadAllMicrolocations();
  }, []);

  // Load microlocations when city changes
  useEffect(() => {
    const loadMicrosForFilter = async () => {
      setMicrosFilter([]);
      setFilterMicro("");
      if (!filterCity) return;
      try {
        const cityMeta = cities.find(
          (c) => String(c.id) === String(filterCity)
        );
        const key = cityMeta?.slug || filterCity;
        const res = await axios.get(
          `${API_BASE}/api/microlocations/${encodeURIComponent(key)}`
        );
        setMicrosFilter(adaptMicros(res.data || res));
      } catch (e) {
        console.error(e);
        setMicrosFilter([]);
      }
    };
    loadMicrosForFilter();
  }, [filterCity, cities]);

  // Fetch leads with filters
  const fetchRows = async () => {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      params.set("all", "true");
      if (filterCity) params.set("city", filterCity);
      if (filterMicro) params.set("microlocation", filterMicro);
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const url = `${API_BASE}/api/leads?${params.toString()}`;
      const res = await axios.get(url);
      const list = res.data?.leads ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setErr("Failed to load leads");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial + refetch on filters
  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterCity, filterMicro, fromDate, toDate]);

  const cityName = (lead) => {
    const c = cities.find((c) => String(c.id) === String(lead.city));
    return c ? c.name : lead.city || "-";
  };

  const microName = (lead) => {
    const m = microsAll.find(
      (m) => String(m.id) === String(lead.microlocation)
    );
    return m ? m.name : lead.microlocation || "-";
  };

  const fmtDate = (s) => {
    try {
      return new Date(s).toLocaleString();
    } catch {
      return "-";
    }
  };

  const clearFilters = () => {
    setFilterCity("");
    setFilterMicro("");
    setFromDate("");
    setToDate("");
  };

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.heading}>Lead Enquiries</h2>

      {/* Filters toolbar */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 15,
          flexWrap: "wrap",
        }}
      >
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
          disabled={!filterCity || microsFilter.length === 0}
        >
          <option value="">All microlocations</option>
          {microsFilter.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          className={styles.input}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="From Date"
        />
        <input
          type="date"
          className={styles.input}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="To Date"
        />
        <button
          className={styles.addButton}
          onClick={fetchRows}
          disabled={loading}
        >
          Apply
        </button>
        <button
          className={styles.cancelButton}
          onClick={clearFilters}
          disabled={loading}
        >
          Clear
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "12%" }}>Id</th>
              <th style={{ width: "14%" }}>Date / Time</th>
              <th style={{ width: "18%" }}>Name</th>
              <th style={{ width: "20%" }}>Email</th>
              <th style={{ width: "12%" }}>Phone</th>
              <th style={{ width: "10%" }}>City</th>
              <th style={{ width: "12%" }}>Microlocation</th>
              <th style={{ width: "12%" }}>Room Type</th>
              <th style={{ width: "12%" }}>Move In Date</th>
              <th style={{ width: "14%" }}>Page URL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead._id}>
                <td title={lead._id}>{String(lead._id).slice(0, 8)}…</td>
                <td>{fmtDate(lead.createdAt)}</td>
                <td>{lead.name || "-"}</td>
                <td>{lead.email || "-"}</td>
                <td>{lead.phone || "-"}</td>
                <td>{cityName(lead)}</td>
                <td>{microName(lead)}</td>
                <td>{lead.roomType || "-"}</td>
                <td>
                  {lead.moveInDate
                    ? new Date(lead.moveInDate).toLocaleDateString()
                    : "-"}
                </td>
                <td style={{ maxWidth: 200 }}>
                  <a href={lead.url} target="_blank" rel="noopener noreferrer">
                    {lead.url}
                  </a>
                </td>
              </tr>
            ))}
            {!rows.length && !loading && (
              <tr>
                <td colSpan={8} style={{ textAlign: "center", color: "#777" }}>
                  No leads found
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
