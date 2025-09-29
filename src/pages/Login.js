import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
  const {
    loginRequest,
    loginVerify,
    forgotPasswordRequestOtp,
    forgotPasswordReset,
  } = useAuth();

  const navigate = useNavigate();

  // Steps:
  // 1 = Login: Request OTP
  // 2 = Login: Verify OTP
  // 3 = Forgot Password: Request OTP
  // 4 = Forgot Password: Reset Password
  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");

  // Utility: validate email format
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // Step 1: Login - Request OTP
  const handleLoginRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const success = await loginRequest(email.trim(), password.trim());
    if (success) {
      setStep(2);
    }
  };

  // Step 2: Login - Verify OTP
  const handleLoginVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    const user = await loginVerify(email.trim(), otp.trim());
    if (user) {
      navigate("/");
    }
  };

  // Step 3: Forgot Password - Request OTP
  const handleForgotPasswordRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    const success = await forgotPasswordRequestOtp(email.trim());
    if (success) {
      setStep(4);
    }
  };

  // Step 4: Forgot Password - Reset Password
  const handleForgotPasswordReset = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim() || !newPassword.trim()) {
      setError("OTP and new password are required.");
      return;
    }

    const success = await forgotPasswordReset(
      email.trim(),
      otp.trim(),
      newPassword.trim()
    );

    if (success) {
      alert("Password reset successful. Please login with your new password.");
      // Reset form & go back to login step 1
      setStep(1);
      setOtp("");
      setNewPassword("");
      setPassword("");
    }
  };

  return (
    <Card className="p-4" style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        {step === 1 || step === 2 ? "Login" : "Forgot Password"}
      </h3>

      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

      {(step === 1 || step === 2) && (
        <>
          {step === 1 && (
            <Form onSubmit={handleLoginRequestOtp}>
              <Form.Group className="mb-3" controlId="loginEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 mb-3">
                Send OTP
              </Button>

              <div style={{ textAlign: "center" }}>
                <Link to="#" onClick={() => setStep(3)}>
                  Forgot Password?
                </Link>
              </div>

              <p className="mt-3" style={{ textAlign: "center" }}>
                Don't have an account? <Link to="/signup">Sign Up</Link>
              </p>
            </Form>
          )}

          {step === 2 && (
            <Form onSubmit={handleLoginVerifyOtp}>
              <p style={{ textAlign: "center" }}>
                An OTP has been sent to <b>{email}</b>. Enter it below to
                complete login.
              </p>

              <Form.Group className="mb-3" controlId="loginOtp">
                <Form.Label>OTP</Form.Label>
                <Form.Control
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 mb-3">
                Verify OTP
              </Button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => setStep(1)}
                >
                  Back to Login
                </button>
              </div>
            </Form>
          )}
        </>
      )}

      {(step === 3 || step === 4) && (
        <>
          {step === 3 && (
            <Form onSubmit={handleForgotPasswordRequestOtp}>
              <Form.Group className="mb-3" controlId="forgotEmail">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Form.Group>

              <Button type="submit" variant="warning" className="w-100 mb-3">
                Send Reset OTP
              </Button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => setStep(1)}
                >
                  Back to Login
                </button>
              </div>
            </Form>
          )}

          {step === 4 && (
            <Form onSubmit={handleForgotPasswordReset}>
              <p style={{ textAlign: "center" }}>
                An OTP has been sent to <b>{email}</b>. Enter it and your new
                password below.
              </p>

              <Form.Group className="mb-3" controlId="resetOtp">
                <Form.Label>OTP</Form.Label>
                <Form.Control
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </Form.Group>

              <Button type="submit" variant="warning" className="w-100 mb-3">
                Reset Password
              </Button>

              <div style={{ textAlign: "center" }}>
                <button
                  type="button"
                  className="btn btn-link"
                  onClick={() => setStep(1)}
                >
                  Back to Login
                </button>
              </div>
            </Form>
          )}
        </>
      )}
    </Card>
  );
}

export default Login;
