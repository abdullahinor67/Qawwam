import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Target, Check, Settings, BookOpen, Award, Flame, 
  ChevronRight, ChevronLeft, Plus, Minus, Calendar, Star,
  Trophy, FileText
} from 'lucide-react';

// Spaced repetition intervals (in days)
const REVIEW_INTERVALS = [1, 3, 7, 14, 30, 60];

// Quran Pages Data (Madinah Mushaf - 604 pages)
const TOTAL_PAGES = 604;
const TOTAL_AYAHS = 6236;

// Page to Surah/Ayah mapping (simplified - shows starting ayah of each page)
// In reality you'd have a complete mapping, but this gives a good approximation
const JUZ_PAGES = [
  { juz: 1, startPage: 1, endPage: 21 },
  { juz: 2, startPage: 22, endPage: 41 },
  { juz: 3, startPage: 42, endPage: 62 },
  { juz: 4, startPage: 63, endPage: 81 },
  { juz: 5, startPage: 82, endPage: 101 },
  { juz: 6, startPage: 102, endPage: 121 },
  { juz: 7, startPage: 122, endPage: 141 },
  { juz: 8, startPage: 142, endPage: 161 },
  { juz: 9, startPage: 162, endPage: 181 },
  { juz: 10, startPage: 182, endPage: 201 },
  { juz: 11, startPage: 202, endPage: 221 },
  { juz: 12, startPage: 222, endPage: 241 },
  { juz: 13, startPage: 242, endPage: 261 },
  { juz: 14, startPage: 262, endPage: 281 },
  { juz: 15, startPage: 282, endPage: 301 },
  { juz: 16, startPage: 302, endPage: 321 },
  { juz: 17, startPage: 322, endPage: 341 },
  { juz: 18, startPage: 342, endPage: 361 },
  { juz: 19, startPage: 362, endPage: 381 },
  { juz: 20, startPage: 382, endPage: 401 },
  { juz: 21, startPage: 402, endPage: 421 },
  { juz: 22, startPage: 422, endPage: 441 },
  { juz: 23, startPage: 442, endPage: 461 },
  { juz: 24, startPage: 462, endPage: 481 },
  { juz: 25, startPage: 482, endPage: 502 },
  { juz: 26, startPage: 503, endPage: 521 },
  { juz: 27, startPage: 522, endPage: 541 },
  { juz: 28, startPage: 542, endPage: 561 },
  { juz: 29, startPage: 562, endPage: 581 },
  { juz: 30, startPage: 582, endPage: 604 },
];

