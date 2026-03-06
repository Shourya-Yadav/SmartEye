import Navbar from "../components/Navbar";
import "../styles/home.css";

const Home = () => {
  return (
    <>
      <Navbar />

      {/* HERO */}
      <section className="hero-section">
        <h1>SmartEye</h1>
        <p>
          AI-Driven Traffic Violation Detection & Intelligent Monitoring Platform
        </p>
        <div className="hero-actions">
          <a href="/dashboard">View Dashboard</a>
          <a href="/detect" className="secondary">Detect Violation</a>
        </div>
      </section>

      {/* TRUST METRICS */}
      <section className="metrics">
        <div>
          <h2>98%</h2>
          <p>Detection Accuracy</p>
        </div>
        <div>
          <h2>Real-Time</h2>
          <p>Violation Processing</p>
        </div>
        <div>
          <h2>24/7</h2>
          <p>System Availability</p>
        </div>
      </section>

      {/* SYSTEM WORKFLOW */}
      <section className="architecture">
        <h2>System Workflow</h2>
        <div className="steps">
          <span>Traffic Input</span>
          <span>AI Rule Engine</span>
          <span>Violation Analysis</span>
          <span>Fine Estimation</span>
          <span>Dashboard Output</span>
        </div>
      </section>

      {/* FEATURES */}
      <section className="feature-grid">
        <div className="feature">
          <h3>🚦 Automated Detection</h3>
          <p>
            Detects overspeeding, signal jumping and helmet violations using
            intelligent rule-based logic.
          </p>
        </div>

        <div className="feature">
          <h3>🧠 AI-Inspired Analysis</h3>
          <p>
            Mimics real-world traffic surveillance systems using decision rules
            and inference logic.
          </p>
        </div>

        <div className="feature">
          <h3>📊 Decision Support</h3>
          <p>
            Provides analytics and violation summaries to assist traffic
            authorities.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        © 2026 SmartEye – AI Traffic Monitoring System
      </footer>
    </>
  );
};

export default Home;
