import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Instruction from './pages/Instruction';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import BloodRequestForm from './pages/BloodRequestForm';
import Dashboard from './pages/Dashboard';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/*"
            element={
              <PrivateRoute>
                <div style={{ display: 'flex' }}>
                  <Sidebar />
                  <div style={{ flex: 1, padding: '16px' }}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/instruction" element={<Instruction />} />
                      <Route path="/contactus" element={<ContactUs />} />
                      <Route path="/BloodRequestForm" element={<BloodRequestForm />} />
                      <Route path="/faq" element={<FAQ />} />
                    </Routes>
                  </div>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;