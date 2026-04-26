import { useState, useEffect } from "react";
import API from "../api/api";
import AI_API from "../api/aiApi";
import Navbar from "../components/Navbar";
import "../styles/detect.css";

const DetectViolation = () => {
  /* ---- Manual form state ---- */
  const [vehicleType,   setVehicleType]   = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [speed,         setSpeed]         = useState("");
  const [signalJumped,  setSignalJumped]  = useState(false);
  const [helmetWorn,    setHelmetWorn]    = useState(false);

  /* ---- AI form state ---- */
  const [file,     setFile]     = useState(null);
  const [fileName, setFileName] = useState("");

  /* ---- Results ---- */
  const [result,        setResult]        = useState(null);
  const [aiResult,      setAiResult]      = useState(null);
  const [allViolations, setAllViolations] = useState([]);

  /* ---- Loading ---- */
  const [manualLoading, setManualLoading] = useState(false);
  const [aiLoading,     setAiLoading]     = useState(false);

  /* ─────────────────────────────────────────
     OLD NODE BACKEND — Manual detect
  ───────────────────────────────────────── */
  const submitViolation = async (e) => {
    e.preventDefault();
    setManualLoading(true);
    try {
      const res = await API.post("/violations/detect", {
        vehicleType,
        vehicleNumber,
        speed,
        signalJumped,
        helmetWorn: vehicleType === "bike" ? helmetWorn : false,
        location: "Main Junction",
      });
      setResult(res.data);
      fetchAllViolations();
    } catch {
      alert("Manual detection failed");
    } finally {
      setManualLoading(false);
    }
  };

  /* ─────────────────────────────────────────
     AI BACKEND — Video detect
  ───────────────────────────────────────── */
  const uploadVideo = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    const formData = new FormData();
    formData.append("file",       file);
    formData.append("camera_id",  "frontend");
    formData.append("async_mode", false);

    try {
      const res = await AI_API.post("/detect/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAiResult(res.data);
      fetchAllViolations();
    } catch {
      alert("AI video detection failed");
    } finally {
      setAiLoading(false);
    }
  };

  /* ─────────────────────────────────────────
     MERGE BOTH BACKENDS
  ───────────────────────────────────────── */
  const fetchAllViolations = async () => {
    try {
      const nodeRes = await API.get("/violations");
      const aiRes   = await AI_API.get("/violations");

      const nodeData = (nodeRes.data || []).map((item) => ({
        source:        "Manual",
        vehicleNumber: item.vehicleNumber,
        violationType: item.violationType,
        fineAmount:    item.fineAmount,
        detectedAt:    item.detectedAt,
        imageUrl:      item.imageUrl,
      }));

      const aiData = (aiRes.data || []).map((item) => ({
        source:        "AI Camera",
        vehicleNumber: item.plate_number || "UNKNOWN",
        violationType: "Red Light Violation",
        fineAmount:    1000,
        detectedAt:    item.created_at,
        imageUrl:      item.image_url
          ? `http://localhost:8000${item.image_url}`
          : "",
      }));

      const merged = [...nodeData, ...aiData].sort(
        (a, b) => new Date(b.detectedAt) - new Date(a.detectedAt)
      );

      setAllViolations(merged);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchAllViolations(); }, []);

  /* ─────────────────────────────────────────
     File picker handler
  ───────────────────────────────────────── */
  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); setFileName(f.name); }
  };

  return (
    <>
      <Navbar />

      <div className="detect-page">

        {/* ════════ PAGE HEADER ════════ */}
        <div className="detect-page-header">
          <h1>Detection Center</h1>
          <p>Run manual checks or upload video footage for AI analysis</p>
        </div>

        {/* ════════ TWO PANELS ════════ */}
        <div className="detect-panels">

          {/* ── PANEL 1: Manual ── */}
          <div className="detect-panel panel-manual">
            <div className="detect-panel-header">
              <div className="detect-panel-icon">🧾</div>
              <div>
                <h2>Manual Detection</h2>
                <span>Officer-entered vehicle data</span>
              </div>
            </div>

            <div className="detect-panel-body">
              <form className="detect-form" onSubmit={submitViolation}>

                <div className="input-group">
                  <label className="input-label">Vehicle Type</label>
                  <select
                    className="detect-select"
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    required
                  >
                    <option value="">Select type…</option>
                    <option value="car">Car</option>
                    <option value="bike">Bike</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Vehicle Number</label>
                  <input
                    className="se-input"
                    placeholder="e.g. UP32 AB 1234"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    required
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Speed (km/h)</label>
                  <input
                    className="se-input"
                    type="number"
                    placeholder="e.g. 85"
                    value={speed}
                    onChange={(e) => setSpeed(e.target.value)}
                    required
                  />
                </div>

                <label className="detect-checkbox-row">
                  <input
                    type="checkbox"
                    checked={signalJumped}
                    onChange={(e) => setSignalJumped(e.target.checked)}
                  />
                  <span>🚦 Signal Jumped</span>
                </label>

                {vehicleType === "bike" && (
                  <label className="detect-checkbox-row">
                    <input
                      type="checkbox"
                      checked={helmetWorn}
                      onChange={(e) => setHelmetWorn(e.target.checked)}
                    />
                    <span>⛑️ Helmet Worn</span>
                  </label>
                )}

                <button
                  type="submit"
                  className="detect-submit-btn btn-manual"
                  disabled={manualLoading}
                >
                  {manualLoading ? "Detecting…" : "▶ Run Manual Check"}
                </button>

              </form>

              {/* Manual result */}
              {result && (
                <div className="result-box">
                  <h4>Detection Result</h4>
                  <div className="result-row">
                    <span className="result-row-label">Violation</span>
                    <span className="result-row-value">{result.data?.violationType || "—"}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-row-label">Fine</span>
                    <span className="result-row-value green">₹{result.data?.fineAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── PANEL 2: AI Video ── */}
          <div className="detect-panel panel-ai">
            <div className="detect-panel-header">
              <div className="detect-panel-icon">🤖</div>
              <div>
                <h2>AI Video Detection</h2>
                <span>Upload footage for automated analysis</span>
              </div>
            </div>

            <div className="detect-panel-body">
              <form className="detect-form" onSubmit={uploadVideo}>

                <div className={`file-upload-zone ${fileName ? "has-file" : ""}`}>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    required
                  />
                  <div className="file-upload-icon">
                    {fileName ? "🎬" : "📁"}
                  </div>
                  <p className="file-upload-text">
                    {fileName ? "File selected" : "Click or drag video here"}
                  </p>
                  {fileName
                    ? <p className="file-upload-name">{fileName}</p>
                    : <p className="file-upload-hint">MP4, MOV, AVI supported</p>
                  }
                </div>

                <button
                  type="submit"
                  className="detect-submit-btn btn-ai"
                  disabled={aiLoading || !file}
                >
                  {aiLoading ? "Analysing…" : "▶ Upload & Detect"}
                </button>

              </form>

              {/* AI result */}
              {aiResult && (
                <div className="result-box">
                  <h4>AI Analysis Result</h4>
                  <div className="result-row">
                    <span className="result-row-label">Status</span>
                    <span className="result-row-value green">{aiResult.status}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-row-label">Frames Processed</span>
                    <span className="result-row-value blue">{aiResult.frames_processed}</span>
                  </div>
                  <div className="result-row">
                    <span className="result-row-label">Violations Found</span>
                    <span className="result-row-value">{aiResult.violations_found}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* ════════ HISTORY ════════ */}
        <div className="history-section">

          <div className="history-header">
            <h2>Violation History</h2>
            <span className="table-count-badge">{allViolations.length} records</span>
          </div>

          {allViolations.length === 0 ? (
            <div className="history-empty">No records yet</div>
          ) : (
            <div className="history-list">
              {allViolations.map((item, index) => (
                <div key={index} className="history-item">

                  {/* Source tag */}
                  <span
                    className={`history-source ${
                      item.source === "Manual" ? "source-manual" : "source-ai"
                    }`}
                  >
                    {item.source === "Manual" ? "Manual" : "AI Cam"}
                  </span>

                  {/* Body */}
                  <div className="history-body">
                    <div className="history-vehicle">{item.vehicleNumber}</div>
                    <div className="history-meta">{item.violationType}</div>
                  </div>

                  {/* Right */}
                  <div className="history-right">
                    <span className="history-fine">₹{item.fineAmount}</span>
                    <span className="history-date">
                      {item.detectedAt
                        ? new Date(item.detectedAt).toLocaleString()
                        : "—"}
                    </span>
                  </div>

                  {/* Evidence image */}
                  {item.imageUrl && (
                    <div className="history-image">
                      <img src={item.imageUrl} alt="evidence" />
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

        </div>

      </div>
    </>
  );
};

export default DetectViolation;