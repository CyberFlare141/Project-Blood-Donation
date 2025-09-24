import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import FAQ from './pages/FAQ';
import ContactUs from './pages/ContactUs';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import BloodRequestForm from './pages/BloodRequestForm';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';  

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />
            <Route path="/BloodRequestForm" element={
              <PrivateRoute><BloodRequestForm /></PrivateRoute>
            } />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
