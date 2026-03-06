import nodemailer from "nodemailer";

const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL credentials missing at runtime");
  }

  return nodemailer.createTransport({
    service: "gmail", // Gmail service use karo (Render par stable)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000 // timeout prevent karega
  });
};

export default createTransporter;