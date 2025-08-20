import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) {
     navigate("/");
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <Card className="p-4" style={{ maxWidth: "400px", margin: "100px auto" }}>
      <h3>Login</h3>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </Form.Group>
        <Button type="submit" variant="primary" className="w-100">Login</Button>
      </Form>
      <p className="mt-3">Don't have an account? <Link to="/signup">Sign Up</Link></p>
    </Card>
  );
}
export default Login;