import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import "./ContactUs.css";

function ContactUs() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("");

  // Get user coordinates
  const getLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => alert("Could not get your location")
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Sending...");

    emailjs
      .send(
        "service_7i32r3l",      // your service ID
        "template_fmoo1lz",     // your template ID
        {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          location: location
            ? `https://maps.google.com/?q=${location}`
            : "No location provided",
        },
        "FGwbanEmhiglULNzk"    // your public key
      )
      .then(
        () => {
          setStatus("Message sent successfully!");
          setFormData({ name: "", email: "", message: "" });
          setLocation("");
        },
        () => setStatus("Failed to send. Please try again.")
      );
  };

  return (
    <div className="contact-container">
      {/* Header */}
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you! Reach out with questions, feedback, or partnership inquiries.</p>
      </div>

      {/* Get in Touch Section */}
      <div className="get-in-touch">
        <div className="contact-card">
          <h2>Get in Touch</h2>
          <p>Please fill out the form below and optionally share your location.</p>

          {/* Contact Form */}
          <form className="contact-form" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Your Message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>

            <button type="button" onClick={getLocation}>
              Get My Location
            </button>
            {location && (
              <p>
                Location captured:{" "}
                <a
                  href={`https://maps.google.com/?q=${location}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on Google Maps
                </a>
              </p>
            )}

            <button type="submit">Send Message</button>
          </form>
          {status && <p className="status">{status}</p>}
        </div>
      </div>

      {/* Map Section */}
      <div className="map-section">
        <a
          href={location ? `https://maps.google.com/?q=${location}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-map-link"
        >
          <div className="contact-map">
            {location ? "Click to view your location on Google Maps" : "Map Placeholder"}
          </div>
        </a>
      </div>

      {/* Footer */}
      <footer className="contact-footer">
        © 2024 Be a Hero – Blood Donation. All rights reserved.
      </footer>
    </div>
  );
}

export default ContactUs;
