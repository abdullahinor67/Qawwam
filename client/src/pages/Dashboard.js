import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, TIERS, TIER_LABELS } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  Sun, Moon, Sunrise, Sunset,
  BookOpen, Calendar, Dumbbell, ListChecks,
  Crown, Star, Trophy, Flame, Award,
  ChevronRight, Edit2, BarChart3
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';

const TOTAL_QURAN_PAGES = 604;

function Dashboard() {
  const { user, userProfile, getTier, getTierLabel, updateUserProfile } = useAuth();
  const { userXp, userLevel, userStreak, calculateLevel } = useApp();
  
  const [greeting, setGreeting] = useState('');
  const [greetingIcon, setGreetingIcon] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  
  const [stats, setStats] = useState({
    salahToday: 0,
    quranMemorized: 0,
    quranProgress: 0,
    quizScore: 0,
    workoutDays: 0,
    weightLost: 0,
    streak: 0
  });

  const tier = getTier();
  const tierLabel = getTierLabel();

  // Set greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('Good Morning');
      setGreetingIcon(<Sunrise size={24} className="greeting-icon sunrise" />);
    } else if (hour >= 12 && hour < 17) {
      setGreeting('Good Afternoon');
      setGreetingIcon(<Sun size={24} className="greeting-icon sun" />);
    } else if (hour >= 17 && hour < 21) {
      setGreeting('Good Evening');
      setGreetingIcon(<Sunset size={24} className="greeting-icon sunset" />);
    } else {
      setGreeting('Good Night');
      setGreetingIcon(<Moon size={24} className="greeting-icon moon" />);
    }
  }, []);

  // Load user stats from Firestore
  useEffect(() => {
    if (user) {
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      // Load salah stats
      const today = new Date().toISOString().split('T')[0];
      const salahDoc = await getDoc(doc(db, 'users', user.uid, 'prayers', today));
      if (salahDoc.exists()) {
        const prayers = salahDoc.data();
        const completed = Object.values(prayers).filter(s => s === 'on_time' || s === 'late').length;
        setStats(prev => ({ ...prev, salahToday: completed }));
      }

      // Load workout stats
      const workoutDoc = await getDoc(doc(db, 'users', user.uid, 'fitness', 'workout'));
      if (workoutDoc.exists()) {
        const workout = workoutDoc.data();
        const completedDays = Object.keys(workout.completedWorkouts || {}).length;
        const currentWeight = workout.currentWeight;
        const startWeight = workout.weightHistory?.[0]?.weight;
        const lost = startWeight && currentWeight ? (startWeight - currentWeight).toFixed(1) : 0;
        setStats(prev => ({ 
          ...prev, 
          workoutDays: completedDays,
          weightLost: lost 
        }));
      }

      // Load quran/quiz stats (now using pages)
      const quranDoc = await getDoc(doc(db, 'users', user.uid, 'quran', 'memorization'));
      if (quranDoc.exists()) {
        const quran = quranDoc.data();
        const memorizedPages = quran.progress?.memorizedPages?.length || 0;
        const quranProgressPercent = (memorizedPages / TOTAL_QURAN_PAGES) * 100;
        setStats(prev => ({ 
          ...prev, 
          quranMemorized: memorizedPages,
          quranProgress: quranProgressPercent,
          quizScore: quran.progress?.points || 0,
          streak: quran.progress?.streak || 0
        }));
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleNameSave = async () => {
    if (newName.trim()) {
      await updateUserProfile({ name: newName.trim() });
      setEditingName(false);
    }
  };

  const userName = userProfile?.name || user?.displayName || 'User';
  const levelProgress = calculateLevel(userXp);

  // Tier badge colors
  const tierColors = {
    [TIERS.FREE]: { bg: '#374151', text: '#9ca3af' },
    [TIERS.PRO]: { bg: '#92400e', text: '#fbbf24' },
    [TIERS.PRO_PLUS]: { bg: '#5b21b6', text: '#a78bfa' }
  };

  return (
    <div className="dashboard">
      {/* Header Section */}
      <header className="dashboard-header">
        <div className="greeting-section">
          {greetingIcon}
          <div>
            <p className="greeting-text">{greeting},</p>
            {editingName ? (
              <div className="name-edit">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={userName}
                  autoFocus
                />
                <button onClick={handleNameSave}>Save</button>
                <button onClick={() => setEditingName(false)} className="cancel">Cancel</button>
              </div>
            ) : (
              <h1 className="user-name" onClick={() => { setNewName(userName); setEditingName(true); }}>
                {userName} <Edit2 size={14} className="edit-icon" />
              </h1>
            )}
          </div>
        </div>
        
        <div className="badges-row">
          <span 
            className="tier-badge"
            style={{ 
              background: tierColors[tier].bg,
              color: tierColors[tier].text
            }}
          >
            {tier !== TIERS.FREE && <Crown size={12} />}
            {tierLabel}
          </span>
          <span className="level-badge">
            <Trophy size={12} />
            Lvl {levelProgress.level}
          </span>
        </div>
      </header>

      {/* Level Progress Bar */}
      <div className="level-progress-card">
        <div className="level-info">
          <span>Level {levelProgress.level}</span>
          <span className="xp-text">{userXp} XP</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${levelProgress.progress}%` }}
          />
        </div>
        <span className="xp-to-next">{levelProgress.xpToNext} XP to Level {levelProgress.level + 1}</span>
      </div>

      {/* Stats Row */}
      <div className="stats-row">
        <div className="stat-card streak">
          <Flame size={20} />
          <span className="stat-value">{userStreak}</span>
          <span className="stat-label">Day Streak</span>
        </div>
        <div className="stat-card xp">
          <Star size={20} />
          <span className="stat-value">{userXp}</span>
          <span className="stat-label">Total XP</span>
        </div>
        <div className="stat-card awards">
          <Award size={20} />
          <span className="stat-value">{levelProgress.level}</span>
          <span className="stat-label">Level</span>
        </div>
      </div>

      {/* Quick Access Cards */}
      <section className="quick-access">
        <h2>Today's Progress</h2>
        
        <div className="progress-cards">
          <Link to="/salah" className="progress-card salah">
            <div className="card-icon">
              <Calendar size={24} />
            </div>
            <div className="card-content">
              <h3>Salah</h3>
              <p className="card-stat">{stats.salahToday}/5 completed</p>
            </div>
            <ProgressRing 
              progress={(stats.salahToday / 5) * 100}
              size={50}
              strokeWidth={4}
              color="var(--ring-salah)"
            />
            <ChevronRight size={18} className="chevron" />
          </Link>

          <Link to="/quran" className="progress-card quran">
            <div className="card-icon">
              <BookOpen size={24} />
            </div>
            <div className="card-content">
              <h3>Quran</h3>
              <p className="card-stat">{stats.quranMemorized} pages • {stats.quranProgress.toFixed(1)}%</p>
              <div className="mini-progress-bar">
                <div className="mini-progress-fill" style={{ width: `${stats.quranProgress}%` }} />
              </div>
            </div>
            <div className="points-badge">
              <Star size={12} />
              {stats.quizScore}
            </div>
            <ChevronRight size={18} className="chevron" />
          </Link>

          <Link to="/workout" className="progress-card workout">
            <div className="card-icon">
              <Dumbbell size={24} />
            </div>
            <div className="card-content">
              <h3>Workout</h3>
              <p className="card-stat">{stats.workoutDays} days • {stats.weightLost > 0 ? `-${stats.weightLost}lbs` : 'Start today!'}</p>
            </div>
            <ChevronRight size={18} className="chevron" />
          </Link>

          <Link to="/habits" className="progress-card habits">
            <div className="card-icon">
              <ListChecks size={24} />
            </div>
            <div className="card-content">
              <h3>Habits</h3>
              <p className="card-stat">Build your routine</p>
            </div>
            <ChevronRight size={18} className="chevron" />
          </Link>
        </div>
      </section>

      {/* Upgrade Banner for Free Users */}
      {tier === TIERS.FREE && (
        <Link to="/pricing" className="upgrade-banner">
          <Crown size={24} />
          <div>
            <h4>Upgrade to Pro</h4>
            <p>Unlock Quran memorization, workout tracking, and more!</p>
          </div>
          <ChevronRight size={20} />
        </Link>
      )}

      <style>{`
        .dashboard {
          padding: 20px;
          padding-bottom: 100px;
          animation: fadeIn 0.3s ease-out;
        }
        
        .dashboard-header {
          margin-bottom: 20px;
        }
        
        .greeting-section {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }
        
        .greeting-icon {
          margin-top: 4px;
        }
        .greeting-icon.sunrise { color: #f59e0b; }
        .greeting-icon.sun { color: #fbbf24; }
        .greeting-icon.sunset { color: #f97316; }
        .greeting-icon.moon { color: #a78bfa; }
        
        .greeting-text {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }
        
        .user-name {
          font-size: 28px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
        }
        
        .edit-icon {
          color: var(--text-muted);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .user-name:hover .edit-icon { opacity: 1; }
        
        .name-edit {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .name-edit input {
          font-size: 20px;
          background: var(--bg-surface);
          border: 2px solid var(--gold);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--text-primary);
          width: 180px;
        }
        .name-edit button {
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          background: var(--gold);
          color: var(--bg-primary);
        }
        .name-edit button.cancel {
          background: var(--bg-surface);
          color: var(--text-secondary);
        }
        
        .badges-row {
          display: flex;
          gap: 8px;
        }
        
        .tier-badge, .level-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
        
        .level-badge {
          background: var(--primary);
          color: var(--gold);
        }
        
        .level-progress-card {
          background: var(--bg-surface);
          padding: 18px;
          border-radius: 14px;
          margin-bottom: 16px;
        }
        
        .level-info {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 10px;
        }
        .xp-text { color: var(--gold); font-weight: 600; }
        
        .progress-bar {
          height: 8px;
          background: var(--bg-surface-light);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold), var(--gold-light));
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .xp-to-next {
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 24px;
        }
        
        .stat-card {
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 12px;
          text-align: center;
        }
        .stat-card svg { margin-bottom: 8px; }
        .stat-card.streak svg { color: #ef4444; }
        .stat-card.xp svg { color: var(--gold); }
        .stat-card.awards svg { color: #3b82f6; }
        .stat-value {
          display: block;
          font-size: 22px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .quick-access h2 {
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        
        .progress-cards {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .progress-card {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 14px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s ease;
          border-left: 4px solid transparent;
        }
        .progress-card:hover {
          background: var(--bg-surface-light);
          transform: translateX(4px);
        }
        
        .progress-card.salah { border-left-color: var(--ring-salah); }
        .progress-card.quran { border-left-color: var(--ring-quran); }
        .progress-card.workout { border-left-color: var(--ring-workout); }
        .progress-card.habits { border-left-color: var(--ring-habit); }
        
        .card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--bg-surface-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .progress-card.salah .card-icon { color: var(--ring-salah); }
        .progress-card.quran .card-icon { color: var(--ring-quran); }
        .progress-card.workout .card-icon { color: var(--ring-workout); }
        .progress-card.habits .card-icon { color: var(--ring-habit); }
        
        .card-content {
          flex: 1;
        }
        .card-content h3 { font-size: 15px; margin-bottom: 2px; }
        .card-stat { font-size: 12px; color: var(--text-muted); }
        
        .mini-progress-bar {
          height: 4px;
          background: var(--bg-surface-light);
          border-radius: 2px;
          margin-top: 6px;
          overflow: hidden;
        }
        .mini-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--ring-quran), #27ae60);
          border-radius: 2px;
          transition: width 0.5s ease;
        }
        
        .points-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--primary);
          padding: 6px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: var(--gold);
        }
        
        .chevron { color: var(--text-muted); }
        
        .upgrade-banner {
          display: flex;
          align-items: center;
          gap: 14px;
          background: linear-gradient(135deg, #92400e 0%, #78350f 100%);
          padding: 18px;
          border-radius: 14px;
          margin-top: 24px;
          text-decoration: none;
          color: var(--text-primary);
          border: 1px solid rgba(251,191,36,0.3);
        }
        .upgrade-banner svg:first-child { color: #fbbf24; }
        .upgrade-banner h4 { font-size: 15px; color: #fbbf24; margin-bottom: 2px; }
        .upgrade-banner p { font-size: 12px; color: var(--text-secondary); }
        .upgrade-banner > svg:last-child { margin-left: auto; color: var(--text-muted); }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
