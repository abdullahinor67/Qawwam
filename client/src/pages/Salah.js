import React, { useState, useEffect } from 'react';
import { useAuth, TIERS } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Sun, Sunrise, Sunset, Moon, Cloud,
  Check, X, Clock, Edit2, ChevronLeft, ChevronRight,
  Lock
} from 'lucide-react';
import FeatureGate from '../components/FeatureGate';

const PRAYER_ICONS = {
  fajr: Sunrise,
  dhuhr: Sun,
  asr: Cloud,
  maghrib: Sunset,
  isha: Moon
};

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const PRAYER_KEYS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

const STATUS_OPTIONS = [
  { value: 'on_time', label: 'On Time', color: 'var(--success)', icon: Check },
  { value: 'late', label: 'Late', color: 'var(--warning)', icon: Clock },
  { value: 'missed', label: 'Missed', color: 'var(--error)', icon: X },
  { value: 'pending', label: 'Pending', color: 'var(--text-muted)', icon: Clock }
];

function Salah() {
  const { user, hasAccess, getTier } = useAuth();
  const { addXp } = useApp();
  const tier = getTier();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prayerData, setPrayerData] = useState({});
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [editingPrayer, setEditingPrayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekHistory, setWeekHistory] = useState([]);

  const today = new Date();
  const isToday = selectedDate.toDateString() === today.toDateString();
  const isYesterday = selectedDate.toDateString() === new Date(today.getTime() - 86400000).toDateString();
  const isTomorrow = selectedDate.toDateString() === new Date(today.getTime() + 86400000).toDateString();
  const isPast = selectedDate < today && !isToday;
  const isFuture = selectedDate > today;

  // Get date string for Firestore
  const getDateStr = (date) => date.toISOString().split('T')[0];

  // Load prayer data
  useEffect(() => {
    if (user) {
      loadPrayerData();
      loadWeekHistory();
      fetchPrayerTimes();
    }
  }, [user, selectedDate]);

  const loadPrayerData = async () => {
    setLoading(true);
    try {
      const dateStr = getDateStr(selectedDate);
      const docRef = doc(db, 'users', user.uid, 'prayers', dateStr);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setPrayerData(docSnap.data());
      } else {
        setPrayerData({
          fajr: 'pending',
          dhuhr: 'pending',
          asr: 'pending',
          maghrib: 'pending',
          isha: 'pending'
        });
      }
    } catch (error) {
      console.error('Error loading prayer data:', error);
    }
    setLoading(false);
  };

  const loadWeekHistory = async () => {
    if (!hasAccess('salah_history')) return;
    
    try {
      const history = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 86400000);
        const dateStr = getDateStr(date);
        const docRef = doc(db, 'users', user.uid, 'prayers', dateStr);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          const completed = PRAYER_KEYS.filter(p => 
            data[p] === 'on_time' || data[p] === 'late'
          ).length;
          history.push({ date, completed, data });
        } else {
          history.push({ date, completed: 0, data: null });
        }
      }
      setWeekHistory(history);
    } catch (error) {
      console.error('Error loading week history:', error);
    }
  };

  const fetchPrayerTimes = async () => {
    try {
      // Using Aladhan API for prayer times
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity/${getDateStr(selectedDate)}?city=Minneapolis&country=USA&method=2`
      );
      const data = await response.json();
      setPrayerTimes(data.data.timings);
    } catch (error) {
      console.error('Error fetching prayer times:', error);
    }
  };

  const updatePrayerStatus = async (prayer, status) => {
    if (!hasAccess('salah_tracking')) return;
    
    const newData = { ...prayerData, [prayer]: status };
    setPrayerData(newData);
    setEditingPrayer(null);

    // Save to Firestore
    try {
      const dateStr = getDateStr(selectedDate);
      await setDoc(doc(db, 'users', user.uid, 'prayers', dateStr), newData);
      
      // Add XP for on_time prayers
      if (status === 'on_time') {
        addXp(20);
      } else if (status === 'late') {
        addXp(10);
      }
    } catch (error) {
      console.error('Error saving prayer status:', error);
    }
  };

  const getStatusInfo = (status) => {
    return STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[3];
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + direction);
    
    // Don't allow navigation to dates more than 1 day in the future
    if (newDate > new Date(today.getTime() + 86400000)) return;
    // Don't allow navigation to dates more than 7 days in the past
    if (newDate < new Date(today.getTime() - 7 * 86400000)) return;
    
    setSelectedDate(newDate);
  };

  const completedToday = PRAYER_KEYS.filter(p => 
    prayerData[p] === 'on_time' || prayerData[p] === 'late'
  ).length;

  const onTimeToday = PRAYER_KEYS.filter(p => prayerData[p] === 'on_time').length;

  return (
    <div className="salah-page">
      <header className="page-header">
        <h1>🕌 Salah</h1>
        <p className="subtitle">Track your daily prayers</p>
      </header>

      {/* Date Navigator */}
      <div className="date-navigator">
        <button 
          className="nav-btn"
          onClick={() => navigateDate(-1)}
          disabled={selectedDate <= new Date(today.getTime() - 7 * 86400000)}
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="date-display">
          <span className="date-label">
            {isToday ? 'Today' : isYesterday ? 'Yesterday' : isTomorrow ? 'Tomorrow' : ''}
          </span>
          <span className="date-value">
            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        
        <button 
          className="nav-btn"
          onClick={() => navigateDate(1)}
          disabled={selectedDate >= new Date(today.getTime() + 86400000)}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Progress Card */}
      <div className="progress-card">
        <div className="progress-ring-container">
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--bg-surface-light)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="var(--ring-salah)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(completedToday / 5) * 251.2} 251.2`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="progress-text">
            <span className="progress-value">{completedToday}</span>
            <span className="progress-total">/5</span>
          </div>
        </div>
        <div className="progress-stats">
          <div className="stat">
            <Check size={16} className="on-time" />
            <span>{onTimeToday} on time</span>
          </div>
          <div className="stat">
            <Clock size={16} className="late" />
            <span>{completedToday - onTimeToday} late</span>
          </div>
          <div className="stat">
            <X size={16} className="missed" />
            <span>{5 - completedToday} {isToday ? 'remaining' : 'missed'}</span>
          </div>
        </div>
      </div>

      {/* Prayer List */}
      <div className="prayer-list">
        {PRAYER_KEYS.map((prayer, index) => {
          const Icon = PRAYER_ICONS[prayer];
          const status = prayerData[prayer] || 'pending';
          const statusInfo = getStatusInfo(status);
          const time = prayerTimes?.[prayer.charAt(0).toUpperCase() + prayer.slice(1)];
          const canEdit = hasAccess('salah_tracking') && !isFuture;

          return (
            <div 
              key={prayer}
              className={`prayer-item ${status}`}
            >
              <div className="prayer-icon">
                <Icon size={22} />
              </div>
              
              <div className="prayer-info">
                <h3>{PRAYER_NAMES[index]}</h3>
                <span className="prayer-time">{time || '--:--'}</span>
              </div>

              <div className="prayer-status">
                {editingPrayer === prayer ? (
                  <div className="status-options">
                    {STATUS_OPTIONS.slice(0, 3).map(opt => (
                      <button
                        key={opt.value}
                        className={`status-btn ${opt.value}`}
                        onClick={() => updatePrayerStatus(prayer, opt.value)}
                        title={opt.label}
                      >
                        <opt.icon size={16} />
                      </button>
                    ))}
                    <button
                      className="status-btn cancel"
                      onClick={() => setEditingPrayer(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div 
                    className={`status-badge ${status}`}
                    onClick={() => canEdit && setEditingPrayer(prayer)}
                    style={{ cursor: canEdit ? 'pointer' : 'default' }}
                  >
                    <statusInfo.icon size={14} />
                    <span>{statusInfo.label}</span>
                    {canEdit && <Edit2 size={12} className="edit-icon" />}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Feature locked notice for free users */}
      {!hasAccess('salah_tracking') && (
        <div className="feature-notice">
          <Lock size={16} />
          <span>Prayer tracking is a Pro feature. <a href="/pricing">Upgrade</a></span>
        </div>
      )}

      {/* Week History - Pro Feature */}
      {hasAccess('salah_history') && weekHistory.length > 0 && (
        <div className="week-history">
          <h3>This Week</h3>
          <div className="history-dots">
            {weekHistory.map((day, i) => (
              <div 
                key={i} 
                className={`day-dot ${day.date.toDateString() === selectedDate.toDateString() ? 'selected' : ''}`}
                onClick={() => setSelectedDate(day.date)}
              >
                <span className="day-name">
                  {day.date.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)}
                </span>
                <div className="dot-progress">
                  {[...Array(5)].map((_, j) => (
                    <span 
                      key={j} 
                      className={`mini-dot ${j < day.completed ? 'filled' : ''}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .salah-page {
          padding: 20px;
          padding-bottom: 100px;
        }
        .page-header {
          margin-bottom: 20px;
        }
        .page-header h1 { font-size: 28px; margin-bottom: 4px; }
        .subtitle { color: var(--text-muted); font-size: 14px; }
        
        .date-navigator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .nav-btn {
          background: var(--bg-surface-light);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .date-display {
          text-align: center;
        }
        .date-label {
          display: block;
          font-size: 12px;
          color: var(--gold);
          font-weight: 600;
        }
        .date-value {
          font-size: 14px;
          color: var(--text-secondary);
        }
        
        .progress-card {
          display: flex;
          align-items: center;
          gap: 24px;
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .progress-ring-container {
          position: relative;
          flex-shrink: 0;
        }
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }
        .progress-value {
          font-size: 28px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .progress-total {
          font-size: 16px;
          color: var(--text-muted);
        }
        .progress-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .stat {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .stat .on-time { color: var(--success); }
        .stat .late { color: var(--warning); }
        .stat .missed { color: var(--error); }
        
        .prayer-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .prayer-item {
          display: flex;
          align-items: center;
          gap: 14px;
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 14px;
          border-left: 4px solid var(--text-muted);
        }
        .prayer-item.on_time { border-left-color: var(--success); }
        .prayer-item.late { border-left-color: var(--warning); }
        .prayer-item.missed { border-left-color: var(--error); }
        
        .prayer-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--bg-surface-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--gold);
        }
        .prayer-info {
          flex: 1;
        }
        .prayer-info h3 { font-size: 15px; margin-bottom: 2px; }
        .prayer-time { font-size: 12px; color: var(--text-muted); }
        
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          background: var(--bg-surface-light);
          color: var(--text-muted);
        }
        .status-badge.on_time {
          background: rgba(46,204,113,0.2);
          color: var(--success);
        }
        .status-badge.late {
          background: rgba(241,196,15,0.2);
          color: var(--warning);
        }
        .status-badge.missed {
          background: rgba(231,76,60,0.2);
          color: var(--error);
        }
        .edit-icon {
          opacity: 0;
          margin-left: 4px;
        }
        .status-badge:hover .edit-icon { opacity: 0.7; }
        
        .status-options {
          display: flex;
          gap: 6px;
        }
        .status-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .status-btn.on_time {
          background: rgba(46,204,113,0.2);
          color: var(--success);
        }
        .status-btn.late {
          background: rgba(241,196,15,0.2);
          color: var(--warning);
        }
        .status-btn.missed {
          background: rgba(231,76,60,0.2);
          color: var(--error);
        }
        .status-btn.cancel {
          background: var(--bg-surface-light);
          color: var(--text-muted);
        }
        
        .feature-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px;
          background: var(--bg-surface);
          border-radius: 12px;
          font-size: 13px;
          color: var(--text-muted);
          margin-bottom: 20px;
        }
        .feature-notice a {
          color: var(--gold);
          text-decoration: none;
          font-weight: 600;
        }
        
        .week-history {
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 14px;
        }
        .week-history h3 {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 14px;
          text-align: center;
        }
        .history-dots {
          display: flex;
          justify-content: space-between;
        }
        .day-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 8px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.2s;
        }
        .day-dot:hover { background: var(--bg-surface-light); }
        .day-dot.selected { background: var(--primary); }
        .day-name {
          font-size: 11px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .dot-progress {
          display: flex;
          gap: 2px;
        }
        .mini-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--bg-surface-light);
        }
        .mini-dot.filled { background: var(--ring-salah); }
      `}</style>
    </div>
  );
}

export default Salah;
