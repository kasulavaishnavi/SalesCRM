import React from "react";
import { NavLink } from "react-router-dom";
import "./SideBar.css";

const SideBar = () => {
  return (
    <div className="sidebar">
      <NavLink to="/" 
      className={({ isActive }) => (isActive ? "active" : "")}>
        Dashboard
      </NavLink>
      <NavLink
        to="/Leads"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Leads
      </NavLink>
      <NavLink
        to="/Emp"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Employees
      </NavLink>
      <NavLink
        to="/Settings"
        className={({ isActive }) => (isActive ? "active" : "")}
      >
        Settings
      </NavLink>
    </div>
  );
};

export default SideBar;
