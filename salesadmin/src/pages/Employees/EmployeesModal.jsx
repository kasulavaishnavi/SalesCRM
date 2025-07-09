import React, { useState, useEffect } from "react";
import "./EmployeesModal.css";

const EmployeeModal = ({ isOpen, onClose, onSave, initialData = {}, isEdit = false }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    location: "",
    language: "",
  });

  useEffect(() => {
    if (isEdit && initialData) {
      setFormData({ ...initialData });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        location: "",
        language: "",
      });
    }
  }, [isEdit, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isEdit) {
      formData.password = formData.lastName; // Set default password as last name
    }

    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modalOverlay" onClick={(e) => e.target.classList.contains('modalOverlay') && onClose()}>
      <div className="modalBox">
        <div className="modalHeader">
          <h2>{isEdit ? "Edit Employee" : "Add New Employee"}</h2>
          <span className="closeBtn" onClick={onClose}>×</span>
        </div>

        <form onSubmit={handleSubmit}>
          <label>First name</label>
          <input name="firstName" value={formData.firstName} onChange={handleChange} required />

          <label>Last name</label>
          <input name="lastName" value={formData.lastName} onChange={handleChange} required />

          <label>Email</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isEdit}
          />

          <label>Location</label>
          <select
            name="location"
            value={formData.location}
            onChange={handleChange}
            disabled={isEdit}
            required
          >
            <option value="">Select</option>
            <option value="Karnataka">Pune</option>
            <option value="Telangana">Hyderabad</option>
            <option value="Maharashtra">Delhi</option>
          </select>
          <small>Lead will be assigned based on location</small>

          <label>Language</label>
          <select
            name="language"
            value={formData.language}
            onChange={handleChange}
            disabled={isEdit}
            required
          >
            <option value="">Select</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Bengali">Bengali</option>
            <option value="Tamil">Tamil</option>

          </select>
          <small>Lead will be assigned based on language</small>

          <div className="modalActions">
            <button type="button" className="cancelBtn" onClick={onClose}>Cancel</button>
            <button type="submit" className="saveBtn">{isEdit ? "Update" : "Save"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeModal;
