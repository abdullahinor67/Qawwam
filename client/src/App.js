import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Home, Moon, BookOpen, Dumbbell, CheckSquare, Calendar } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import Salah from './pages/Salah';
import Quran from './pages/Quran';
import Workout from './pages/Workout';
import Habits from './pages/Habits';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="app">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/salah" element={<Salah />} />
              <Route path="/quran" element={<Quran />} />
              <Route path="/workout" element={<Workout />} />
              <Route path="/habits" element={<Habits />} />
            </Routes>
          </main>
          <Navigation />
        </div>
      </Router>
    </AppProvider>
  );
}

function Navigation() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/salah" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Moon size={22} />
        <span>Salah</span>
      </NavLink>
      <NavLink to="/quran" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <BookOpen size={22} />
        <span>Quran</span>
      </NavLink>
      <NavLink to="/workout" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <Dumbbell size={22} />
        <span>Workout</span>
      </NavLink>
      <NavLink to="/habits" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <CheckSquare size={22} />
        <span>Habits</span>
      </NavLink>
      
      <style>{`
        .app {
          min-height: 100vh;
          padding-bottom: 80px;
        }
        .main-content {
          min-height: calc(100vh - 80px);
        }
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: var(--bg-surface);
          display: flex;
          justify-content: space-around;
          padding: 12px 0;
          border-top: 1px solid var(--bg-surface-light);
          z-index: 100;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          color: var(--text-muted);
          text-decoration: none;
          font-size: 11px;
          font-weight: 500;
          padding: 8px 16px;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          color: var(--text-secondary);
          background: var(--bg-surface-light);
        }
        .nav-item.active {
          color: var(--gold);
          background: rgba(212, 175, 55, 0.1);
        }
      `}</style>
    </nav>
  );
}

export default App;

