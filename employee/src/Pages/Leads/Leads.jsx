import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Leads.css";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [showTypePopup, setShowTypePopup] = useState(null);
  const [showSchedulePopup, setShowSchedulePopup] = useState(null);
  const [showStatusPopup, setShowStatusPopup] = useState(null);
  const [scheduleData, setScheduleData] = useState({ date: "", time: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const typePopupRef = useRef();
  const schedulePopupRef = useRef();
  const statusPopupRef = useRef();
  const filterDropdownRef = useRef();


  useEffect(() => {
 const empLeads = async () => {
  try {
    const res = await axios.get("https://salescrm-server.onrender.com/api/leads/empleads", {
      withCredentials: true,
    });
    console.log("My leads:", res.data);
    setLeads(res.data)
  } catch (error) {
    console.error("Failed to fetch my leads:", error);
  }
};
  empLeads();
}, []);

  // ✅ Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (typePopupRef.current && !typePopupRef.current.contains(event.target))
        setShowTypePopup(null);
      if (
        schedulePopupRef.current &&
        !schedulePopupRef.current.contains(event.target)
      )
        setShowSchedulePopup(null);
      if (
        statusPopupRef.current &&
        !statusPopupRef.current.contains(event.target)
      )
        setShowStatusPopup(null);
      if (
        filterDropdownRef.current &&
        !filterDropdownRef.current.contains(event.target)
      )
        setShowFilterDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateType = async (id, type) => {
    await axios.patch(
      `http://localhost:4000/api/leads/${id}/type`,
      { type },
      { withCredentials: true }
    );
    setLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead._id === id ? { ...lead, type: type } : lead
      )
    );
    setShowTypePopup(null);
  };

  const updateSchedule = async (id) => {
    await axios.patch(
      `http://localhost:4000/api/leads/${id}/schedule`,
      scheduleData,
      { withCredentials: true }
    );
    setShowSchedulePopup(null);
  };

  const updateStatus = async (id, status) => {
    const res = await axios.patch(
      `http://localhost:4000/api/leads/${id}/status`,
      { status },
      { withCredentials: true }
    );
    // console.log("Lead status updated:", res.data);
    setShowStatusPopup(null);
  };

  const filteredLeads = leads.filter(
    (lead) =>
      Object.values(lead).some((value) =>
        String(value).toLowerCase().includes(searchQuery.toLowerCase())
      ) &&
      (statusFilter === "" || lead.status === statusFilter)
  );

  const convertToIST = (utcDateString) => {
    if (!utcDateString) return "";
    const date = new Date(utcDateString);

    // Convert to IST
    const istTime = new Date(date.getTime());

    return istTime.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="leads-container">
      <div className="search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Search here..."
          className="searchLead"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="filter-container" ref={filterDropdownRef}>
          <i
            className="fa-solid fa-sliders"
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          ></i>

          {showFilterDropdown && (
            <div className="popup popup-overlay">
              <div
                className="filters"
                onClick={() => {
                  setStatusFilter("Ongoing");
                  setShowFilterDropdown(false);
                }}
              >
                Ongoing
              </div>
              <div
                className="filters"
                onClick={() => {
                  setStatusFilter("Closed");
                  setShowFilterDropdown(false);
                }}
              >
                Closed
              </div>
              <div
                className="filters"
                onClick={() => {
                  setStatusFilter("");
                  setShowFilterDropdown(false);
                }}
              >
                All
              </div>
            </div>
          )}
        </div>
      </div>

      {filteredLeads.map((lead) => (
        <div key={lead._id} className="lead-card">
          <div
            className={`status-ring ${lead.status.toLowerCase()} ${lead.type ? lead.type.toLowerCase() : ""}`}
          >
            {lead.status}
          </div>
          <h4>{lead.name}</h4>
          <p>{lead.email}</p>
          <div className="date">
            <i className="fa fa-calendar"></i>
            <span>
              {lead.receivedDate ? convertToIST(lead.receivedDate) : "No date"}
            </span>
          </div>

          <div className="actions">
            <button onClick={() => setShowTypePopup(lead._id)}>
              <i className="fa fa-tag"></i>
            </button>
            <button onClick={() => setShowSchedulePopup(lead._id)}>
              <i className="fa fa-clock"></i>
            </button>
            <button onClick={() => setShowStatusPopup(lead._id)}>
              <i className="fa fa-chevron-down"></i>
            </button>
          </div>

          {showTypePopup === lead._id && (
            <div className="popup-overlay1" ref={typePopupRef}>
              <div className="popup">
                <button
                  onClick={() => updateType(lead._id, "Hot")}
                  className="popup1 hot"
                >
                  Hot
                </button>
                <button
                  onClick={() => updateType(lead._id, "Warm")}
                  className="popup2 warm"
                >
                  Warm
                </button>
                <button
                  onClick={() => updateType(lead._id, "Cold")}
                  className="popup3 cold"
                >
                  Cold
                </button>
              </div>
            </div>
          )}

          {showSchedulePopup === lead._id && (
            <div className="popup-overlay2" ref={schedulePopupRef}>
              <div className="popup">
                <input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, date: e.target.value })
                  }
                />
                <input
                  type="time"
                  value={scheduleData.time}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, time: e.target.value })
                  }
                />
                <button onClick={() => updateSchedule(lead._id)}>Save</button>
              </div>
            </div>
          )}

          {showStatusPopup === lead._id && (
            <div className="popup-overlay3" ref={statusPopupRef}>
              <div className="popup">
                <select
                  onChange={(e) => updateStatus(lead._id, e.target.value)}
                  defaultValue={lead.status}
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Closed">Closed</option>
                </select>
                <button onClick={() => setShowStatusPopup(null)}>Save</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Leads;
