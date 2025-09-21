import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const { loginRequest, loginVerify } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request OTP, 2 = verify OTP
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    const success = await loginRequest(email.trim(), password.trim());
    if (success) {
      setStep(2); // Move to OTP verification
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    const user = await loginVerify(email.trim(), otp.trim());
    if (user) navigate("/"); // OTP successful, go to home page
  };

  return (
    <Card className="p-4" style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h3>Login</h3>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {step === 1 ? (
        <Form onSubmit={handleRequestOtp}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="success" className="w-100">
            Send OTP
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleVerifyOtp}>
          <p>
            An OTP has been sent to <b>{email}</b>. Enter it below to complete login.
          </p>

          <Form.Group className="mb-3">
            <Form.Label>OTP</Form.Label>
            <Form.Control
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </Form.Group>

          <Button type="submit" variant="success" className="w-100">
            Verify OTP
          </Button>
        </Form>
      )}

      {step === 1 && (
        <p className="mt-3" style={{ textAlign: "center" }}>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      )}
    </Card>
  );
}

export default Login;
