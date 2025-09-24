import React, { useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ResponsiveNav from "../components/ResponsiveNav";

function Signup() {
  const { signupRequest, signupVerify } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = request OTP, 2 = verify OTP
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(""); // Server errors

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Name, email, and password are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      const success = await signupRequest(
        name.trim(),
        email.trim(),
        password.trim(),
        phone.trim(),
        profilePic.trim()
      );

      if (success) {
        setStep(2); // go to OTP verification
      } else {
        setError("Failed to send OTP. Check your email and try again.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Server error. Try again later.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    try {
      const user = await signupVerify(email.trim(), otp.trim());
      if (user) navigate("/"); // signup complete
      else setError("Invalid OTP or server error.");
    } catch (err) {
      setError(err?.response?.data?.message || "Server error. Try again later.");
    }
  };

  return (
    <>
      <ResponsiveNav />
      <Card className="p-4" style={{ maxWidth: "400px", margin: "100px auto" }}>
        <h3>Sign Up</h3>
        {error && <p style={{ color: "red" }}>{error}</p>}

        {step === 1 ? (
          <Form onSubmit={handleRequestOtp}>
            <Form.Group className="mb-3">
              <Form.Label>Full Name</Form.Label>
              <Form.Control value={name} onChange={(e) => setName(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control value={phone} onChange={(e) => setPhone(e.target.value)} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Profile Picture URL</Form.Label>
              <Form.Control value={profilePic} onChange={(e) => setProfilePic(e.target.value)} />
            </Form.Group>

            <Button type="submit" variant="success" className="w-100">Send OTP</Button>
          </Form>
        ) : (
          <Form onSubmit={handleVerifyOtp}>
            <p>An OTP has been sent to <b>{email}</b>. Enter it below to complete signup.</p>

            <Form.Group className="mb-3">
              <Form.Label>OTP</Form.Label>
              <Form.Control value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </Form.Group>

            <Button type="submit" variant="success" className="w-100">Verify OTP</Button>
          </Form>
        )}

        {step === 1 && (
          <p className="mt-3">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        )}
      </Card>
    </>
  );
}

export default Signup;
