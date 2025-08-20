import React from "react";
import "./ContactUs.css";

function ContactUs() {
  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>
          We'd love to hear from you! Reach out with questions, feedback, or
          partnership inquiries.
        </p>
      </div>

      <div className="contact-card">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:info@beahero.org">info@beahero.org</a>
          </p>
          <p>
            <strong>Phone:</strong>{" "}
            <a href="tel:+1234567890">+1 234 567 890</a>
          </p>
          <p>
            <strong>Address:</strong> 123 Hero Lane, Cityville, Country
          </p>

          <form className="contact-form">
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="4" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>

        <div className="contact-map">
          <p>[Map Placeholder]</p>
          <small>Embed Google Maps or Leaflet here</small>
        </div>
      </div>

      <footer className="contact-footer">
        © 2024 Be a Hero – Blood Donation. All rights reserved.
      </footer>
    </div>
  );
}

export default ContactUs;
