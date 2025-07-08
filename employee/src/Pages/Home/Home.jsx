import React, { useEffect, useState } from "react";
import "./Home.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RecentActivity from "../../Components/RecentAct/RecentAct";

const Home = () => {
  const [checkInTime, setCheckInTime] = useState(null);
  const [checkOutTime, setCheckOutTime] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [breaks, setBreaks] = useState([]);
  const navigate = useNavigate();

  const empId = sessionStorage.getItem("empId");

  useEffect(() => {
    if (empId) {
      fetchTodayAttendance(); 
    }

    const handleBeforeUnload = async (event) => {
      const navType = performance.getEntriesByType("navigation")[0]?.type;
      if (navType === "reload" || navType === "back_forward") {
        sessionStorage.setItem("isReloading", "true");
        console.log(
          "Page reload or history navigation detected, skipping automatic checkout."
        );
      } else {
        try {
          await axios.post(
            "https://salescrm-server.onrender.com/api/attendance/checkout",
            {},
            { withCredentials: true }
          );
          console.log("Checked out successfully on tab close/navigation.");
        } catch (error) {
          console.error("Checkout on tab close/navigation failed:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [empId]);


const fetchTodayAttendance = async () => {
  try {
    const res = await axios.get(
      `https://salescrm-server.onrender.com/api/attendance/today?empId=${empId}`,
      { withCredentials: true }
    );
    const data = res.data;

    if (data && data.checkInOuts && data.checkInOuts.length > 0) {
      const checkInOuts = data.checkInOuts;
      const reversed = [...checkInOuts].reverse();

      // Active check-in (checked in but not checked out)
      const currentEntry = reversed.find(entry => entry.checkedIn && !entry.checkedOut);
      setCheckInTime(currentEntry ? currentEntry.checkedIn : null);

      let lastCheckoutTime = null;

      if (currentEntry) {
        const index = reversed.findIndex(entry => entry.checkedIn && !entry.checkedOut);
        const prevEntry = reversed[index + 1];
        lastCheckoutTime = prevEntry ? prevEntry.checkedIn : null;
      } else {
        const prevEntry = reversed[1];
        lastCheckoutTime = prevEntry ? prevEntry.checkedIn : reversed[0].checkedIn;
      }

      setCheckOutTime(lastCheckoutTime);
      setIsCheckedIn(!!currentEntry);

      //reaks as durations between check-ins
      const breaksCalculated = [];
      for (let i = 1; i < checkInOuts.length; i++) {
        const prev = checkInOuts[i - 1];
        const curr = checkInOuts[i];
        if (prev.checkedIn && curr.checkedIn) {
          breaksCalculated.push({
            start: prev.checkedIn,
            end: curr.checkedIn,
          });
        }
      }

      setBreaks(breaksCalculated);
      console.log("Entries from DB:", reversed);
      console.log("Current active check-in:", currentEntry);
      console.log("Last checkout time (fallback to previous check-in if no checkout):", lastCheckoutTime);

    } else {
      setCheckInTime(null);
      setCheckOutTime(null);
      setIsCheckedIn(false);
      setBreaks([]);
    }
  } catch (error) {
    console.error("Failed to fetch today's attendance:", error);
    if (error.response && error.response.status === 401) {
      navigate("/", { replace: true });
    }
  }
};


  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    const date = new Date(timeString);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = ("0" + date.getDate()).slice(-2);
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="home-container">
      <div className="timings-section">
        <h4>Timings</h4>
        <div className="checkin-checkout-card">
          <div className="checkin-info">
            <span className="label">Checked-In</span>
            <p className="time">{formatTime(checkInTime)}</p>
          </div>
          <div className="checkout-info">
            <span className="label">Check Out</span>
            <p className="time">{formatTime(checkOutTime)}</p>
          </div>
          <div
            className={`toggle-color-container ${isCheckedIn ? "active" : ""}`}
          ></div>
        </div>

       <div className="breaks-card">
  <h5>Break</h5>
  <div className="breakTab">
  {breaks.length > 0 ? (
    <table className="breaks-table">
      <thead>
        <tr>
          <th>Start</th>
          <th>Ended</th>
          <th>Date</th>
        </tr>
      </thead>
      <tbody>
        {[...breaks].reverse().map((brk, index) => (
          <tr key={index}>
            <td>{brk.start ? formatTime(brk.start) : "--:--"}</td>
            <td>{brk.end ? formatTime(brk.end) : "--:--"}</td>
            <td>{formatDate(brk.start)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="no-breaks-message">No breaks recorded today.</p>
  )}
  </div>
</div>

      </div>
        <h4>Recent Activity</h4>

      <div className="recent-activity">
        <RecentActivity empId={empId} />
      </div>
    </div>
  );
};

export default Home;
