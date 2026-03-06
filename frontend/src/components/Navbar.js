import { Link, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

const Navbar = () => {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        {/* LOGO */}
        <span className="logo" onClick={() => navigate("/home")}>
          SmartEye
        </span>

        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>

        <Link to="/detect" className="nav-link">
          Detect Violation
        </Link>

        {/* ✅ NEW SERVICES LINK */}
        <Link to="/services" className="nav-link">
          Services
        </Link>

        <Link to="/penalties" className="nav-link">
          Penalties
        </Link>
      </div>

      <button className="logout-btn" onClick={logout}>
        Logout
      </button>
    </nav>
  );
};

export default Navbar;
