import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronRight, ArrowLeft, Search, Lock } from 'lucide-react';

// All 114 Surahs
export const SURAHS = [
  { number: 1, name: 'Al-Fatihah', arabicName: 'الفاتحة', ayahs: 7 },
  { number: 2, name: 'Al-Baqarah', arabicName: 'البقرة', ayahs: 286 },
  { number: 3, name: 'Aal-E-Imran', arabicName: 'آل عمران', ayahs: 200 },
  { number: 4, name: 'An-Nisa', arabicName: 'النساء', ayahs: 176 },
  { number: 5, name: 'Al-Maidah', arabicName: 'المائدة', ayahs: 120 },
  { number: 6, name: 'Al-Anam', arabicName: 'الأنعام', ayahs: 165 },
  { number: 7, name: 'Al-Araf', arabicName: 'الأعراف', ayahs: 206 },
  { number: 8, name: 'Al-Anfal', arabicName: 'الأنفال', ayahs: 75 },
  { number: 9, name: 'At-Tawbah', arabicName: 'التوبة', ayahs: 129 },
  { number: 10, name: 'Yunus', arabicName: 'يونس', ayahs: 109 },
  { number: 11, name: 'Hud', arabicName: 'هود', ayahs: 123 },
  { number: 12, name: 'Yusuf', arabicName: 'يوسف', ayahs: 111 },
  { number: 13, name: 'Ar-Ra\'d', arabicName: 'الرعد', ayahs: 43 },
  { number: 14, name: 'Ibrahim', arabicName: 'إبراهيم', ayahs: 52 },
  { number: 15, name: 'Al-Hijr', arabicName: 'الحجر', ayahs: 99 },
  { number: 16, name: 'An-Nahl', arabicName: 'النحل', ayahs: 128 },
  { number: 17, name: 'Al-Isra', arabicName: 'الإسراء', ayahs: 111 },
  { number: 18, name: 'Al-Kahf', arabicName: 'الكهف', ayahs: 110 },
  { number: 19, name: 'Maryam', arabicName: 'مريم', ayahs: 98 },
  { number: 20, name: 'Taha', arabicName: 'طه', ayahs: 135 },
  { number: 21, name: 'Al-Anbiya', arabicName: 'الأنبياء', ayahs: 112 },
  { number: 22, name: 'Al-Hajj', arabicName: 'الحج', ayahs: 78 },
  { number: 23, name: 'Al-Mu\'minun', arabicName: 'المؤمنون', ayahs: 118 },
  { number: 24, name: 'An-Nur', arabicName: 'النور', ayahs: 64 },
  { number: 25, name: 'Al-Furqan', arabicName: 'الفرقان', ayahs: 77 },
  { number: 26, name: 'Ash-Shuara', arabicName: 'الشعراء', ayahs: 227 },
  { number: 27, name: 'An-Naml', arabicName: 'النمل', ayahs: 93 },
  { number: 28, name: 'Al-Qasas', arabicName: 'القصص', ayahs: 88 },
  { number: 29, name: 'Al-Ankabut', arabicName: 'العنكبوت', ayahs: 69 },
  { number: 30, name: 'Ar-Rum', arabicName: 'الروم', ayahs: 60 },
  { number: 31, name: 'Luqman', arabicName: 'لقمان', ayahs: 34 },
  { number: 32, name: 'As-Sajdah', arabicName: 'السجدة', ayahs: 30 },
  { number: 33, name: 'Al-Ahzab', arabicName: 'الأحزاب', ayahs: 73 },
  { number: 34, name: 'Saba', arabicName: 'سبأ', ayahs: 54 },
  { number: 35, name: 'Fatir', arabicName: 'فاطر', ayahs: 45 },
  { number: 36, name: 'Ya-Sin', arabicName: 'يس', ayahs: 83 },
  { number: 37, name: 'As-Saffat', arabicName: 'الصافات', ayahs: 182 },
  { number: 38, name: 'Sad', arabicName: 'ص', ayahs: 88 },
  { number: 39, name: 'Az-Zumar', arabicName: 'الزمر', ayahs: 75 },
  { number: 40, name: 'Ghafir', arabicName: 'غافر', ayahs: 85 },
  { number: 41, name: 'Fussilat', arabicName: 'فصلت', ayahs: 54 },
  { number: 42, name: 'Ash-Shura', arabicName: 'الشورى', ayahs: 53 },
  { number: 43, name: 'Az-Zukhruf', arabicName: 'الزخرف', ayahs: 89 },
  { number: 44, name: 'Ad-Dukhan', arabicName: 'الدخان', ayahs: 59 },
  { number: 45, name: 'Al-Jathiyah', arabicName: 'الجاثية', ayahs: 37 },
  { number: 46, name: 'Al-Ahqaf', arabicName: 'الأحقاف', ayahs: 35 },
  { number: 47, name: 'Muhammad', arabicName: 'محمد', ayahs: 38 },
  { number: 48, name: 'Al-Fath', arabicName: 'الفتح', ayahs: 29 },
  { number: 49, name: 'Al-Hujurat', arabicName: 'الحجرات', ayahs: 18 },
  { number: 50, name: 'Qaf', arabicName: 'ق', ayahs: 45 },
  { number: 51, name: 'Adh-Dhariyat', arabicName: 'الذاريات', ayahs: 60 },
  { number: 52, name: 'At-Tur', arabicName: 'الطور', ayahs: 49 },
  { number: 53, name: 'An-Najm', arabicName: 'النجم', ayahs: 62 },
  { number: 54, name: 'Al-Qamar', arabicName: 'القمر', ayahs: 55 },
  { number: 55, name: 'Ar-Rahman', arabicName: 'الرحمن', ayahs: 78 },
  { number: 56, name: 'Al-Waqia', arabicName: 'الواقعة', ayahs: 96 },
  { number: 57, name: 'Al-Hadid', arabicName: 'الحديد', ayahs: 29 },
  { number: 58, name: 'Al-Mujadila', arabicName: 'المجادلة', ayahs: 22 },
  { number: 59, name: 'Al-Hashr', arabicName: 'الحشر', ayahs: 24 },
  { number: 60, name: 'Al-Mumtahina', arabicName: 'الممتحنة', ayahs: 13 },
  { number: 61, name: 'As-Saff', arabicName: 'الصف', ayahs: 14 },
  { number: 62, name: 'Al-Jumuah', arabicName: 'الجمعة', ayahs: 11 },
  { number: 63, name: 'Al-Munafiqun', arabicName: 'المنافقون', ayahs: 11 },
  { number: 64, name: 'At-Taghabun', arabicName: 'التغابن', ayahs: 18 },
  { number: 65, name: 'At-Talaq', arabicName: 'الطلاق', ayahs: 12 },
  { number: 66, name: 'At-Tahrim', arabicName: 'التحريم', ayahs: 12 },
  { number: 67, name: 'Al-Mulk', arabicName: 'الملك', ayahs: 30 },
  { number: 68, name: 'Al-Qalam', arabicName: 'القلم', ayahs: 52 },
  { number: 69, name: 'Al-Haqqah', arabicName: 'الحاقة', ayahs: 52 },
  { number: 70, name: 'Al-Maarij', arabicName: 'المعارج', ayahs: 44 },
  { number: 71, name: 'Nuh', arabicName: 'نوح', ayahs: 28 },
  { number: 72, name: 'Al-Jinn', arabicName: 'الجن', ayahs: 28 },
  { number: 73, name: 'Al-Muzzammil', arabicName: 'المزمل', ayahs: 20 },
  { number: 74, name: 'Al-Muddaththir', arabicName: 'المدثر', ayahs: 56 },
  { number: 75, name: 'Al-Qiyamah', arabicName: 'القيامة', ayahs: 40 },
  { number: 76, name: 'Al-Insan', arabicName: 'الإنسان', ayahs: 31 },
  { number: 77, name: 'Al-Mursalat', arabicName: 'المرسلات', ayahs: 50 },
  { number: 78, name: 'An-Naba', arabicName: 'النبأ', ayahs: 40 },
  { number: 79, name: 'An-Naziat', arabicName: 'النازعات', ayahs: 46 },
  { number: 80, name: 'Abasa', arabicName: 'عبس', ayahs: 42 },
  { number: 81, name: 'At-Takwir', arabicName: 'التكوير', ayahs: 29 },
  { number: 82, name: 'Al-Infitar', arabicName: 'الانفطار', ayahs: 19 },
  { number: 83, name: 'Al-Mutaffifin', arabicName: 'المطففين', ayahs: 36 },
  { number: 84, name: 'Al-Inshiqaq', arabicName: 'الانشقاق', ayahs: 25 },
  { number: 85, name: 'Al-Buruj', arabicName: 'البروج', ayahs: 22 },
  { number: 86, name: 'At-Tariq', arabicName: 'الطارق', ayahs: 17 },
  { number: 87, name: 'Al-Ala', arabicName: 'الأعلى', ayahs: 19 },
  { number: 88, name: 'Al-Ghashiyah', arabicName: 'الغاشية', ayahs: 26 },
  { number: 89, name: 'Al-Fajr', arabicName: 'الفجر', ayahs: 30 },
  { number: 90, name: 'Al-Balad', arabicName: 'البلد', ayahs: 20 },
  { number: 91, name: 'Ash-Shams', arabicName: 'الشمس', ayahs: 15 },
  { number: 92, name: 'Al-Layl', arabicName: 'الليل', ayahs: 21 },
  { number: 93, name: 'Ad-Duha', arabicName: 'الضحى', ayahs: 11 },
  { number: 94, name: 'Ash-Sharh', arabicName: 'الشرح', ayahs: 8 },
  { number: 95, name: 'At-Tin', arabicName: 'التين', ayahs: 8 },
  { number: 96, name: 'Al-Alaq', arabicName: 'العلق', ayahs: 19 },
  { number: 97, name: 'Al-Qadr', arabicName: 'القدر', ayahs: 5 },
  { number: 98, name: 'Al-Bayyinah', arabicName: 'البينة', ayahs: 8 },
  { number: 99, name: 'Az-Zalzalah', arabicName: 'الزلزلة', ayahs: 8 },
  { number: 100, name: 'Al-Adiyat', arabicName: 'العاديات', ayahs: 11 },
  { number: 101, name: 'Al-Qariah', arabicName: 'القارعة', ayahs: 11 },
  { number: 102, name: 'At-Takathur', arabicName: 'التكاثر', ayahs: 8 },
  { number: 103, name: 'Al-Asr', arabicName: 'العصر', ayahs: 3 },
  { number: 104, name: 'Al-Humazah', arabicName: 'الهمزة', ayahs: 9 },
  { number: 105, name: 'Al-Fil', arabicName: 'الفيل', ayahs: 5 },
  { number: 106, name: 'Quraysh', arabicName: 'قريش', ayahs: 4 },
  { number: 107, name: 'Al-Maun', arabicName: 'الماعون', ayahs: 7 },
  { number: 108, name: 'Al-Kawthar', arabicName: 'الكوثر', ayahs: 3 },
  { number: 109, name: 'Al-Kafirun', arabicName: 'الكافرون', ayahs: 6 },
  { number: 110, name: 'An-Nasr', arabicName: 'النصر', ayahs: 3 },
  { number: 111, name: 'Al-Masad', arabicName: 'المسد', ayahs: 5 },
  { number: 112, name: 'Al-Ikhlas', arabicName: 'الإخلاص', ayahs: 4 },
  { number: 113, name: 'Al-Falaq', arabicName: 'الفلق', ayahs: 5 },
  { number: 114, name: 'An-Nas', arabicName: 'الناس', ayahs: 6 },
];

