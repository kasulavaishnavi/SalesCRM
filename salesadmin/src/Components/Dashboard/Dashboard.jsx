import React,{useState, useEffect} from "react";
import axios from "axios"
import "./Dashboard.css";
import EmployeeDisplay from "./EmployeeDisplay";
import Sales from "./Sales";
import RecentsLog from "./Recentslog";
const Dashboard = () => {
const [stats, setStats] = useState({
    unassignedLeads: 0,
    assignedThisWeek: 0,
    activeUsers: 0,
    conversionRate: 0
  });

  const fetchStats = async () => {
    try {
      const { data } = await axios.get("https://salescrm-server.onrender.com/api/dashboard");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);



  return (
    <>
      <div className="dash">
        <h4 className="headingDash">Home &gt; Dashboard</h4>

        <div className="gridDashboard">
          <div className="cards">
            <div className="card"><div className="icons"><i class="fa-solid fa-money-bills"></i></div> <div>Unassigned Leads<div className="values">{stats.unassignedLeads} </div> </div> </div>
            <div className="card"><div className="icons"><i class="fa-regular fa-user"></i></div> <div> Assigned This Week <div className="values"> {stats.assignedThisWeek} </div> </div> </div>
            <div className="card"><div className="icons"><i class="fa-regular fa-handshake"></i></div><div>Active Salespeople <div className="values">{stats.activeUsers} </div>  </div> </div>
            <div className="card"><div className="icons"><i class="fa-regular fa-circle-question"></i></div><div className="cardName">Conversion Rate  <div className="values">{stats.conversionRate}% </div></div> </div>
          </div>
          <div className="sales">
            <Sales />
          </div>
          <div className="logs">
            {" "}
            <RecentsLog />
          </div>
          <div className="emp">
            <EmployeeDisplay />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
