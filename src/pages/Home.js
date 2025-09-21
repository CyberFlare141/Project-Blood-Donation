import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  const [eligibilityAnswers, setEligibilityAnswers] = useState({
    age: null,
    vaccine: null,
    disease: null
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);

  // Sample blood inventory data
  const bloodInventory = [
    { type: "O-", units: 2 },
    { type: "O+", units: 6 },
    { type: "A-", units: 4 },
    { type: "A+", units: 8 },
    { type: "B-", units: 1 },
    { type: "B+", units: 7 },
    { type: "AB-", units: 3 },
    { type: "AB+", units: 5 }
  ];

  const questions = [
    {
      id: 'age',
      text: 'Are you between 18 and 65 years old?',
      yesText: 'Great! Age is an important factor for donor safety.',
      noText: 'Thank you for your interest! Unfortunately, age restrictions apply for donor safety.'
    },
    {
      id: 'vaccine',
      text: 'Have you had any vaccinations in the last 4 weeks?',
      yesText: 'Depending on the type of vaccine, you may need to wait before donating. Please consult with our staff.',
      noText: 'Good! Vaccinations can sometimes temporarily defer donation eligibility.'
    },
    {
      id: 'disease',
      text: 'Do you have any chronic diseases (like HIV, Hepatitis B/C, heart conditions, etc.) that might prevent donation?',
      yesText: 'For your safety and the safety of recipients, certain medical conditions may prevent blood donation.',
      noText: 'Excellent! Being in good health is important for blood donation.'
    }
  ];

  const handleAnswer = (answer) => {
    const updatedAnswers = {
      ...eligibilityAnswers,
      [questions[currentQuestion].id]: answer
    };
    
    setEligibilityAnswers(updatedAnswers);
    
    if (currentQuestion === questions.length - 1) {
      setShowFinalResult(true);
    } else {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 800);
    }
  };

  const resetEligibilityCheck = () => {
    setEligibilityAnswers({ age: null, vaccine: null, disease: null });
    setCurrentQuestion(0);
    setShowFinalResult(false);
  };

  const allQuestionsAnswered = Object.values(eligibilityAnswers).every(answer => answer !== null);
  const isEligible = allQuestionsAnswered && 
                     eligibilityAnswers.age === 'yes' && 
                     eligibilityAnswers.vaccine === 'no' && 
                     eligibilityAnswers.disease === 'no';

  const getBloodStatus = (units) => {
    if (units <= 2) return "urgent";
    if (units <= 5) return "low";
    return "moderate";
  };

  const getPercentage = (units) => {
    const maxUnits = 10;
    return Math.min((units / maxUnits) * 100, 100);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-pill">Life Saver</div>
          <h1>Donate Blood, Save Lives</h1>
          <p>Join thousands of heroes who give the gift of life. Your donation can save up to 3 lives.</p>
          <div className="hero-buttons">
            <Link to="/BloodRequestForm" className="cta-button primary">Request Blood</Link>
            <Link to="/dashboard" className="cta-button secondary">View Requests</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="blood-drop-icon">🩸</div>
        </div>
      </section>

      {/* Blood Inventory Section */}
      <section className="inventory-section">
        <div className="container">
          <h2>Current Blood Inventory</h2>
          <p className="section-subtitle">Your donation can help replenish our critical supply</p>
          
          <div className="blood-grid">
            {bloodInventory.map((blood, index) => {
              const status = getBloodStatus(blood.units);
              const percentage = getPercentage(blood.units);
              const statusLabels = {
                urgent: "Urgent",
                low: "Low",
                moderate: "Moderate"
              };
              
              return (
                <div key={index} className={`blood-type ${status}`}>
                  <div className={`badge-pill ${status}-badge`}>{statusLabels[status]}</div>
                  <h3>{blood.type}</h3>
                  <div className="blood-level">
                    <div className="level-bar">
                      <div 
                        className="level-fill" 
                        style={{width: `${percentage}%`}}
                      ></div>
                    </div>
                    <span className="level-text">
                      {status === "urgent" ? `Critical: ${blood.units} units` : `${blood.units} units`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Action Section */}
      <section className="quick-actions-section">
        <div className="container">
          <h2>Quick Actions</h2>
          <p className="section-subtitle">Get involved and make a difference</p>
          
          <div className="action-cards">
            <div className="action-card">
              <div className="action-icon">🩸</div>
              <h3>Request Blood</h3>
              <p>Submit a request for blood donation for a patient in need.</p>
              <Link to="/BloodRequestForm" className="action-link">Make a Request →</Link>
            </div>
            
            <div className="action-card">
              <div className="action-icon">📊</div>
              <h3>View Requests</h3>
              <p>See all current blood requests and find opportunities to help.</p>
              <Link to="/dashboard" className="action-link">View Dashboard →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility Checker */}
      <section className="eligibility-section">
        <div className="container">
          <h2>Eligibility Checker</h2>
          <p className="section-subtitle">Quick check to see if you can donate today</p>
          
          <div className="eligibility-card">
            {!showFinalResult ? (
              <>
                <div className="badge-pill info-badge">Question {currentQuestion + 1} of {questions.length}</div>
                <h3>{questions[currentQuestion].text}</h3>
                <div className="eligibility-buttons">
                  <button 
                    className={`answer-btn pill-btn ${eligibilityAnswers[questions[currentQuestion].id] === 'yes' ? 'selected' : ''}`}
                    onClick={() => handleAnswer('yes')}
                  >
                    Yes
                  </button>
                  <button 
                    className={`answer-btn pill-btn ${eligibilityAnswers[questions[currentQuestion].id] === 'no' ? 'selected' : ''}`}
                    onClick={() => handleAnswer('no')}
                  >
                    No
                  </button>
                </div>
                
                {eligibilityAnswers[questions[currentQuestion].id] && (
                  <div className="eligibility-feedback">
                    <p className={eligibilityAnswers[questions[currentQuestion].id] === 'yes' ? 'not-eligible' : 'eligible'}>
                      {eligibilityAnswers[questions[currentQuestion].id] === 'yes' 
                        ? questions[currentQuestion].yesText 
                        : questions[currentQuestion].noText}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="eligibility-final-result">
                <div className="badge-pill light-badge">Final Result</div>
                {isEligible ? (
                  <div className="eligibility-result success">
                    <h3>You may be eligible to donate!</h3>
                    <p>Based on your answers, you meet the basic criteria for blood donation.</p>
                    <button className="cta-button primary" onClick={resetEligibilityCheck}>
                      Start Over
                    </button>
                  </div>
                ) : (
                  <div className="eligibility-result warning">
                    <h3>You may not be eligible to donate at this time</h3>
                    <p>Based on your answers, there may be some restrictions. Please consult with our medical staff for more information.</p>
                    <button className="cta-button secondary" onClick={resetEligibilityCheck}>
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="badge-pill light-badge">Our Impact</div>
          <div className="stats-grid">
            <div className="stat">
              <h3>5,000+</h3>
              <p>Lives Saved</p>
              <span className="badge-pill neutral-badge">Since 2020</span>
            </div>
            <div className="stat">
              <h3>2,400+</h3>
              <p>Active Donors</p>
              <span className="badge-pill neutral-badge">Community</span>
            </div>
            <div className="stat">
              <h3>12</h3>
              <p>Donation Centers</p>
              <span className="badge-pill neutral-badge">Nationwide</span>
            </div>
            <div className="stat">
              <h3>1</h3>
              <p>Donation Can Save 3 Lives</p>
              <span className="badge-pill neutral-badge">Multiply Impact</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;