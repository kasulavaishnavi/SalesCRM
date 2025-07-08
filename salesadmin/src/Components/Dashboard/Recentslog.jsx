import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Dashboard.css";

const RecentActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    try {
      const res = await axios.get("https://salescrm-server.onrender.com/api/recentlogs/admin");
      setActivities(res.data.activities || []);
    } catch (err) {
      console.error("Failed to fetch recent activities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const getTimeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  };

  return (
    <div className="recentContainer">
      <h4 className="header">Recent Activity Feed</h4>
      {loading ? (
        <p>Loading...</p>
      ) : activities.length === 0 ? (
        <p>No recent activities</p>
      ) : (
        <ul className="list">
          {activities.map((activity, index) => (
            <li key={`${activity.type}-${index}`} className="item">
              {activity.description} - {getTimeAgo(activity.date)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default RecentActivityFeed;
