import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [profilePic, setProfilePic] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await signup(name, email, password, phone, profilePic);
    if (success) {
      navigate('/');
    }
  };

  return (
    <Card className="p-4" style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h3>Sign Up</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Full Name</Form.Label>
          <Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} required />
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
          <Form.Control type="text" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Profile Picture URL</Form.Label>
          <Form.Control type="text" value={profilePic} onChange={(e) => setProfilePic(e.target.value)} />
        </Form.Group>
        <Button type="submit" variant="success" className="w-100">Sign Up</Button>
      </Form>
      <p className="mt-3">Already have an account? <Link to="/login">Login</Link></p>
    </Card>
  );
}
export default Signup;