import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./Schedule.css";

const Schedule = () => {
  const [scheduledLeads, setScheduledLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showFilterPopup, setShowFilterPopup] = useState(false);

  const popupRef = useRef();

  useEffect(() => {
    const fetchScheduledLeads = async () => {
      const res = await axios.get("http://localhost:4000/api/leads?scheduledCalls=true", {
        withCredentials: true,
      });
      setScheduledLeads(res.data);
    };
    fetchScheduledLeads();
  }, []);

  // Close filter popup 
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowFilterPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredLeads = scheduledLeads
    .filter((lead) =>
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((lead) => {
      if (filter === "Today") {
        const today = new Date();
        const scheduledDate = new Date(lead.scheduledCalls);
        return (
          scheduledDate.getDate() === today.getDate() &&
          scheduledDate.getMonth() === today.getMonth() &&
          scheduledDate.getFullYear() === today.getFullYear()
        );
      }
      return true;
    });

  return (
    <div className="schedule-container">
      <div className="search">
        <i className="fa-solid fa-magnifying-glass"></i>
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <i
          className="fa-solid fa-sliders filter-icon"
          onClick={() => setShowFilterPopup(!showFilterPopup)}
        ></i>

        {showFilterPopup && (
          <div className="filter-popup" ref={popupRef}>
            <select
              className="filter-select-popup"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Today">Today</option>
              <option value="All">All</option>
            </select>
            <button className="filter-save-btn" onClick={() => setShowFilterPopup(false)}>Save</button>
          </div>
        )}
      </div>

      <div className="schedules">
        {filteredLeads.length === 0 ? (
          <p className="no-schedule-message">No scheduled calls</p>
        ) : (
          filteredLeads.map((lead) => (
            <div key={lead._id} className="scheduled-lead-card">
              <div className="leadSource">
                <h4>{lead.source}</h4>
                <p className="scheduled-date">
                  <p className="Date">Date</p>
                  {lead.scheduledCalls
                    ? new Date(lead.scheduledCalls).toLocaleDateString()
                    : "Not scheduled"}
                </p>
              </div>

              <div className="leadPhone">
                <i className="fa fa-phone"></i>
                <p>{lead.phone}</p>
              </div>

              <div className="leadName">
                <p>{lead.name}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Schedule;
