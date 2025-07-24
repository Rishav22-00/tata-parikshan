import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SLACreate from './pages/SLACreate';
import SLAReview from './pages/SLAReview';
import SLATracking from './pages/SLATracking';
import Reports from './pages/Reports';
import { useUser } from './contexts/UserContext';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { user } = useUser();
  return user ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sla/create" 
          element={
            <ProtectedRoute>
              <SLACreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sla/review/:id" 
          element={
            <ProtectedRoute>
              <SLAReview />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/sla/track/:id" 
          element={
            <ProtectedRoute>
              <SLATracking />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reports" 
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;