function MemorizationPlan() {
  const { user } = useAuth();
  
  const defaultSettings = {
    dailyNewPages: 1,        // Pages to memorize per day
    dailyReviewPages: 2,     // Pages to review per day
    currentPage: 1,          // Start from page 1 (beginning of Quran)
    startedDate: null
  };

  const [settings, setSettings] = useState(defaultSettings);

  const [progress, setProgress] = useState({
    memorizedPages: [],      // Array of { pageNum, memorizedAt, reviewCount, nextReview, lastReviewed, status }
    todayNewPages: 0,
    todayReviewedPages: 0,
    lastActiveDate: null,
    streak: 0,
    points: 0,
  });

  const [reviewPages, setReviewPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('dashboard'); // dashboard, memorize, review, settings
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pagesToMemorize, setPagesToMemorize] = useState([]);

  // Load user's memorization data from Firestore
  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    setLoading(true);
    
    try {
      const docRef = doc(db, 'users', user.uid, 'quran', 'memorization');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Merge loaded settings with defaults to ensure all fields exist
        const loadedSettings = {
          ...defaultSettings,
          ...(data.settings || {}),
          dailyNewPages: data.settings?.dailyNewPages ?? defaultSettings.dailyNewPages,
          dailyReviewPages: data.settings?.dailyReviewPages ?? defaultSettings.dailyReviewPages,
          currentPage: data.settings?.currentPage ?? defaultSettings.currentPage,
        };
        setSettings(loadedSettings);
        
        // Merge loaded progress with defaults
        const defaultProgress = {
          memorizedPages: [],
          todayNewPages: 0,
          todayReviewedPages: 0,
          lastActiveDate: null,
          streak: 0,
          points: 0,
        };
        const loadedProgress = {
          ...defaultProgress,
          ...(data.progress || {}),
        };
        
        // Check if new day - reset daily counters
        const today = new Date().toDateString();
        if (loadedProgress.lastActiveDate !== today) {
          loadedProgress.todayNewPages = 0;
          loadedProgress.todayReviewedPages = 0;
          loadedProgress.lastActiveDate = today;
          
          await setDoc(docRef, { 
            settings: loadedSettings, 
            progress: loadedProgress 
          }, { merge: true });
        }
        
        setProgress(loadedProgress);
      } else {
        // Initialize new user data
        const initialProgress = {
          memorizedPages: [],
          todayNewPages: 0,
          todayReviewedPages: 0,
          lastActiveDate: new Date().toDateString(),
          streak: 0,
          points: 0,
        };
        const initialData = {
          settings: defaultSettings,
          progress: initialProgress
        };
        await setDoc(docRef, initialData);
        setSettings(defaultSettings);
        setProgress(initialProgress);
      }
    } catch (error) {
      console.error('Error loading memorization data:', error);
      // On error, use defaults
      setSettings(defaultSettings);
    }
    setLoading(false);
  };

  const saveUserData = async (newSettings, newProgress) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'quran', 'memorization');
      await setDoc(docRef, {
        settings: { ...defaultSettings, ...(newSettings || settings) },
        progress: newProgress || progress,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving memorization data:', error);
    }
  };

  // Get pages due for review (spaced repetition)
  const getReviewPages = () => {
    if (!progress.memorizedPages || !Array.isArray(progress.memorizedPages)) {
      return [];
    }
    const today = new Date();
    const duePages = progress.memorizedPages.filter(page => {
      if (!page.nextReview) return false;
      const reviewDate = new Date(page.nextReview);
      return reviewDate <= today;
    });
    return duePages.slice(0, settings.dailyReviewPages);
  };

  // Calculate next review date based on review count
  const getNextReviewDate = (reviewCount) => {
    const interval = REVIEW_INTERVALS[Math.min(reviewCount, REVIEW_INTERVALS.length - 1)];
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + interval);
    return nextDate.toISOString();
  };

  // Get Juz number for a page
  const getJuzForPage = (pageNum) => {
    const juz = JUZ_PAGES.find(j => pageNum >= j.startPage && pageNum <= j.endPage);
    return juz ? juz.juz : 1;
  };

  // Get next pages to memorize
  const getNextPagesToMemorize = () => {
    const memorizedPages = progress.memorizedPages || [];
    const memorizedPageNums = new Set(memorizedPages.map(p => p.pageNum));
    const pages = [];
    
    let page = settings.currentPage;
    while (pages.length < settings.dailyNewPages && page <= TOTAL_PAGES) {
      if (!memorizedPageNums.has(page)) {
        pages.push(page);
      }
      page++;
    }
    
    return pages;
  };

  // Mark page as memorized
  const markPageMemorized = async (pageNum) => {
    const memorizedPages = progress.memorizedPages || [];
    const existingIndex = memorizedPages.findIndex(p => p.pageNum === pageNum);
    
    let updatedPages = [...memorizedPages];
    
    if (existingIndex === -1) {
      updatedPages.push({
        pageNum,
        juz: getJuzForPage(pageNum),
        memorizedAt: new Date().toISOString(),
        reviewCount: 0,
        nextReview: getNextReviewDate(0),
        lastReviewed: null,
        status: 'memorized'
      });
    }

    // Update current page to next unmemorized
    const memorizedSet = new Set(updatedPages.map(p => p.pageNum));
    let nextPage = settings.currentPage;
    while (memorizedSet.has(nextPage) && nextPage <= TOTAL_PAGES) {
      nextPage++;
    }

    const newSettings = { ...settings, currentPage: nextPage };
    const newProgress = {
      ...progress,
      memorizedPages: updatedPages,
      todayNewPages: progress.todayNewPages + 1,
      points: progress.points + 50, // 50 points per page
      lastActiveDate: new Date().toDateString()
    };

    setSettings(newSettings);
    setProgress(newProgress);
    await saveUserData(newSettings, newProgress);
    
    checkDailyGoal(newProgress);
  };

  // Mark page as reviewed
  const markPageReviewed = async (pageNum, quality) => {
    // quality: 'hard', 'good', 'easy'
    const memorizedPages = progress.memorizedPages || [];
    const updatedPages = memorizedPages.map(page => {
      if (page.pageNum === pageNum) {
        let newReviewCount = page.reviewCount;
        
        if (quality === 'easy') {
          newReviewCount = page.reviewCount + 2;
        } else if (quality === 'good') {
          newReviewCount = page.reviewCount + 1;
        } else {
          newReviewCount = Math.max(0, page.reviewCount - 1);
        }
        
        return {
          ...page,
          reviewCount: newReviewCount,
          nextReview: getNextReviewDate(newReviewCount),
          lastReviewed: new Date().toISOString(),
          status: newReviewCount >= 5 ? 'mastered' : 'reviewed'
        };
      }
      return page;
    });

    const newProgress = {
      ...progress,
      memorizedPages: updatedPages,
      todayReviewedPages: progress.todayReviewedPages + 1,
      points: progress.points + (quality === 'easy' ? 30 : quality === 'good' ? 20 : 10),
      lastActiveDate: new Date().toDateString()
    };

    setProgress(newProgress);
    await saveUserData(settings, newProgress);
    
    checkDailyGoal(newProgress);
  };

  // Check if daily goal is met
  const checkDailyGoal = async (currentProgress) => {
    const goalMet = currentProgress.todayNewPages >= settings.dailyNewPages && 
                    currentProgress.todayReviewedPages >= settings.dailyReviewPages;
    
    if (goalMet && currentProgress.streak === progress.streak) {
      const newStreak = currentProgress.streak + 1;
      const bonusPoints = 100;
      
      const updatedProgress = {
        ...currentProgress,
        streak: newStreak,
        points: currentProgress.points + bonusPoints
      };
      
      setProgress(updatedProgress);
      await saveUserData(settings, updatedProgress);
    }
  };

  useEffect(() => {
    if (view === 'memorize') {
      setPagesToMemorize(getNextPagesToMemorize());
      setCurrentPageIndex(0);
    }
    if (view === 'review') {
      setReviewPages(getReviewPages());
      setCurrentPageIndex(0);
    }
  }, [view, progress.memorizedPages]);

  const startPlan = async () => {
    const newSettings = {
      ...defaultSettings,
      ...settings,
      dailyNewPages: settings.dailyNewPages || 1,
      dailyReviewPages: settings.dailyReviewPages || 2,
      currentPage: settings.currentPage || 1,
      startedDate: new Date().toISOString()
    };
    setSettings(newSettings);
    await saveUserData(newSettings, progress);
    setView('dashboard');
  };

  const dailyGoalProgress = {
    new: Math.min((progress.todayNewPages / settings.dailyNewPages) * 100, 100),
    review: Math.min((progress.todayReviewedPages / settings.dailyReviewPages) * 100, 100)
  };

  const reviewDueCount = getReviewPages().length;
  
  // Calculate overall Quran progress
  const memorizedPagesArray = progress.memorizedPages || [];
  const pagesMemorized = memorizedPagesArray.length;
  const quranProgress = (pagesMemorized / TOTAL_PAGES) * 100;
  const masteredCount = memorizedPagesArray.filter(p => p.status === 'mastered').length;
  
  // Calculate Juz progress
  const juzProgress = JUZ_PAGES.map(juz => {
    const pagesInJuz = memorizedPagesArray.filter(
      p => p.pageNum >= juz.startPage && p.pageNum <= juz.endPage
    ).length;
    const totalPagesInJuz = juz.endPage - juz.startPage + 1;
    return {
      juz: juz.juz,
      memorized: pagesInJuz,
      total: totalPagesInJuz,
      percentage: (pagesInJuz / totalPagesInJuz) * 100
    };
  });

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading your progress...</p>
      </div>
    );
  }

  // Settings View
  if (view === 'settings' || !settings.startedDate) {
    return (
      <div className="memorization-settings">
        <div className="settings-header">
          <Target size={32} className="icon" />
          <h2>{settings.startedDate ? 'Adjust Goals' : 'Set Your Goals'}</h2>
          <p>Memorize the Quran page by page, starting from the beginning</p>
        </div>

        <div className="setting-option">
          <label>New Pages Per Day</label>
          <div className="number-selector">
            <button onClick={() => setSettings(p => ({ ...defaultSettings, ...p, dailyNewPages: Math.max(1, (p.dailyNewPages || 1) - 1) }))}>
              <Minus size={18} />
            </button>
            <span className="number-value">{settings.dailyNewPages || 1}</span>
            <button onClick={() => setSettings(p => ({ ...defaultSettings, ...p, dailyNewPages: Math.min(5, (p.dailyNewPages || 1) + 1) }))}>
              <Plus size={18} />
            </button>
          </div>
          <span className="helper-text">~15 ayahs per page • Recommended: 1-2 pages/day</span>
        </div>

        <div className="setting-option">
          <label>Review Pages Per Day</label>
          <div className="number-selector">
            <button onClick={() => setSettings(p => ({ ...defaultSettings, ...p, dailyReviewPages: Math.max(1, (p.dailyReviewPages || 2) - 1) }))}>
              <Minus size={18} />
            </button>
            <span className="number-value">{settings.dailyReviewPages || 2}</span>
            <button onClick={() => setSettings(p => ({ ...defaultSettings, ...p, dailyReviewPages: Math.min(10, (p.dailyReviewPages || 2) + 1) }))}>
              <Plus size={18} />
            </button>
          </div>
          <span className="helper-text">Spaced repetition: 1, 3, 7, 14, 30, 60 days</span>
        </div>

        <div className="setting-option">
          <label>Start From Page</label>
          <div className="number-selector">
            <button onClick={() => setSettings(p => ({ ...defaultSettings, ...p, currentPage: Math.max(1, (p.currentPage || 1) - 1) }))}>
              <Minus size={18} />
            </button>
            <span className="number-value">{settings.currentPage || 1}</span>
            <button onClick={() => setSettings(p => ({ ...defaultSettings, ...p, currentPage: Math.min(TOTAL_PAGES, (p.currentPage || 1) + 1) }))}>
              <Plus size={18} />
            </button>
          </div>
          <span className="helper-text">Page 1 = Start of Al-Fatihah (Juz 1)</span>
        </div>

        <div className="settings-buttons">
          {settings.startedDate && (
            <button className="btn btn-secondary" onClick={() => setView('dashboard')}>
              Cancel
            </button>
          )}
          <button className="btn btn-primary" onClick={startPlan}>
            <Target size={18} />
            {settings.startedDate ? 'Save Changes' : 'Start From Page 1'}
          </button>
        </div>

        <style>{`
          .memorization-settings { animation: fadeIn 0.3s ease-out; }
          .settings-header {
            text-align: center;
            padding: 30px 20px;
            background: var(--bg-surface);
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .settings-header .icon { color: var(--gold); margin-bottom: 12px; }
          .settings-header h2 { font-size: 22px; margin-bottom: 8px; }
          .settings-header p { color: var(--text-muted); font-size: 14px; }
          .setting-option {
            background: var(--bg-surface);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 12px;
          }
          .setting-option label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .number-selector {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
          }
          .number-selector button {
            width: 44px;
            height: 44px;
            border-radius: 12px;
            background: var(--bg-surface-light);
            border: none;
            color: var(--text-primary);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .number-selector button:hover {
            background: var(--primary);
            color: var(--gold);
          }
          .number-value {
            font-size: 36px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
            color: var(--gold);
            min-width: 60px;
            text-align: center;
          }
          .helper-text {
            display: block;
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
            margin-top: 10px;
          }
          .settings-buttons {
            display: flex;
            gap: 12px;
            margin-top: 20px;
          }
          .settings-buttons .btn { flex: 1; padding: 16px; }
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-primary { background: var(--gold); color: var(--bg-primary); }
          .btn-secondary { background: var(--bg-surface); color: var(--text-primary); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // Dashboard View
  if (view === 'dashboard') {
    return (
      <div className="memorization-dashboard">
        {/* Overall Quran Progress */}
        <div className="quran-progress-card">
          <div className="progress-header-row">
            <BookOpen size={20} />
            <h3>Quran Memorization</h3>
          </div>
          
          <div className="big-progress-bar">
            <div className="progress-fill" style={{ width: `${quranProgress}%` }} />
          </div>
          
          <div className="progress-stats-row">
            <div className="progress-stat">
              <span className="stat-value">{pagesMemorized}</span>
              <span className="stat-label">Pages</span>
            </div>
            <div className="progress-stat">
              <span className="stat-value">{masteredCount}</span>
              <span className="stat-label">Mastered</span>
            </div>
            <div className="progress-stat">
              <span className="stat-value">{TOTAL_PAGES - pagesMemorized}</span>
              <span className="stat-label">Remaining</span>
            </div>
          </div>
          
          <div className="percentage-display">
            <span className="percentage">{quranProgress.toFixed(1)}%</span>
            <span className="of-quran">of the Quran ({pagesMemorized}/{TOTAL_PAGES} pages)</span>
          </div>
        </div>

        {/* Stats Header */}
        <div className="stats-header">
          <div className="stat-item">
            <Flame size={20} className="flame" />
            <div>
              <span className="stat-value">{progress.streak}</span>
              <span className="stat-label">Streak</span>
            </div>
          </div>
          <div className="stat-item">
            <Star size={20} className="star" />
            <div>
              <span className="stat-value">{progress.points}</span>
              <span className="stat-label">Points</span>
            </div>
          </div>
          <div className="stat-item">
            <Trophy size={20} className="trophy" />
            <div>
              <span className="stat-value">{juzProgress.filter(j => j.percentage === 100).length}</span>
              <span className="stat-label">Juz Done</span>
            </div>
          </div>
        </div>

        {/* Daily Goals */}
        <div className="daily-goals">
          <div className="goals-header">
            <h3>Today's Goals</h3>
            <button className="settings-btn" onClick={() => setView('settings')}>
              <Settings size={18} />
            </button>
          </div>

          <div className="goal-card" onClick={() => setView('memorize')}>
            <div className="goal-info">
              <span className="goal-emoji">📖</span>
              <div>
                <h4>New Memorization</h4>
                <span className="goal-progress">
                  {progress.todayNewPages} / {settings.dailyNewPages} pages
                </span>
              </div>
            </div>
            <div className="goal-bar">
              <div className="goal-fill" style={{ width: `${dailyGoalProgress.new}%` }} />
            </div>
            {progress.todayNewPages >= settings.dailyNewPages ? (
              <Check size={20} className="check-icon" />
            ) : (
              <ChevronRight size={20} className="chevron" />
            )}
          </div>

          <div className="goal-card" onClick={() => setView('review')}>
            <div className="goal-info">
              <span className="goal-emoji">🔄</span>
              <div>
                <h4>Review</h4>
                <span className="goal-progress">
                  {progress.todayReviewedPages} / {settings.dailyReviewPages} pages
                  {reviewDueCount > 0 && <span className="due-badge">{reviewDueCount} due</span>}
                </span>
              </div>
            </div>
            <div className="goal-bar review">
              <div className="goal-fill" style={{ width: `${dailyGoalProgress.review}%` }} />
            </div>
            {progress.todayReviewedPages >= settings.dailyReviewPages ? (
              <Check size={20} className="check-icon" />
            ) : (
              <ChevronRight size={20} className="chevron" />
            )}
          </div>
        </div>

        {/* Goal Completion */}
        {dailyGoalProgress.new >= 100 && dailyGoalProgress.review >= 100 && (
          <div className="completion-banner">
            <Award size={24} />
            <div>
              <h4>Daily Goal Complete! 🎉</h4>
              <p>+100 bonus points • Streak: {progress.streak} days</p>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-btn primary" onClick={() => setView('memorize')}>
            <Plus size={18} />
            Memorize Page {settings.currentPage}
          </button>
          <button className="action-btn secondary" onClick={() => setView('review')}>
            <Calendar size={18} />
            Review ({reviewDueCount})
          </button>
        </div>

        {/* Juz Progress */}
        <div className="juz-progress-section">
          <h3>Juz Progress</h3>
          <div className="juz-grid">
            {juzProgress.slice(0, 10).map(juz => (
              <div key={juz.juz} className={`juz-item ${juz.percentage === 100 ? 'complete' : ''}`}>
                <span className="juz-num">{juz.juz}</span>
                <div className="juz-bar">
                  <div className="juz-fill" style={{ width: `${juz.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
          {pagesMemorized > 0 && (
            <p className="juz-summary">
              Currently on Juz {getJuzForPage(settings.currentPage)} • Page {settings.currentPage}
            </p>
          )}
        </div>

        <style>{`
          .memorization-dashboard { animation: fadeIn 0.3s ease-out; }
          
          .quran-progress-card {
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            padding: 24px;
            border-radius: 20px;
            margin-bottom: 16px;
          }
          .progress-header-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 16px;
          }
          .progress-header-row svg { color: var(--gold); }
          .progress-header-row h3 { font-size: 16px; }
          .big-progress-bar {
            height: 14px;
            background: rgba(0,0,0,0.3);
            border-radius: 7px;
            overflow: hidden;
            margin-bottom: 16px;
          }
          .big-progress-bar .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, var(--gold), #27ae60);
            border-radius: 7px;
            transition: width 0.5s ease;
          }
          .progress-stats-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .progress-stat { text-align: center; }
          .progress-stat .stat-value {
            display: block;
            font-size: 20px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
          }
          .progress-stat .stat-label {
            font-size: 11px;
            color: var(--text-secondary);
          }
          .percentage-display {
            text-align: center;
            padding-top: 12px;
            border-top: 1px solid rgba(255,255,255,0.1);
          }
          .percentage {
            font-size: 32px;
            font-weight: 700;
            color: var(--gold);
            font-family: 'Space Grotesk', sans-serif;
          }
          .of-quran {
            display: block;
            font-size: 12px;
            color: var(--text-muted);
          }
          
          .stats-header {
            display: flex;
            justify-content: space-between;
            background: var(--bg-surface);
            padding: 16px;
            border-radius: 14px;
            margin-bottom: 16px;
          }
          .stat-item {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .stat-item .flame { color: #e74c3c; }
          .stat-item .star { color: var(--gold); }
          .stat-item .trophy { color: #3498db; }
          .stat-item .stat-value {
            display: block;
            font-size: 18px;
            font-weight: 700;
          }
          .stat-item .stat-label {
            font-size: 10px;
            color: var(--text-muted);
          }
          
          .daily-goals {
            background: var(--bg-surface);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
          }
          .goals-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
          }
          .goals-header h3 { font-size: 16px; }
          .settings-btn {
            background: var(--bg-surface-light);
            border: none;
            width: 36px;
            height: 36px;
            border-radius: 10px;
            color: var(--text-muted);
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .goal-card {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            background: var(--bg-surface-light);
            border-radius: 12px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .goal-card:hover { background: var(--bg-primary); }
          .goal-info {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
          }
          .goal-emoji { font-size: 24px; }
          .goal-info h4 { font-size: 14px; margin-bottom: 2px; }
          .goal-progress { font-size: 12px; color: var(--text-muted); }
          .due-badge {
            background: var(--gold);
            color: var(--bg-primary);
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 10px;
            font-weight: 600;
            margin-left: 8px;
          }
          .goal-bar {
            width: 60px;
            height: 6px;
            background: var(--bg-surface);
            border-radius: 3px;
            overflow: hidden;
          }
          .goal-fill {
            height: 100%;
            background: var(--gold);
            transition: width 0.3s ease;
          }
          .goal-bar.review .goal-fill { background: #3498db; }
          .chevron { color: var(--text-muted); }
          .check-icon { color: var(--success); }
          
          .completion-banner {
            display: flex;
            align-items: center;
            gap: 16px;
            background: linear-gradient(135deg, rgba(46,204,113,0.2) 0%, rgba(46,204,113,0.05) 100%);
            border: 1px solid rgba(46,204,113,0.3);
            padding: 16px;
            border-radius: 14px;
            margin-bottom: 16px;
          }
          .completion-banner svg { color: var(--success); }
          .completion-banner h4 { font-size: 14px; color: var(--success); }
          .completion-banner p { font-size: 12px; color: var(--text-muted); }
          
          .quick-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .action-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
          }
          .action-btn.primary {
            background: var(--gold);
            color: var(--bg-primary);
          }
          .action-btn.secondary {
            background: var(--bg-surface);
            color: var(--text-primary);
          }
          
          .juz-progress-section {
            background: var(--bg-surface);
            padding: 16px;
            border-radius: 14px;
          }
          .juz-progress-section h3 {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
          }
          .juz-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 8px;
            margin-bottom: 12px;
          }
          .juz-item {
            text-align: center;
          }
          .juz-num {
            font-size: 11px;
            font-weight: 600;
            color: var(--text-muted);
          }
          .juz-item.complete .juz-num { color: var(--success); }
          .juz-bar {
            height: 4px;
            background: var(--bg-surface-light);
            border-radius: 2px;
            margin-top: 4px;
            overflow: hidden;
          }
          .juz-fill {
            height: 100%;
            background: var(--gold);
          }
          .juz-item.complete .juz-fill { background: var(--success); }
          .juz-summary {
            text-align: center;
            font-size: 12px;
            color: var(--text-muted);
          }
          
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px;
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--bg-surface-light);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // Memorize View
  if (view === 'memorize') {
    const currentPage = pagesToMemorize[currentPageIndex];
    const currentJuz = currentPage ? getJuzForPage(currentPage) : 1;
    
    return (
      <div className="memorize-view">
        <button className="back-btn" onClick={() => setView('dashboard')}>
          <ChevronLeft size={18} /> Back
        </button>

        <div className="progress-header">
          <span>Page {currentPageIndex + 1} of {pagesToMemorize.length}</span>
          <div className="progress-dots">
            {pagesToMemorize.map((_, i) => (
              <span 
                key={i} 
                className={`dot ${i < currentPageIndex ? 'done' : i === currentPageIndex ? 'current' : ''}`}
              />
            ))}
          </div>
        </div>

        {currentPage ? (
          <div className="page-card">
            <div className="page-header">
              <span className="page-badge">
                <FileText size={14} />
                Page {currentPage}
              </span>
              <span className="juz-badge">Juz {currentJuz}</span>
            </div>
            
            <div className="page-content">
              <p className="instruction">Open your Mushaf to page {currentPage} and memorize it.</p>
              <p className="tip">💡 Read each ayah 10-15 times, then try to recite without looking.</p>
            </div>
            
            <div className="page-info">
              <span>~15 ayahs</span>
              <span>•</span>
              <span>Juz {currentJuz} of 30</span>
            </div>
          </div>
        ) : (
          <div className="no-pages">
            <Check size={48} />
            <h3>Today's Goal Complete!</h3>
            <p>You've memorized all your pages for today. Come back tomorrow!</p>
            <button className="btn btn-primary" onClick={() => setView('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        )}

        {currentPage && (
          <div className="memorize-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setCurrentPageIndex(Math.max(0, currentPageIndex - 1))}
              disabled={currentPageIndex === 0}
            >
              <ChevronLeft size={18} /> Previous
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={() => {
                markPageMemorized(currentPage);
                if (currentPageIndex < pagesToMemorize.length - 1) {
                  setCurrentPageIndex(currentPageIndex + 1);
                } else {
                  setView('dashboard');
                }
              }}
            >
              <Check size={18} />
              Page Memorized (+50 pts)
            </button>
          </div>
        )}

        <style>{`
          .memorize-view { animation: fadeIn 0.3s ease-out; }
          .back-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            color: var(--gold);
            font-size: 14px;
            cursor: pointer;
            margin-bottom: 16px;
          }
          .progress-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .progress-header span { font-size: 13px; color: var(--text-muted); }
          .progress-dots { display: flex; gap: 6px; }
          .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--bg-surface-light);
          }
          .dot.done { background: var(--success); }
          .dot.current { background: var(--gold); }
          .page-card {
            background: var(--bg-surface);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          .page-header {
            display: flex;
            justify-content: center;
            gap: 12px;
            margin-bottom: 24px;
          }
          .page-badge, .juz-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .page-badge {
            background: var(--gold);
            color: var(--bg-primary);
          }
          .juz-badge {
            background: var(--primary);
            color: var(--text-primary);
          }
          .page-content {
            padding: 30px 0;
          }
          .instruction {
            font-size: 18px;
            margin-bottom: 16px;
          }
          .tip {
            font-size: 14px;
            color: var(--text-muted);
            background: var(--bg-surface-light);
            padding: 12px 16px;
            border-radius: 10px;
          }
          .page-info {
            display: flex;
            justify-content: center;
            gap: 10px;
            font-size: 12px;
            color: var(--text-muted);
            padding-top: 16px;
            border-top: 1px solid var(--bg-surface-light);
          }
          .no-pages {
            text-align: center;
            padding: 40px 20px;
            background: var(--bg-surface);
            border-radius: 20px;
          }
          .no-pages svg { color: var(--success); margin-bottom: 16px; }
          .no-pages h3 { margin-bottom: 8px; }
          .no-pages p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
          .memorize-actions {
            display: flex;
            gap: 12px;
          }
          .memorize-actions .btn { flex: 1; padding: 16px; }
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-primary { background: var(--gold); color: var(--bg-primary); }
          .btn-secondary { background: var(--bg-surface); color: var(--text-primary); }
          .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        `}</style>
      </div>
    );
  }

  // Review View
  if (view === 'review') {
    const currentReviewPage = reviewPages[currentPageIndex];
    
    return (
      <div className="review-view">
        <button className="back-btn" onClick={() => { setView('dashboard'); setCurrentPageIndex(0); }}>
          <ChevronLeft size={18} /> Back
        </button>

        {reviewPages.length === 0 ? (
          <div className="no-reviews">
            <Check size={48} />
            <h3>No Reviews Due!</h3>
            <p>All your pages are up to date. Keep memorizing new pages!</p>
            <button className="btn btn-primary" onClick={() => setView('dashboard')}>
              Back to Dashboard
            </button>
          </div>
        ) : currentReviewPage ? (
          <>
            <div className="progress-header">
              <span>Review {currentPageIndex + 1} of {reviewPages.length}</span>
              <span className="review-count">Reviewed {currentReviewPage.reviewCount}x</span>
            </div>

            <div className="review-card">
              <div className="review-header">
                <span className="page-badge">Page {currentReviewPage.pageNum}</span>
                <span className="juz-badge">Juz {currentReviewPage.juz}</span>
              </div>
              
              <p className="review-instruction">
                Open your Mushaf to page {currentReviewPage.pageNum} and recite from memory.
              </p>
              
              <div className="next-review-info">
                Next review: Based on your performance below
              </div>
            </div>

            <p className="review-prompt">How well did you recite this page?</p>

            <div className="review-actions">
              <button 
                className="review-btn hard"
                onClick={() => {
                  markPageReviewed(currentReviewPage.pageNum, 'hard');
                  if (currentPageIndex < reviewPages.length - 1) {
                    setCurrentPageIndex(currentPageIndex + 1);
                  } else {
                    setView('dashboard');
                    setCurrentPageIndex(0);
                  }
                }}
              >
                <span className="btn-emoji">😓</span>
                <span className="btn-label">Hard</span>
                <span className="btn-desc">Many mistakes, review tomorrow</span>
              </button>
              
              <button 
                className="review-btn good"
                onClick={() => {
                  markPageReviewed(currentReviewPage.pageNum, 'good');
                  if (currentPageIndex < reviewPages.length - 1) {
                    setCurrentPageIndex(currentPageIndex + 1);
                  } else {
                    setView('dashboard');
                    setCurrentPageIndex(0);
                  }
                }}
              >
                <span className="btn-emoji">👍</span>
                <span className="btn-label">Good</span>
                <span className="btn-desc">Some hesitation, normal interval</span>
              </button>
              
              <button 
                className="review-btn easy"
                onClick={() => {
                  markPageReviewed(currentReviewPage.pageNum, 'easy');
                  if (currentPageIndex < reviewPages.length - 1) {
                    setCurrentPageIndex(currentPageIndex + 1);
                  } else {
                    setView('dashboard');
                    setCurrentPageIndex(0);
                  }
                }}
              >
                <span className="btn-emoji">⭐</span>
                <span className="btn-label">Easy</span>
                <span className="btn-desc">Perfect! Longer interval</span>
              </button>
            </div>
          </>
        ) : null}

        <style>{`
          .review-view { animation: fadeIn 0.3s ease-out; }
          .back-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            color: var(--gold);
            font-size: 14px;
            cursor: pointer;
            margin-bottom: 16px;
          }
          .no-reviews {
            text-align: center;
            padding: 40px 20px;
            background: var(--bg-surface);
            border-radius: 20px;
          }
          .no-reviews svg { color: var(--success); margin-bottom: 16px; }
          .no-reviews h3 { margin-bottom: 8px; }
          .no-reviews p { color: var(--text-muted); font-size: 14px; margin-bottom: 20px; }
          .progress-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .progress-header span { font-size: 13px; color: var(--text-muted); }
          .review-count {
            background: var(--primary);
            padding: 4px 12px;
            border-radius: 10px;
            color: var(--gold);
          }
          .review-card {
            background: var(--bg-surface);
            border-radius: 20px;
            padding: 24px;
            text-align: center;
            margin-bottom: 20px;
          }
          .review-header {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
          }
          .page-badge, .juz-badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
          }
          .page-badge { background: var(--gold); color: var(--bg-primary); }
          .juz-badge { background: var(--primary); color: var(--text-primary); }
          .review-instruction {
            font-size: 16px;
            margin-bottom: 16px;
          }
          .next-review-info {
            font-size: 12px;
            color: var(--text-muted);
            padding: 10px;
            background: var(--bg-surface-light);
            border-radius: 10px;
          }
          .review-prompt {
            text-align: center;
            color: var(--text-secondary);
            margin-bottom: 16px;
            font-size: 14px;
          }
          .review-actions {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .review-btn {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 16px;
            border: none;
            border-radius: 14px;
            cursor: pointer;
            text-align: left;
          }
          .review-btn.hard { background: rgba(231,76,60,0.15); }
          .review-btn.good { background: rgba(241,196,15,0.15); }
          .review-btn.easy { background: rgba(46,204,113,0.15); }
          .btn-emoji { font-size: 24px; }
          .btn-label {
            font-size: 15px;
            font-weight: 600;
            color: var(--text-primary);
          }
          .review-btn.hard .btn-label { color: var(--error); }
          .review-btn.good .btn-label { color: var(--warning); }
          .review-btn.easy .btn-label { color: var(--success); }
          .btn-desc {
            font-size: 12px;
            color: var(--text-muted);
            margin-left: auto;
          }
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            border: none;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-primary { background: var(--gold); color: var(--bg-primary); }
        `}</style>
      </div>
    );
  }

  return null;
}

export default MemorizationPlan;
