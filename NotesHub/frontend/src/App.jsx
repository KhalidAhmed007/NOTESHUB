import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import UserDashboard from './pages/Dashboard';
import NotesPage from './pages/NotesPage';
import HistoryPage from './pages/History';
import UploadNote from './pages/UploadNote';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import PublicNote from './pages/PublicNote';

// ── Spinner shared between guards ──────────────────────────────────────────
const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
  </div>
);

// ── Protected Route (any logged-in user) ────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/login" />;
  return children;
};

// ── Admin-only Route ─────────────────────────────────────────────────────────
const AdminRoute = ({ children }) => {
  const { user, loading } = React.useContext(AuthContext);
  if (loading)              return <Spinner />;
  if (!user)                return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login"  element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/notes/:id" element={<PublicNote />} />

          {/* Root → Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* User routes */}
          <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/notes"     element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
          <Route path="/history"   element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
          <Route path="/upload"    element={<ProtectedRoute><UploadNote /></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />

          {/* Admin route */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
