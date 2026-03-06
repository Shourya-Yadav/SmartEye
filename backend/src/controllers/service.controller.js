import createTransporter from "../config/mailConfig.js";

export const requestPoliceService = async (req, res) => {
  try {
    console.log("REQ BODY 👉", req.body);

    const { location, message } = req.body || {};

    if (!location || !message) {
      return res.status(400).json({
        message: "Location and message are required",
      });
    }

    const transporter = createTransporter(); // CREATE AT RUNTIME

    await transporter.sendMail({
      from: `"SmartEye Alert" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "🚓 SmartEye Service Request",
      html: `
        <h2>🚨Service Requested</h2>
        <p><b>📍 Service:</b> ${location}</p>
        <p><b>📝 Message:</b> ${message}</p>
        <p><b>⏰ Time:</b> ${new Date().toLocaleString()}</p>
      `,
    });

    res.status(200).json({ message: "Police notified successfully" });
  } catch (err) {
    console.error("EMAIL ERROR ❌", err);
    res.status(500).json({ message: err.message || "Failed to send mail" });
  }
};
