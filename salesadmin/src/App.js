import "./App.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import SideBar from "./Components/SideBar/SideBar";
import { Route, Routes } from "react-router-dom";
import Leads from "./pages/Leads/Leads";
import Employees from "./pages/Employees/Employees";
import Settings from "./pages/Settings/Settings"
function App() {
  return (
    <>
      <div className="App">
        <div className="container">
          <div className="app">
            <div className="name">
              <h2>
                Canova<span className="crm">CRM</span>
              </h2>
            </div>
          </div>
          <p className="break"></p>

          <SideBar />
        </div>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Leads" element={<Leads />} />
          <Route path="/Emp" element={<Employees />} />
          <Route path="/Settings" element={<Settings />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
