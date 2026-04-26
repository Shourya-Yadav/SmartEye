import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/form.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch {
      alert("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ════════ LEFT PANEL ════════ */}
      <div className="login-left">
        <div className="login-left-content">

          <h1 className="login-brand">SmartEye</h1>
          <p className="login-tagline">
            AI-driven traffic violation detection &amp; intelligent monitoring
            for modern traffic authorities.
          </p>

          {/* Platform stats */}
          <div className="login-stats">
            <div className="login-stat">
              <div className="login-stat-icon">🚦</div>
              <div className="login-stat-text">
                <strong>98% Accuracy</strong>
                <span>Real-time violation detection</span>
              </div>
            </div>

            <div className="login-stat">
              <div className="login-stat-icon">🧠</div>
              <div className="login-stat-text">
                <strong>AI-Powered Analysis</strong>
                <span>Intelligent rule-based inference engine</span>
              </div>
            </div>

            <div className="login-stat">
              <div className="login-stat-icon">📊</div>
              <div className="login-stat-text">
                <strong>24 / 7 Monitoring</strong>
                <span>Always-on system availability</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ════════ RIGHT PANEL ════════ */}
      <div className="login-right">
        <div className="login-form-box">

          <h2>Welcome back</h2>
          <p className="login-sub">Sign in to your SmartEye account</p>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input
                className="se-input"
                type="email"
                placeholder="admin@smarteye.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input
                className="se-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="se-btn-primary"
              style={{ marginTop: "8px" }}
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <div className="login-divider">
            <span>New to SmartEye?</span>
          </div>

          <Link to="/register">
            <span className="register-link-btn">Create an account</span>
          </Link>

          <p className="login-footer-note">
            © 2026 SmartEye · AI Traffic Monitoring System
          </p>

        </div>
      </div>

    </div>
  );
};

export default Login;