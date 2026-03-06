import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/api";
import "../styles/form.css";

const Login = () => {
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="fb-container">
      {/* LEFT SECTION */}
      <div className="fb-left">
        <h1>SmartEye</h1>
        <p>
          SmartEye helps authorities detect and manage traffic violations
          efficiently.
        </p>
      </div>

      {/* RIGHT SECTION */}
      <div className="fb-right">
        <div className="fb-card">
          <form onSubmit={handleLogin}>
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

            <button type="submit" className="login-btn">
              Log in
            </button>
          </form>

          {/* <p className="forgot">Forgotten password?</p> */}

          <hr />

          <Link to="/register">
            <button className="signup-btn">
              Create new account
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
