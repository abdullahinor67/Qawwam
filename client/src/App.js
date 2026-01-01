import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Dashboard from './pages/Dashboard';
import Salah from './pages/Salah';
import Quran from './pages/Quran';
import Workout from './pages/Workout';
import Habits from './pages/Habits';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Pricing from './pages/Pricing';
import Profile from './pages/Profile';

// Components
import Navigation from './components/Navigation';

// Styles
import './styles/index.css';

// Protected Route wrapper
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Public Route wrapper (redirect if already logged in)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }
  
  if (user) {
    return <Navigate to="/" />;
  }
  
  return children;
}

// Main App Layout with Navigation
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <main className="main-content">
        {children}
      </main>
      <Navigation />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <Signup />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout>
            <Dashboard />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/salah" element={
        <ProtectedRoute>
          <AppLayout>
            <Salah />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/quran" element={
        <ProtectedRoute>
          <AppLayout>
            <Quran />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/workout" element={
        <ProtectedRoute>
          <AppLayout>
            <Workout />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/habits" element={
        <ProtectedRoute>
          <AppLayout>
            <Habits />
          </AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout>
            <Profile />
          </AppLayout>
        </ProtectedRoute>
      } />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <AppRoutes />
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
