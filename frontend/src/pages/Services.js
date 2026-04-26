import { useState } from "react";
import Navbar from "../components/Navbar";
import emailjs from "@emailjs/browser";
import "../styles/services.css";

const SERVICE_OPTIONS = [
  { value: "Traffic Police Assistance", icon: "🚔", label: "Police Assistance" },
  { value: "Accident Report",           icon: "🚨", label: "Accident Report"  },
  { value: "Signal Malfunction",        icon: "🚦", label: "Signal Fault"     },
  { value: "Emergency Support",         icon: "🆘", label: "Emergency"        },
];

const getStatusClass = (msg) => {
  if (!msg)                  return "";
  if (msg.includes("✅"))    return "status-msg status-success";
  if (msg.includes("❌"))    return "status-msg status-error";
  return "status-msg status-pending";
};

const Services = () => {
  const [serviceType,  setServiceType]  = useState("");
  const [description,  setDescription]  = useState("");
  const [status,       setStatus]       = useState("");

  const submitRequest = async (e) => {
    e.preventDefault();

    if (!serviceType || !description) {
      setStatus("❌ Please fill all fields");
      return;
    }

    setStatus("Sending request…");

    try {
      await emailjs.send(
        "service_wp5wgeb",
        "template_hfsfdjl",
        {
          location: serviceType,
          message:  description,
          time:     new Date().toLocaleString(),
        },
        "xlqDm8-BQ5OaquPOh"
      );

      setStatus("✅ Service request sent successfully.");
      setServiceType("");
      setDescription("");
    } catch (error) {
      console.error("EmailJS Error:", error);
      setStatus("❌ Failed to send request");
    }
  };

  return (
    <>
      <Navbar />

      <div className="services-page">
        <div className="services-layout">

          {/* ════════ LEFT SIDEBAR ════════ */}
          <aside className="services-sidebar">
            <div className="services-brand">SmartEye</div>

            <h2 className="services-sidebar-title">
              Request Traffic Authority Services
            </h2>
            <p className="services-sidebar-sub">
              Raise an official request and our team will dispatch
              assistance to your location promptly.
            </p>

            <div className="services-info-tile">
              <span className="services-info-tile-icon">⚡</span>
              <div>
                <strong>Fast Response</strong>
                <span>Average dispatch time under 8 minutes</span>
              </div>
            </div>

            <div className="services-info-tile">
              <span className="services-info-tile-icon">📡</span>
              <div>
                <strong>Real-Time Updates</strong>
                <span>Email confirmation sent immediately</span>
              </div>
            </div>

            <div className="services-info-tile">
              <span className="services-info-tile-icon">🔒</span>
              <div>
                <strong>Verified Channel</strong>
                <span>Requests routed directly to traffic HQ</span>
              </div>
            </div>
          </aside>

          {/* ════════ RIGHT FORM CARD ════════ */}
          <div className="services-card">

            <div className="services-card-header">
              <h2>New Service Request</h2>
              <p>Select a service type and describe the situation</p>
            </div>

            <div className="services-card-body">
              <form onSubmit={submitRequest}>

                {/* Service type — visual radio tiles */}
                <div className="input-group">
                  <label className="input-label">Service Type</label>
                  <div className="service-type-grid">
                    {SERVICE_OPTIONS.map((opt) => (
                      <label className="service-type-option" key={opt.value}>
                        <input
                          type="radio"
                          name="serviceType"
                          value={opt.value}
                          checked={serviceType === opt.value}
                          onChange={() => setServiceType(opt.value)}
                          required
                        />
                        <div className="service-type-tile">
                          <span className="service-type-tile-icon">{opt.icon}</span>
                          <span className="service-type-tile-label">{opt.label}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="input-group" style={{ marginTop: 18 }}>
                  <label className="input-label">Situation Details</label>
                  <textarea
                    className="services-textarea"
                    placeholder="Describe the issue in detail — location, time, vehicle involved…"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="se-btn-primary"
                  style={{ marginTop: 6 }}
                >
                  📤 Submit Request
                </button>

              </form>

              {status && (
                <div className={getStatusClass(status)}>{status}</div>
              )}

            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Services;