import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw, Check, ChevronRight, Award, ClipboardList } from 'lucide-react';
import { SURAHS } from './QuranReader';
import axios from 'axios';

const KNOWLEDGE_LEVELS = [
  { id: 'none', label: 'Not memorized', color: 'var(--text-muted)' },
  { id: 'learning', label: 'Currently learning', color: 'var(--warning)' },
  { id: 'weak', label: 'Memorized but weak', color: 'var(--error)' },
  { id: 'good', label: 'Memorized & good', color: 'var(--info)' },
  { id: 'strong', label: 'Memorized & strong', color: 'var(--success)' },
];

function RevisionPlan() {
  const { addXp } = useApp();
  
  const [surveyComplete, setSurveyComplete] = useState(() => {
    const saved = localStorage.getItem('qawaam_revision_survey');
    return saved ? JSON.parse(saved).complete : false;
  });

  const [surveyData, setSurveyData] = useState(() => {
    const saved = localStorage.getItem('qawaam_revision_survey');
    return saved ? JSON.parse(saved).data : {};
  });

  const [revisionPlan, setRevisionPlan] = useState(() => {
    const saved = localStorage.getItem('qawaam_revision_plan');
    return saved ? JSON.parse(saved) : [];
  });

  const [todayRevision, setTodayRevision] = useState(() => {
    const saved = localStorage.getItem('qawaam_today_revision');
    const today = new Date().toDateString();
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === today) return parsed;
    }
    return { date: today, completed: false, items: [] };
  });

  const [currentSurahIndex, setCurrentSurahIndex] = useState(0);
  const [revisionAyahs, setRevisionAyahs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('qawaam_revision_survey', JSON.stringify({
      complete: surveyComplete,
      data: surveyData
    }));
  }, [surveyComplete, surveyData]);

  useEffect(() => {
    localStorage.setItem('qawaam_revision_plan', JSON.stringify(revisionPlan));
  }, [revisionPlan]);

  useEffect(() => {
    localStorage.setItem('qawaam_today_revision', JSON.stringify(todayRevision));
  }, [todayRevision]);

  // Generate revision plan based on survey
  const generateRevisionPlan = () => {
    const plan = [];
    
    // Get surahs that need revision (weak, learning, good - but not none or strong)
    Object.entries(surveyData).forEach(([surahNum, level]) => {
      if (level === 'weak' || level === 'learning' || level === 'good') {
        const priority = level === 'weak' ? 3 : level === 'learning' ? 2 : 1;
        plan.push({
          surah: parseInt(surahNum),
          level,
          priority,
          lastReviewed: null
        });
      }
    });

    // Sort by priority (weak first)
    plan.sort((a, b) => b.priority - a.priority);
    
    setRevisionPlan(plan);
    
    // Set today's revision (first 3 items)
    const todayItems = plan.slice(0, 3).map(p => p.surah);
    setTodayRevision({
      date: new Date().toDateString(),
      completed: false,
      items: todayItems,
      current: 0
    });
  };

  const handleSurveyAnswer = (surahNum, level) => {
    setSurveyData(prev => ({
      ...prev,
      [surahNum]: level
    }));
  };

  const completeSurvey = () => {
    setSurveyComplete(true);
    generateRevisionPlan();
  };

  const loadRevisionSurah = async (surahNum) => {
    setLoading(true);
    try {
      const [arabicRes, translationRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/surah/${surahNum}`),
        axios.get(`http://localhost:5000/api/surah/${surahNum}/translation`)
      ]);

      const ayahs = arabicRes.data.data.ayahs.map((ayah, i) => ({
        ...ayah,
        translation: translationRes.data.data.ayahs[i]?.text
      }));

      setRevisionAyahs(ayahs);
    } catch (error) {
      console.error('Error loading surah:', error);
    }
    setLoading(false);
  };

  const markRevisionComplete = () => {
    const updatedItems = [...todayRevision.items];
    const currentIndex = todayRevision.current || 0;
    
    if (currentIndex < updatedItems.length - 1) {
      // Move to next surah
      setTodayRevision(prev => ({
        ...prev,
        current: currentIndex + 1
      }));
      loadRevisionSurah(updatedItems[currentIndex + 1]);
    } else {
      // All done
      setTodayRevision(prev => ({
        ...prev,
        completed: true
      }));
      addXp(75);
    }
  };

  const resetSurvey = () => {
    setSurveyComplete(false);
    setSurveyData({});
    setRevisionPlan([]);
    setTodayRevision({ date: new Date().toDateString(), completed: false, items: [] });
  };

  // Start revision if items exist
  useEffect(() => {
    if (todayRevision.items.length > 0 && !todayRevision.completed && revisionAyahs.length === 0) {
      loadRevisionSurah(todayRevision.items[todayRevision.current || 0]);
    }
  }, [todayRevision]);

  // Survey View
  if (!surveyComplete) {
    const surveySurahs = SURAHS.slice().reverse().slice(0, 30); // Last 30 surahs (Juz Amma + some)
    
    return (
      <div className="revision-survey">
        <div className="survey-header">
          <ClipboardList size={32} className="icon" />
          <h2>Knowledge Assessment</h2>
          <p>Tell us what you've memorized so we can create your revision plan</p>
        </div>

        <div className="survey-progress">
          <span>{Object.keys(surveyData).length} / {surveySurahs.length} surahs assessed</span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(Object.keys(surveyData).length / surveySurahs.length) * 100}%` }} 
            />
          </div>
        </div>

        <div className="survey-list">
          {surveySurahs.map((surah) => (
            <div key={surah.number} className="survey-item">
              <div className="surah-info">
                <span className="surah-num">{surah.number}</span>
                <div>
                  <span className="surah-name">{surah.name}</span>
                  <span className="arabic-name">{surah.arabicName}</span>
                </div>
              </div>
              <div className="level-selector">
                {KNOWLEDGE_LEVELS.map((level) => (
                  <button
                    key={level.id}
                    className={`level-btn ${surveyData[surah.number] === level.id ? 'active' : ''}`}
                    style={{ 
                      '--level-color': level.color,
                      borderColor: surveyData[surah.number] === level.id ? level.color : 'transparent'
                    }}
                    onClick={() => handleSurveyAnswer(surah.number, level.id)}
                    title={level.label}
                  >
                    {level.id === 'none' && '✗'}
                    {level.id === 'learning' && '📚'}
                    {level.id === 'weak' && '⚠️'}
                    {level.id === 'good' && '👍'}
                    {level.id === 'strong' && '💪'}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="legend">
          {KNOWLEDGE_LEVELS.map((level) => (
            <span key={level.id} style={{ color: level.color }}>
              {level.id === 'none' && '✗'}
              {level.id === 'learning' && '📚'}
              {level.id === 'weak' && '⚠️'}
              {level.id === 'good' && '👍'}
              {level.id === 'strong' && '💪'}
              {' '}{level.label}
            </span>
          ))}
        </div>

        <button 
          className="btn btn-primary complete-survey-btn"
          onClick={completeSurvey}
          disabled={Object.keys(surveyData).length < 5}
        >
          Generate My Revision Plan
        </button>

        <style>{`
          .revision-survey {
            animation: fadeIn 0.3s ease-out;
          }
          .survey-header {
            text-align: center;
            padding: 30px 20px;
            background: var(--bg-surface);
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .survey-header .icon {
            color: var(--gold);
            margin-bottom: 12px;
          }
          .survey-header h2 {
            font-size: 20px;
            margin-bottom: 8px;
          }
          .survey-header p {
            color: var(--text-muted);
            font-size: 13px;
          }
          .survey-progress {
            margin-bottom: 16px;
          }
          .survey-progress span {
            font-size: 12px;
            color: var(--text-muted);
          }
          .progress-bar {
            height: 4px;
            background: var(--bg-surface);
            border-radius: 2px;
            margin-top: 8px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: var(--gold);
            transition: width 0.3s ease;
          }
          .survey-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin-bottom: 20px;
          }
          .survey-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--bg-surface);
            padding: 12px 16px;
            border-radius: 10px;
          }
          .surah-info {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .surah-num {
            width: 28px;
            height: 28px;
            background: var(--primary);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: 600;
          }
          .surah-name {
            display: block;
            font-size: 13px;
            font-weight: 500;
          }
          .arabic-name {
            font-family: 'Amiri', serif;
            font-size: 12px;
            color: var(--gold);
          }
          .level-selector {
            display: flex;
            gap: 4px;
          }
          .level-btn {
            width: 32px;
            height: 32px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .level-btn:hover {
            background: var(--bg-primary);
          }
          .level-btn.active {
            background: rgba(212,175,55,0.2);
          }
          .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            justify-content: center;
            margin-bottom: 20px;
            font-size: 11px;
          }
          .complete-survey-btn {
            width: 100%;
          }
          .complete-survey-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}</style>
      </div>
    );
  }

  // Revision View
  const currentSurahNum = todayRevision.items[todayRevision.current || 0];
  const currentSurah = SURAHS.find(s => s.number === currentSurahNum);

  return (
    <div className="revision-plan">
      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <RotateCcw size={20} />
          <div>
            <span className="stat-value">{revisionPlan.length}</span>
            <span className="stat-label">Surahs to Revise</span>
          </div>
        </div>
        <div className="stat-card">
          <span className="stat-value">{todayRevision.items.length}</span>
          <span className="stat-label">Today's Sessions</span>
        </div>
      </div>

      {/* Today's Revision */}
      <div className={`today-revision ${todayRevision.completed ? 'completed' : ''}`}>
        <div className="revision-header">
          <h3>{todayRevision.completed ? '✅ Revision Complete!' : '📖 Today\'s Revision'}</h3>
          <button className="reset-btn" onClick={resetSurvey}>Reset</button>
        </div>

        {todayRevision.completed ? (
          <div className="completed-message">
            <Award size={32} />
            <p>Excellent! You've completed today's revision.</p>
            <span>+75 XP earned</span>
          </div>
        ) : todayRevision.items.length === 0 ? (
          <div className="no-revision">
            <p>No surahs to revise based on your assessment.</p>
            <button className="btn btn-secondary" onClick={resetSurvey}>
              Retake Assessment
            </button>
          </div>
        ) : (
          <>
            {/* Progress dots */}
            <div className="revision-progress">
              {todayRevision.items.map((item, i) => {
                const surah = SURAHS.find(s => s.number === item);
                const isCurrent = i === (todayRevision.current || 0);
                const isDone = i < (todayRevision.current || 0);
                return (
                  <div key={item} className={`progress-dot ${isCurrent ? 'current' : ''} ${isDone ? 'done' : ''}`}>
                    {isDone ? <Check size={12} /> : i + 1}
                    <span>{surah?.name}</span>
                  </div>
                );
              })}
            </div>

            {currentSurah && (
              <div className="current-surah">
                <h4>{currentSurah.name} <span className="arabic">{currentSurah.arabicName}</span></h4>
                <p>{currentSurah.ayahs} ayahs</p>
              </div>
            )}

            {loading ? (
              <div className="loading">Loading surah...</div>
            ) : (
              <div className="ayahs-container">
                {revisionAyahs.map((ayah) => (
                  <div key={ayah.number} className="ayah-item">
                    <span className="ayah-num">{ayah.numberInSurah}</span>
                    <div>
                      <p className="arabic">{ayah.text}</p>
                      <p className="translation">{ayah.translation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary" onClick={markRevisionComplete}>
              <Check size={18} />
              {todayRevision.current < todayRevision.items.length - 1 
                ? 'Next Surah' 
                : 'Complete Revision (+75 XP)'}
            </button>
          </>
        )}
      </div>

      <style>{`
        .revision-plan {
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
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        .today-revision {
          background: var(--bg-surface);
          border-radius: 16px;
          padding: 20px;
        }
        .today-revision.completed {
          border: 2px solid var(--success);
        }
        .revision-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .revision-header h3 {
          font-size: 16px;
        }
        .reset-btn {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 12px;
          cursor: pointer;
        }
        .completed-message {
          text-align: center;
          padding: 30px;
        }
        .completed-message svg {
          color: var(--gold);
          margin-bottom: 12px;
        }
        .completed-message span {
          color: var(--gold);
          font-size: 12px;
        }
        .no-revision {
          text-align: center;
          padding: 30px;
          color: var(--text-muted);
        }
        .revision-progress {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .progress-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 8px 12px;
          background: var(--bg-surface-light);
          border-radius: 8px;
          font-size: 12px;
          color: var(--text-muted);
        }
        .progress-dot.current {
          background: var(--primary);
          color: var(--gold);
        }
        .progress-dot.done {
          background: rgba(46,204,113,0.2);
          color: var(--success);
        }
        .progress-dot span {
          font-size: 10px;
        }
        .current-surah {
          text-align: center;
          padding: 16px;
          background: var(--bg-surface-light);
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .current-surah h4 {
          font-size: 18px;
          margin-bottom: 4px;
        }
        .current-surah .arabic {
          color: var(--gold);
          font-family: 'Amiri', serif;
        }
        .current-surah p {
          font-size: 12px;
          color: var(--text-muted);
        }
        .ayahs-container {
          max-height: 350px;
          overflow-y: auto;
          margin-bottom: 16px;
        }
        .ayah-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--bg-surface-light);
        }
        .ayah-num {
          width: 24px;
          height: 24px;
          background: var(--primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          flex-shrink: 0;
        }
        .ayah-item .arabic {
          font-size: 20px;
          line-height: 2;
          margin-bottom: 8px;
        }
        .ayah-item .translation {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.5;
        }
        .loading {
          text-align: center;
          padding: 40px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default RevisionPlan;

