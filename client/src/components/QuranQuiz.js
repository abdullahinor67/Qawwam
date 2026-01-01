import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Play, Trophy, ChevronRight, Check, X, 
  AlertCircle, Eye, EyeOff, RotateCcw, Zap, Book
} from 'lucide-react';

// All 114 Surahs with Juz information
const SURAH_DATA = {
  1: { juz: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', ayahs: 7 },
  2: { juz: [1,2,3], name: 'Al-Baqarah', arabicName: 'البقرة', ayahs: 286 },
  3: { juz: [3,4], name: 'Aal-E-Imran', arabicName: 'آل عمران', ayahs: 200 },
  4: { juz: [4,5,6], name: 'An-Nisa', arabicName: 'النساء', ayahs: 176 },
  5: { juz: 6, name: 'Al-Maidah', arabicName: 'المائدة', ayahs: 120 },
  6: { juz: [7,8], name: 'Al-Anam', arabicName: 'الأنعام', ayahs: 165 },
  7: { juz: [8,9], name: 'Al-Araf', arabicName: 'الأعراف', ayahs: 206 },
  8: { juz: [9,10], name: 'Al-Anfal', arabicName: 'الأنفال', ayahs: 75 },
  9: { juz: [10,11], name: 'At-Tawbah', arabicName: 'التوبة', ayahs: 129 },
  10: { juz: 11, name: 'Yunus', arabicName: 'يونس', ayahs: 109 },
  11: { juz: [11,12], name: 'Hud', arabicName: 'هود', ayahs: 123 },
  12: { juz: [12,13], name: 'Yusuf', arabicName: 'يوسف', ayahs: 111 },
  13: { juz: 13, name: "Ar-Ra'd", arabicName: 'الرعد', ayahs: 43 },
  14: { juz: 13, name: 'Ibrahim', arabicName: 'إبراهيم', ayahs: 52 },
  15: { juz: 14, name: 'Al-Hijr', arabicName: 'الحجر', ayahs: 99 },
  16: { juz: 14, name: 'An-Nahl', arabicName: 'النحل', ayahs: 128 },
  17: { juz: 15, name: 'Al-Isra', arabicName: 'الإسراء', ayahs: 111 },
  18: { juz: [15,16], name: 'Al-Kahf', arabicName: 'الكهف', ayahs: 110 },
  19: { juz: 16, name: 'Maryam', arabicName: 'مريم', ayahs: 98 },
  20: { juz: 16, name: 'Taha', arabicName: 'طه', ayahs: 135 },
  21: { juz: 17, name: 'Al-Anbiya', arabicName: 'الأنبياء', ayahs: 112 },
  22: { juz: 17, name: 'Al-Hajj', arabicName: 'الحج', ayahs: 78 },
  23: { juz: 18, name: "Al-Mu'minun", arabicName: 'المؤمنون', ayahs: 118 },
  24: { juz: 18, name: 'An-Nur', arabicName: 'النور', ayahs: 64 },
  25: { juz: [18,19], name: 'Al-Furqan', arabicName: 'الفرقان', ayahs: 77 },
  26: { juz: 19, name: 'Ash-Shuara', arabicName: 'الشعراء', ayahs: 227 },
  27: { juz: [19,20], name: 'An-Naml', arabicName: 'النمل', ayahs: 93 },
  28: { juz: 20, name: 'Al-Qasas', arabicName: 'القصص', ayahs: 88 },
  29: { juz: [20,21], name: 'Al-Ankabut', arabicName: 'العنكبوت', ayahs: 69 },
  30: { juz: 21, name: 'Ar-Rum', arabicName: 'الروم', ayahs: 60 },
  31: { juz: 21, name: 'Luqman', arabicName: 'لقمان', ayahs: 34 },
  32: { juz: 21, name: 'As-Sajdah', arabicName: 'السجدة', ayahs: 30 },
  33: { juz: [21,22], name: 'Al-Ahzab', arabicName: 'الأحزاب', ayahs: 73 },
  34: { juz: 22, name: 'Saba', arabicName: 'سبأ', ayahs: 54 },
  35: { juz: 22, name: 'Fatir', arabicName: 'فاطر', ayahs: 45 },
  36: { juz: [22,23], name: 'Ya-Sin', arabicName: 'يس', ayahs: 83 },
  37: { juz: 23, name: 'As-Saffat', arabicName: 'الصافات', ayahs: 182 },
  38: { juz: 23, name: 'Sad', arabicName: 'ص', ayahs: 88 },
  39: { juz: [23,24], name: 'Az-Zumar', arabicName: 'الزمر', ayahs: 75 },
  40: { juz: 24, name: 'Ghafir', arabicName: 'غافر', ayahs: 85 },
  41: { juz: [24,25], name: 'Fussilat', arabicName: 'فصلت', ayahs: 54 },
  42: { juz: 25, name: 'Ash-Shura', arabicName: 'الشورى', ayahs: 53 },
  43: { juz: 25, name: 'Az-Zukhruf', arabicName: 'الزخرف', ayahs: 89 },
  44: { juz: 25, name: 'Ad-Dukhan', arabicName: 'الدخان', ayahs: 59 },
  45: { juz: 25, name: 'Al-Jathiyah', arabicName: 'الجاثية', ayahs: 37 },
  46: { juz: 26, name: 'Al-Ahqaf', arabicName: 'الأحقاف', ayahs: 35 },
  47: { juz: 26, name: 'Muhammad', arabicName: 'محمد', ayahs: 38 },
  48: { juz: 26, name: 'Al-Fath', arabicName: 'الفتح', ayahs: 29 },
  49: { juz: 26, name: 'Al-Hujurat', arabicName: 'الحجرات', ayahs: 18 },
  50: { juz: 26, name: 'Qaf', arabicName: 'ق', ayahs: 45 },
  51: { juz: [26,27], name: 'Adh-Dhariyat', arabicName: 'الذاريات', ayahs: 60 },
  52: { juz: 27, name: 'At-Tur', arabicName: 'الطور', ayahs: 49 },
  53: { juz: 27, name: 'An-Najm', arabicName: 'النجم', ayahs: 62 },
  54: { juz: 27, name: 'Al-Qamar', arabicName: 'القمر', ayahs: 55 },
  55: { juz: 27, name: 'Ar-Rahman', arabicName: 'الرحمن', ayahs: 78 },
  56: { juz: 27, name: 'Al-Waqia', arabicName: 'الواقعة', ayahs: 96 },
  57: { juz: 27, name: 'Al-Hadid', arabicName: 'الحديد', ayahs: 29 },
  58: { juz: 28, name: 'Al-Mujadila', arabicName: 'المجادلة', ayahs: 22 },
  59: { juz: 28, name: 'Al-Hashr', arabicName: 'الحشر', ayahs: 24 },
  60: { juz: 28, name: 'Al-Mumtahina', arabicName: 'الممتحنة', ayahs: 13 },
  61: { juz: 28, name: 'As-Saff', arabicName: 'الصف', ayahs: 14 },
  62: { juz: 28, name: 'Al-Jumuah', arabicName: 'الجمعة', ayahs: 11 },
  63: { juz: 28, name: 'Al-Munafiqun', arabicName: 'المنافقون', ayahs: 11 },
  64: { juz: 28, name: 'At-Taghabun', arabicName: 'التغابن', ayahs: 18 },
  65: { juz: 28, name: 'At-Talaq', arabicName: 'الطلاق', ayahs: 12 },
  66: { juz: 28, name: 'At-Tahrim', arabicName: 'التحريم', ayahs: 12 },
  67: { juz: 29, name: 'Al-Mulk', arabicName: 'الملك', ayahs: 30 },
  68: { juz: 29, name: 'Al-Qalam', arabicName: 'القلم', ayahs: 52 },
  69: { juz: 29, name: 'Al-Haqqah', arabicName: 'الحاقة', ayahs: 52 },
  70: { juz: 29, name: 'Al-Maarij', arabicName: 'المعارج', ayahs: 44 },
  71: { juz: 29, name: 'Nuh', arabicName: 'نوح', ayahs: 28 },
  72: { juz: 29, name: 'Al-Jinn', arabicName: 'الجن', ayahs: 28 },
  73: { juz: 29, name: 'Al-Muzzammil', arabicName: 'المزمل', ayahs: 20 },
  74: { juz: 29, name: 'Al-Muddaththir', arabicName: 'المدثر', ayahs: 56 },
  75: { juz: 29, name: 'Al-Qiyamah', arabicName: 'القيامة', ayahs: 40 },
  76: { juz: 29, name: 'Al-Insan', arabicName: 'الإنسان', ayahs: 31 },
  77: { juz: 29, name: 'Al-Mursalat', arabicName: 'المرسلات', ayahs: 50 },
  78: { juz: 30, name: 'An-Naba', arabicName: 'النبأ', ayahs: 40 },
  79: { juz: 30, name: 'An-Naziat', arabicName: 'النازعات', ayahs: 46 },
  80: { juz: 30, name: 'Abasa', arabicName: 'عبس', ayahs: 42 },
  81: { juz: 30, name: 'At-Takwir', arabicName: 'التكوير', ayahs: 29 },
  82: { juz: 30, name: 'Al-Infitar', arabicName: 'الانفطار', ayahs: 19 },
  83: { juz: 30, name: 'Al-Mutaffifin', arabicName: 'المطففين', ayahs: 36 },
  84: { juz: 30, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', ayahs: 25 },
  85: { juz: 30, name: 'Al-Buruj', arabicName: 'البروج', ayahs: 22 },
  86: { juz: 30, name: 'At-Tariq', arabicName: 'الطارق', ayahs: 17 },
  87: { juz: 30, name: 'Al-Ala', arabicName: 'الأعلى', ayahs: 19 },
  88: { juz: 30, name: 'Al-Ghashiyah', arabicName: 'الغاشية', ayahs: 26 },
  89: { juz: 30, name: 'Al-Fajr', arabicName: 'الفجر', ayahs: 30 },
  90: { juz: 30, name: 'Al-Balad', arabicName: 'البلد', ayahs: 20 },
  91: { juz: 30, name: 'Ash-Shams', arabicName: 'الشمس', ayahs: 15 },
  92: { juz: 30, name: 'Al-Layl', arabicName: 'الليل', ayahs: 21 },
  93: { juz: 30, name: 'Ad-Duha', arabicName: 'الضحى', ayahs: 11 },
  94: { juz: 30, name: 'Ash-Sharh', arabicName: 'الشرح', ayahs: 8 },
  95: { juz: 30, name: 'At-Tin', arabicName: 'التين', ayahs: 8 },
  96: { juz: 30, name: 'Al-Alaq', arabicName: 'العلق', ayahs: 19 },
  97: { juz: 30, name: 'Al-Qadr', arabicName: 'القدر', ayahs: 5 },
  98: { juz: 30, name: 'Al-Bayyinah', arabicName: 'البينة', ayahs: 8 },
  99: { juz: 30, name: 'Az-Zalzalah', arabicName: 'الزلزلة', ayahs: 8 },
  100: { juz: 30, name: 'Al-Adiyat', arabicName: 'العاديات', ayahs: 11 },
  101: { juz: 30, name: 'Al-Qariah', arabicName: 'القارعة', ayahs: 11 },
  102: { juz: 30, name: 'At-Takathur', arabicName: 'التكاثر', ayahs: 8 },
  103: { juz: 30, name: 'Al-Asr', arabicName: 'العصر', ayahs: 3 },
  104: { juz: 30, name: 'Al-Humazah', arabicName: 'الهمزة', ayahs: 9 },
  105: { juz: 30, name: 'Al-Fil', arabicName: 'الفيل', ayahs: 5 },
  106: { juz: 30, name: 'Quraysh', arabicName: 'قريش', ayahs: 4 },
  107: { juz: 30, name: 'Al-Maun', arabicName: 'الماعون', ayahs: 7 },
  108: { juz: 30, name: 'Al-Kawthar', arabicName: 'الكوثر', ayahs: 3 },
  109: { juz: 30, name: 'Al-Kafirun', arabicName: 'الكافرون', ayahs: 6 },
  110: { juz: 30, name: 'An-Nasr', arabicName: 'النصر', ayahs: 3 },
  111: { juz: 30, name: 'Al-Masad', arabicName: 'المسد', ayahs: 5 },
  112: { juz: 30, name: 'Al-Ikhlas', arabicName: 'الإخلاص', ayahs: 4 },
  113: { juz: 30, name: 'Al-Falaq', arabicName: 'الفلق', ayahs: 5 },
  114: { juz: 30, name: 'An-Nas', arabicName: 'الناس', ayahs: 6 },
};

// Number of ayahs per page (~15 ayahs = 1 page)
const AYAHS_PER_PAGE = 15;

function QuranQuiz() {
  const { user } = useAuth();
  
  const [mode, setMode] = useState('setup'); // setup, quiz, reciting, results
  const [quizConfig, setQuizConfig] = useState({
    numRounds: 5,
    recitationLength: 1, // 1 or 1.5 pages
  });
  
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [quizHistory, setQuizHistory] = useState([]);
  const [continuationAyahs, setContinuationAyahs] = useState([]);
  const [loadingContinuation, setLoadingContinuation] = useState(false);

  useEffect(() => {
    if (user) {
      loadQuizHistory();
    }
  }, [user]);

  const loadQuizHistory = async () => {
    try {
      const docRef = doc(db, 'users', user.uid, 'quran', 'quiz');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setQuizHistory(docSnap.data().history || []);
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
    }
  };

  const saveQuizResult = async (result) => {
    try {
      const docRef = doc(db, 'users', user.uid, 'quran', 'quiz');
      const newHistory = [...quizHistory, result].slice(-50);
      await setDoc(docRef, { history: newHistory, updatedAt: new Date().toISOString() });
      setQuizHistory(newHistory);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  // Generate random starting points from ALL 30 Juz
  const generateQuestions = async () => {
    setLoading(true);
    const generatedQuestions = [];
    const usedPositions = new Set();
    
    for (let i = 0; i < quizConfig.numRounds; i++) {
      // Pick a random Juz (1-30)
      const targetJuz = Math.floor(Math.random() * 30) + 1;
      
      // Find surahs in this Juz
      const surahsInJuz = Object.entries(SURAH_DATA).filter(([_, info]) => {
        const juz = info.juz;
        if (Array.isArray(juz)) return juz.includes(targetJuz);
        return juz === targetJuz;
      });
      
      if (surahsInJuz.length === 0) continue;
      
      // Pick random surah from this Juz
      const [surahNum, surahInfo] = surahsInJuz[Math.floor(Math.random() * surahsInJuz.length)];
      const surah = parseInt(surahNum);
      
      // Pick random ayah (not too close to the end to allow continuation)
      const maxStartAyah = Math.max(1, surahInfo.ayahs - 20);
      let ayahNum;
      let positionKey;
      let attempts = 0;
      
      do {
        ayahNum = Math.floor(Math.random() * maxStartAyah) + 1;
        positionKey = `${surah}:${ayahNum}`;
        attempts++;
      } while (usedPositions.has(positionKey) && attempts < 20);
      
      usedPositions.add(positionKey);
      
      // Fetch the starting ayah
      try {
        const response = await fetch(
          `https://api.alquran.cloud/v1/ayah/${surah}:${ayahNum}/ar.alafasy`
        );
        const data = await response.json();
        
        if (data.code === 200) {
          generatedQuestions.push({
            id: i,
            surah,
            surahName: surahInfo.name,
            surahArabic: surahInfo.arabicName,
            juz: targetJuz,
            ayahNum,
            totalAyahs: surahInfo.ayahs,
            startingAyah: data.data.text,
          });
        }
      } catch (error) {
        console.error('Error fetching ayah:', error);
      }
    }
    
    // Shuffle questions
    generatedQuestions.sort(() => Math.random() - 0.5);
    
    setQuestions(generatedQuestions);
    setCurrentQuestion(0);
    setScore({ correct: 0, total: generatedQuestions.length });
    setMode('quiz');
    setLoading(false);
  };

  // Fetch continuation ayahs (what comes AFTER the starting ayah)
  const fetchContinuation = async (question) => {
    setLoadingContinuation(true);
    const numAyahs = Math.round(AYAHS_PER_PAGE * quizConfig.recitationLength);
    const ayahs = [];
    
    for (let i = 1; i <= numAyahs; i++) {
      const nextAyah = question.ayahNum + i;
      if (nextAyah > question.totalAyahs) break;
      
      try {
        const response = await fetch(
          `https://api.alquran.cloud/v1/ayah/${question.surah}:${nextAyah}/ar.alafasy`
        );
        const data = await response.json();
        
        if (data.code === 200) {
          ayahs.push({
            num: nextAyah,
            text: data.data.text,
          });
        }
      } catch (error) {
        console.error('Error fetching ayah:', error);
      }
    }
    
    setContinuationAyahs(ayahs);
    setLoadingContinuation(false);
    setShowAnswer(true);
  };

  const handleAnswer = (isCorrect) => {
    const newScore = isCorrect ? score.correct + 1 : score.correct;
    setScore(prev => ({ ...prev, correct: newScore }));
    setShowAnswer(false);
    setContinuationAyahs([]);
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Quiz complete
      const finalResult = {
        correct: newScore,
        total: questions.length,
        percentage: Math.round((newScore / questions.length) * 100),
        date: new Date().toISOString(),
        recitationLength: quizConfig.recitationLength,
      };
      saveQuizResult(finalResult);
      setMode('results');
    }
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 90) return { emoji: '🏆', message: 'ما شاء الله! Excellent Hafiz!', color: 'var(--gold)' };
    if (percentage >= 70) return { emoji: '⭐', message: 'Great memorization!', color: 'var(--success)' };
    if (percentage >= 50) return { emoji: '📖', message: 'Good effort. Keep reviewing!', color: 'var(--warning)' };
    return { emoji: '💪', message: 'Practice makes perfect!', color: 'var(--error)' };
  };

  // Setup Screen
  if (mode === 'setup') {
    return (
      <div className="quiz-setup">
        <div className="setup-header">
          <Trophy size={40} className="trophy-icon" />
          <h2>مسابقة القرآن</h2>
          <h3>Musabaqah Quiz</h3>
          <p>You'll be given an ayah. Recite what comes AFTER it.</p>
        </div>

        <div className="setup-options">
          <div className="option-group">
            <label>Number of Rounds</label>
            <div className="round-selector">
              {[3, 5, 7, 10].map(num => (
                <button
                  key={num}
                  className={`round-btn ${quizConfig.numRounds === num ? 'active' : ''}`}
                  onClick={() => setQuizConfig(p => ({ ...p, numRounds: num }))}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="option-group">
            <label>Recitation Length</label>
            <div className="length-selector">
              <button
                className={`length-btn ${quizConfig.recitationLength === 1 ? 'active' : ''}`}
                onClick={() => setQuizConfig(p => ({ ...p, recitationLength: 1 }))}
              >
                <Book size={20} />
                <span className="length-label">1 Page</span>
                <span className="length-desc">~15 ayahs</span>
              </button>
              <button
                className={`length-btn ${quizConfig.recitationLength === 1.5 ? 'active' : ''}`}
                onClick={() => setQuizConfig(p => ({ ...p, recitationLength: 1.5 }))}
              >
                <Book size={20} />
                <span className="length-label">1.5 Pages</span>
                <span className="length-desc">~22 ayahs</span>
              </button>
            </div>
          </div>

          <div className="quiz-info">
            <AlertCircle size={16} />
            <div>
              <strong>How it works:</strong>
              <p>1. You see a starting ayah from anywhere in the Quran (Juz 1-30)</p>
              <p>2. Recite what comes AFTER it (not including the ayah shown)</p>
              <p>3. Click "Show Answer" to check your recitation</p>
              <p>4. Mark as correct or incorrect</p>
            </div>
          </div>
        </div>

        <button className="start-quiz-btn" onClick={generateQuestions} disabled={loading}>
          {loading ? (
            <>Preparing Questions...</>
          ) : (
            <><Play size={20} /> Start Musabaqah</>
          )}
        </button>

        {quizHistory.length > 0 && (
          <div className="quiz-history">
            <h3>Recent Scores</h3>
            <div className="history-list">
              {quizHistory.slice(-5).reverse().map((result, i) => (
                <div key={i} className="history-item">
                  <span className="history-score">{result.percentage}%</span>
                  <span className="history-detail">{result.correct}/{result.total}</span>
                  <span className="history-date">{new Date(result.date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <style>{`
          .quiz-setup { animation: fadeIn 0.3s ease-out; }
          .setup-header {
            text-align: center;
            padding: 30px 20px;
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            border-radius: 20px;
            margin-bottom: 20px;
          }
          .trophy-icon { color: var(--gold); margin-bottom: 12px; }
          .setup-header h2 { 
            font-size: 28px; 
            margin-bottom: 4px;
            font-family: 'Amiri', serif;
          }
          .setup-header h3 { font-size: 18px; margin-bottom: 8px; color: var(--gold); }
          .setup-header p { color: var(--text-secondary); font-size: 14px; }
          .setup-options {
            background: var(--bg-surface);
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .option-group {
            margin-bottom: 20px;
          }
          .option-group:last-child { margin-bottom: 0; }
          .option-group label {
            display: block;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 12px;
          }
          .round-selector {
            display: flex;
            gap: 10px;
          }
          .round-btn {
            flex: 1;
            padding: 14px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 12px;
            color: var(--text-primary);
            font-size: 18px;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .round-btn.active {
            background: var(--primary);
            border-color: var(--gold);
            color: var(--gold);
          }
          .length-selector {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .length-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 16px;
            background: var(--bg-surface-light);
            border: 2px solid transparent;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .length-btn.active {
            background: var(--primary);
            border-color: var(--gold);
          }
          .length-btn svg { color: var(--text-muted); margin-bottom: 8px; }
          .length-btn.active svg { color: var(--gold); }
          .length-label {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-primary);
          }
          .length-desc {
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 4px;
          }
          .length-btn.active .length-label { color: var(--gold); }
          .quiz-info {
            display: flex;
            gap: 12px;
            padding: 16px;
            background: rgba(212,175,55,0.1);
            border-radius: 12px;
            font-size: 12px;
            color: var(--text-secondary);
          }
          .quiz-info svg { flex-shrink: 0; color: var(--gold); margin-top: 2px; }
          .quiz-info strong { color: var(--gold); display: block; margin-bottom: 6px; }
          .quiz-info p { margin: 4px 0; line-height: 1.4; }
          .start-quiz-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            padding: 18px;
            background: var(--gold);
            border: none;
            border-radius: 14px;
            color: var(--bg-primary);
            font-size: 16px;
            font-weight: 700;
            cursor: pointer;
          }
          .start-quiz-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .quiz-history {
            margin-top: 24px;
            background: var(--bg-surface);
            padding: 16px;
            border-radius: 14px;
          }
          .quiz-history h3 {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
          }
          .history-list { display: flex; flex-direction: column; gap: 8px; }
          .history-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 10px 12px;
            background: var(--bg-surface-light);
            border-radius: 10px;
          }
          .history-score {
            font-size: 16px;
            font-weight: 700;
            color: var(--gold);
            min-width: 50px;
          }
          .history-detail { font-size: 13px; color: var(--text-muted); flex: 1; }
          .history-date { font-size: 11px; color: var(--text-muted); }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        `}</style>
      </div>
    );
  }

  // Quiz Screen
  if (mode === 'quiz' && questions.length > 0) {
    const question = questions[currentQuestion];
    
    return (
      <div className="quiz-active">
        <div className="quiz-progress">
          <span>Round {currentQuestion + 1} / {questions.length}</span>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }} />
          </div>
          <span className="score-display">{score.correct} ✓</span>
        </div>

        <div className="question-card">
          <div className="question-meta">
            <span className="juz-badge">Juz {question.juz}</span>
            <span className="surah-badge">{question.surahName}</span>
          </div>
          
          <p className="question-prompt">
            <strong>Starting Point:</strong> Recite what comes AFTER this ayah
          </p>
          
          <div className="starting-ayah arabic">
            {question.startingAyah}
          </div>
          
          <span className="ayah-ref">
            {question.surahArabic} ({question.surahName}) - Ayah {question.ayahNum}
          </span>
          
          <div className="recitation-target">
            <ChevronRight size={16} />
            Continue for ~{Math.round(AYAHS_PER_PAGE * quizConfig.recitationLength)} ayahs ({quizConfig.recitationLength} page{quizConfig.recitationLength > 1 ? 's' : ''})
          </div>
        </div>

        {/* Show Answer Button */}
        {!showAnswer && (
          <button 
            className="reveal-btn"
            onClick={() => fetchContinuation(question)}
            disabled={loadingContinuation}
          >
            {loadingContinuation ? (
              <>Loading...</>
            ) : (
              <><Eye size={18} /> Show What Comes After</>
            )}
          </button>
        )}

        {/* Answer Display */}
        {showAnswer && continuationAyahs.length > 0 && (
          <div className="answer-section">
            <h4>What comes AFTER (Ayah {question.ayahNum + 1} onwards):</h4>
            <div className="continuation-ayahs">
              {continuationAyahs.map((ayah, idx) => (
                <div key={idx} className="continuation-ayah">
                  <span className="ayah-num">{ayah.num}</span>
                  <span className="ayah-text arabic">{ayah.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Answer Buttons */}
        {showAnswer && (
          <div className="answer-buttons">
            <button className="answer-btn wrong" onClick={() => handleAnswer(false)}>
              <X size={18} />
              Made Mistakes
            </button>
            <button className="answer-btn correct" onClick={() => handleAnswer(true)}>
              <Check size={18} />
              Recited Correctly
            </button>
          </div>
        )}

        <style>{`
          .quiz-active { animation: fadeIn 0.3s ease-out; }
          .quiz-progress {
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
          .score-display {
            color: var(--success);
            font-weight: 600;
          }
          .question-card {
            background: var(--bg-surface);
            border-radius: 20px;
            padding: 24px;
            margin-bottom: 16px;
            text-align: center;
          }
          .question-meta {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 16px;
          }
          .juz-badge, .surah-badge {
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .juz-badge {
            background: var(--primary);
            color: var(--gold);
          }
          .surah-badge {
            background: var(--bg-surface-light);
            color: var(--text-secondary);
          }
          .question-prompt {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 20px;
          }
          .starting-ayah {
            font-size: 26px;
            line-height: 2.2;
            margin-bottom: 16px;
            padding: 20px;
            background: var(--bg-surface-light);
            border-radius: 16px;
            border-left: 4px solid var(--gold);
          }
          .ayah-ref {
            font-size: 12px;
            color: var(--text-muted);
            display: block;
            margin-bottom: 12px;
          }
          .recitation-target {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 10px;
            background: rgba(212,175,55,0.1);
            border-radius: 10px;
            font-size: 12px;
            color: var(--gold);
          }
          .reveal-btn {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            background: var(--primary);
            border: 2px solid var(--gold);
            border-radius: 14px;
            color: var(--gold);
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 16px;
          }
          .reveal-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          .answer-section {
            background: rgba(46,204,113,0.1);
            border: 1px solid rgba(46,204,113,0.3);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 16px;
          }
          .answer-section h4 {
            font-size: 13px;
            color: var(--success);
            margin-bottom: 16px;
            text-align: center;
          }
          .continuation-ayahs {
            max-height: 400px;
            overflow-y: auto;
          }
          .continuation-ayah {
            display: flex;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            background: var(--bg-surface);
            border-radius: 10px;
          }
          .ayah-num {
            flex-shrink: 0;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary);
            color: var(--gold);
            border-radius: 50%;
            font-size: 11px;
            font-weight: 600;
          }
          .ayah-text {
            font-size: 20px;
            line-height: 2;
            text-align: right;
            flex: 1;
          }
          .answer-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .answer-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            border: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .answer-btn.wrong {
            background: rgba(231,76,60,0.2);
            color: var(--error);
          }
          .answer-btn.correct {
            background: var(--gold);
            color: var(--bg-primary);
          }
          .arabic {
            direction: rtl;
            font-family: 'Amiri', 'Traditional Arabic', serif;
          }
        `}</style>
      </div>
    );
  }

  // Results Screen
  if (mode === 'results') {
    const percentage = Math.round((score.correct / score.total) * 100);
    const { emoji, message, color } = getScoreMessage(percentage);
    
    return (
      <div className="quiz-results">
        <div className="results-header" style={{ background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)` }}>
          <span className="result-emoji">{emoji}</span>
          <h2>{percentage}%</h2>
          <p className="result-message">{message}</p>
          <div className="score-breakdown">
            <span>{score.correct} correct</span>
            <span>•</span>
            <span>{score.total - score.correct} incorrect</span>
            <span>•</span>
            <span>{score.total} total</span>
          </div>
        </div>

        <div className="performance-tips">
          <h3>Tips for Improvement</h3>
          {percentage < 50 && (
            <p>Focus on reviewing your memorized sections more frequently. Use the Review tab to strengthen weak areas.</p>
          )}
          {percentage >= 50 && percentage < 70 && (
            <p>Good progress! Try connecting ayahs across page boundaries to improve flow.</p>
          )}
          {percentage >= 70 && percentage < 90 && (
            <p>Great work! Challenge yourself with longer recitation lengths.</p>
          )}
          {percentage >= 90 && (
            <p>Excellent mastery! Keep up your daily review to maintain this level.</p>
          )}
        </div>

        <div className="results-actions">
          <button className="btn btn-secondary" onClick={() => setMode('setup')}>
            <RotateCcw size={18} /> New Quiz
          </button>
          <button className="btn btn-primary" onClick={generateQuestions}>
            <Zap size={18} /> Try Again
          </button>
        </div>

        <style>{`
          .quiz-results { animation: fadeIn 0.3s ease-out; }
          .results-header {
            text-align: center;
            padding: 40px 20px;
            border-radius: 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255,255,255,0.1);
          }
          .result-emoji { font-size: 60px; display: block; margin-bottom: 16px; }
          .results-header h2 {
            font-size: 56px;
            font-weight: 700;
            font-family: 'Space Grotesk', sans-serif;
            margin-bottom: 8px;
          }
          .result-message {
            font-size: 18px;
            color: var(--text-secondary);
            margin-bottom: 16px;
          }
          .score-breakdown {
            display: flex;
            justify-content: center;
            gap: 12px;
            font-size: 13px;
            color: var(--text-muted);
          }
          .performance-tips {
            background: var(--bg-surface);
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .performance-tips h3 {
            font-size: 14px;
            color: var(--gold);
            margin-bottom: 10px;
          }
          .performance-tips p {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.6;
          }
          .results-actions {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }
          .btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            border: none;
            border-radius: 14px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
          }
          .btn-primary {
            background: var(--gold);
            color: var(--bg-primary);
          }
          .btn-secondary {
            background: var(--bg-surface);
            color: var(--text-primary);
          }
        `}</style>
      </div>
    );
  }

  return null;
}

export default QuranQuiz;
