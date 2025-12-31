import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Search, BookOpen, AlertCircle, Wifi, WifiOff } from 'lucide-react';

// All 114 Surahs
const SURAHS = [
  { number: 1, name: "Al-Fatihah", arabicName: "الفاتحة", ayahs: 7, type: "Meccan" },
  { number: 2, name: "Al-Baqarah", arabicName: "البقرة", ayahs: 286, type: "Medinan" },
  { number: 3, name: "Aal-E-Imran", arabicName: "آل عمران", ayahs: 200, type: "Medinan" },
  { number: 4, name: "An-Nisa", arabicName: "النساء", ayahs: 176, type: "Medinan" },
  { number: 5, name: "Al-Ma'idah", arabicName: "المائدة", ayahs: 120, type: "Medinan" },
  { number: 6, name: "Al-An'am", arabicName: "الأنعام", ayahs: 165, type: "Meccan" },
  { number: 7, name: "Al-A'raf", arabicName: "الأعراف", ayahs: 206, type: "Meccan" },
  { number: 8, name: "Al-Anfal", arabicName: "الأنفال", ayahs: 75, type: "Medinan" },
  { number: 9, name: "At-Tawbah", arabicName: "التوبة", ayahs: 129, type: "Medinan" },
  { number: 10, name: "Yunus", arabicName: "يونس", ayahs: 109, type: "Meccan" },
  { number: 11, name: "Hud", arabicName: "هود", ayahs: 123, type: "Meccan" },
  { number: 12, name: "Yusuf", arabicName: "يوسف", ayahs: 111, type: "Meccan" },
  { number: 13, name: "Ar-Ra'd", arabicName: "الرعد", ayahs: 43, type: "Medinan" },
  { number: 14, name: "Ibrahim", arabicName: "إبراهيم", ayahs: 52, type: "Meccan" },
  { number: 15, name: "Al-Hijr", arabicName: "الحجر", ayahs: 99, type: "Meccan" },
  { number: 16, name: "An-Nahl", arabicName: "النحل", ayahs: 128, type: "Meccan" },
  { number: 17, name: "Al-Isra", arabicName: "الإسراء", ayahs: 111, type: "Meccan" },
  { number: 18, name: "Al-Kahf", arabicName: "الكهف", ayahs: 110, type: "Meccan" },
  { number: 19, name: "Maryam", arabicName: "مريم", ayahs: 98, type: "Meccan" },
  { number: 20, name: "Ta-Ha", arabicName: "طه", ayahs: 135, type: "Meccan" },
  { number: 21, name: "Al-Anbiya", arabicName: "الأنبياء", ayahs: 112, type: "Meccan" },
  { number: 22, name: "Al-Hajj", arabicName: "الحج", ayahs: 78, type: "Medinan" },
  { number: 23, name: "Al-Mu'minun", arabicName: "المؤمنون", ayahs: 118, type: "Meccan" },
  { number: 24, name: "An-Nur", arabicName: "النور", ayahs: 64, type: "Medinan" },
  { number: 25, name: "Al-Furqan", arabicName: "الفرقان", ayahs: 77, type: "Meccan" },
  { number: 26, name: "Ash-Shu'ara", arabicName: "الشعراء", ayahs: 227, type: "Meccan" },
  { number: 27, name: "An-Naml", arabicName: "النمل", ayahs: 93, type: "Meccan" },
  { number: 28, name: "Al-Qasas", arabicName: "القصص", ayahs: 88, type: "Meccan" },
  { number: 29, name: "Al-Ankabut", arabicName: "العنكبوت", ayahs: 69, type: "Meccan" },
  { number: 30, name: "Ar-Rum", arabicName: "الروم", ayahs: 60, type: "Meccan" },
  { number: 31, name: "Luqman", arabicName: "لقمان", ayahs: 34, type: "Meccan" },
  { number: 32, name: "As-Sajdah", arabicName: "السجدة", ayahs: 30, type: "Meccan" },
  { number: 33, name: "Al-Ahzab", arabicName: "الأحزاب", ayahs: 73, type: "Medinan" },
  { number: 34, name: "Saba", arabicName: "سبأ", ayahs: 54, type: "Meccan" },
  { number: 35, name: "Fatir", arabicName: "فاطر", ayahs: 45, type: "Meccan" },
  { number: 36, name: "Ya-Sin", arabicName: "يس", ayahs: 83, type: "Meccan" },
  { number: 37, name: "As-Saffat", arabicName: "الصافات", ayahs: 182, type: "Meccan" },
  { number: 38, name: "Sad", arabicName: "ص", ayahs: 88, type: "Meccan" },
  { number: 39, name: "Az-Zumar", arabicName: "الزمر", ayahs: 75, type: "Meccan" },
  { number: 40, name: "Ghafir", arabicName: "غافر", ayahs: 85, type: "Meccan" },
  { number: 41, name: "Fussilat", arabicName: "فصلت", ayahs: 54, type: "Meccan" },
  { number: 42, name: "Ash-Shura", arabicName: "الشورى", ayahs: 53, type: "Meccan" },
  { number: 43, name: "Az-Zukhruf", arabicName: "الزخرف", ayahs: 89, type: "Meccan" },
  { number: 44, name: "Ad-Dukhan", arabicName: "الدخان", ayahs: 59, type: "Meccan" },
  { number: 45, name: "Al-Jathiyah", arabicName: "الجاثية", ayahs: 37, type: "Meccan" },
  { number: 46, name: "Al-Ahqaf", arabicName: "الأحقاف", ayahs: 35, type: "Meccan" },
  { number: 47, name: "Muhammad", arabicName: "محمد", ayahs: 38, type: "Medinan" },
  { number: 48, name: "Al-Fath", arabicName: "الفتح", ayahs: 29, type: "Medinan" },
  { number: 49, name: "Al-Hujurat", arabicName: "الحجرات", ayahs: 18, type: "Medinan" },
  { number: 50, name: "Qaf", arabicName: "ق", ayahs: 45, type: "Meccan" },
  { number: 51, name: "Adh-Dhariyat", arabicName: "الذاريات", ayahs: 60, type: "Meccan" },
  { number: 52, name: "At-Tur", arabicName: "الطور", ayahs: 49, type: "Meccan" },
  { number: 53, name: "An-Najm", arabicName: "النجم", ayahs: 62, type: "Meccan" },
  { number: 54, name: "Al-Qamar", arabicName: "القمر", ayahs: 55, type: "Meccan" },
  { number: 55, name: "Ar-Rahman", arabicName: "الرحمن", ayahs: 78, type: "Medinan" },
  { number: 56, name: "Al-Waqi'ah", arabicName: "الواقعة", ayahs: 96, type: "Meccan" },
  { number: 57, name: "Al-Hadid", arabicName: "الحديد", ayahs: 29, type: "Medinan" },
  { number: 58, name: "Al-Mujadila", arabicName: "المجادلة", ayahs: 22, type: "Medinan" },
  { number: 59, name: "Al-Hashr", arabicName: "الحشر", ayahs: 24, type: "Medinan" },
  { number: 60, name: "Al-Mumtahanah", arabicName: "الممتحنة", ayahs: 13, type: "Medinan" },
  { number: 61, name: "As-Saf", arabicName: "الصف", ayahs: 14, type: "Medinan" },
  { number: 62, name: "Al-Jumu'ah", arabicName: "الجمعة", ayahs: 11, type: "Medinan" },
  { number: 63, name: "Al-Munafiqun", arabicName: "المنافقون", ayahs: 11, type: "Medinan" },
  { number: 64, name: "At-Taghabun", arabicName: "التغابن", ayahs: 18, type: "Medinan" },
  { number: 65, name: "At-Talaq", arabicName: "الطلاق", ayahs: 12, type: "Medinan" },
  { number: 66, name: "At-Tahrim", arabicName: "التحريم", ayahs: 12, type: "Medinan" },
  { number: 67, name: "Al-Mulk", arabicName: "الملك", ayahs: 30, type: "Meccan" },
  { number: 68, name: "Al-Qalam", arabicName: "القلم", ayahs: 52, type: "Meccan" },
  { number: 69, name: "Al-Haqqah", arabicName: "الحاقة", ayahs: 52, type: "Meccan" },
  { number: 70, name: "Al-Ma'arij", arabicName: "المعارج", ayahs: 44, type: "Meccan" },
  { number: 71, name: "Nuh", arabicName: "نوح", ayahs: 28, type: "Meccan" },
  { number: 72, name: "Al-Jinn", arabicName: "الجن", ayahs: 28, type: "Meccan" },
  { number: 73, name: "Al-Muzzammil", arabicName: "المزمل", ayahs: 20, type: "Meccan" },
  { number: 74, name: "Al-Muddaththir", arabicName: "المدثر", ayahs: 56, type: "Meccan" },
  { number: 75, name: "Al-Qiyamah", arabicName: "القيامة", ayahs: 40, type: "Meccan" },
  { number: 76, name: "Al-Insan", arabicName: "الإنسان", ayahs: 31, type: "Medinan" },
  { number: 77, name: "Al-Mursalat", arabicName: "المرسلات", ayahs: 50, type: "Meccan" },
  { number: 78, name: "An-Naba", arabicName: "النبأ", ayahs: 40, type: "Meccan" },
  { number: 79, name: "An-Nazi'at", arabicName: "النازعات", ayahs: 46, type: "Meccan" },
  { number: 80, name: "Abasa", arabicName: "عبس", ayahs: 42, type: "Meccan" },
  { number: 81, name: "At-Takwir", arabicName: "التكوير", ayahs: 29, type: "Meccan" },
  { number: 82, name: "Al-Infitar", arabicName: "الانفطار", ayahs: 19, type: "Meccan" },
  { number: 83, name: "Al-Mutaffifin", arabicName: "المطففين", ayahs: 36, type: "Meccan" },
  { number: 84, name: "Al-Inshiqaq", arabicName: "الانشقاق", ayahs: 25, type: "Meccan" },
  { number: 85, name: "Al-Buruj", arabicName: "البروج", ayahs: 22, type: "Meccan" },
  { number: 86, name: "At-Tariq", arabicName: "الطارق", ayahs: 17, type: "Meccan" },
  { number: 87, name: "Al-A'la", arabicName: "الأعلى", ayahs: 19, type: "Meccan" },
  { number: 88, name: "Al-Ghashiyah", arabicName: "الغاشية", ayahs: 26, type: "Meccan" },
  { number: 89, name: "Al-Fajr", arabicName: "الفجر", ayahs: 30, type: "Meccan" },
  { number: 90, name: "Al-Balad", arabicName: "البلد", ayahs: 20, type: "Meccan" },
  { number: 91, name: "Ash-Shams", arabicName: "الشمس", ayahs: 15, type: "Meccan" },
  { number: 92, name: "Al-Layl", arabicName: "الليل", ayahs: 21, type: "Meccan" },
  { number: 93, name: "Ad-Duha", arabicName: "الضحى", ayahs: 11, type: "Meccan" },
  { number: 94, name: "Ash-Sharh", arabicName: "الشرح", ayahs: 8, type: "Meccan" },
  { number: 95, name: "At-Tin", arabicName: "التين", ayahs: 8, type: "Meccan" },
  { number: 96, name: "Al-Alaq", arabicName: "العلق", ayahs: 19, type: "Meccan" },
  { number: 97, name: "Al-Qadr", arabicName: "القدر", ayahs: 5, type: "Meccan" },
  { number: 98, name: "Al-Bayyinah", arabicName: "البينة", ayahs: 8, type: "Medinan" },
  { number: 99, name: "Az-Zalzalah", arabicName: "الزلزلة", ayahs: 8, type: "Medinan" },
  { number: 100, name: "Al-Adiyat", arabicName: "العاديات", ayahs: 11, type: "Meccan" },
  { number: 101, name: "Al-Qari'ah", arabicName: "القارعة", ayahs: 11, type: "Meccan" },
  { number: 102, name: "At-Takathur", arabicName: "التكاثر", ayahs: 8, type: "Meccan" },
  { number: 103, name: "Al-Asr", arabicName: "العصر", ayahs: 3, type: "Meccan" },
  { number: 104, name: "Al-Humazah", arabicName: "الهمزة", ayahs: 9, type: "Meccan" },
  { number: 105, name: "Al-Fil", arabicName: "الفيل", ayahs: 5, type: "Meccan" },
  { number: 106, name: "Quraysh", arabicName: "قريش", ayahs: 4, type: "Meccan" },
  { number: 107, name: "Al-Ma'un", arabicName: "الماعون", ayahs: 7, type: "Meccan" },
  { number: 108, name: "Al-Kawthar", arabicName: "الكوثر", ayahs: 3, type: "Meccan" },
  { number: 109, name: "Al-Kafirun", arabicName: "الكافرون", ayahs: 6, type: "Meccan" },
  { number: 110, name: "An-Nasr", arabicName: "النصر", ayahs: 3, type: "Medinan" },
  { number: 111, name: "Al-Masad", arabicName: "المسد", ayahs: 5, type: "Meccan" },
  { number: 112, name: "Al-Ikhlas", arabicName: "الإخلاص", ayahs: 4, type: "Meccan" },
  { number: 113, name: "Al-Falaq", arabicName: "الفلق", ayahs: 5, type: "Meccan" },
  { number: 114, name: "An-Nas", arabicName: "الناس", ayahs: 6, type: "Meccan" },
];

