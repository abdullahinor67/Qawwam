import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Eye, EyeOff, Check, X, Award, RotateCcw, BookOpen, ChevronRight, AlertCircle } from 'lucide-react';
import { SURAHS } from './QuranReader';

// Juz to Surah mapping
const JUZ_SURAHS = {
  1: [1, 2], 2: [2], 3: [2, 3], 4: [3, 4], 5: [4], 6: [4, 5], 7: [5, 6], 8: [6, 7],
  9: [7, 8], 10: [8, 9], 11: [9, 10, 11], 12: [11, 12], 13: [12, 13, 14], 14: [15, 16],
  15: [17, 18], 16: [18, 19, 20], 17: [21, 22], 18: [23, 24, 25], 19: [25, 26, 27],
  20: [27, 28, 29], 21: [29, 30, 31, 32, 33], 22: [33, 34, 35, 36], 23: [36, 37, 38, 39],
  24: [39, 40, 41], 25: [41, 42, 43, 44, 45], 26: [46, 47, 48, 49, 50, 51],
  27: [51, 52, 53, 54, 55, 56, 57], 28: [58, 59, 60, 61, 62, 63, 64, 65, 66],
  29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
  30: [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114]
};

const AYAHS_PER_PAGE = 15;

const fetchSurahAyahs = async (surahNumber) => {
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
  if (!response.ok) throw new Error('Failed to fetch');
  const data = await response.json();
  return data.data.ayahs;
};

