import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  RotateCcw, Check, ChevronRight, BookOpen, 
  Calendar, Lock, Award, Target, Star, Clock,
  ChevronDown, ChevronUp, Play, Trophy
} from 'lucide-react';

// Juz sections with page ranges (Madinah Mushaf)
const JUZ_SECTIONS = [
  { 
    id: 'juz1-5', 
    name: 'Juz 1-5', 
    subtitle: 'Al-Fatihah to Al-Maidah',
    pages: { start: 1, end: 106 },
    surahs: [1, 2, 3, 4, 5],
    unlocked: true 
  },
  { 
    id: 'juz6-10', 
    name: 'Juz 6-10', 
    subtitle: 'Al-Anam to At-Tawbah',
    pages: { start: 107, end: 208 },
    surahs: [6, 7, 8, 9],
    unlocked: false 
  },
  { 
    id: 'juz11-15', 
    name: 'Juz 11-15', 
    subtitle: 'Yunus to Al-Isra',
    pages: { start: 209, end: 293 },
    surahs: [10, 11, 12, 13, 14, 15, 16, 17],
    unlocked: false 
  },
  { 
    id: 'juz16-20', 
    name: 'Juz 16-20', 
    subtitle: 'Al-Kahf to Al-Ankabut',
    pages: { start: 294, end: 396 },
    surahs: [18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
    unlocked: false 
  },
  { 
    id: 'juz21-25', 
    name: 'Juz 21-25', 
    subtitle: 'Ar-Rum to Al-Jathiyah',
    pages: { start: 397, end: 499 },
    surahs: [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45],
    unlocked: false 
  },
  { 
    id: 'juz26-30', 
    name: 'Juz 26-30', 
    subtitle: 'Al-Ahqaf to An-Nas',
    pages: { start: 500, end: 604 },
    surahs: [46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114],
    unlocked: false 
  },
];

// Assessment questions per section (sample - in real app, fetch from API)
const generateAssessmentQuestions = (sectionId) => {
  const questions = [
    { id: 1, prompt: 'Recite from the beginning of this Juz section', type: 'recite' },
    { id: 2, prompt: 'Continue from a random ayah in the middle', type: 'continue' },
    { id: 3, prompt: 'Identify which Surah this ayah is from', type: 'identify' },
    { id: 4, prompt: 'Recite the next 5 ayahs from this point', type: 'recite' },
    { id: 5, prompt: 'Complete this ayah from memory', type: 'complete' },
  ];
  return questions;
};

function RevisionPlan() {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState(JUZ_SECTIONS);
  const [sectionProgress, setSectionProgress] = useState({});
  const [assessments, setAssessments] = useState({});
  const [expandedSection, setExpandedSection] = useState(null);
  const [activeAssessment, setActiveAssessment] = useState(null);
  const [assessmentStep, setAssessmentStep] = useState(0);
  const [assessmentScore, setAssessmentScore] = useState(0);
  const [dailyGoal, setDailyGoal] = useState(5); // Pages per day
  const [todayProgress, setTodayProgress] = useState({ reviewed: 0, date: null });

  useEffect(() => {
    if (user) {
      loadRevisionData();
    }
  }, [user]);

  const loadRevisionData = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'users', user.uid, 'quran', 'revision');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Load section unlock status
        const loadedSections = JUZ_SECTIONS.map(section => ({
          ...section,
          unlocked: data.unlockedSections?.includes(section.id) || section.id === 'juz1-5'
        }));
        setSections(loadedSections);
        
        // Load progress
        setSectionProgress(data.sectionProgress || {});
        setAssessments(data.assessments || {});
        setDailyGoal(data.dailyGoal || 5);
        
        // Check today's progress
        const today = new Date().toDateString();
        if (data.todayProgress?.date === today) {
          setTodayProgress(data.todayProgress);
        } else {
          setTodayProgress({ reviewed: 0, date: today });
        }
      }
    } catch (error) {
      console.error('Error loading revision data:', error);
    }
    setLoading(false);
  };

  const saveRevisionData = async (updates) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid, 'quran', 'revision');
      await setDoc(docRef, {
        unlockedSections: sections.filter(s => s.unlocked).map(s => s.id),
        sectionProgress,
        assessments,
        dailyGoal,
        todayProgress,
        ...updates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error('Error saving revision data:', error);
    }
  };

  const getProgress = (sectionId) => {
    const progress = sectionProgress[sectionId] || { pagesReviewed: [], lastReview: null };
    const section = sections.find(s => s.id === sectionId);
    const totalPages = section.pages.end - section.pages.start + 1;
    const reviewedCount = progress.pagesReviewed?.length || 0;
    return {
      ...progress,
      totalPages,
      reviewedCount,
      percentage: Math.round((reviewedCount / totalPages) * 100)
    };
  };

  const markPageReviewed = async (sectionId, pageNum) => {
    const currentProgress = sectionProgress[sectionId] || { pagesReviewed: [], lastReview: null };
    
    if (!currentProgress.pagesReviewed.includes(pageNum)) {
      const updatedProgress = {
        ...sectionProgress,
        [sectionId]: {
          pagesReviewed: [...currentProgress.pagesReviewed, pageNum],
          lastReview: new Date().toISOString()
        }
      };
      
      const updatedTodayProgress = {
        reviewed: todayProgress.reviewed + 1,
        date: new Date().toDateString()
      };
      
      setSectionProgress(updatedProgress);
      setTodayProgress(updatedTodayProgress);
      
      await saveRevisionData({ 
        sectionProgress: updatedProgress,
        todayProgress: updatedTodayProgress
      });
    }
  };

  const startAssessment = (sectionId) => {
    setActiveAssessment(sectionId);
    setAssessmentStep(0);
    setAssessmentScore(0);
  };

  const answerAssessment = async (correct) => {
    const newScore = correct ? assessmentScore + 1 : assessmentScore;
    setAssessmentScore(newScore);
    
    const questions = generateAssessmentQuestions(activeAssessment);
    
    if (assessmentStep < questions.length - 1) {
      setAssessmentStep(assessmentStep + 1);
    } else {
      // Assessment complete
      const passed = (newScore / questions.length) >= 0.7; // 70% to pass
      
      const updatedAssessments = {
        ...assessments,
        [activeAssessment]: {
          completed: true,
          passed,
          score: newScore,
          total: questions.length,
          date: new Date().toISOString()
        }
      };
      setAssessments(updatedAssessments);
      
      // Unlock next section if passed
      if (passed) {
        const currentIndex = sections.findIndex(s => s.id === activeAssessment);
        if (currentIndex < sections.length - 1) {
          const nextSectionId = sections[currentIndex + 1].id;
          const updatedSections = sections.map(s => 
            s.id === nextSectionId ? { ...s, unlocked: true } : s
          );
          setSections(updatedSections);
          
          await saveRevisionData({ 
            assessments: updatedAssessments,
            unlockedSections: updatedSections.filter(s => s.unlocked).map(s => s.id)
          });
        }
      } else {
        await saveRevisionData({ assessments: updatedAssessments });
      }
      
      setActiveAssessment(null);
    }
  };

  const getNextPages = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    const progress = sectionProgress[sectionId] || { pagesReviewed: [] };
    const reviewed = new Set(progress.pagesReviewed || []);
    
    const nextPages = [];
    for (let page = section.pages.start; page <= section.pages.end && nextPages.length < 5; page++) {
      if (!reviewed.has(page)) {
        nextPages.push(page);
      }
    }
    return nextPages;
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading revision plan...</p>
      </div>
    );
  }

  // Assessment View
  if (activeAssessment) {
    const questions = generateAssessmentQuestions(activeAssessment);
    const currentQuestion = questions[assessmentStep];
    const section = sections.find(s => s.id === activeAssessment);
    
    return (
      <div className="assessment-view">
        <div className="assessment-header">
          <Trophy size={32} className="trophy" />
          <h2>Assessment: {section.name}</h2>
          <p>Pass with 70% to unlock the next section</p>
        </div>
        
        <div className="assessment-progress">
          <span>Question {assessmentStep + 1} / {questions.length}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((assessmentStep + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="score">{assessmentScore} ✓</span>
        </div>
        
        <div className="question-card">
          <h3>{currentQuestion.prompt}</h3>
          <p className="question-type">{currentQuestion.type === 'recite' ? '🎤 Recitation' : currentQuestion.type === 'continue' ? '➡️ Continuation' : '❓ Identification'}</p>
          
          <div className="instruction-box">
            <p>Open your Mushaf to {section.name} and perform this task. Then rate your performance below.</p>
          </div>
        </div>
        
        <div className="answer-buttons">
          <button className="answer-btn wrong" onClick={() => answerAssessment(false)}>
            <span>❌</span>
            Made Mistakes
          </button>
          <button className="answer-btn correct" onClick={() => answerAssessment(true)}>
            <span>✅</span>
            Correct
          </button>
        </div>
        
        <button className="cancel-btn" onClick={() => setActiveAssessment(null)}>
          Cancel Assessment
        </button>
        
        <style>{`
          .assessment-view { animation: fadeIn 0.3s ease-out; }
          .assessment-header {
            text-align: center;
            padding: 30px;
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            border-radius: 20px;
            margin-bottom: 20px;
          }
          .trophy { color: var(--gold); margin-bottom: 12px; }
          .assessment-header h2 { font-size: 22px; margin-bottom: 8px; }
          .assessment-header p { color: var(--text-secondary); font-size: 14px; }
          .assessment-progress {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
            font-size: 13px;
            color: var(--text-muted);
          }
          .progress-bar {
            flex: 1;
            height: 6px;
            background: var(--bg-surface);
            border-radius: 3px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: var(--gold);
            transition: width 0.3s ease;
          }
          .score { color: var(--success); font-weight: 600; }
          .question-card {
            background: var(--bg-surface);
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            margin-bottom: 20px;
          }
          .question-card h3 { font-size: 18px; margin-bottom: 12px; }
          .question-type {
            display: inline-block;
            padding: 6px 16px;
            background: var(--bg-surface-light);
            border-radius: 20px;
            font-size: 13px;
            margin-bottom: 20px;
          }
          .instruction-box {
            padding: 16px;
            background: rgba(212,175,55,0.1);
            border-radius: 12px;
            font-size: 14px;
            color: var(--gold);
          }
          .answer-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 16px;
          }
          .answer-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            padding: 20px;
            border: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .answer-btn span { font-size: 24px; }
          .answer-btn.wrong { background: rgba(231,76,60,0.2); color: var(--error); }
          .answer-btn.correct { background: var(--gold); color: var(--bg-primary); }
          .cancel-btn {
            width: 100%;
            padding: 14px;
            background: var(--bg-surface);
            border: none;
            border-radius: 12px;
            color: var(--text-muted);
            font-size: 14px;
            cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="revision-dashboard">
      {/* Daily Progress */}
      <div className="daily-card">
        <div className="daily-header">
          <Calendar size={20} />
          <h3>Today's Revision</h3>
        </div>
        <div className="daily-progress">
          <div className="daily-ring">
            <svg viewBox="0 0 100 100">
              <circle className="ring-bg" cx="50" cy="50" r="40" />
              <circle 
                className="ring-fill" 
                cx="50" cy="50" r="40"
                strokeDasharray={`${(todayProgress.reviewed / dailyGoal) * 251} 251`}
              />
            </svg>
            <span className="ring-text">{todayProgress.reviewed}/{dailyGoal}</span>
          </div>
          <div className="daily-info">
            <span className="pages-label">Pages Reviewed</span>
            <span className="goal-text">Daily Goal: {dailyGoal} pages</span>
            {todayProgress.reviewed >= dailyGoal && (
              <span className="goal-complete">✨ Goal Complete!</span>
            )}
          </div>
        </div>
      </div>

      {/* Juz Sections */}
      <div className="sections-list">
        <h3>📖 Revision Progress</h3>
        <p className="sections-subtitle">Starting from Al-Fatihah • Pass assessment to unlock next section</p>
        
        {sections.map((section, index) => {
          const progress = getProgress(section.id);
          const assessment = assessments[section.id];
          const isExpanded = expandedSection === section.id;
          const nextPages = getNextPages(section.id);
          const isLastUnlocked = section.unlocked && (index === sections.length - 1 || !sections[index + 1].unlocked);
          
          return (
            <div 
              key={section.id} 
              className={`section-card ${!section.unlocked ? 'locked' : ''} ${progress.percentage === 100 ? 'complete' : ''}`}
            >
              <div className="section-header" onClick={() => section.unlocked && setExpandedSection(isExpanded ? null : section.id)}>
                <div className="section-info">
                  {!section.unlocked ? (
                    <Lock size={20} className="lock-icon" />
                  ) : progress.percentage === 100 ? (
                    <Check size={20} className="check-icon" />
                  ) : (
                    <BookOpen size={20} className="book-icon" />
                  )}
                  <div>
                    <h4>{section.name}</h4>
                    <span className="section-subtitle">{section.subtitle}</span>
                  </div>
                </div>
                <div className="section-meta">
                  {section.unlocked ? (
                    <>
                      <span className="progress-text">{progress.percentage}%</span>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </>
                  ) : (
                    <span className="locked-text">Locked</span>
                  )}
                </div>
              </div>
              
              {/* Progress Bar */}
              {section.unlocked && (
                <div className="section-progress-bar">
                  <div className="bar-fill" style={{ width: `${progress.percentage}%` }} />
                </div>
              )}
              
              {/* Expanded Content */}
              {isExpanded && section.unlocked && (
                <div className="section-content">
                  <div className="progress-stats">
                    <div className="stat">
                      <span className="stat-value">{progress.reviewedCount}</span>
                      <span className="stat-label">Reviewed</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{progress.totalPages - progress.reviewedCount}</span>
                      <span className="stat-label">Remaining</span>
                    </div>
                    <div className="stat">
                      <span className="stat-value">{progress.totalPages}</span>
                      <span className="stat-label">Total Pages</span>
                    </div>
                  </div>
                  
                  {/* Next Pages to Review */}
                  {nextPages.length > 0 && (
                    <div className="next-pages">
                      <h5>Next pages to review:</h5>
                      <div className="page-buttons">
                        {nextPages.map(page => (
                          <button 
                            key={page}
                            className="page-btn"
                            onClick={() => markPageReviewed(section.id, page)}
                          >
                            Page {page}
                            <Check size={14} />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Assessment Button */}
                  {progress.percentage >= 80 && isLastUnlocked && index < sections.length - 1 && (
                    <div className="assessment-section">
                      {assessment?.passed ? (
                        <div className="assessment-passed">
                          <Award size={20} />
                          <span>Assessment Passed! ({assessment.score}/{assessment.total})</span>
                        </div>
                      ) : (
                        <>
                          <p className="assessment-hint">Complete 80%+ to take assessment</p>
                          <button className="assessment-btn" onClick={() => startAssessment(section.id)}>
                            <Play size={16} />
                            Take Assessment to Unlock {sections[index + 1].name}
                          </button>
                          {assessment && !assessment.passed && (
                            <p className="retry-hint">Previous attempt: {assessment.score}/{assessment.total} - Try again!</p>
                          )}
                        </>
                      )}
                    </div>
                  )}
                  
                  {progress.percentage === 100 && !isLastUnlocked && (
                    <div className="section-complete">
                      <Star size={20} />
                      <span>Section Complete!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .revision-dashboard { animation: fadeIn 0.3s ease-out; }
        
        .daily-card {
          background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
          padding: 20px;
          border-radius: 20px;
          margin-bottom: 20px;
        }
        .daily-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }
        .daily-header svg { color: var(--gold); }
        .daily-header h3 { font-size: 16px; }
        .daily-progress {
          display: flex;
          align-items: center;
          gap: 20px;
        }
        .daily-ring {
          position: relative;
          width: 80px;
          height: 80px;
        }
        .daily-ring svg {
          transform: rotate(-90deg);
          width: 100%;
          height: 100%;
        }
        .ring-bg {
          fill: none;
          stroke: rgba(255,255,255,0.1);
          stroke-width: 8;
        }
        .ring-fill {
          fill: none;
          stroke: var(--gold);
          stroke-width: 8;
          stroke-linecap: round;
          transition: stroke-dasharray 0.3s ease;
        }
        .ring-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 16px;
          font-weight: 700;
          color: var(--gold);
        }
        .daily-info { flex: 1; }
        .pages-label {
          display: block;
          font-size: 14px;
          margin-bottom: 4px;
        }
        .goal-text {
          display: block;
          font-size: 12px;
          color: var(--text-muted);
        }
        .goal-complete {
          display: block;
          font-size: 13px;
          color: var(--gold);
          margin-top: 8px;
        }
        
        .sections-list {
          background: var(--bg-surface);
          padding: 20px;
          border-radius: 20px;
        }
        .sections-list h3 {
          font-size: 18px;
          margin-bottom: 4px;
        }
        .sections-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 16px;
        }
        
        .section-card {
          background: var(--bg-surface-light);
          border-radius: 16px;
          margin-bottom: 12px;
          overflow: hidden;
          border-left: 4px solid var(--text-muted);
          transition: all 0.2s ease;
        }
        .section-card.locked {
          opacity: 0.6;
          border-left-color: var(--text-muted);
        }
        .section-card.complete {
          border-left-color: var(--success);
        }
        .section-card:not(.locked) {
          border-left-color: var(--gold);
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          cursor: pointer;
        }
        .section-card.locked .section-header {
          cursor: not-allowed;
        }
        .section-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .lock-icon { color: var(--text-muted); }
        .check-icon { color: var(--success); }
        .book-icon { color: var(--gold); }
        .section-info h4 { font-size: 15px; margin-bottom: 2px; }
        .section-subtitle { font-size: 12px; color: var(--text-muted); }
        .section-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .progress-text {
          font-size: 14px;
          font-weight: 600;
          color: var(--gold);
        }
        .locked-text {
          font-size: 12px;
          color: var(--text-muted);
        }
        
        .section-progress-bar {
          height: 4px;
          background: var(--bg-primary);
          margin: 0 16px;
        }
        .bar-fill {
          height: 100%;
          background: var(--gold);
          transition: width 0.3s ease;
        }
        
        .section-content {
          padding: 16px;
          border-top: 1px solid var(--bg-primary);
        }
        
        .progress-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 16px;
        }
        .stat {
          text-align: center;
          padding: 12px;
          background: var(--bg-primary);
          border-radius: 10px;
        }
        .stat-value {
          display: block;
          font-size: 20px;
          font-weight: 700;
          color: var(--gold);
        }
        .stat-label {
          font-size: 11px;
          color: var(--text-muted);
        }
        
        .next-pages {
          margin-bottom: 16px;
        }
        .next-pages h5 {
          font-size: 13px;
          color: var(--text-secondary);
          margin-bottom: 10px;
        }
        .page-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .page-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          background: var(--bg-primary);
          border: none;
          border-radius: 10px;
          color: var(--text-primary);
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .page-btn:hover {
          background: var(--gold);
          color: var(--bg-primary);
        }
        .page-btn svg { opacity: 0; }
        .page-btn:hover svg { opacity: 1; }
        
        .assessment-section {
          padding: 16px;
          background: rgba(212,175,55,0.1);
          border-radius: 12px;
          text-align: center;
        }
        .assessment-hint {
          font-size: 12px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .assessment-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          background: var(--gold);
          border: none;
          border-radius: 12px;
          color: var(--bg-primary);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }
        .retry-hint {
          font-size: 12px;
          color: var(--error);
          margin-top: 10px;
        }
        .assessment-passed {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--success);
          font-weight: 600;
        }
        
        .section-complete {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: rgba(46,204,113,0.1);
          border-radius: 10px;
          color: var(--success);
          font-size: 14px;
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

export default RevisionPlan;
