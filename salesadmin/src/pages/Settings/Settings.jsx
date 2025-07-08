import React, { useState } from 'react';
import './Settings.css';

const EditProfile = () => {
  const [formData, setFormData] = useState({
    firstName: 'Sarthak',
    lastName: 'Pal',
    email: 'sarthakpal08@gmail.com',
    password: '********',
    confirmPassword: '********',
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (e) => {
    setSaved(false);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
  };

  return (
    <div className="edit-container">
      <div className="settingsHeader">
        <div className='searchInp'>
          <i className="fa-solid fa-magnifying-glass"></i>
          <input type="text" placeholder="Search here..." className='Inp'/>
        </div>

        <div className="header">
          <h3>Home &gt; Settings</h3>
        </div>
      </div> 

      <div className="edit-card">
        <h3>Edit Profile</h3>
        <form onSubmit={handleSubmit}>
          <label>First name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />

          <label>Last name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
          />

          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit">Save</button>
          {saved && <p className="saved">Profile details updated!</p>}
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
