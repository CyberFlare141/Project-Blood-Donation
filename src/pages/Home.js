import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const allBloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

function Home() {
  const { API_BASE } = useAuth();
  const [bloodNeeded, setBloodNeeded] = useState({});
  const [loading, setLoading] = useState(true);

  const [eligibilityAnswers, setEligibilityAnswers] = useState({
    age: null,
    vaccine: null,
    disease: null
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showFinalResult, setShowFinalResult] = useState(false);

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
      text: 'Do you have any chronic diseases that might prevent donation?',
      yesText: 'Certain medical conditions may prevent blood donation.',
      noText: 'Excellent! Being in good health is important for blood donation.'
    }
  ];

  // Fetch current blood requests
  useEffect(() => {
    const fetchNeeded = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE}/api/requests/inventory`);
        const data = await res.json();

        const needed = {};
        allBloodTypes.forEach(type => {
          needed[type] = data[type] || 0; 
        });

        setBloodNeeded(needed);
      } catch (err) {
        console.error("Failed to fetch blood requests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNeeded();
  }, [API_BASE]);

  const handleAnswer = (answer) => {
    const updated = { ...eligibilityAnswers, [questions[currentQuestion].id]: answer };
    setEligibilityAnswers(updated);

    if (currentQuestion === questions.length - 1) {
      setShowFinalResult(true);
    } else {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 600);
    }
  };

  const resetEligibilityCheck = () => {
    setEligibilityAnswers({ age: null, vaccine: null, disease: null });
    setCurrentQuestion(0);
    setShowFinalResult(false);
  };

  const allAnswered = Object.values(eligibilityAnswers).every(a => a !== null);
  const isEligible = allAnswered &&
                     eligibilityAnswers.age === 'yes' &&
                     eligibilityAnswers.vaccine === 'no' &&
                     eligibilityAnswers.disease === 'no';

  const getBloodStatus = (units) => {
    if (units >= 5) return "urgent";
    if (units >= 3) return "low";
    return "moderate";
  };

  const getPercentage = (units) => {
    const maxUnits = 10;
    return Math.min((units / maxUnits) * 100, 100);
  };

  return (
    <div className="home-page">

      <section className="hero-section">
        <div className="hero-content">
          <div className="badge-pill">Life Saver</div>
          <h1>Donate Blood, Save Lives</h1>
          <p>Join thousands of heroes who give the gift of life. Your donation can save up to 3 lives.</p>
        </div>
        <div className="hero-visual">
          <div className="blood-drop-icon">🩸</div>
        </div>
      </section>

      <section className="inventory-section">
        <div className="container">
          <h2>Current Blood Needed</h2>
          {loading ? <p>Loading...</p> : (
            <div className="blood-grid">
              {Object.entries(bloodNeeded).map(([type, units], idx) => {
                const status = getBloodStatus(units);
                const percentage = getPercentage(units);
                const statusLabels = { urgent: "Urgent", low: "Low", moderate: "Moderate" };
                return (
                  <div key={idx} className={`blood-type ${status}`}>
                    <div className={`badge-pill ${status}-badge`}>{statusLabels[status]}</div>
                    <h3>{type}</h3>
                    <div className="blood-level">
                      <div className="level-bar">
                        <div className="level-fill" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="level-text">{units} units needed</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="eligibility-section">
        <div className="container">
          <h2>Eligibility Checker</h2>
          <div className="eligibility-card">
            {!showFinalResult ? (
              <>
                <div className="badge-pill info-badge">Question {currentQuestion + 1} of {questions.length}</div>
                <h3>{questions[currentQuestion].text}</h3>
                <div className="eligibility-buttons">
                  <button onClick={() => handleAnswer('yes')}>Yes</button>
                  <button onClick={() => handleAnswer('no')}>No</button>
                </div>
                {eligibilityAnswers[questions[currentQuestion].id] && (
                  <div className="eligibility-feedback">
                    <p>
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
                    <button onClick={resetEligibilityCheck}>Start Over</button>
                  </div>
                ) : (
                  <div className="eligibility-result warning">
                    <h3>You may not be eligible to donate at this time</h3>
                    <button onClick={resetEligibilityCheck}>Try Again</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div className="container">
          <div className="badge-pill light-badge">Our Impact</div>
          <div className="stats-grid">
            <div className="stat"><h3>5,000+</h3><p>Lives Saved</p></div>
            <div className="stat"><h3>2,400+</h3><p>Active Donors</p></div>
            <div className="stat"><h3>12</h3><p>Donation Centers</p></div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
