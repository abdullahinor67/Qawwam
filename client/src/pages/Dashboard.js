import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';
import { 
  Sun, Moon, Sunrise, BookOpen, Dumbbell, CheckSquare, 
  TrendingUp, Award, Flame, Target, ChevronRight, Edit2, Check,
  Calendar, Brain, Scale
} from 'lucide-react';
import ProgressRing from '../components/ProgressRing';

function Dashboard() {
  const { 
    xp, level, streak, prayerTimes, todayPrayers,
    quranStats, workoutStats, quizHistory, userName, setUserName
  } = useApp();
  
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(userName);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 12) return { text: 'Good Morning', icon: <Sunrise className="greeting-icon sunrise" />, emoji: '🌅' };
    if (hour >= 12 && hour < 17) return { text: 'Good Afternoon', icon: <Sun className="greeting-icon sun" />, emoji: '☀️' };
    if (hour >= 17 && hour < 21) return { text: 'Good Evening', icon: <Sunset className="greeting-icon sunset" />, emoji: '🌇' };
    return { text: 'Good Night', icon: <Moon className="greeting-icon moon" />, emoji: '🌙' };
  };

  const greeting = getGreeting();

  const saveName = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
    }
    setEditingName(false);
  };

  // Calculate prayer progress
  const prayerNames = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const completedPrayers = prayerNames.filter(p => todayPrayers[p]).length;
  const prayerProgress = (completedPrayers / 5) * 100;

  // Calculate XP for next level
  const xpForCurrentLevel = level * 100;
  const xpProgress = ((xp % 100) / 100) * 100;

  // Get next prayer
  const getNextPrayer = () => {
    if (!prayerTimes) return null;
    const now = new Date();
    for (const prayer of prayerNames) {
      const time = new Date(prayerTimes[prayer]);
      if (time > now && !todayPrayers[prayer]) {
        return { name: prayer, time };
      }
    }
    return null;
  };

  const nextPrayer = getNextPrayer();

  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Get motivational message
  const getMotivation = () => {
    if (completedPrayers === 5) return "All prayers complete! Mashallah! 🌟";
    if (streak >= 7) return `${streak} day streak! Keep going! 🔥`;
    if (completedPrayers >= 3) return "Great progress today! 💪";
    return "Every good deed counts! 🌱";
  };

  return (
    <div className="dashboard">
      {/* Header with Greeting */}
      <header className="dash-header">
        <div className="greeting-section">
          <div className="greeting-row">
            <span className="greeting-emoji">{greeting.emoji}</span>
            <span className="greeting-text">{greeting.text},</span>
          </div>
          {editingName ? (
            <div className="name-edit">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                placeholder="Enter your name"
                autoFocus
                onKeyPress={(e) => e.key === 'Enter' && saveName()}
              />
              <button onClick={saveName}><Check size={18} /></button>
            </div>
          ) : (
            <div className="name-row">
              <h1 className="user-name">{userName || 'Friend'}</h1>
              <button className="edit-name-btn" onClick={() => { setTempName(userName); setEditingName(true); }}>
                <Edit2 size={14} />
              </button>
            </div>
          )}
        </div>
        <div className="header-stats">
          <div className="level-badge">
            <Award size={16} />
            <span>Lvl {level}</span>
          </div>
        </div>
      </header>

      {/* Motivation Banner */}
      <div className="motivation-banner">
        <span>{getMotivation()}</span>
      </div>

      {/* XP Progress Bar */}
      <div className="xp-card">
        <div className="xp-header">
          <span className="xp-label">Level {level} Progress</span>
          <span className="xp-value">{xp % 100} / 100 XP</span>
        </div>
        <div className="xp-bar">
          <div className="xp-fill" style={{ width: `${xpProgress}%` }} />
        </div>
        <span className="xp-total">{xp} total XP earned</span>
      </div>

      {/* Quick Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card streak">
          <Flame size={24} />
          <div className="stat-info">
            <span className="stat-value">{streak}</span>
            <span className="stat-label">Day Streak</span>
          </div>
        </div>
        <div className="stat-card prayers">
          <Target size={24} />
          <div className="stat-info">
            <span className="stat-value">{completedPrayers}/5</span>
            <span className="stat-label">Prayers</span>
          </div>
        </div>
      </div>

      {/* Next Prayer Card */}
      {nextPrayer && (
        <Link to="/salah" className="next-prayer-card">
          <div className="prayer-glow" />
          <div className="prayer-content">
            <span className="next-label">Next Prayer</span>
            <h3 className="prayer-name">{nextPrayer.name.charAt(0).toUpperCase() + nextPrayer.name.slice(1)}</h3>
            <span className="prayer-time">{formatTime(nextPrayer.time)}</span>
          </div>
          <ChevronRight size={24} />
        </Link>
      )}

      {/* Progress Rings */}
      <div className="rings-section">
        <h2>Today's Progress</h2>
        <div className="rings-grid">
          <Link to="/salah" className="ring-item">
            <ProgressRing progress={prayerProgress} color="#2ecc71" size={70} strokeWidth={6}>
              <span className="ring-value">{completedPrayers}</span>
            </ProgressRing>
            <span className="ring-label">Salah</span>
          </Link>
          <Link to="/quran" className="ring-item">
            <ProgressRing progress={quranStats.todayProgress} color="#d4af37" size={70} strokeWidth={6}>
              <BookOpen size={20} />
            </ProgressRing>
            <span className="ring-label">Quran</span>
          </Link>
          <Link to="/workout" className="ring-item">
            <ProgressRing progress={workoutStats.todayProgress} color="#e74c3c" size={70} strokeWidth={6}>
              <Dumbbell size={20} />
            </ProgressRing>
            <span className="ring-label">Workout</span>
          </Link>
          <Link to="/habits" className="ring-item">
            <ProgressRing progress={70} color="#9b59b6" size={70} strokeWidth={6}>
              <CheckSquare size={20} />
            </ProgressRing>
            <span className="ring-label">Habits</span>
          </Link>
        </div>
      </div>

      {/* Tracking Summary Cards */}
      <div className="tracking-section">
        <h2>Your Progress</h2>
        
        {/* Quran Stats */}
        <div className="tracking-card quran">
          <div className="tracking-icon">
            <BookOpen size={20} />
          </div>
          <div className="tracking-content">
            <h4>Quran Journey</h4>
            <div className="tracking-stats">
              <div className="track-stat">
                <span className="track-value">{quranStats.pagesMemorized}</span>
                <span className="track-label">Pages Memorized</span>
              </div>
              <div className="track-stat">
                <span className="track-value">{quranStats.pagesRevised}</span>
                <span className="track-label">Pages Revised</span>
              </div>
              <div className="track-stat">
                <span className="track-value">{quranStats.quizzesTaken}</span>
                <span className="track-label">Quizzes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quiz Stats */}
        <div className="tracking-card quiz">
          <div className="tracking-icon">
            <Brain size={20} />
          </div>
          <div className="tracking-content">
            <h4>Quiz Performance</h4>
            <div className="tracking-stats">
              <div className="track-stat">
                <span className="track-value">{quizHistory.totalQuizzes}</span>
                <span className="track-label">Total Quizzes</span>
              </div>
              <div className="track-stat">
                <span className="track-value">{quizHistory.averageScore}%</span>
                <span className="track-label">Avg Score</span>
              </div>
              <div className="track-stat">
                <span className="track-value">{quizHistory.totalMistakes}</span>
                <span className="track-label">Mistakes</span>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Stats */}
        <div className="tracking-card workout">
          <div className="tracking-icon">
            <Scale size={20} />
          </div>
          <div className="tracking-content">
            <h4>Fitness Tracker</h4>
            <div className="tracking-stats">
              <div className="track-stat">
                <span className="track-value">{workoutStats.workoutsCompleted}</span>
                <span className="track-label">Workouts</span>
              </div>
              <div className="track-stat">
                <span className="track-value">{workoutStats.currentWeight || '--'}</span>
                <span className="track-label">Current lbs</span>
              </div>
              <div className="track-stat">
                <span className="track-value">{workoutStats.weekStreak}</span>
                <span className="track-label">Week Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/salah" className="action-btn">
            <span className="action-emoji">🕌</span>
            <span>Salah</span>
          </Link>
          <Link to="/quran" className="action-btn">
            <span className="action-emoji">📖</span>
            <span>Quran</span>
          </Link>
          <Link to="/workout" className="action-btn">
            <span className="action-emoji">💪</span>
            <span>Workout</span>
          </Link>
          <Link to="/habits" className="action-btn">
            <span className="action-emoji">✅</span>
            <span>Habits</span>
          </Link>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 20px;
          padding-bottom: 100px;
          animation: fadeIn 0.4s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }
        .greeting-section {
          flex: 1;
        }
        .greeting-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }
        .greeting-emoji {
          font-size: 24px;
        }
        .greeting-text {
          font-size: 16px;
          color: var(--text-secondary);
        }
        .name-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .user-name {
          font-size: 28px;
          font-weight: 700;
          background: linear-gradient(135deg, var(--gold) 0%, #f4d03f 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .edit-name-btn {
          background: var(--bg-surface);
          border: none;
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
        }
        .name-edit {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .name-edit input {
          font-size: 24px;
          font-weight: 700;
          background: var(--bg-surface);
          border: 2px solid var(--gold);
          border-radius: 8px;
          padding: 8px 12px;
          color: var(--gold);
          width: 200px;
        }
        .name-edit button {
          background: var(--gold);
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          color: var(--bg-primary);
          cursor: pointer;
        }
        .header-stats {
          display: flex;
          gap: 8px;
        }
        .level-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--gold);
        }

        .motivation-banner {
          background: linear-gradient(135deg, rgba(212,175,55,0.15) 0%, rgba(212,175,55,0.05) 100%);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 12px 16px;
          border-radius: 12px;
          text-align: center;
          font-size: 14px;
          color: var(--gold);
          margin-bottom: 16px;
        }

        .xp-card {
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 14px;
          margin-bottom: 16px;
        }
        .xp-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        .xp-label {
          font-size: 13px;
          color: var(--text-secondary);
        }
        .xp-value {
          font-size: 13px;
          color: var(--gold);
          font-weight: 600;
        }
        .xp-bar {
          height: 8px;
          background: var(--bg-surface-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .xp-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--gold) 0%, #f4d03f 100%);
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .xp-total {
          display: block;
          text-align: right;
          font-size: 11px;
          color: var(--text-muted);
          margin-top: 6px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 14px;
        }
        .stat-card.streak {
          background: linear-gradient(135deg, rgba(231,76,60,0.2) 0%, rgba(231,76,60,0.05) 100%);
          color: #e74c3c;
        }
        .stat-card.prayers {
          background: linear-gradient(135deg, rgba(46,204,113,0.2) 0%, rgba(46,204,113,0.05) 100%);
          color: var(--success);
        }
        .stat-info {
          display: flex;
          flex-direction: column;
        }
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .stat-label {
          font-size: 11px;
          opacity: 0.8;
        }

        .next-prayer-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 20px;
          text-decoration: none;
          color: var(--text-primary);
          position: relative;
          overflow: hidden;
        }
        .prayer-glow {
          position: absolute;
          top: -50%;
          right: -20%;
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%);
          pointer-events: none;
        }
        .prayer-content {
          flex: 1;
          z-index: 1;
        }
        .next-label {
          font-size: 11px;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .prayer-name {
          font-size: 22px;
          font-weight: 700;
          color: var(--gold);
          margin: 4px 0;
        }
        .prayer-time {
          font-size: 14px;
          color: var(--text-secondary);
        }

        .rings-section {
          margin-bottom: 24px;
        }
        .rings-section h2 {
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .rings-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .ring-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          color: var(--text-primary);
          padding: 12px 8px;
          background: var(--bg-surface);
          border-radius: 14px;
          transition: transform 0.2s ease;
        }
        .ring-item:hover {
          transform: translateY(-4px);
        }
        .ring-value {
          font-size: 18px;
          font-weight: 700;
        }
        .ring-label {
          font-size: 11px;
          color: var(--text-muted);
        }

        .tracking-section {
          margin-bottom: 24px;
        }
        .tracking-section h2 {
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .tracking-card {
          display: flex;
          gap: 14px;
          padding: 16px;
          background: var(--bg-surface);
          border-radius: 14px;
          margin-bottom: 10px;
        }
        .tracking-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .tracking-card.quran .tracking-icon {
          background: rgba(212,175,55,0.2);
          color: var(--gold);
        }
        .tracking-card.quiz .tracking-icon {
          background: rgba(155,89,182,0.2);
          color: #9b59b6;
        }
        .tracking-card.workout .tracking-icon {
          background: rgba(231,76,60,0.2);
          color: #e74c3c;
        }
        .tracking-content {
          flex: 1;
        }
        .tracking-content h4 {
          font-size: 14px;
          margin-bottom: 10px;
        }
        .tracking-stats {
          display: flex;
          gap: 16px;
        }
        .track-stat {
          display: flex;
          flex-direction: column;
        }
        .track-value {
          font-size: 18px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .track-label {
          font-size: 10px;
          color: var(--text-muted);
        }

        .quick-actions h2 {
          font-size: 16px;
          color: var(--text-secondary);
          margin-bottom: 14px;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }
        .action-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 10px;
          background: var(--bg-surface);
          border-radius: 14px;
          text-decoration: none;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }
        .action-btn:hover {
          background: var(--primary);
          transform: translateY(-2px);
        }
        .action-emoji {
          font-size: 24px;
        }
        .action-btn span:last-child {
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

// Sunset icon component
function Sunset({ className }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 18a5 5 0 0 0-10 0"/>
      <line x1="12" y1="9" x2="12" y2="2"/>
      <line x1="4.22" y1="10.22" x2="5.64" y2="11.64"/>
      <line x1="1" y1="18" x2="3" y2="18"/>
      <line x1="21" y1="18" x2="23" y2="18"/>
      <line x1="18.36" y1="11.64" x2="19.78" y2="10.22"/>
      <line x1="23" y1="22" x2="1" y2="22"/>
      <polyline points="16 5 12 9 8 5"/>
    </svg>
  );
}

export default Dashboard;
