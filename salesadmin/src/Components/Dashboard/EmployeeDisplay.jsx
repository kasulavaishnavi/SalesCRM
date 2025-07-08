import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css"; // create and import a CSS file

const EmployeeDisplay = () => {
  const [employeeData, setEmployeeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const EmployeeDashboardData = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/auth/all`, {
          withCredentials: true,
        });
        setEmployeeData(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Error fetching employee data:", err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    EmployeeDashboardData();
  }, []);

  if (loading) return <div>Loading employee data...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="employee-dashboard">
      <table className="employee-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Emp ID</th>
            <th>Assigned Leads</th>
            <th>Closed Leads</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {employeeData.map((emp) => {
            const closedLeads =
              emp.assignedLeads?.filter(
                (lead) => lead.status === "Closed" || lead.status === "Won"
              ).length || 0;

            const initials = `${emp.firstName[0] || ""}${emp.lastName[0] || ""}`.toUpperCase();
            const status = emp.isActive ? "Active" : "Inactive";

            return (
              <tr key={emp._id}>
                <td className="emp-name-cell">
                  <div className="avatar">
                    {initials}
                  </div>
                  <div className="name-email">
                    <div className="emp-name">{emp.firstName} {emp.lastName}</div>
                    <div className="emp-email">{emp.email}</div>
                  </div>
                </td>
                <td><span className="emp-id-pill">#{emp._id.slice(-12).toUpperCase()}</span></td>
                <td className="leads">{emp.assignedLeads.length}</td>
                <td className="leads">{closedLeads}</td>
                <td>
                  <span className={`status-pill ${status.toLowerCase()}`}>
                    <span className="dot"></span> {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeDisplay;
