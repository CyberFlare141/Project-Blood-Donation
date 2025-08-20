import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import ContactUs from './pages/ContactUs';
import Instruction from './pages/Instruction';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';

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
          <Route path="/*" element={
            <PrivateRoute>
              <div className="d-flex">
                <Sidebar />
                <div className="p-3 flex-grow-1">
                  <Routes>
                    <Route index element={<Home />} /> 
                    <Route path="Profile" element={<Profile />} />
                    <Route path="Instruction" element={<Instruction />} />
                    <Route path="Contact Us" element={<ContactUs />} />
                  </Routes>
                </div>
              </div>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
