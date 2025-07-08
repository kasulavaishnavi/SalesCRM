import React from "react";
import "./Footer.css";
import { NavLink } from "react-router-dom";
const Footer = () => {
  return (
    <div className="footer">
      <div className="icons">
        <NavLink to="/home" className={({ isActive }) => isActive ? "active" : "order"} >
        <i class="fa-solid fa-house"></i>
       <span>Home</span> </NavLink>
      </div>

      <div className="icons">
        <NavLink to="/leads" className={({ isActive }) => isActive ? "active" : "order"}>
        <i class="fa-solid fa-user-tie"></i>

        Leads</NavLink>
      </div>

      <div className="icons">
        <NavLink to="/schedule" className={({ isActive }) => isActive ? "active" : "order"}>
        <i class="fa-regular fa-calendar-days"></i>
        Schedule</NavLink>
      </div>
      <div className="icons">
        <NavLink to="/profile" className={({ isActive }) => isActive ? "active" : "order"}>
        <i class="fa-regular fa-circle-user"></i>
        Profile</NavLink>
      </div>
    </div>
  );
};

export default Footer;
