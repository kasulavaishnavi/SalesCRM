import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Profile.css";

const Profile = () => {
const [profileData, setProfileData] = useState({
  firstName: "",
  lastName: "",
  email: "",
  location: "",
  language: "",
  currentPassword: "",
  newPassword: "",
});

// Handle change
const handleChange = (e) => {
  setProfileData({ ...profileData, [e.target.name]: e.target.value });
};

// Handle submit
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.put("http://localhost:4000/api/auth/profile/update", profileData, { withCredentials: true });
    alert(res.data.message);
  } catch (error) {
    alert(error.response?.data?.message || "Update failed");
  }
};


  return (
    <div className="profile-container">
      <h4>Employee Profile</h4>
    <form onSubmit={handleSubmit}>
  <input
    type="text"
    name="firstName"
    value={profileData.firstName}
    onChange={handleChange}
    placeholder="First Name"
  />
  <input
    type="text"
    name="lastName"
    value={profileData.lastName}
    onChange={handleChange}
    placeholder="Last Name"
  />
  <input
    type="email"
    name="email"
    value={profileData.email}
    onChange={handleChange}
    placeholder="Email"
  />
  <input
    type="text"
    name="location"
    value={profileData.location}
    onChange={handleChange}
    placeholder="Location"
  />
  <input
    type="text"
    name="language"
    value={profileData.language}
    onChange={handleChange}
    placeholder="Language"
  />
  <input
    type="password"
    name="currentPassword"
    value={profileData.currentPassword}
    onChange={handleChange}
    placeholder="Current Password"
  />
  <input
    type="password"
    name="newPassword"
    value={profileData.newPassword}
    onChange={handleChange}
    placeholder="New Password"
  />
  <button type="submit">Update Profile</button>
</form>

    </div>
  );
};

export default Profile;
