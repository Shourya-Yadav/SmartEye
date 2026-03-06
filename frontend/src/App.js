import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import DetectViolation from "./pages/DetectViolation";
import Services from "./pages/Services";
import Penalties from "./pages/Penalties";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
         <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/detect" element={<DetectViolation />} />
        <Route path="/services" element={<Services />} />
        <Route path="/penalties" element={<Penalties />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
