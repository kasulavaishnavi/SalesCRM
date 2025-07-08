import React, { useState, useEffect } from 'react';
import "./RecentAct.css";
import axios from "axios";

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const token = sessionStorage.getItem("token"); // token here

  const empId = sessionStorage.getItem("empId"); // get empId here

  
  const getTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };
useEffect(() => {
  const fetchRecentLogs = async () => {
     const empId = sessionStorage.getItem("empId"); 
    if (!empId) {
      console.error("empId is null. Cannot fetch recent activities.");
      return;
    }

    try {
      const response = await axios.get(`https://salescrm-server.onrender.com/api/recentlogs/employee/${empId}`, {
        withCredentials: true,
      });

      const data = response.data;

      if (!data.activities) {
        console.error("No activities found in response:", data);
        setActivities([]);
        return;
      }

      const sortedActivities = data.activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 10);

      setActivities(sortedActivities);

    } catch (error) {
      console.error("Failed to fetch recent activities:", error);
    }
  };

  fetchRecentLogs();
}, [empId]);


  return (
    <div className="recentActivity">
      <ul>
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <li key={index}>{activity.description}  - {getTimeAgo(activity.date)}</li>
          ))
        ) : (
          <li>No recent activities found.</li>
        )}
      </ul>
    </div>
  );
};

export default RecentActivity;
