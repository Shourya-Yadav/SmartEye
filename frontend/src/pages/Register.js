import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";
import "../styles/auth.css";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await API.post("/users/register", { name, email, password });
      alert("Registration successful");
      window.location.href = "/";
    } catch (err) {
      alert("User already exists or error occurred");
    }
  };

  return (
    <div className="auth-page-center">
      {/* SmartEye heading */}
      <h1 className="brand-title">SmartEye</h1>

      {/* Card */}
      <div className="auth-card">
        <h2>Create Account</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="green-btn">
            Sign Up
          </button>
        </form>

        <div className="divider"></div>

        <p className="redirect-text">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
