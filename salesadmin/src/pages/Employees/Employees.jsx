import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Employees.css";
import EmployeesModal from "./EmployeesModal";

const Employees = () => {
  const [empData, setEmpData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const itemsPerPage = 7;
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
const [openDropdownId, setOpenDropdownId] = useState(null);




  const DropdownMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  const toggleMenu = () => {
    setOpen(!open);
  };

  // Close dropdown if clicked outside
 useEffect(() => {
  const handleClickOutside = (event) => {
    if (!event.target.closest(".menu-button") && !event.target.closest(".dropdown-menu")) {
      setOpenDropdownId(null);
    }
  };
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, []);


}
  const fetchData = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/api/auth/all`, {
        withCredentials: true,
      });
      const data = Array.isArray(response.data) ? response.data : [];
      setEmpData(data);
      setFilteredData(data);
    } catch (err) {
      console.error("Error fetching employee data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = empData.filter((emp) => {
      const fullText =
        `${emp.firstName} ${emp.lastName} ${emp.email} ${emp._id}`.toLowerCase();
      return fullText.includes(search.toLowerCase());
    });
    setFilteredData(filtered);
    setCurrentPage(1);
  }, [search, empData]);

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key]?.toString().toLowerCase();
    const bVal = b[sortConfig.key]?.toString().toLowerCase();
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleAddEmployee = async (newEmp) => {
    const payload = {
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      email: newEmp.email,
      location: newEmp.location,
      language: newEmp.language,
      password: newEmp.lastName, // default password = last name
    };
    console.log("Payload being sent:", payload);
    try {
      await axios.post(
        "http://localhost:4000/api/auth/register-employee",
        payload,
        {
          withCredentials: true,
        }
      );
      fetchData(); // Refresh table
      setShowModal(false);
    } catch (err) {
      console.error("Error adding employee:", err);
    }
  };

  const handleEditEmployee = async (updatedEmp) => {
    try {
      await axios.put(
        `http://localhost:4000/api/auth/update/${updatedEmp._id}`,
        updatedEmp,
        {
          withCredentials: true,
        }
      );
      fetchData(); // Refresh table
    } catch (err) {
      console.error("Error updating employee:", err);
    }
  };

  const toggleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = async (id) => {
    await axios.delete(`http://localhost:4000/api/auth/delete/${id}`);
    fetchData();
  };

  return (
    <div className="empPage">
      <div className="empheader">
        <input
          type="text"
          placeholder="Search Employees..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="empHeader1">

        <h3>Home &gt; Employees</h3>
        <button onClick={() => setShowModal(true)} className="empBtn">Add Employees</button>
        </div>

      </div>
<div className="Emp">

      <table className="emptable">
        <thead>
          <tr>
            <th onClick={() => toggleSort("firstName")}>Name</th>
            <th onClick={() => toggleSort("_id")}>Emp ID</th>
            <th onClick={() => toggleSort("assignedLeads")}>Assigned Leads</th>
            <th onClick={() => toggleSort("_id")}>Closed Leads</th>
            <th onClick={() => toggleSort("isActive")}>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((emp) => {
            const closedLeads =
              emp.assignedLeads?.filter(
                (lead) => lead.status === "Closed" || lead.status === "Ongoing"
              ).length || 0;

            const initials =
              `${emp.firstName[0] || ""}${emp.lastName[0] || ""}`.toUpperCase();
            const status = emp.isActive ? "Active" : "Inactive";

            return (
              <tr key={emp._id}>
                <td className="empName">
                  <div className="initial">{initials}</div>
                  <div className="nameEmail">
                    <div className="empName">
                      {emp.firstName} {emp.lastName}
                    </div>
                    <div className="empEmail">{emp.email}</div>
                  </div>
                </td>
                <td>
                  <span className="empId">
                    #{emp._id.slice(-12).toUpperCase()}
                  </span>
                </td>
                <td className="lead">{emp.assignedLeads.length}</td>
                <td className="lead">{closedLeads}</td>
                <td>
                  <span className={`status ${status.toLowerCase()}`}>
                    <span className="dots"></span> {status}
                  </span>
                </td>
               <td style={{ position: "relative" }}>
  <button
    onClick={() =>
      setOpenDropdownId(openDropdownId === emp._id ? null : emp._id)
    }
    className="menu-button"
  >
    ⋮
  </button>
  {openDropdownId === emp._id && (
    <div className="dropdownMenu">
      <button
        className="menuitem"
        onClick={() => {
          setIsEdit(true);
          setSelectedEmp(emp);
          setShowModal(true);
          setOpenDropdownId(null);
        }}
      >
        <i class="fa-solid fa-pen"></i>
      Edit
      </button>
      <button
        className="menuitem"
        onClick={() => {
          handleDelete(emp._id);
          setOpenDropdownId(null);
        }}
      >
        <i class="fa-solid fa-trash"></i>
      Delete
      </button>
    </div>
  )}
</td>

              </tr>
            );
          })}
        </tbody>
      </table>
</div>

      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
          className="prev"
        >
          <i class="fa-solid fa-arrow-left"></i>

          Previous
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            className={currentPage === idx + 1 ? "active" : ""}
            onClick={() => setCurrentPage(idx + 1)}
           id="currentPage"
          >
            {idx + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
          
        >
          Next<i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
      <EmployeesModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={isEdit ? handleEditEmployee : handleAddEmployee}
        initialData={selectedEmp}
        isEdit={isEdit}
      />
    </div>
  );
};

export default Employees;
