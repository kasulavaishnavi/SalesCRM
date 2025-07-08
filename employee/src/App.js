import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Footer from "./Components/Footer/Footer";
import Header from "./Components/Header/Header";
import Login from "./Pages/Login/Login";
import Leads from "./Pages/Leads/Leads";
import Schedule from "./Pages/Schedule/Schedule";
import Profile from "./Pages/Profile/Profile";
import Home from "./Pages/Home/Home";
import { useState, useEffect } from "react";

function App() {
  const [token, setToken] = useState(sessionStorage.getItem("token"));

 useEffect(() => {
  const handleStorageChange = () => {
    setToken(sessionStorage.getItem("token"));
  };

  window.addEventListener("storage", handleStorageChange);
  return () => window.removeEventListener("storage", handleStorageChange);
}, []);


  return (
    <div className="App">
      <Header />
      <div className="content">
        <Routes>
          <Route
            path="/"
            element={
              !token ? (
                <Login setToken={setToken} />
              ) : (
                <Navigate to="/home" replace />
              )
            }
          />

          <Route
            path="/home"
            element={token ? <Home /> : <Navigate to="/" replace />}
          />
          <Route
            path="/leads"
            element={token ? <Leads /> : <Navigate to="/" replace />}
          />
          <Route
            path="/schedule"
            element={token ? <Schedule /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={token ? <Profile /> : <Navigate to="/" replace />}
          />
        </Routes>
      </div>
      {<Footer />}
    </div>
  );
}

export default App;
