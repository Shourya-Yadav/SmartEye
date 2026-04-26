import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/users/register", { name, email, password });
      alert("Registration successful");
      window.location.href = "/";
    } catch {
      alert("User already exists or error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Brand */}
        <div className="auth-brand">SmartEye</div>

        <h2>Create account</h2>
        <p className="auth-sub">Join the SmartEye monitoring platform</p>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              className="se-input"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <input
              className="se-input"
              type="email"
              placeholder="you@example.com"
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
            <p className="auth-hint">Minimum 8 characters recommended</p>
          </div>

          <button
            type="submit"
            className="se-btn-accent"
            style={{ marginTop: "10px" }}
            disabled={loading}
          >
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div className="auth-divider" />

        <p className="auth-redirect">
          Already have an account? <Link to="/">Sign in</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;