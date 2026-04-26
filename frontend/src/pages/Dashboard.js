import { useEffect, useState } from "react";
import API from "../api/api";
import AI_API from "../api/aiApi";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [violations, setViolations] = useState([]);
  const [manualCount, setManualCount] = useState(0);
  const [aiCount, setAiCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViolations();
  }, []);

  const fetchViolations = async () => {
    try {
      // -----------------------------
      // OLD NODE BACKEND DATA
      // -----------------------------
      const res = await API.get("/violations/all");
      const manualData = res.data?.data || [];

      // -----------------------------
      // NEW AI BACKEND DATA
      // -----------------------------
      const aiRes = await AI_API.get("/violations");
      const aiData = aiRes.data?.violations || [];

      // -----------------------------
      // COUNTS
      // -----------------------------
      setManualCount(manualData.length);
      setAiCount(aiData.length);

      // -----------------------------
      // FORMAT AI DATA SAME AS OLD DATA
      // -----------------------------
      const formattedAI = aiData.map((item, index) => ({
        _id: item.id || index,
        vehicleNumber: item.plate_number || "UNKNOWN",
        violationType: "Red Light Violation",
        location: item.camera_id || "AI Camera",
        fineAmount: 1000,
      }));

      // -----------------------------
      // MERGE BOTH
      // -----------------------------
      setViolations([...manualData, ...formattedAI]);

    } catch (error) {
      console.error("Failed to fetch violations:", error);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // TOTAL FINE
  // -----------------------------
  const totalFine = violations.reduce(
    (sum, v) => sum + (v.fineAmount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1>Violation Dashboard</h1>

        {/* ---------------- STATS ---------------- */}
        <div className="stats-grid">

          <div className="stat-card">
            <h3>Total Violations</h3>
            <p>{violations.length}</p>
          </div>

          <div className="stat-card blue">
            <h3>Total Fine</h3>
            <p>₹{totalFine}</p>
          </div>

          <div className="stat-card green">
            <h3>Manual Violations</h3>
            <p>{manualCount}</p>
          </div>

          <div className="stat-card red">
            <h3>AI Violations</h3>
            <p>{aiCount}</p>
          </div>

        </div>

        {/* ---------------- TABLE ---------------- */}
        {loading ? (
          <p className="loading">Loading...</p>
        ) : (
          <div className="table-card">
            <table className="violation-table">
              <thead>
                <tr>
                  <th>Vehicle Number</th>
                  <th>Violation Type</th>
                  <th>Location</th>
                  <th>Fine Amount</th>
                </tr>
              </thead>

              <tbody>
                {violations.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="empty">
                      No violations found
                    </td>
                  </tr>
                ) : (
                  violations.map((v, index) => (
                    <tr key={v._id || index}>
                      <td>{v.vehicleNumber}</td>

                      <td>
                        <span className="badge">
                          {v.violationType}
                        </span>
                      </td>

                      <td>{v.location}</td>

                      <td>₹{v.fineAmount}</td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;