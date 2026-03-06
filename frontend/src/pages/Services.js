import { useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api/api";
import "../styles/services.css";

const Services = () => {
  const [serviceType, setServiceType] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  const submitRequest = async (e) => {
    e.preventDefault();
    setStatus("Sending request...");

    try {
      await API.post("/services/request", {
        location: serviceType,
        message: description,
      });

      setStatus("✅ Service request sent successfully. Email delivered.");
      setServiceType("");
      setDescription("");
    } catch (err) {
      console.error(err);
      setStatus("❌ Failed to send request");
    }
  };

  return (
    <>
      <Navbar />

      <div className="services-wrapper">
        <div className="services-card">
          <h2>Request Traffic Police Service</h2>
          <p className="subtitle">
            Raise an official request to traffic authorities
          </p>

          <form onSubmit={submitRequest}>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            >
              <option value="">Select Service</option>
              <option value="Traffic Police Assistance">Traffic Police Assistance</option>
              <option value="Accident Report">Accident Report</option>
              <option value="Signal Malfunction">Signal Malfunction</option>
              <option value="Emergency Support">Emergency Support</option>
            </select>

            <textarea
              placeholder="Describe the issue in detail"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />

            <button type="submit">Submit Request</button>
          </form>

          {status && <p className="status-msg">{status}</p>}
        </div>
      </div>
    </>
  );
};

export default Services;
