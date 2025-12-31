import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Target, Check, Settings, ChevronRight, BookOpen, Award } from 'lucide-react';
import { SURAHS } from './QuranReader';
import axios from 'axios';

function MemorizationPlan() {
  const { addXp, addMemorizedPages } = useApp();
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('qawaam_memorization_settings');
    return saved ? JSON.parse(saved) : {
      dailyPages: 2,
      currentSurah: 114,
      currentAyah: 1,
      startedDate: null
    };
  });

  const [progress, setProgress] = useState(() => {
    const saved = localStorage.getItem('qawaam_memorization_progress');
    return saved ? JSON.parse(saved) : {
      memorized: [],
      todayCompleted: false,
      todayDate: null
    };
  });

  const [showSettings, setShowSettings] = useState(!settings.startedDate);
  const [todayAyahs, setTodayAyahs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem('qawaam_memorization_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('qawaam_memorization_progress', JSON.stringify(progress));
  }, [progress]);

  // Reset daily completion if new day
  useEffect(() => {
    const today = new Date().toDateString();
    if (progress.todayDate !== today) {
      setProgress(prev => ({ ...prev, todayCompleted: false, todayDate: today }));
    }
  }, []);

  // Load today's memorization ayahs
  useEffect(() => {
    if (settings.startedDate && !progress.todayCompleted) {
      loadTodayAyahs();
    }
  }, [settings.currentSurah, settings.currentAyah]);

  const loadTodayAyahs = async () => {
    if (!settings.currentSurah) return;
    
    setLoading(true);
    try {
      const [arabicRes, translationRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/surah/${settings.currentSurah}`),
        axios.get(`http://localhost:5000/api/surah/${settings.currentSurah}/translation`)
      ]);

      const surah = SURAHS.find(s => s.number === settings.currentSurah);
      const totalAyahs = surah?.ayahs || 0;
      
      // Get next few ayahs based on daily goal (roughly 15 ayahs per page)
      const ayahsPerPage = 15;
      const endAyah = Math.min(settings.currentAyah + (settings.dailyPages * ayahsPerPage) - 1, totalAyahs);
      
      const ayahs = arabicRes.data.data.ayahs
        .slice(settings.currentAyah - 1, endAyah)
        .map((ayah, i) => ({
          ...ayah,
          translation: translationRes.data.data.ayahs[settings.currentAyah - 1 + i]?.text
        }));

      setTodayAyahs(ayahs);
    } catch (error) {
      console.error('Error loading ayahs:', error);
    }
    setLoading(false);
  };

  const startPlan = () => {
    setSettings(prev => ({
      ...prev,
      startedDate: new Date().toISOString()
    }));
    setShowSettings(false);
    loadTodayAyahs();
  };

  const markTodayComplete = () => {
    const surah = SURAHS.find(s => s.number === settings.currentSurah);
    const totalAyahs = surah?.ayahs || 0;
    const ayahsPerPage = 15;
    const nextAyah = settings.currentAyah + (settings.dailyPages * ayahsPerPage);

    // Update progress
    setProgress(prev => ({
      ...prev,
      todayCompleted: true,
      todayDate: new Date().toDateString(),
      memorized: [...prev.memorized, {
        surah: settings.currentSurah,
        fromAyah: settings.currentAyah,
        toAyah: Math.min(nextAyah - 1, totalAyahs),
        date: new Date().toISOString()
      }]
    }));

    // Move to next position
    if (nextAyah > totalAyahs) {
      // Move to previous surah (going backwards from An-Nas)
      if (settings.currentSurah > 1) {
        setSettings(prev => ({
          ...prev,
          currentSurah: prev.currentSurah - 1,
          currentAyah: 1
        }));
      }
    } else {
      setSettings(prev => ({
        ...prev,
        currentAyah: nextAyah
      }));
    }

    addMemorizedPages(settings.dailyPages);
  };

  const currentSurahInfo = SURAHS.find(s => s.number === settings.currentSurah);
  const totalMemorized = progress.memorized.reduce((acc, m) => acc + (m.toAyah - m.fromAyah + 1), 0);

  if (showSettings) {
    return (
      <div className="memorization-settings">
        <div className="settings-header">
          <Target size={32} className="icon" />
          <h2>Set Your Memorization Goal</h2>
          <p>Choose how much you want to memorize daily</p>
        </div>

        <div className="setting-option">
          <label>Daily Goal (Pages)</label>
          <div className="page-selector">
            {[1, 2, 3, 4].map(num => (
              <button
                key={num}
                className={`page-btn ${settings.dailyPages === num ? 'active' : ''}`}
                onClick={() => setSettings(prev => ({ ...prev, dailyPages: num }))}
              >
                {num} {num === 1 ? 'Page' : 'Pages'}
              </button>
            ))}
          </div>
          <span className="helper-text">~{settings.dailyPages * 15} ayahs per day</span>
        </div>

        <div className="setting-option">
          <label>Start From</label>
          <select 
            value={settings.currentSurah}
            onChange={(e) => setSettings(prev => ({ 
              ...prev, 
              currentSurah: parseInt(e.target.value),
              currentAyah: 1
            }))}
          >
            {SURAHS.slice().reverse().map(surah => (
              <option key={surah.number} value={surah.number}>
                {surah.number}. {surah.name} ({surah.arabicName})
              </option>
            ))}
          </select>
          <span className="helper-text">Recommended: Start from Juz Amma (short surahs)</span>
        </div>

        <button className="btn btn-primary start-btn" onClick={startPlan}>
          <Target size={18} />
          Start Memorization Plan
        </button>

        <style>{`
          .memorization-settings {
            animation: fadeIn 0.3s ease-out;
          }
          .settings-header {
            text-align: center;
            padding: 40px 20px;
            background: var(--bg-surface);
            border-radius: 16px;
            margin-bottom: 24px;
          }
          .settings-header .icon {
            color: var(--gold);
            margin-bottom: 16px;
          }
          .settings-header h2 {
            font-size: 22px;
            margin-bottom: 8px;
          }
          .settings-header p {
            color: var(--text-muted);
            font-size: 14px;
          }
          .setting-option {
            background: var(--bg-surface);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 16px;
          }
          .setting-option label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .page-selector {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .page-btn {
            padding: 12px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .page-btn:hover {
            border-color: var(--primary);
          }
          .page-btn.active {
            background: var(--primary);
            border-color: var(--gold);
            color: var(--gold);
          }
          .helper-text {
            display: block;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 8px;
          }
          select {
            width: 100%;
            padding: 12px;
            background: var(--bg-surface-light);
            border: none;
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 14px;
          }
          .start-btn {
            width: 100%;
            padding: 16px;
            font-size: 16px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="memorization-plan">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <BookOpen size={20} />
          <div>
            <span className="stat-value">{totalMemorized}</span>
            <span className="stat-label">Ayahs Memorized</span>
          </div>
        </div>
        <div className="stat-card">
          <Target size={20} />
          <div>
            <span className="stat-value">{settings.dailyPages}</span>
            <span className="stat-label">Pages/Day</span>
          </div>
        </div>
      </div>

      {/* Today's Goal */}
      <div className={`today-goal ${progress.todayCompleted ? 'completed' : ''}`}>
        <div className="goal-header">
          <h3>{progress.todayCompleted ? "✅ Today's Goal Complete!" : "📖 Today's Memorization"}</h3>
          <button className="settings-btn" onClick={() => setShowSettings(true)}>
            <Settings size={16} />
          </button>
        </div>

        {!progress.todayCompleted && currentSurahInfo && (
          <div className="current-position">
            <span>Surah {currentSurahInfo.name} ({currentSurahInfo.arabicName})</span>
            <span>Ayah {settings.currentAyah} - {Math.min(settings.currentAyah + (settings.dailyPages * 15) - 1, currentSurahInfo.ayahs)}</span>
          </div>
        )}

        {progress.todayCompleted ? (
          <div className="completed-message">
            <Award size={24} />
            <p>Mashallah! You've completed today's memorization.</p>
            <span>+100 XP earned</span>
          </div>
        ) : (
          <>
            {loading ? (
              <div className="loading">Loading ayahs...</div>
            ) : (
              <div className="ayahs-to-memorize">
                {todayAyahs.map((ayah) => (
                  <div key={ayah.number} className="ayah-item">
                    <span className="ayah-num">{ayah.numberInSurah}</span>
                    <div className="ayah-content">
                      <p className="arabic">{ayah.text}</p>
                      <p className="translation">{ayah.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary complete-btn" onClick={markTodayComplete}>
              <Check size={18} />
              Mark Today Complete (+100 XP)
            </button>
          </>
        )}
      </div>

      {/* Recent Progress */}
      {progress.memorized.length > 0 && (
        <div className="recent-progress">
          <h3>Recent Progress</h3>
          <div className="progress-list">
            {progress.memorized.slice(-5).reverse().map((item, i) => {
              const surah = SURAHS.find(s => s.number === item.surah);
              return (
                <div key={i} className="progress-item">
                  <Check size={16} className="check-icon" />
                  <div>
                    <span className="progress-surah">{surah?.name}</span>
                    <span className="progress-ayahs">Ayahs {item.fromAyah}-{item.toAyah}</span>
                  </div>
                  <span className="progress-date">
                    {new Date(item.date).toLocaleDateString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .memorization-plan {
          animation: fadeIn 0.3s ease-out;
        }
        .stats-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface);
          padding: 16px;
          border-radius: 12px;
        }
        .stat-card svg {
          color: var(--gold);
        }
        .stat-value {
          display: block;
          font-size: 24px;
          font-weight: 700;
          font-family: 'Space Grotesk', sans-serif;
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .today-goal {
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 20px;
        }
        .today-goal.completed {
          border: 2px solid var(--success);
          background: rgba(46,204,113,0.1);
        }
        .goal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .goal-header h3 {
          font-size: 16px;
        }
        .settings-btn {
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
        }
        .current-position {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: var(--bg-surface-light);
          border-radius: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--text-secondary);
        }
        .completed-message {
          text-align: center;
          padding: 20px;
        }
        .completed-message svg {
          color: var(--gold);
          margin-bottom: 12px;
        }
        .completed-message p {
          font-size: 14px;
          margin-bottom: 8px;
        }
        .completed-message span {
          font-size: 12px;
          color: var(--gold);
        }
        .ayahs-to-memorize {
          max-height: 400px;
          overflow-y: auto;
          margin-bottom: 16px;
        }
        .ayah-item {
          display: flex;
          gap: 12px;
          padding: 16px 0;
          border-bottom: 1px solid var(--bg-surface-light);
        }
        .ayah-item:last-child {
          border-bottom: none;
        }
        .ayah-num {
          width: 28px;
          height: 28px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 600;
          flex-shrink: 0;
        }
        .ayah-content .arabic {
          font-size: 22px;
          line-height: 2;
          margin-bottom: 8px;
          color: var(--text-primary);
        }
        .ayah-content .translation {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .complete-btn {
          width: 100%;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }
        .recent-progress {
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 20px;
        }
        .recent-progress h3 {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 16px;
        }
        .progress-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .progress-item {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .check-icon {
          color: var(--success);
        }
        .progress-surah {
          display: block;
          font-size: 13px;
          font-weight: 500;
        }
        .progress-ayahs {
          font-size: 11px;
          color: var(--text-muted);
        }
        .progress-date {
          margin-left: auto;
          font-size: 11px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default MemorizationPlan;

