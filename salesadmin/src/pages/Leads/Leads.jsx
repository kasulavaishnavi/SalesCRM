import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Leads.css';
import UploadCsv from './UploadCsv';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const LeadsData = async () => {
    try {
      const info = await axios.get(`https://salescrm-server.onrender.com/api/leads`, {
        withCredentials: true,
      });
      setLeads(Array.isArray(info.data) ? info.data : []);
    } catch (err) {
      console.log("Error in fetching leads:", err);
    }
  };

  useEffect(() => {
    LeadsData();
  }, []);

  // Filtered leads based on search query
  const filteredLeads = leads.filter((lead) =>
    Object.values(lead).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <>
      <div className="leads-container">
        <div className='search'>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input
            type='text'
            placeholder='Search here...'
            className='searchLead'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="leads-header">
          <h3>Home &gt; Leads</h3>
          <button className="add-leads-btn" onClick={() => setShowModal(true)}>Add Leads</button>
        </div>

        <div className="table-container">
          <table className="leads-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>Name</th>
                <th>Date</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Language</th>
                <th>Location</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead, index) => (
                <tr key={lead._id}>
                  <td>{String(index + 1).padStart(2, '0')}</td>
                  <td>{lead.name || 'CSV0225'}</td>
                  <td>{new Date(lead.createdAt).toLocaleDateString('en-GB')}</td>
                  <td>{lead.phone}</td>
                  <td>{lead.email}</td>
                  <td>{lead.language}</td>
                  <td>{lead.location}</td>
                  <td>{lead.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <UploadCsv
            onClose={() => setShowModal(false)}
            onUploaded={LeadsData}
          />
        )}
      </div>
    </>
  );
};

export default Leads;
