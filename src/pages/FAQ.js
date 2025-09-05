
import React from "react";
import { Accordion, Container, Row, Col } from "react-bootstrap";
import './Faq.css'; 

const faqs = [
  { question: "Can I donate blood if I have a tattoo?", answer: "Yes, but you may need to wait for a certain period depending on your location." },
  { question: "How often can I donate blood?", answer: "Typically, every 8–12 weeks, depending on your health and blood type." },
  { question: "Is blood donation safe?", answer: "Yes, blood donation is safe when performed at certified blood donation centers." },
  { question: "Will I feel weak after donating?", answer: "Some people feel lightheaded, but most recover quickly with rest and hydration." },
  { question: "What should I eat before donating?", answer: "Eat a healthy meal with iron-rich foods and stay hydrated." },
  { question: "Can I donate if I had COVID-19?", answer: "Yes, after full recovery and following local guidelines." },
  { question: "How long does the donation process take?", answer: "Usually 45–60 minutes including registration and recovery." },
];

const FAQ = () => {
  return (
    <div className="faq-page">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about blood donation.</p>
      </div>
      <Container className="faq-container">
        <Row className="justify-content-center">
          <Col md={8}>
            <h4 className="faq-title">FAQ</h4>
            <Accordion defaultActiveKey="0">
              {faqs.map((faq, index) => (
                <Accordion.Item eventKey={index.toString()} key={index}>
                  <Accordion.Header>{faq.question}</Accordion.Header>
                  <Accordion.Body>{faq.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Container>
      <footer className="faq-footer">
        © 2024 Be a Hero – Blood Donation. All rights reserved.
      </footer>
    </div>
  );
};

export default FAQ;
