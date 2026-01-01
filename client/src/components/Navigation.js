import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth, TIER_COLORS } from '../context/AuthContext';
import { Home, Moon, BookOpen, Dumbbell, CheckSquare, User, Crown } from 'lucide-react';

function Navigation() {
  const { userProfile, getTier } = useAuth();
  const tier = getTier();
  const tierColor = TIER_COLORS[tier];

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/salah', icon: Moon, label: 'Salah' },
    { path: '/quran', icon: BookOpen, label: 'Quran' },
    { path: '/workout', icon: Dumbbell, label: 'Workout' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <div className="nav-icon">
            <item.icon size={22} />
            {item.path === '/profile' && tier !== 'free' && (
              <span className="tier-dot" style={{ background: tierColor?.bg }}></span>
            )}
          </div>
          <span className="nav-label">{item.label}</span>
        </NavLink>
      ))}

      <style>{`
        .bottom-nav {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 8px 0 20px;
          background: linear-gradient(180deg, transparent 0%, var(--bg-primary) 20%);
          backdrop-filter: blur(10px);
          border-top: 1px solid var(--bg-surface-light);
          z-index: 100;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          color: var(--text-muted);
          padding: 8px 16px;
          border-radius: 12px;
          transition: all 0.2s ease;
        }
        .nav-item.active {
          color: var(--gold);
        }
        .nav-item:hover {
          color: var(--text-secondary);
        }
        .nav-icon {
          position: relative;
        }
        .tier-dot {
          position: absolute;
          top: -2px;
          right: -4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          border: 2px solid var(--bg-primary);
        }
        .nav-label {
          font-size: 10px;
          font-weight: 500;
        }
        .nav-item.active .nav-label {
          font-weight: 600;
        }
      `}</style>
    </nav>
  );
}

export default Navigation;

