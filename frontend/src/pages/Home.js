import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import "../styles/home.css";

const Home = () => {
  return (
    <>
      <Navbar />

      {/* ════════ HERO ════════ */}
      <section className="hero">
        <div className="hero-inner">

          {/* Live badge */}
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            System Active · AI Engine Online
          </div>

          <h1>
            Intelligent Traffic
            <br />
            <span className="gradient-text">Violation Detection</span>
          </h1>

          <p className="hero-sub">
            SmartEye combines AI inference and real-time video analysis to
            detect traffic violations with 98% accuracy — built for modern
            traffic authorities.
          </p>

          <div className="hero-actions">
            <Link to="/dashboard" className="hero-btn-primary">
              📊 View Dashboard
            </Link>
            <Link to="/detect" className="hero-btn-ghost">
              🎥 Detect Violation
            </Link>
          </div>

        </div>
      </section>

      {/* ════════ METRICS ════════ */}
      <div className="metrics-strip">
        <div className="metric-item">
          <div className="metric-value">98%</div>
          <div className="metric-label">Detection Accuracy</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">&lt;2s</div>
          <div className="metric-label">Processing Latency</div>
        </div>
        <div className="metric-item">
          <div className="metric-value">24/7</div>
          <div className="metric-label">System Availability</div>
        </div>
      </div>

      {/* ════════ WORKFLOW ════════ */}
      <section className="workflow">
        <h2>System Workflow</h2>
        <p className="workflow-sub">
          How SmartEye processes violations end-to-end
        </p>

        <div className="workflow-steps">

          <div className="workflow-step">
            <div className="workflow-node">
              <span className="workflow-node-icon">📷</span>
              <span className="workflow-node-label">Traffic Input</span>
            </div>
          </div>

          <span className="workflow-arrow">→</span>

          <div className="workflow-step">
            <div className="workflow-node">
              <span className="workflow-node-icon">🧠</span>
              <span className="workflow-node-label">AI Rule Engine</span>
            </div>
          </div>

          <span className="workflow-arrow">→</span>

          <div className="workflow-step">
            <div className="workflow-node">
              <span className="workflow-node-icon">🔍</span>
              <span className="workflow-node-label">Violation Analysis</span>
            </div>
          </div>

          <span className="workflow-arrow">→</span>

          <div className="workflow-step">
            <div className="workflow-node">
              <span className="workflow-node-icon">💰</span>
              <span className="workflow-node-label">Fine Estimation</span>
            </div>
          </div>

          <span className="workflow-arrow">→</span>

          <div className="workflow-step">
            <div className="workflow-node">
              <span className="workflow-node-icon">📊</span>
              <span className="workflow-node-label">Dashboard Output</span>
            </div>
          </div>

        </div>
      </section>

      {/* ════════ FEATURES ════════ */}
      <section className="features">
        <div className="features-header">
          <h2>Platform Capabilities</h2>
          <p>Everything you need for intelligent traffic surveillance</p>
        </div>

        <div className="features-grid">

          <div className="feature-card">
            <span className="feature-icon">🚦</span>
            <h3>Automated Detection</h3>
            <p>
              Detects overspeeding, signal jumping, and helmet violations using
              intelligent rule-based logic trained on real traffic patterns.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">🧠</span>
            <h3>AI-Powered Analysis</h3>
            <p>
              Mimics real-world traffic surveillance using deep learning
              inference — frame-by-frame video analysis with plate recognition.
            </p>
          </div>

          <div className="feature-card">
            <span className="feature-icon">📊</span>
            <h3>Decision Support</h3>
            <p>
              Live analytics, violation summaries, and trend dashboards to
              assist traffic authorities in data-driven enforcement.
            </p>
          </div>

        </div>
      </section>

      {/* ════════ FOOTER ════════ */}
      <footer className="home-footer">
        <span className="footer-brand">SmartEye</span>
        <span className="footer-copy">
          © 2026 SmartEye · AI Traffic Monitoring System
        </span>
      </footer>
    </>
  );
};

export default Home;