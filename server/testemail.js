import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config(); 

async function main() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `"Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, 
      subject: "Test Email from MyApp",
      text: "Hello! This is a test email to check the OTP system.",
    });

    console.log("Email sent successfully:", info.response);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

main();
