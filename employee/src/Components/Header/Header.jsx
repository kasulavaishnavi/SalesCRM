import React, { useState, useEffect } from "react";
import "./Header.css";
import axios from "axios";
import { useLocation, NavLink } from "react-router-dom";

const Header = () => {
  const [name, setName] = useState("");
  const [greets, setGreets] = useState("Hello");
  const loc = useLocation();
  const empId = sessionStorage.getItem("empId");

  const getName = async () => {
    const res = await axios.get("https://salescrm-server.onrender.com/api/auth/me", {
      withCredentials: true,
    });
    console.log(res.data);
    const { firstName, lastName } = res.data;
    setName(`${firstName} ${lastName}`);
  };

  const getGreeting = () => {
    const now = new Date();
    // Convert to IST (+5:30)
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const istTime = new Date(utc + 3600000 * 5.5);
    const hour = istTime.getHours();

    if (hour >= 5 && hour < 12) {
      setGreets("Good Morning");
    } else if (hour >= 12 && hour < 17) {
      setGreets("Good Afternoon");
    } else if (hour >= 17 && hour < 20) {
      setGreets("Good Evening");
    } else {
      setGreets("Good Night");
    }
  };

  useEffect(() => {
    getGreeting();
    if (empId) {
      getName();
    }
  }, []);

  const headerTitle = () => {
    const path = loc.pathname;
    if (path === "/") {
      return null;
    } else if (path.includes("leads")) {
      return "leads";
    } else if (path.includes("schedule")) {
      return "schedule";
    } else if (path.includes("profile")) {
      return "profile";
    }
  };
  const headerName = headerTitle();

  return (
    <div className="Header">
      <div className="Top">
        <div className="title">
          Canova<div className="crm">CRM</div>
        </div>

          {headerName ? (
            <div className="page-title">
              <div className="nav">
                <NavLink to="/">
                  <i className="fa-solid fa-less-than"></i>{" "}
                </NavLink>
                <h4>{headerName}</h4>
              </div>
            </div>
          ) : (
            <div className="greetings">
          <h4>{greets}</h4>

              <h4 className="empName">{name}</h4>
            </div>
          )}
      </div>
    </div>
  );
};

export default Header;
