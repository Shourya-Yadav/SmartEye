import { useEffect, useState } from "react";
import API from "../api/api";
import Navbar from "../components/Navbar";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchViolations = async () => {
      try {
        const res = await API.get("/violations/all");

        // FIX HERE
        setViolations(res.data.data || []);

      } catch (error) {
        console.error("Failed to fetch violations");
      } finally {
        setLoading(false);
      }
    };

    fetchViolations();
  }, []);

  const totalFine = violations.reduce(
    (sum, v) => sum + (v.fineAmount || 0),
    0
  );

  return (
    <>
      <Navbar />

      <div className="dashboard-container">
        <h1>Violation Dashboard</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Violations</h3>
            <p>{violations.length}</p>
          </div>

          <div className="stat-card blue">
            <h3>Total Fine</h3>
            <p>₹{totalFine}</p>
          </div>
        </div>

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
                        <span className="badge">{v.violationType}</span>
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