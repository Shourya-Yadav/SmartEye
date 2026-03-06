import Navbar from "../components/Navbar";
import "../styles/penalties.css";

const penalties = [
  { title: "Drunken Driving", fine: "₹10,000 or 6 months imprisonment" },
  { title: "Over Speeding", fine: "₹1,000 – ₹2,000 (LMV)" },
  { title: "Driving Without License", fine: "₹5,000" },
  { title: "Using Mobile While Driving", fine: "₹5,000" },
  { title: "No Seat Belt", fine: "₹1,000" },
  { title: "No Helmet (2-Wheelers)", fine: "₹1,000 + license suspension (3 months)" },
  { title: "Driving Without Insurance", fine: "₹2,000 or jail up to 3 months" },
  { title: "Minor Driving Vehicle", fine: "₹25,000 + jail for owner" },
  { title: "Jumping Red Light", fine: "₹1,000 – ₹5,000 + suspension" },
  { title: "Blocking Emergency Vehicles", fine: "₹10,000" },
];

function Penalties() {
  return (
    <>
      <Navbar />
      <div className="penalty-page">
        <h1>Traffic Rule Penalties in India</h1>

        <div className="penalty-grid">
          {penalties.map((p, i) => (
            <div className="penalty-card" key={i}>
              <h3>{p.title}</h3>
              <p><strong>Penalty:</strong> {p.fine}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Penalties;
