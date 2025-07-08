import React, { useState } from "react";
import axios from "axios";
// import "./manualEntry.css"; // create this CSS file for styling

const ManualEntry = ({ onClose, onAdded }) => {
  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
    // add other fields as per your Lead model
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setLeadData({ ...leadData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:4000/api/leads", leadData, {
        withCredentials: true,
      });
      setSuccess("Lead added successfully");
      setError(null);
      setLeadData({ name: "", email: "", phone: "" });

      if (onAdded) onAdded(); // refresh parent if needed
    } catch (err) {
      console.error("Add lead error:", err);
      setError(err.response?.data?.message || "Something went wrong");
      setSuccess(null);
    }
  };

  return (
    <div className="modalOverlay" onClick={(e) => e.target.classList.contains("modalOverlay") && onClose()}>
      <div className="modalBox">
        <div className="modalHeader">
          <h2>Manual Lead Entry</h2>
          <span className="closeBtn" onClick={onClose}>×</span>
        </div>

        <form onSubmit={handleSubmit} className="manualForm">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={leadData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={leadData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={leadData.phone}
            onChange={handleChange}
            required
          />
    

          <p>Location</p>
           <select
            name="location"
            value={leadData.location}
            required
          >
            <option value="">Select</option>
            <option value="Hyderabad">Hyderabad</option>
            <option value="pune">pune</option>
            <option value="Delhi">Delhi</option>
            </select>
          <label>Language</label>
          <select
            name="language"
            value={leadData.language}
            required
          >
            <option value="">Select</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Bengali">Bengali</option>
            <option value="Tamil">Tamil</option>
            </select>

          <input
            type="text"
            name="source"
            placeholder="source"
            value={leadData.source}
            onChange={handleChange}
            required
          />
             {/* <input
            type="text"
            name="date"
            placeholder="date"
            value={leadData.receivedDate}
            onChange={handleChange}
          /> */}
         
         

          <div className="modalActions">
            <button type="button" className="cancelBtn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submitBtn">
              Add Lead
            </button>
          </div>
        </form>

        {success && <div className="resultBox successBox">{success}</div>}
        {error && <div className="resultBox errorBox"><strong>Error:</strong> {error}</div>}
      </div>
    </div>
  );
};

export default ManualEntry;
