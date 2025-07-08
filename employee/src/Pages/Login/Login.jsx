import React, { useState } from "react";
import "./Login.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await axios.post("https://salescrm-server.onrender.com/api/auth/login", { email, password }, { withCredentials: true });
    const data = response.data;


    sessionStorage.setItem("empId", data.empId);
  sessionStorage.setItem("token", data.empId); 

    console.log("Saved empId:", sessionStorage.getItem("empId"));
console.log("Login response data:", data);

    navigate("/home");
  };

  return (
    <div className="login">
      <div className="loginContainer">
        <h5>Employee Login</h5>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button>Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
