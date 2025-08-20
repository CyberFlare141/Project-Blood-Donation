import React from "react";
import "./Home.css"

function Home() {
  return (
    <div className="home-page">

      <div className="hero-section">
        <h1>Be a Hero Today! – Save Lives with Just One Donation.</h1>
        <p>Every drop counts. Join our community of lifesavers and make a difference now.</p>
        <button className="donate-button">Donate Now</button>
      </div>

 
      <div className="container">
        <h3 className="section-title">🩸 Live Blood Inventory</h3>
        <div className="blood-cards">
          <div className="blood-card urgent">
            <h5>O-</h5>
            <p>Urgently Needed!</p>
            <strong>2 units</strong>
          </div>
          <div className="blood-card low">
            <h5>O+</h5>
            <strong>6 units</strong>
          </div>
          <div className="blood-card good">
            <h5>A+</h5>
            <strong>8 units</strong>
          </div>
          <div className="blood-card normal">
            <h5>B+</h5>
            <strong>7 units</strong>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="eligibility-section">
          <h3 className="section-title">🧾 Can You Donate? Quick Eligibility Checker</h3>
          <p>Are you between 18 and 65 years old?</p>
          <button className="button yes-button">Yes</button>
          <button className="button no-button">No</button>
          <br />
          <button className="button check-button">Check Eligibility</button>
        </div>
      </div>
    </div>
  );
}

export default Home;