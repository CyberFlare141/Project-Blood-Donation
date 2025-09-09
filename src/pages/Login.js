import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password);
    if (ok) {
      // After successful login:
      login(ok); // ok is what you want to store (e.g., user object or token)
      navigate('/');
    }
  };

  return (
    <Card className="p-4" style={{ maxWidth: 420, margin: '40px auto' }}>
      <h3 className="mb-3 text-center">Login</h3>
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
      <p className="mt-3 text-center">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </Card>
  );
}
export default Login;