function QuranQuiz() {
  const { addXp, recordQuizResult } = useApp();
  
  const [settings, setSettings] = useState({
    mode: 'surah',
    surahFrom: 112,
    surahTo: 114,
    juzFrom: 30,
    juzTo: 30,
    questionCount: 5,
    pageLength: 1
  });

  const [state, setState] = useState('setup');
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  
  // Mistake highlighting
  const [highlightedMistakes, setHighlightedMistakes] = useState([]);
  const [highlightMode, setHighlightMode] = useState(false);

  const generateQuestions = async () => {
    setState('loading');
    setError(null);
    
    try {
      let allAyahs = [];
      let surahsToFetch = [];
      
      if (settings.mode === 'surah') {
        for (let i = settings.surahFrom; i <= settings.surahTo; i++) {
          surahsToFetch.push(i);
        }
      } else {
        for (let j = settings.juzFrom; j <= settings.juzTo; j++) {
          surahsToFetch.push(...(JUZ_SURAHS[j] || []));
        }
        surahsToFetch = [...new Set(surahsToFetch)];
      }

      const limitedSurahs = surahsToFetch.slice(0, 8);
      
      for (const surahNum of limitedSurahs) {
        try {
          const ayahs = await fetchSurahAyahs(surahNum);
          const surahInfo = SURAHS.find(s => s.number === surahNum);
          allAyahs.push(...ayahs.map(a => ({
            ...a,
            surahNum,
            surahName: surahInfo?.name || `Surah ${surahNum}`,
            surahArabic: surahInfo?.arabicName || ''
          })));
        } catch (err) {
          console.error(`Error fetching surah ${surahNum}:`, err);
        }
      }

      if (allAyahs.length < AYAHS_PER_PAGE) {
        throw new Error('Not enough ayahs. Please select more surahs.');
      }

      const ayahsNeeded = Math.floor(AYAHS_PER_PAGE * settings.pageLength);
      const generatedQs = [];
      const usedStarts = new Set();

      for (let i = 0; i < settings.questionCount && i < 20; i++) {
        let attempts = 0;
        let startIdx = -1;
        
        while (attempts < 50) {
          const idx = Math.floor(Math.random() * (allAyahs.length - ayahsNeeded));
          if (!usedStarts.has(idx) && idx >= 0) {
            startIdx = idx;
            usedStarts.add(idx);
            break;
          }
          attempts++;
        }

        if (startIdx === -1) continue;

        const startAyah = allAyahs[startIdx];
        const continuationAyahs = allAyahs.slice(startIdx + 1, startIdx + ayahsNeeded + 1);

        if (continuationAyahs.length < 3) continue;

        generatedQs.push({
          id: i,
          startAyah: {
            text: startAyah.text,
            surahName: startAyah.surahName,
            surahArabic: startAyah.surahArabic,
            surahNum: startAyah.surahNum,
            ayahNum: startAyah.numberInSurah
          },
          continuation: continuationAyahs.map(a => ({
            text: a.text,
            ayahNum: a.numberInSurah,
            surahNum: a.surahNum,
            surahName: a.surahName
          })),
          pageCount: settings.pageLength
        });
      }

      if (generatedQs.length === 0) {
        throw new Error('Could not generate questions. Try selecting different surahs.');
      }

      setQuestions(generatedQs);
      setCurrentQ(0);
      setResults([]);
      setRevealed(false);
      setHighlightedMistakes([]);
      setHighlightMode(false);
      setState('playing');
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to generate quiz.');
      setState('setup');
    }
  };

  const handleReveal = () => {
    setRevealed(true);
    setHighlightedMistakes([]);
    setHighlightMode(false);
  };

  const toggleMistake = (ayahIndex) => {
    if (!highlightMode) return;
    
    setHighlightedMistakes(prev => {
      if (prev.includes(ayahIndex)) {
        return prev.filter(i => i !== ayahIndex);
      } else {
        return [...prev, ayahIndex];
      }
    });
  };

  const handleResult = (passed) => {
    const mistakeCount = highlightedMistakes.length;
    const totalAyahs = questions[currentQ]?.continuation.length || 0;
    
    setResults([...results, { 
      questionId: currentQ, 
      passed,
      mistakes: highlightedMistakes,
      mistakeCount,
      totalAyahs
    }]);
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setRevealed(false);
      setHighlightedMistakes([]);
      setHighlightMode(false);
    } else {
      const allResults = [...results, { questionId: currentQ, passed, mistakes: highlightedMistakes, mistakeCount, totalAyahs }];
      const passedCount = allResults.filter(r => r.passed).length;
      const totalMistakes = allResults.reduce((sum, r) => sum + (r.mistakeCount || 0), 0);
      const xpEarned = passedCount * 20;
      addXp(xpEarned);
      recordQuizResult(passedCount >= questions.length / 2, questions.length, totalMistakes);
      setState('results');
    }
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { emoji: '🏆', title: 'Mumtaz!', message: 'Excellent! Your memorization is strong.' };
    if (percentage >= 70) return { emoji: '⭐', title: 'Jayyid Jiddan!', message: 'Very good! Keep practicing.' };
    if (percentage >= 50) return { emoji: '👍', title: 'Jayyid!', message: 'Good effort. Review weak areas.' };
    return { emoji: '📖', title: 'Keep Going!', message: 'More revision needed. Don\'t give up!' };
  };

  // Loading
  if (state === 'loading') {
    return (
      <div className="quiz-loading">
        <div className="spinner" />
        <p>Preparing Musabaqah...</p>
        <span>Loading ayahs from the Quran</span>
        <style>{`
          .quiz-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 80px 20px;
            text-align: center;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 4px solid var(--bg-surface-light);
            border-top-color: var(--gold);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 20px;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  // Setup
  if (state === 'setup') {
    return (
      <div className="quiz-setup">
        <div className="setup-header">
          <BookOpen size={36} className="icon" />
          <h2>Musabaqah</h2>
          <p>Quran Competition Style Quiz</p>
        </div>

        <div className="info-box">
          <h4>📜 How it works:</h4>
          <ol>
            <li>You'll be given a <strong>starting ayah</strong></li>
            <li>Recite the <strong>next 1-1.5 pages</strong> from memory</li>
            <li>Tap <strong>"Reveal"</strong> to see the correct continuation</li>
            <li><strong>Highlight mistakes</strong> by tapping on ayahs you got wrong</li>
            <li>Mark if you <strong>passed</strong> or <strong>made mistakes</strong></li>
          </ol>
        </div>

        {error && (
          <div className="error-banner">
            <X size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="setting-group">
          <label>Select Range</label>
          <div className="mode-selector">
            <button 
              className={`mode-btn ${settings.mode === 'surah' ? 'active' : ''}`}
              onClick={() => setSettings(p => ({ ...p, mode: 'surah' }))}
            >
              By Surah
            </button>
            <button 
              className={`mode-btn ${settings.mode === 'juz' ? 'active' : ''}`}
              onClick={() => setSettings(p => ({ ...p, mode: 'juz' }))}
            >
              By Juz
            </button>
          </div>
        </div>

        {settings.mode === 'surah' ? (
          <div className="setting-group">
            <label>Surah Range</label>
            <div className="range-row">
              <div className="range-select">
                <span className="range-label">From</span>
                <select 
                  value={settings.surahFrom}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSettings(p => ({ ...p, surahFrom: val, surahTo: Math.max(val, p.surahTo) }));
                  }}
                >
                  {SURAHS.map(s => (
                    <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                  ))}
                </select>
              </div>
              <ChevronRight size={20} className="range-arrow" />
              <div className="range-select">
                <span className="range-label">To</span>
                <select 
                  value={settings.surahTo}
                  onChange={(e) => setSettings(p => ({ ...p, surahTo: parseInt(e.target.value) }))}
                >
                  {SURAHS.filter(s => s.number >= settings.surahFrom).map(s => (
                    <option key={s.number} value={s.number}>{s.number}. {s.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="setting-group">
            <label>Juz Range</label>
            <div className="range-row">
              <div className="range-select">
                <span className="range-label">From Juz</span>
                <select 
                  value={settings.juzFrom}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setSettings(p => ({ ...p, juzFrom: val, juzTo: Math.max(val, p.juzTo) }));
                  }}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                    <option key={j} value={j}>Juz {j}</option>
                  ))}
                </select>
              </div>
              <ChevronRight size={20} className="range-arrow" />
              <div className="range-select">
                <span className="range-label">To Juz</span>
                <select 
                  value={settings.juzTo}
                  onChange={(e) => setSettings(p => ({ ...p, juzTo: parseInt(e.target.value) }))}
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).filter(j => j >= settings.juzFrom).map(j => (
                    <option key={j} value={j}>Juz {j}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="setting-group">
          <label>Recitation Length</label>
          <div className="length-selector">
            <button 
              className={`length-btn ${settings.pageLength === 1 ? 'active' : ''}`}
              onClick={() => setSettings(p => ({ ...p, pageLength: 1 }))}
            >
              <span className="length-value">1</span>
              <span className="length-label">Page</span>
            </button>
            <button 
              className={`length-btn ${settings.pageLength === 1.5 ? 'active' : ''}`}
              onClick={() => setSettings(p => ({ ...p, pageLength: 1.5 }))}
            >
              <span className="length-value">1.5</span>
              <span className="length-label">Pages</span>
            </button>
          </div>
        </div>

        <div className="setting-group">
          <label>Number of Rounds</label>
          <div className="count-selector">
            {[3, 5, 7, 10].map(n => (
              <button
                key={n}
                className={`count-btn ${settings.questionCount === n ? 'active' : ''}`}
                onClick={() => setSettings(p => ({ ...p, questionCount: n }))}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary start-btn" onClick={generateQuestions}>
          <Play size={20} /> Start Musabaqah
        </button>

        <style>{`
          .quiz-setup { animation: fadeIn 0.3s ease-out; }
          .setup-header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            border-radius: 20px;
            margin-bottom: 16px;
          }
          .setup-header .icon { color: var(--gold); margin-bottom: 12px; }
          .setup-header h2 { font-size: 26px; margin-bottom: 6px; }
          .setup-header p { color: var(--text-muted); font-size: 14px; }
          
          .info-box {
            background: rgba(212,175,55,0.1);
            border: 1px solid rgba(212,175,55,0.3);
            border-radius: 12px;
            padding: 16px;
            margin-bottom: 16px;
          }
          .info-box h4 { font-size: 14px; margin-bottom: 10px; color: var(--gold); }
          .info-box ol { padding-left: 20px; margin: 0; }
          .info-box li { font-size: 13px; color: var(--text-secondary); margin-bottom: 6px; line-height: 1.5; }
          
          .error-banner {
            display: flex; align-items: center; gap: 8px;
            background: rgba(231,76,60,0.2); color: var(--error);
            padding: 12px 16px; border-radius: 10px; margin-bottom: 16px; font-size: 13px;
          }
          .setting-group {
            background: var(--bg-surface);
            padding: 16px;
            border-radius: 12px;
            margin-bottom: 12px;
          }
          .setting-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            margin-bottom: 12px;
            color: var(--text-secondary);
          }
          .mode-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .mode-btn {
            padding: 14px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .mode-btn.active {
            background: var(--primary);
            border-color: var(--gold);
            color: var(--gold);
          }
          .range-row {
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .range-select { flex: 1; }
          .range-label {
            display: block;
            font-size: 11px;
            color: var(--text-muted);
            margin-bottom: 6px;
            text-transform: uppercase;
          }
          .range-arrow { color: var(--text-muted); flex-shrink: 0; }
          select {
            width: 100%;
            padding: 12px;
            background: var(--bg-surface-light);
            border: none;
            border-radius: 8px;
            color: var(--text-primary);
            font-size: 13px;
          }
          .length-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
          }
          .length-btn {
            padding: 16px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 12px;
            cursor: pointer;
            text-align: center;
          }
          .length-btn.active {
            background: var(--primary);
            border-color: var(--gold);
          }
          .length-value {
            display: block;
            font-size: 28px;
            font-weight: 700;
            color: var(--text-primary);
            font-family: 'Space Grotesk', sans-serif;
          }
          .length-btn.active .length-value { color: var(--gold); }
          .length-label {
            font-size: 12px;
            color: var(--text-muted);
          }
          .count-selector {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 8px;
          }
          .count-btn {
            padding: 14px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
          }
          .count-btn.active {
            background: var(--primary);
            border-color: var(--gold);
            color: var(--gold);
          }
          .start-btn {
            width: 100%;
            padding: 18px;
            font-size: 16px;
            margin-top: 8px;
          }
        `}</style>
      </div>
    );
  }

  // Playing
  if (state === 'playing' && questions.length > 0) {
    const q = questions[currentQ];
    
    return (
      <div className="quiz-playing">
        {/* Progress */}
        <div className="quiz-progress">
          <span>Round {currentQ + 1} of {questions.length}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Starting Ayah Card */}
        <div className="start-card">
          <div className="start-label">
            <span className="label-icon">📖</span>
            <span>Start from here:</span>
          </div>
          <div className="surah-info">
            <span className="surah-name">{q.startAyah.surahName}</span>
            <span className="surah-arabic">{q.startAyah.surahArabic}</span>
            <span className="ayah-ref">Ayah {q.startAyah.ayahNum}</span>
          </div>
          <p className="arabic start-ayah">{q.startAyah.text}</p>
          <div className="instruction">
            ⬇️ Continue reciting {q.pageCount} page{q.pageCount > 1 ? 's' : ''} from memory
          </div>
        </div>

        {/* Reveal Section */}
        {!revealed ? (
          <button className="reveal-btn" onClick={handleReveal}>
            <Eye size={20} /> Reveal Continuation
          </button>
        ) : (
          <div className="continuation-section">
            <div className="continuation-header">
              <EyeOff size={16} />
              <span>Correct Continuation ({q.continuation.length} ayahs)</span>
            </div>

            {/* Highlight Toggle */}
            <div className="highlight-toggle">
              <button 
                className={`toggle-btn ${highlightMode ? 'active' : ''}`}
                onClick={() => setHighlightMode(!highlightMode)}
              >
                <AlertCircle size={16} />
                {highlightMode ? 'Done Highlighting' : 'Highlight Mistakes'}
              </button>
              {highlightedMistakes.length > 0 && (
                <span className="mistake-count">
                  {highlightedMistakes.length} mistake{highlightedMistakes.length !== 1 ? 's' : ''} marked
                </span>
              )}
            </div>

            {highlightMode && (
              <div className="highlight-hint">
                👆 Tap on any ayah where you made a mistake
              </div>
            )}
            
            <div className={`continuation-text ${highlightMode ? 'highlight-mode' : ''}`}>
              {q.continuation.map((ayah, i) => {
                const isMistake = highlightedMistakes.includes(i);
                return (
                  <span 
                    key={i} 
                    className={`cont-ayah ${isMistake ? 'mistake' : ''} ${highlightMode ? 'clickable' : ''}`}
                    onClick={() => toggleMistake(i)}
                  >
                    <span className="arabic">{ayah.text}</span>
                    <span className="ayah-num">({ayah.ayahNum})</span>
                    {isMistake && <span className="mistake-marker">✗</span>}
                  </span>
                );
              })}
            </div>

            <div className="result-prompt">
              <p>How did you do overall?</p>
              {highlightedMistakes.length > 0 && (
                <div className="mistakes-summary">
                  <AlertCircle size={14} />
                  <span>You marked {highlightedMistakes.length} mistake{highlightedMistakes.length !== 1 ? 's' : ''} in {q.continuation.length} ayahs</span>
                </div>
              )}
              <div className="result-buttons">
                <button className="result-btn pass" onClick={() => handleResult(true)}>
                  <Check size={20} />
                  <span>Passed</span>
                  <small>Minor/No mistakes</small>
                </button>
                <button className="result-btn fail" onClick={() => handleResult(false)}>
                  <X size={20} />
                  <span>Failed</span>
                  <small>Major mistakes</small>
                </button>
              </div>
            </div>
          </div>
        )}

        <style>{`
          .quiz-playing { animation: fadeIn 0.3s ease-out; }
          .quiz-progress { margin-bottom: 20px; }
          .quiz-progress span { font-size: 12px; color: var(--text-muted); }
          .progress-bar {
            height: 6px;
            background: var(--bg-surface);
            border-radius: 3px;
            margin-top: 8px;
            overflow: hidden;
          }
          .progress-fill {
            height: 100%;
            background: var(--gold);
            transition: width 0.3s ease;
          }
          
          .start-card {
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 16px;
            border-left: 4px solid var(--gold);
          }
          .start-label {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 13px;
            color: var(--text-muted);
            margin-bottom: 12px;
          }
          .label-icon { font-size: 18px; }
          .surah-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 16px;
            flex-wrap: wrap;
          }
          .surah-name {
            font-size: 16px;
            font-weight: 600;
          }
          .surah-arabic {
            font-family: 'Amiri', serif;
            font-size: 18px;
            color: var(--gold);
          }
          .ayah-ref {
            background: rgba(212,175,55,0.2);
            padding: 4px 10px;
            border-radius: 12px;
            font-size: 11px;
            color: var(--gold);
          }
          .start-ayah {
            font-size: 28px;
            line-height: 2.2;
            color: var(--text-primary);
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid rgba(255,255,255,0.1);
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }
          .instruction {
            text-align: center;
            font-size: 13px;
            color: var(--gold);
            margin-top: 16px;
          }
          
          .reveal-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 18px;
            background: var(--bg-surface);
            border: 2px dashed var(--gold);
            border-radius: 14px;
            color: var(--gold);
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .reveal-btn:hover {
            background: var(--primary);
          }
          
          .continuation-section {
            background: var(--bg-surface);
            border-radius: 16px;
            overflow: hidden;
            animation: slideUp 0.3s ease-out;
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .continuation-header {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 14px 16px;
            background: var(--bg-surface-light);
            font-size: 13px;
            color: var(--text-muted);
          }

          .highlight-toggle {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 16px;
            border-bottom: 1px solid var(--bg-surface-light);
          }
          .toggle-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 10px 16px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 13px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .toggle-btn.active {
            background: rgba(231,76,60,0.15);
            border-color: var(--error);
            color: var(--error);
          }
          .mistake-count {
            font-size: 12px;
            color: var(--error);
            background: rgba(231,76,60,0.15);
            padding: 6px 12px;
            border-radius: 12px;
          }

          .highlight-hint {
            text-align: center;
            font-size: 12px;
            color: var(--gold);
            padding: 10px;
            background: rgba(212,175,55,0.1);
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }

          .continuation-text {
            padding: 20px;
            max-height: 350px;
            overflow-y: auto;
          }
          .continuation-text.highlight-mode {
            background: rgba(0,0,0,0.2);
          }
          .cont-ayah {
            display: inline;
            position: relative;
            padding: 4px 2px;
            border-radius: 4px;
            transition: all 0.2s ease;
          }
          .cont-ayah.clickable {
            cursor: pointer;
          }
          .cont-ayah.clickable:hover {
            background: rgba(212,175,55,0.1);
          }
          .cont-ayah.mistake {
            background: rgba(231,76,60,0.25);
            border-radius: 6px;
          }
          .cont-ayah.mistake .arabic {
            color: var(--error);
          }
          .mistake-marker {
            font-size: 12px;
            color: var(--error);
            margin-left: 4px;
            font-weight: bold;
          }
          .cont-ayah .arabic {
            font-size: 22px;
            line-height: 2.4;
          }
          .ayah-num {
            font-size: 11px;
            color: var(--gold);
            margin: 0 6px;
            font-family: 'Space Grotesk', sans-serif;
          }
          
          .result-prompt {
            padding: 20px;
            border-top: 1px solid var(--bg-surface-light);
            text-align: center;
          }
          .result-prompt p {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
          }
          .mistakes-summary {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(231,76,60,0.15);
            color: var(--error);
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 12px;
            margin-bottom: 16px;
          }
          .result-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .result-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            padding: 20px;
            border: 2px solid transparent;
            border-radius: 14px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .result-btn span {
            font-size: 16px;
            font-weight: 600;
          }
          .result-btn small {
            font-size: 11px;
            opacity: 0.7;
          }
          .result-btn.pass {
            background: rgba(46,204,113,0.15);
            color: var(--success);
          }
          .result-btn.pass:hover {
            border-color: var(--success);
            background: rgba(46,204,113,0.25);
          }
          .result-btn.fail {
            background: rgba(231,76,60,0.15);
            color: var(--error);
          }
          .result-btn.fail:hover {
            border-color: var(--error);
            background: rgba(231,76,60,0.25);
          }
        `}</style>
      </div>
    );
  }

  // Results
  if (state === 'results') {
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = questions.length;
    const percentage = Math.round((passedCount / totalCount) * 100);
    const { emoji, title, message } = getScoreMessage(percentage);
    const xpEarned = passedCount * 20;
    const totalMistakes = results.reduce((sum, r) => sum + (r.mistakeCount || 0), 0);
    const totalAyahs = results.reduce((sum, r) => sum + (r.totalAyahs || 0), 0);

    return (
      <div className="quiz-results">
        <div className="results-card">
          <span className="result-emoji">{emoji}</span>
          <h2>{title}</h2>
          <p className="result-msg">{message}</p>
          
          <div className="score-display">
            <div className="score-ring" style={{ '--percent': percentage }}>
              <span className="score-value">{passedCount}/{totalCount}</span>
            </div>
            <span className="score-percent">{percentage}%</span>
          </div>

          <div className="stats-row">
            <div className="stat passed">
              <Check size={16} />
              <span>{passedCount} Passed</span>
            </div>
            <div className="stat failed">
              <X size={16} />
              <span>{totalCount - passedCount} Failed</span>
            </div>
          </div>

          {totalMistakes > 0 && (
            <div className="mistakes-stat">
              <AlertCircle size={16} />
              <span>{totalMistakes} ayah mistake{totalMistakes !== 1 ? 's' : ''} highlighted across {totalAyahs} ayahs</span>
            </div>
          )}

          <div className="xp-badge">
            <Award size={20} />
            <span>+{xpEarned} XP Earned</span>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="breakdown-card">
          <h3>Round Breakdown</h3>
          <div className="breakdown-list">
            {results.map((r, i) => (
              <div key={i} className={`breakdown-item ${r.passed ? 'pass' : 'fail'}`}>
                <div className="breakdown-main">
                  <span className="round-num">Round {i + 1}</span>
                  {r.passed ? <Check size={16} /> : <X size={16} />}
                </div>
                {r.mistakeCount > 0 && (
                  <span className="breakdown-mistakes">
                    {r.mistakeCount} mistake{r.mistakeCount !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" onClick={() => setState('setup')}>
          <RotateCcw size={18} /> New Musabaqah
        </button>

        <style>{`
          .quiz-results { animation: fadeIn 0.3s ease-out; }
          .results-card {
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            border-radius: 24px;
            padding: 32px;
            text-align: center;
            margin-bottom: 16px;
          }
          .result-emoji { font-size: 56px; display: block; margin-bottom: 16px; }
          .results-card h2 { font-size: 28px; margin-bottom: 8px; }
          .result-msg { color: var(--text-secondary); margin-bottom: 24px; }
          
          .score-display { margin-bottom: 24px; }
          .score-ring {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: conic-gradient(var(--gold) calc(var(--percent) * 1%), var(--bg-surface-light) 0);
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 12px;
            position: relative;
          }
          .score-ring::before {
            content: '';
            position: absolute;
            width: 90px;
            height: 90px;
            background: var(--primary);
            border-radius: 50%;
          }
          .score-value {
            position: relative;
            z-index: 1;
            font-size: 28px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
          }
          .score-percent {
            font-size: 18px;
            color: var(--gold);
            font-weight: 600;
          }
          
          .stats-row {
            display: flex;
            justify-content: center;
            gap: 24px;
            margin-bottom: 16px;
          }
          .stat {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 14px;
          }
          .stat.passed { color: var(--success); }
          .stat.failed { color: var(--error); }

          .mistakes-stat {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(231,76,60,0.2);
            padding: 8px 16px;
            border-radius: 10px;
            color: var(--error);
            font-size: 12px;
            margin-bottom: 16px;
          }
          
          .xp-badge {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(212,175,55,0.2);
            padding: 12px 24px;
            border-radius: 24px;
            color: var(--gold);
            font-weight: 600;
            font-size: 16px;
          }
          
          .breakdown-card {
            background: var(--bg-surface);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
          }
          .breakdown-card h3 {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 16px;
          }
          .breakdown-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .breakdown-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 14px;
            border-radius: 10px;
            font-size: 13px;
            font-weight: 500;
          }
          .breakdown-main {
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .round-num {
            font-weight: 600;
          }
          .breakdown-item.pass {
            background: rgba(46,204,113,0.1);
            color: var(--success);
          }
          .breakdown-item.fail {
            background: rgba(231,76,60,0.1);
            color: var(--error);
          }
          .breakdown-mistakes {
            font-size: 11px;
            background: rgba(0,0,0,0.2);
            padding: 4px 8px;
            border-radius: 6px;
          }
          
          .btn { width: 100%; }
        `}</style>
      </div>
    );
  }

  return null;
}

export default QuranQuiz;