// Free tier limit - last 5 surahs
const FREE_SURAHS = [110, 111, 112, 113, 114];

function QuranReader({ limitedMode = false }) {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahData, setSurahData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const availableSurahs = limitedMode 
    ? SURAHS.filter(s => FREE_SURAHS.includes(s.number))
    : SURAHS;

  const filteredSurahs = searchTerm
    ? availableSurahs.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.arabicName.includes(searchTerm) ||
        s.number.toString() === searchTerm
      )
    : availableSurahs;

  const fetchSurah = async (surahNumber) => {
    setLoading(true);
    try {
      const [arabicRes, englishRes] = await Promise.all([
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`),
        fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.sahih`)
      ]);
      
      const arabicData = await arabicRes.json();
      const englishData = await englishRes.json();

      setSurahData({
        arabic: arabicData.data,
        english: englishData.data
      });
    } catch (error) {
      console.error('Error fetching surah:', error);
    }
    setLoading(false);
  };

  const handleSurahClick = (surah) => {
    if (limitedMode && !FREE_SURAHS.includes(surah.number)) {
      return;
    }
    setSelectedSurah(surah);
    fetchSurah(surah.number);
  };

  // Surah Reader View
  if (selectedSurah && surahData) {
    return (
      <div className="surah-reader">
        <button className="back-btn" onClick={() => { setSelectedSurah(null); setSurahData(null); }}>
          <ArrowLeft size={18} /> Back to Surahs
        </button>

        <div className="surah-header">
          <span className="surah-number">{selectedSurah.number}</span>
          <div className="surah-names">
            <h2 className="arabic">{selectedSurah.arabicName}</h2>
            <h3>{selectedSurah.name}</h3>
          </div>
          <span className="ayah-count">{selectedSurah.ayahs} ayahs</span>
        </div>

        {/* Bismillah - except for Surah 9 */}
        {selectedSurah.number !== 9 && (
          <div className="bismillah arabic">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>
        )}

        <div className="ayahs-container">
          {surahData.arabic.ayahs.map((ayah, index) => (
            <div key={ayah.number} className="ayah-card">
              <div className="ayah-number">{ayah.numberInSurah}</div>
              <div className="ayah-content">
                <p className="arabic ayah-arabic">{ayah.text}</p>
                <p className="ayah-translation">
                  {surahData.english.ayahs[index]?.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        <style>{`
          .surah-reader { animation: fadeIn 0.3s ease-out; }
          .back-btn {
            display: flex;
            align-items: center;
            gap: 6px;
            background: none;
            border: none;
            color: var(--gold);
            font-size: 14px;
            cursor: pointer;
            margin-bottom: 20px;
            padding: 0;
          }
          .surah-header {
            display: flex;
            align-items: center;
            gap: 16px;
            background: linear-gradient(135deg, var(--primary) 0%, #1a4a3a 100%);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .surah-number {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--bg-surface);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            font-weight: 700;
            color: var(--gold);
          }
          .surah-names { flex: 1; }
          .surah-names h2 { font-size: 28px; margin-bottom: 4px; }
          .surah-names h3 { font-size: 14px; color: var(--text-secondary); font-weight: 400; }
          .ayah-count {
            font-size: 12px;
            color: var(--text-muted);
            background: var(--bg-surface);
            padding: 6px 12px;
            border-radius: 20px;
          }
          .bismillah {
            text-align: center;
            font-size: 28px;
            padding: 30px;
            background: var(--bg-surface);
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .ayahs-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }
          .ayah-card {
            display: flex;
            gap: 16px;
            background: var(--bg-surface);
            padding: 20px;
            border-radius: 14px;
          }
          .ayah-number {
            min-width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 13px;
            font-weight: 600;
            color: var(--gold);
          }
          .ayah-content { flex: 1; }
          .ayah-arabic {
            font-size: 26px;
            line-height: 2;
            margin-bottom: 14px;
          }
          .ayah-translation {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.7;
          }
        `}</style>
      </div>
    );
  }

  // Loading State
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading Surah...</p>
        <style>{`
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
        `}</style>
      </div>
    );
  }

  // Surah List View
  return (
    <div className="quran-reader">
      {/* Search */}
      <div className="search-bar">
        <Search size={18} />
        <input
          type="text"
          placeholder="Search surah by name or number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Limited mode notice */}
      {limitedMode && (
        <div className="limited-notice">
          <Lock size={14} />
          <span>Free users can read 5 surahs. <a href="/pricing">Upgrade</a> for all 114.</span>
        </div>
      )}

      {/* Surah Grid */}
      <div className="surah-grid">
        {filteredSurahs.map((surah) => {
          const isLocked = limitedMode && !FREE_SURAHS.includes(surah.number);
          
          return (
            <div 
              key={surah.number}
              className={`surah-card ${isLocked ? 'locked' : ''}`}
              onClick={() => handleSurahClick(surah)}
            >
              <span className="surah-num">{surah.number}</span>
              <div className="surah-info">
                <h4>{surah.name}</h4>
                <span className="arabic surah-arabic-name">{surah.arabicName}</span>
              </div>
              <div className="surah-meta">
                <span>{surah.ayahs} ayahs</span>
                {isLocked && <Lock size={14} className="lock-icon" />}
              </div>
              <ChevronRight size={18} className="chevron" />
            </div>
          );
        })}
      </div>

      {/* Show locked surahs if in limited mode */}
      {limitedMode && (
        <div className="locked-surahs-section">
          <h3>More Surahs (Pro)</h3>
          <div className="locked-preview">
            {SURAHS.filter(s => !FREE_SURAHS.includes(s.number)).slice(0, 3).map(surah => (
              <div key={surah.number} className="surah-card locked">
                <span className="surah-num">{surah.number}</span>
                <div className="surah-info">
                  <h4>{surah.name}</h4>
                </div>
                <Lock size={14} className="lock-icon" />
              </div>
            ))}
            <a href="/pricing" className="see-all-btn">
              + {SURAHS.length - FREE_SURAHS.length - 3} more surahs
            </a>
          </div>
        </div>
      )}

      <style>{`
        .quran-reader { animation: fadeIn 0.3s ease-out; }
        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-surface);
          padding: 14px 16px;
          border-radius: 12px;
          margin-bottom: 16px;
        }
        .search-bar svg { color: var(--text-muted); }
        .search-bar input {
          flex: 1;
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
        }
        .search-bar input::placeholder { color: var(--text-muted); }
        .limited-notice {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(212,175,55,0.1);
          border: 1px solid rgba(212,175,55,0.3);
          padding: 10px 14px;
          border-radius: 10px;
          margin-bottom: 16px;
          font-size: 12px;
          color: var(--gold);
        }
        .limited-notice a {
          color: var(--gold);
          font-weight: 600;
        }
        .surah-grid {
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
        .surah-card:hover:not(.locked) {
          background: var(--bg-surface-light);
          transform: translateX(4px);
        }
        .surah-card.locked {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .surah-num {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: var(--gold);
        }
        .surah-info { flex: 1; }
        .surah-info h4 { font-size: 14px; margin-bottom: 2px; }
        .surah-arabic-name { font-size: 14px; color: var(--text-secondary); }
        .surah-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .lock-icon { color: var(--gold); }
        .chevron { color: var(--text-muted); }
        .surah-card.locked .chevron { display: none; }
        .locked-surahs-section {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid var(--bg-surface-light);
        }
        .locked-surahs-section h3 {
          font-size: 14px;
          color: var(--text-muted);
          margin-bottom: 12px;
        }
        .locked-preview {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .see-all-btn {
          display: block;
          text-align: center;
          padding: 12px;
          background: var(--bg-surface);
          border-radius: 10px;
          color: var(--gold);
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default QuranReader;
