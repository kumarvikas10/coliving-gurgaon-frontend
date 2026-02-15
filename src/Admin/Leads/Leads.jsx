// src/admin/Leads/Leads.jsx
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { ClipLoader } from "react-spinners";
import styles from "../Cities/Cities.module.css";
import { useConfirm } from "../../hooks/useConfirm";
import Delete from "../../assets/Delete.svg";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function Leads() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [propertiesCache, setPropertiesCache] = useState({});

  // Filters
  const [filterCity, setFilterCity] = useState("");
  const [filterMicro, setFilterMicro] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Options
  const [cities, setCities] = useState([]);
  const [microsAll, setMicrosAll] = useState([]);
  const [microsFilter, setMicrosFilter] = useState([]);

  const [deletingIds, setDeletingIds] = useState(new Set()); // Single deletes
  const [selectAll, setSelectAll] = useState(false); // Bulk select
  const [selectedRows, setSelectedRows] = useState(new Set()); // Bulk delete
  const { confirm, isOpen, message, handleConfirm, handleCancel } =
    useConfirm();

  const propertyName = useCallback((lead) => {
  if (!lead.propertyId) return "-";
  
  // ✅ Handle populated OBJECT vs string ID
  if (typeof lead.propertyId === 'object' && lead.propertyId?.name) {
    return lead.propertyId.name;  // ✅ Populated: { _id, name }
  }
  
  if (typeof lead.propertyId === 'string') {
    // Check cache first
    if (propertiesCache[lead.propertyId]) {
      return propertiesCache[lead.propertyId];
    }
    return `ID:${lead.propertyId.slice(-6)}`; // Fallback
  }
  
  return "-";
}, [propertiesCache]);


  useEffect(() => {
    const loadPropertiesCache = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/api/properties?status=approved&limit=500`,
        );
        const props = res.data?.data || [];
        const cache = {};

        props.forEach((p) => {
          cache[p._id] = p.name || `Unnamed (${p._id.slice(-6)})`;
        });

        setPropertiesCache(cache);
      } catch (e) {
        console.error("Failed to load properties cache:", e);
      }
    };

    loadPropertiesCache();
  }, []);

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
          (c) => String(c.id) === String(filterCity),
        );
        const key = cityMeta?.slug || filterCity;
        const res = await axios.get(
          `${API_BASE}/api/microlocations/${encodeURIComponent(key)}`,
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

  const deleteLead = async (leadId) => {
    confirm("Delete this lead?", async () => {
      // ✅ Replace confirm()
      setDeletingIds((prev) => new Set([...prev, leadId]));
      try {
        await axios.delete(`${API_BASE}/api/leads/${leadId}`);
        setRows(rows.filter((r) => r._id !== leadId));
      } catch (e) {
        alert("Delete failed: " + e.response?.data?.message); // ✅ Keep alert (safe)
      } finally {
        setDeletingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(leadId);
          return newSet;
        });
      }
    });
  };

  const bulkDelete = async () => {
    const ids = Array.from(selectedRows);
    if (ids.length === 0) return;

    confirm(`Delete ${ids.length} leads?`, async () => {
      try {
        // ✅ POST /bulk-delete (not DELETE /leads)
        await axios.post(`${API_BASE}/api/leads/bulk-delete`, { ids });
        setRows(rows.filter((r) => !selectedRows.has(r._id)));
        setSelectedRows(new Set());
        setSelectAll(false);
      } catch (e) {
        alert("Bulk delete failed: " + e.response?.data?.message);
      }
    });
  };

  const cityName = (lead) => {
    const c = cities.find((c) => String(c.id) === String(lead.city));
    return c ? c.name : lead.city || "-";
  };

  const microName = (lead) => {
    const m = microsAll.find(
      (m) => String(m.id) === String(lead.microlocation),
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
        {selectedRows.size > 0 && (
          <div
            // style={{
            //   marginBottom: 15,
            //   padding: "10px",
            //   background: "#fee",
            //   borderRadius: 5,
            // }}
          >
            <strong>{selectedRows.size} selected</strong>
            <button
              className={styles.dangerBtn}
              onClick={bulkDelete}
              style={{ marginLeft: 10 }}
            >
              Delete Selected
            </button>
            <button
            className="btn secondaryBtn"
              onClick={() => {
                setSelectedRows(new Set());
                setSelectAll(false);
              }}
              style={{ marginLeft: 10 }}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: "4%" }}>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRows(new Set(rows.map((r) => r._id)));
                    } else {
                      setSelectedRows(new Set());
                    }
                    setSelectAll(e.target.checked);
                  }}
                />
              </th>
              {/* <th style={{ width: "12%" }}>Id</th> */}
              <th style={{ width: "14%" }}>Date / Time</th>
              <th style={{ width: "18%" }}>Name</th>
              <th style={{ width: "20%" }}>Email</th>
              <th style={{ width: "12%" }}>Phone</th>
              <th style={{ width: "10%" }}>City</th>
              <th style={{ width: "12%" }}>Microlocation</th>
              <th style={{ width: "12%" }}>Room Type</th>
              <th style={{ width: "12%" }}>Move In Date</th>
              <th style={{ width: "10%" }}>Property</th>
              <th style={{ width: "10%" }}>Delete</th>
              {/* <th style={{ width: "14%" }}>Page URL</th> */}
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr
                key={lead._id}
                className={selectedRows.has(lead._id) ? styles.selectedRow : ""}
              >
                <td>
                  {" "}
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedRows.has(lead._id)}
                    onChange={(e) => {
                      const newSet = new Set(selectedRows);
                      if (e.target.checked) {
                        newSet.add(lead._id);
                      } else {
                        newSet.delete(lead._id);
                      }
                      setSelectedRows(newSet);
                      setSelectAll(
                        newSet.size === rows.length && rows.length > 0,
                      );
                    }}
                  />
                </td>
                {/* <td title={lead._id}>{String(lead._id).slice(0, 8)}…</td> */}
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
                <td title={lead.propertyId}>
                  <a href={lead.url} target="_blank" rel="noopener noreferrer">
                    {propertyName(lead)}
                  </a>
                </td>
                <td>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => deleteLead(lead._id)}
                    disabled={deletingIds.has(lead._id)}
                  >
                    {deletingIds.has(lead._id) ? <img src={Delete}/> : <img src={Delete}/>}
                  </button>
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

      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={handleCancel}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "10px",
              maxWidth: "400px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 20px 0", color: "#333" }}>
              Confirm Action
            </h3>
            <p style={{ margin: "0 0 25px 0", lineHeight: 1.5 }}>{message}</p>
            <div
              style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}
            >
              <button
                onClick={handleCancel}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #ccc",
                  borderRadius: "5px",
                  background: "white",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                style={{
                  padding: "10px 20px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
