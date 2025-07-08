import React, { useState, useEffect } from "react";
import axios from "axios";
import "./UploadCsv.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import ManualEntry from "./ManualEntry";

const UploadCsv = ({ onClose, onUploaded }) => {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showModalLeads, setShowModalLeads] = useState(false);


  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const simulateVerification = () => {
    setVerifying(true);
    let current = 10;
    const interval = setInterval(() => {
      setProgress(current);
      current += 20;
      if (current > 100) {
        clearInterval(interval);
        setTimeout(() => {
          handleUpload(); // Call actual upload after "verification"
        }, 300);
      }
    }, 500); // every 0.5 sec
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:4000/api/leads/upload-csv",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      setResult(res.data);
      setError(null);
      setVerifying(false);

      if (onUploaded) onUploaded();
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.response?.data?.message || "Something went wrong");
      setResult(null);
      setVerifying(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("modalOverlay")) {
      onClose();
    }
  };

  return (
    <div className="modalOverlay" onClick={handleOverlayClick}>
      <div className="modalBox">

        <div className="modalHeader">
          <h2>CSV Upload</h2>
          <span className="closeBtn" onClick={onClose}>
            ×
          </span>
        </div>

        {!verifying ? (
          <>
            <div className="uploadSection">
              <input type="file" accept=".csv" onChange={handleFileChange} />
              <div className="modalActions">
                <button onClick={onClose} className="cancelBtn">
                  Cancel
                </button>
                <button
                  onClick={simulateVerification}
                  className="uploadBtn"
                  disabled={!file}
                >
                  Upload
                </button>
              </div>
            </div>
                 <div>
              <p>or Add manually</p>
                    {showModalLeads}  <button className="add-leads-btn" onClick={()=>{ setShowModalLeads(true) }}>Add Lead</button>

            </div>
          </>
        ) : (
          <>
            <div className="verifyingBox">
              <div className="progressCircle">
                <CircularProgressbar
                  value={progress}
                  text={`${progress}%`}
                  styles={buildStyles({
                    textSize: "28px",
                    pathColor: "#000",
                    trailColor: "#eee",
                  })}
                />
              </div>
              <p className="verifyingText">Verifying...</p>
            </div>
            <div className="btns">
              <button onClick={onClose} className="cancelBtn">
                Cancel
              </button>
              <button
                onClick={simulateVerification}
                className="uploadBtn"
                disabled={!file}
              >
                Upload
              </button>
            </div>
       
          </>
        )}

        {result && (
          <div className="resultBox successBox">
            <h3>Upload Successful</h3>
          </div>
        )}

        {error && (
          <div className="resultBox errorBox">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
          {showModalLeads && (
        <ManualEntry
          onClose={() => setShowModalLeads(false)}
         
        />
      )}
    </div>
  );
};

export default UploadCsv;
