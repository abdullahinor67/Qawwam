import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { format, subDays, addDays, isToday, isTomorrow, isYesterday } from 'date-fns';
import { Check, X, Clock, MapPin, ChevronLeft, ChevronRight, Calendar, Edit2, Trash2 } from 'lucide-react';
import axios from 'axios';

const PRAYER_NAMES = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
const PRAYER_LABELS = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha'
};
const PRAYER_ICONS = {
  fajr: '🌅',
  dhuhr: '☀️',
  asr: '🌤️',
  maghrib: '🌆',
  isha: '🌙'
};

function Salah() {
  const { location, addXp } = useApp();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState(null);
  
  // Load all prayer data from localStorage
  const [allPrayerData, setAllPrayerData] = useState(() => {
    const saved = localStorage.getItem('qawaam_all_prayers');
    return saved ? JSON.parse(saved) : {};
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('qawaam_all_prayers', JSON.stringify(allPrayerData));
  }, [allPrayerData]);

  // Get prayers for a specific date
  const getPrayersForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return allPrayerData[dateKey] || {};
  };

  // Current selected date's prayers
  const currentPrayers = getPrayersForDate(selectedDate);

  // Fetch prayer times for selected date
  useEffect(() => {
    if (!location) return;
    setLoading(true);

    axios.get(`http://localhost:5000/api/prayer-times?latitude=${location.latitude}&longitude=${location.longitude}&date=${format(selectedDate, 'yyyy-MM-dd')}`)
      .then(res => {
        setPrayerTimes(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [location, selectedDate]);

  const markPrayer = (prayer, status) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    setAllPrayerData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [prayer]: status
      }
    }));

    setEditingPrayer(null);

    // Only give XP for today's prayers
    if (isToday(selectedDate)) {
      if (status === 'on_time') addXp(50);
      else if (status === 'late') addXp(20);
    }
  };

  const clearPrayer = (prayer) => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    
    setAllPrayerData(prev => {
      const updated = { ...prev };
      if (updated[dateKey]) {
        const { [prayer]: removed, ...rest } = updated[dateKey];
        updated[dateKey] = rest;
      }
      return updated;
    });
    setEditingPrayer(null);
  };

  const getStatusIcon = (status) => {
    if (status === 'on_time') return <Check className="status-icon on-time" size={18} />;
    if (status === 'late') return <Clock className="status-icon late" size={18} />;
    if (status === 'missed') return <X className="status-icon missed" size={18} />;
    return null;
  };

  const isPrayerPast = (prayerName) => {
    if (!prayerTimes || !isToday(selectedDate)) return true;
    const time = new Date(prayerTimes[prayerName]);
    return time < new Date();
  };

  const canEdit = isToday(selectedDate) || isYesterday(selectedDate);
  const isFutureDate = selectedDate > new Date() && !isToday(selectedDate);

  const navigateDate = (direction) => {
    const newDate = direction === 'prev' 
      ? subDays(selectedDate, 1) 
      : addDays(selectedDate, 1);
    
    // Can't go more than 1 day into future
    if (newDate > addDays(new Date(), 1)) return;
    // Can't go more than 7 days into past
    if (newDate < subDays(new Date(), 7)) return;
    
    setSelectedDate(newDate);
  };

  const getDateLabel = () => {
    if (isToday(selectedDate)) return 'Today';
    if (isYesterday(selectedDate)) return 'Yesterday';
    if (isTomorrow(selectedDate)) return 'Tomorrow';
    return format(selectedDate, 'EEEE');
  };

  // Calculate stats for selected date
  const dayStats = {
    onTime: Object.values(currentPrayers).filter(s => s === 'on_time').length,
    late: Object.values(currentPrayers).filter(s => s === 'late').length,
    missed: Object.values(currentPrayers).filter(s => s === 'missed').length,
  };
  const totalMarked = dayStats.onTime + dayStats.late + dayStats.missed;

  // Get past 7 days for history
  const pastWeek = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i));

  return (
    <div className="salah-page">
      <header className="page-header">
        <h1>🕌 Salah</h1>
        <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
          <Calendar size={18} />
          <span>History</span>
        </button>
      </header>

      {/* Date Navigator */}
      <div className="date-navigator">
        <button 
          className="nav-btn" 
          onClick={() => navigateDate('prev')}
          disabled={selectedDate <= subDays(new Date(), 7)}
        >
          <ChevronLeft size={20} />
        </button>
        <div className="date-display">
          <span className="date-label">{getDateLabel()}</span>
          <span className="date-full">{format(selectedDate, 'MMMM d, yyyy')}</span>
        </div>
        <button 
          className="nav-btn" 
          onClick={() => navigateDate('next')}
          disabled={selectedDate >= addDays(new Date(), 1)}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day Stats */}
      {totalMarked > 0 && (
        <div className="day-stats">
          <div className="stat on-time">
            <Check size={14} />
            <span>{dayStats.onTime} On Time</span>
          </div>
          <div className="stat late">
            <Clock size={14} />
            <span>{dayStats.late} Late</span>
          </div>
          <div className="stat missed">
            <X size={14} />
            <span>{dayStats.missed} Missed</span>
          </div>
        </div>
      )}

      {/* Future Date Notice */}
      {isFutureDate && (
        <div className="future-notice">
          <span>🔮 Tomorrow's prayer times (view only)</span>
        </div>
      )}

      {/* Location Badge */}
      {location && isToday(selectedDate) && (
        <div className="location-badge">
          <MapPin size={14} />
          <span>Location detected</span>
        </div>
      )}

      {/* Prayer List */}
      <div className="prayers-list">
        {PRAYER_NAMES.map((prayer) => {
          const time = prayerTimes ? new Date(prayerTimes[prayer]) : null;
          const status = currentPrayers[prayer];
          const isPast = isPrayerPast(prayer);
          const showActions = canEdit && (isToday(selectedDate) ? isPast : true) && !status;
          const isEditing = editingPrayer === prayer;

          return (
            <div 
              key={prayer} 
              className={`prayer-card ${status ? 'completed' : ''} ${isPast && !status && isToday(selectedDate) ? 'pending' : ''} ${isFutureDate ? 'future' : ''}`}
            >
              <div className="prayer-main">
                <span className="prayer-emoji">{PRAYER_ICONS[prayer]}</span>
                <div className="prayer-info">
                  <h3>{PRAYER_LABELS[prayer]}</h3>
                  <span className="prayer-time">
                    {time ? format(time, 'h:mm a') : '--:--'}
                  </span>
                </div>
                {status && !isEditing && (
                  <div className={`status-badge ${status.replace('_', '-')}`}>
                    {getStatusIcon(status)}
                    <span>{status === 'on_time' ? 'On Time' : status === 'late' ? 'Late' : 'Missed'}</span>
                  </div>
                )}
                {status && canEdit && !isEditing && (
                  <button 
                    className="edit-btn"
                    onClick={() => setEditingPrayer(prayer)}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                )}
              </div>
              
              {/* Show actions for unmarked prayers */}
              {showActions && (
                <div className="prayer-actions">
                  <button 
                    className="action-btn on-time"
                    onClick={() => markPrayer(prayer, 'on_time')}
                  >
                    <Check size={16} /> On Time
                  </button>
                  <button 
                    className="action-btn late"
                    onClick={() => markPrayer(prayer, 'late')}
                  >
                    <Clock size={16} /> Late
                  </button>
                  <button 
                    className="action-btn missed"
                    onClick={() => markPrayer(prayer, 'missed')}
                  >
                    <X size={16} /> Missed
                  </button>
                </div>
              )}

              {/* Edit mode for marked prayers */}
              {isEditing && (
                <div className="prayer-actions editing">
                  <div className="edit-header">
                    <span>Change status:</span>
                    <button className="cancel-edit" onClick={() => setEditingPrayer(null)}>
                      Cancel
                    </button>
                  </div>
                  <div className="edit-buttons">
                    <button 
                      className={`action-btn on-time ${status === 'on_time' ? 'current' : ''}`}
                      onClick={() => markPrayer(prayer, 'on_time')}
                    >
                      <Check size={16} /> On Time
                    </button>
                    <button 
                      className={`action-btn late ${status === 'late' ? 'current' : ''}`}
                      onClick={() => markPrayer(prayer, 'late')}
                    >
                      <Clock size={16} /> Late
                    </button>
                    <button 
                      className={`action-btn missed ${status === 'missed' ? 'current' : ''}`}
                      onClick={() => markPrayer(prayer, 'missed')}
                    >
                      <X size={16} /> Missed
                    </button>
                  </div>
                  <button 
                    className="clear-btn"
                    onClick={() => clearPrayer(prayer)}
                  >
                    <Trash2 size={14} /> Clear Status
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* XP Summary (only for today) */}
      {isToday(selectedDate) && totalMarked > 0 && (
        <div className="xp-earned">
          <span>XP Earned Today: </span>
          <strong>{dayStats.onTime * 50 + dayStats.late * 20}</strong>
        </div>
      )}

      {/* Week History Panel */}
      {showHistory && (
        <div className="history-panel">
          <h3>📅 Past Week</h3>
          <div className="history-grid">
            {pastWeek.map((date) => {
              const dayPrayers = getPrayersForDate(date);
              const completed = Object.values(dayPrayers).filter(s => s === 'on_time' || s === 'late').length;
              const missed = Object.values(dayPrayers).filter(s => s === 'missed').length;
              const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
              
              return (
                <button 
                  key={date.toISOString()} 
                  className={`history-day ${isSelected ? 'selected' : ''} ${completed === 5 ? 'perfect' : ''}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="day-name">{format(date, 'EEE')}</span>
                  <span className="day-num">{format(date, 'd')}</span>
                  <div className="day-dots">
                    {PRAYER_NAMES.map((p) => (
                      <span 
                        key={p} 
                        className={`dot ${dayPrayers[p] || 'empty'}`}
                      />
                    ))}
                  </div>
                  {completed > 0 && (
                    <span className="day-count">{completed}/5</span>
                  )}
                </button>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="history-legend">
            <span><span className="dot on_time" /> On Time</span>
            <span><span className="dot late" /> Late</span>
            <span><span className="dot missed" /> Missed</span>
          </div>
        </div>
      )}

      <style>{`
        .salah-page {
          padding: 20px;
          padding-bottom: 100px;
        }
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }
        .page-header h1 {
          font-size: 28px;
        }
        .history-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          border: none;
          padding: 10px 14px;
          border-radius: 10px;
          color: var(--text-secondary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .history-btn:hover {
          background: var(--bg-surface-light);
          color: var(--gold);
        }

        .date-navigator {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-surface);
          padding: 12px 16px;
          border-radius: 16px;
          margin-bottom: 16px;
        }
        .nav-btn {
          background: var(--bg-surface-light);
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .nav-btn:hover:not(:disabled) {
          background: var(--primary);
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
          font-size: 18px;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
        }
        .date-full {
          font-size: 12px;
          color: var(--text-muted);
        }

        .day-stats {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .day-stats .stat {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 500;
        }
        .day-stats .stat.on-time {
          background: rgba(46, 204, 113, 0.15);
          color: var(--success);
        }
        .day-stats .stat.late {
          background: rgba(241, 196, 15, 0.15);
          color: var(--warning);
        }
        .day-stats .stat.missed {
          background: rgba(231, 76, 60, 0.15);
          color: var(--error);
        }

        .future-notice {
          background: rgba(52, 152, 219, 0.15);
          color: var(--info);
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          text-align: center;
          margin-bottom: 16px;
        }

        .location-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-surface);
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          color: var(--success);
          margin-bottom: 16px;
        }

        .prayers-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .prayer-card {
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 16px;
          transition: all 0.2s ease;
        }
        .prayer-card.completed {
          border-left: 4px solid var(--success);
        }
        .prayer-card.pending {
          border-left: 4px solid var(--warning);
        }
        .prayer-card.future {
          opacity: 0.7;
        }
        .prayer-main {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .prayer-emoji {
          font-size: 28px;
        }
        .prayer-info {
          flex: 1;
        }
        .prayer-info h3 {
          font-size: 17px;
          margin-bottom: 2px;
        }
        .prayer-time {
          color: var(--text-muted);
          font-size: 13px;
        }
        .status-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
        }
        .status-badge.on-time {
          background: rgba(46, 204, 113, 0.2);
          color: var(--success);
        }
        .status-badge.late {
          background: rgba(241, 196, 15, 0.2);
          color: var(--warning);
        }
        .status-badge.missed {
          background: rgba(231, 76, 60, 0.2);
          color: var(--error);
        }
        .status-icon {
          width: 16px;
          height: 16px;
        }

        .prayer-actions {
          display: flex;
          gap: 8px;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--bg-surface-light);
        }
        .action-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 10px;
          border-radius: 10px;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-btn.on-time {
          background: rgba(46, 204, 113, 0.15);
          color: var(--success);
        }
        .action-btn.on-time:hover {
          background: var(--success);
          color: white;
        }
        .action-btn.late {
          background: rgba(241, 196, 15, 0.15);
          color: var(--warning);
        }
        .action-btn.late:hover {
          background: var(--warning);
          color: var(--bg-primary);
        }
        .action-btn.missed {
          background: rgba(231, 76, 60, 0.15);
          color: var(--error);
        }
        .action-btn.missed:hover {
          background: var(--error);
          color: white;
        }
        .action-btn.current {
          ring: 2px solid white;
          box-shadow: 0 0 0 2px white;
        }
        .edit-btn {
          background: var(--bg-surface-light);
          border: none;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s ease;
          margin-left: 8px;
        }
        .edit-btn:hover {
          background: var(--primary);
          color: var(--gold);
        }
        .prayer-actions.editing {
          flex-direction: column;
          gap: 12px;
        }
        .edit-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--text-muted);
        }
        .cancel-edit {
          background: none;
          border: none;
          color: var(--gold);
          font-size: 12px;
          cursor: pointer;
        }
        .edit-buttons {
          display: flex;
          gap: 8px;
        }
        .clear-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px;
          background: rgba(231,76,60,0.1);
          border: 1px solid rgba(231,76,60,0.3);
          border-radius: 8px;
          color: var(--error);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .clear-btn:hover {
          background: var(--error);
          color: white;
        }

        .xp-earned {
          text-align: center;
          margin-top: 20px;
          padding: 16px;
          background: var(--bg-surface);
          border-radius: 12px;
          color: var(--text-secondary);
        }
        .xp-earned strong {
          color: var(--gold);
          font-size: 20px;
          margin-left: 8px;
        }

        .history-panel {
          margin-top: 24px;
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }
        .history-panel h3 {
          font-size: 16px;
          margin-bottom: 16px;
        }
        .history-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 6px;
        }
        .history-day {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 4px;
          background: var(--bg-surface-light);
          border: 2px solid transparent;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .history-day:hover {
          border-color: var(--primary);
        }
        .history-day.selected {
          border-color: var(--gold);
          background: rgba(212, 175, 55, 0.1);
        }
        .history-day.perfect {
          background: rgba(46, 204, 113, 0.15);
        }
        .day-name {
          font-size: 10px;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .day-num {
          font-size: 16px;
          font-weight: 600;
          font-family: 'Space Grotesk', sans-serif;
        }
        .day-dots {
          display: flex;
          gap: 2px;
        }
        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--bg-primary);
        }
        .dot.on_time { background: var(--success); }
        .dot.late { background: var(--warning); }
        .dot.missed { background: var(--error); }
        .day-count {
          font-size: 10px;
          color: var(--text-muted);
        }

        .history-legend {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--bg-surface-light);
        }
        .history-legend span {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .history-legend .dot {
          width: 8px;
          height: 8px;
        }
      `}</style>
    </div>
  );
}

export default Salah;
