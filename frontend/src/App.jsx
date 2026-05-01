import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard/Dashboard';
import Investment from './pages/Investment/Investment';
import Games from './pages/Games/Games';
import Admin from './pages/Admin/Admin';
import Leaderboard from './pages/Leaderboard/Leaderboard';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Withdrawal from './pages/Withdrawal/Withdrawal';
import Coupons from './pages/Coupons/Coupons';
import Riddles from './pages/Games/Riddles';
import BottomNav from './components/Navigation/BottomNav';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !user.isAdmin) return <Navigate to="/" />;
  return children;
};

const AppContent = () => {
  const { user } = useAuth();
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/investment" element={<ProtectedRoute><Investment /></ProtectedRoute>} />
        <Route path="/games" element={<ProtectedRoute><Games /></ProtectedRoute>} />
        <Route path="/withdrawal" element={<ProtectedRoute><Withdrawal /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/coupons" element={<ProtectedRoute><Coupons /></ProtectedRoute>} />
        <Route path="/riddles" element={<ProtectedRoute><Riddles /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><Admin /></ProtectedRoute>} />
      </Routes>
      {user && <BottomNav />}
      <ToastContainer position="top-right" theme="dark" />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