export { SURAHS };

// Direct API call to AlQuran.cloud (no backend needed)
const fetchSurah = async (surahNumber) => {
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

const fetchTranslation = async (surahNumber) => {
  const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`);
  if (!response.ok) throw new Error('Failed to fetch');
  return response.json();
};

function QuranReader() {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahData, setSurahData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTranslation, setShowTranslation] = useState(true);

  const filteredSurahs = SURAHS.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.arabicName.includes(searchQuery) ||
    s.number.toString() === searchQuery
  );

  const loadSurah = async (surahNumber) => {
    setLoading(true);
    setError(null);
    setSelectedSurah(surahNumber);
    
    try {
      const [arabicRes, translationRes] = await Promise.all([
        fetchSurah(surahNumber),
        fetchTranslation(surahNumber)
      ]);
      
      setSurahData({
        arabic: arabicRes.data,
        translation: translationRes.data
      });
    } catch (err) {
      console.error('Error loading surah:', err);
      setError('Failed to load surah. Please check your internet connection.');
    }
    
    setLoading(false);
  };

  const closeSurah = () => {
    setSelectedSurah(null);
    setSurahData(null);
    setError(null);
  };

  const currentSurahInfo = selectedSurah ? SURAHS.find(s => s.number === selectedSurah) : null;

  // Loading State
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading Surah...</p>
        <style>{`
          .loading-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            color: var(--text-muted);
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
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error State
  if (error && selectedSurah) {
    return (
      <div className="error-screen">
        <WifiOff size={48} />
        <h3>Connection Error</h3>
        <p>{error}</p>
        <div className="error-actions">
          <button className="btn btn-primary" onClick={() => loadSurah(selectedSurah)}>
            Try Again
          </button>
          <button className="btn btn-secondary" onClick={closeSurah}>
            Back to List
          </button>
        </div>
        <style>{`
          .error-screen {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 60px 20px;
            text-align: center;
          }
          .error-screen svg {
            color: var(--error);
            margin-bottom: 16px;
          }
          .error-screen h3 {
            margin-bottom: 8px;
          }
          .error-screen p {
            color: var(--text-muted);
            margin-bottom: 20px;
          }
          .error-actions {
            display: flex;
            gap: 12px;
          }
        `}</style>
      </div>
    );
  }

  // Surah Reader View
  if (selectedSurah && surahData) {
    return (
      <div className="surah-reader">
        <button className="back-btn" onClick={closeSurah}>
          <ChevronLeft size={18} /> Back to Surahs
        </button>

        <div className="surah-header">
          <div className="surah-badge">{selectedSurah}</div>
          <div className="surah-title">
            <h2 className="arabic">{surahData.arabic.name}</h2>
            <p>{surahData.arabic.englishName} • {surahData.arabic.englishNameTranslation}</p>
            <span className="surah-meta">{currentSurahInfo?.ayahs} Ayahs • {currentSurahInfo?.type}</span>
          </div>
        </div>

        <div className="reader-options">
          <button 
            className={`option-btn ${showTranslation ? 'active' : ''}`}
            onClick={() => setShowTranslation(!showTranslation)}
          >
            {showTranslation ? 'Hide' : 'Show'} Translation
          </button>
        </div>

        {/* Bismillah */}
        {selectedSurah !== 1 && selectedSurah !== 9 && (
          <div className="bismillah">
            <p className="arabic">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</p>
          </div>
        )}

        <div className="ayahs-container">
          {surahData.arabic.ayahs.map((ayah, index) => (
            <div key={ayah.number} className="ayah-block">
              <div className="ayah-header">
                <span className="ayah-number">{ayah.numberInSurah}</span>
              </div>
              <p className="arabic ayah-text">{ayah.text}</p>
              {showTranslation && (
                <p className="translation-text">
                  {surahData.translation.ayahs[index]?.text}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="surah-nav">
          {selectedSurah > 1 && (
            <button onClick={() => loadSurah(selectedSurah - 1)}>
              <ChevronLeft size={16} /> Previous Surah
            </button>
          )}
          {selectedSurah < 114 && (
            <button onClick={() => loadSurah(selectedSurah + 1)}>
              Next Surah <ChevronRight size={16} />
            </button>
          )}
        </div>

        <style>{`
          .surah-reader {
            animation: fadeIn 0.3s ease-out;
          }
          .back-btn {
            display: flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            color: var(--gold);
            font-size: 14px;
            cursor: pointer;
            padding: 8px 0;
            margin-bottom: 16px;
          }
          .surah-header {
            display: flex;
            align-items: center;
            gap: 16px;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            padding: 20px;
            border-radius: 16px;
            margin-bottom: 16px;
          }
          .surah-badge {
            width: 50px;
            height: 50px;
            background: rgba(212,175,55,0.2);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: var(--gold);
          }
          .surah-title h2 {
            font-size: 28px;
            color: var(--gold);
            margin-bottom: 4px;
          }
          .surah-title p {
            font-size: 14px;
            color: var(--text-secondary);
          }
          .surah-meta {
            font-size: 12px;
            color: var(--text-muted);
          }
          .reader-options {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
          }
          .option-btn {
            padding: 8px 16px;
            background: var(--bg-surface);
            border: none;
            border-radius: 8px;
            color: var(--text-secondary);
            font-size: 12px;
            cursor: pointer;
          }
          .option-btn.active {
            background: var(--primary);
            color: var(--gold);
          }
          .bismillah {
            text-align: center;
            padding: 20px;
            margin-bottom: 16px;
          }
          .bismillah .arabic {
            font-size: 28px;
            color: var(--gold);
          }
          .ayahs-container {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .ayah-block {
            background: var(--bg-surface);
            padding: 20px;
            border-radius: 12px;
          }
          .ayah-header {
            margin-bottom: 12px;
          }
          .ayah-number {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 28px;
            height: 28px;
            background: var(--primary);
            border-radius: 50%;
            font-size: 11px;
            font-weight: 600;
          }
          .ayah-text {
            font-size: 26px;
            line-height: 2.2;
            color: var(--text-primary);
            margin-bottom: 12px;
          }
          .translation-text {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.7;
            padding-top: 12px;
            border-top: 1px solid var(--bg-surface-light);
          }
          .surah-nav {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;
            gap: 12px;
          }
          .surah-nav button {
            display: flex;
            align-items: center;
            gap: 4px;
            padding: 12px 20px;
            background: var(--bg-surface);
            border: none;
            border-radius: 10px;
            color: var(--text-secondary);
            font-size: 13px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .surah-nav button:hover {
            background: var(--primary);
            color: var(--gold);
          }
        `}</style>
      </div>
    );
  }

  // Surah List View
  return (
    <div className="quran-browser">
      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search surah by name or number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Surah List */}
      <div className="surah-list">
        {filteredSurahs.map((surah) => (
          <div
            key={surah.number}
            className="surah-card"
            onClick={() => loadSurah(surah.number)}
          >
            <div className="surah-number">{surah.number}</div>
            <div className="surah-info">
              <h3>{surah.name}</h3>
              <span className="arabic-name">{surah.arabicName}</span>
            </div>
            <div className="surah-meta">
              <span className="ayah-count">{surah.ayahs} ayahs</span>
              <span className={`type-badge ${surah.type.toLowerCase()}`}>{surah.type}</span>
            </div>
            <ChevronRight className="chevron" size={18} />
          </div>
        ))}
      </div>

      <style>{`
        .quran-browser {
          animation: fadeIn 0.3s ease-out;
        }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface);
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
        }
        .search-bar input:focus {
          outline: none;
        }
        .search-bar svg {
          color: var(--text-muted);
        }
        .surah-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .surah-card {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface);
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .surah-card:hover {
          background: var(--bg-surface-light);
          transform: translateX(4px);
        }
        .surah-number {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 13px;
          flex-shrink: 0;
        }
        .surah-info {
          flex: 1;
        }
        .surah-info h3 {
          font-size: 14px;
          margin-bottom: 2px;
        }
        .arabic-name {
          font-family: 'Amiri', serif;
          font-size: 14px;
          color: var(--gold);
        }
        .surah-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }
        .ayah-count {
          font-size: 11px;
          color: var(--text-muted);
        }
        .type-badge {
          font-size: 9px;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          font-weight: 600;
        }
        .type-badge.meccan {
          background: rgba(212,175,55,0.2);
          color: var(--gold);
        }
        .type-badge.medinan {
          background: rgba(46,204,113,0.2);
          color: var(--success);
        }
        .chevron {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default QuranReader;
