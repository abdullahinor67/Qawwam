import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Check, ChevronRight, ChevronDown, Award, Volume2 } from 'lucide-react';

const TAJWEED_CHAPTERS = [
  {
    id: 1,
    title: "Introduction to Tajweed",
    arabicTitle: "مقدمة في التجويد",
    description: "Learn the basics of Tajweed and its importance",
    lessons: [
      {
        id: "1-1",
        title: "What is Tajweed?",
        content: `Tajweed (تجويد) comes from the Arabic root word "j-w-d" meaning to improve or make better. In the context of Quran recitation, it means reciting the Quran correctly with proper pronunciation of each letter and applying the rules consistently.

The Prophet ﷺ said: "Beautify the Quran with your voices." (Abu Dawud)

Tajweed is not just about beautification, but about preserving the exact pronunciation as it was revealed to Prophet Muhammad ﷺ and recited by him.`,
        examples: []
      },
      {
        id: "1-2",
        title: "Why Learn Tajweed?",
        content: `Learning Tajweed is obligatory (fard) to the extent that it prevents changing the meaning of words. Allah says:

"...and recite the Quran with measured recitation (tarteel)." [73:4]

Benefits of learning Tajweed:
• Preserves the original pronunciation
• Helps understand the meaning
• Earns more rewards from Allah
• Beautifies the recitation
• Follows the Sunnah of the Prophet ﷺ`,
        examples: []
      }
    ]
  },
  {
    id: 2,
    title: "Makhaarij al-Huroof",
    arabicTitle: "مخارج الحروف",
    description: "Points of articulation - where letters originate from",
    lessons: [
      {
        id: "2-1",
        title: "Throat Letters (الحروف الحلقية)",
        content: `Six letters originate from the throat (الحلق):

• Deepest part: ء (Hamza), هـ (Haa)
• Middle: ع (Ayn), ح (Haa)  
• Top (near mouth): غ (Ghayn), خ (Khaa)

Practice saying these letters and feel where they come from in your throat.`,
        examples: [
          { arabic: "ءَامَنَ", transliteration: "aamana", meaning: "he believed" },
          { arabic: "عَلِمَ", transliteration: "'alima", meaning: "he knew" },
          { arabic: "غَفَرَ", transliteration: "ghafara", meaning: "he forgave" }
        ]
      },
      {
        id: "2-2",
        title: "Tongue Letters (الحروف اللسانية)",
        content: `18 letters originate from different parts of the tongue:

Back of tongue: ق (Qaf), ك (Kaf)
Middle: ج (Jeem), ش (Sheen), ي (Yaa)
Sides: ض (Daad)
Tip: ط (Taa), د (Daal), ت (Taa), ن (Noon), ر (Raa), ل (Laam)
Tip with teeth: ظ (Dhaa), ذ (Dhaal), ث (Thaa), ص (Saad), ز (Zay), س (Seen)`,
        examples: [
          { arabic: "قُلْ", transliteration: "qul", meaning: "say" },
          { arabic: "رَبّ", transliteration: "rabb", meaning: "Lord" },
          { arabic: "صَلَاة", transliteration: "salaat", meaning: "prayer" }
        ]
      },
      {
        id: "2-3",
        title: "Lip Letters (الحروف الشفوية)",
        content: `Four letters come from the lips:

• ب (Baa) - Both lips pressed together
• م (Meem) - Both lips pressed together
• و (Waw) - Lips rounded (when sakin or with vowel)
• ف (Faa) - Bottom lip touches upper teeth`,
        examples: [
          { arabic: "بِسْمِ", transliteration: "bismi", meaning: "in the name of" },
          { arabic: "مِنْ", transliteration: "min", meaning: "from" },
          { arabic: "فِي", transliteration: "fee", meaning: "in" }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Noon Saakinah & Tanween",
    arabicTitle: "النون الساكنة والتنوين",
    description: "Rules for نْ and tanween (ً ٍ ٌ)",
    lessons: [
      {
        id: "3-1",
        title: "Idhaar (الإظهار)",
        content: `Idhaar means "clear pronunciation" - pronounce the noon saakinah or tanween clearly without merging or hiding.

Idhaar occurs before 6 throat letters: ء هـ ع ح غ خ

Example: مِنْ عِلْمٍ - pronounce the noon clearly before ع`,
        examples: [
          { arabic: "مَنْ ءَامَنَ", transliteration: "man aamana", meaning: "whoever believed" },
          { arabic: "مِنْ عِنْدِ", transliteration: "min 'indi", meaning: "from" },
          { arabic: "سَمِيعٌ عَلِيمٌ", transliteration: "samee'un 'aleemun", meaning: "All-Hearing, All-Knowing" }
        ]
      },
      {
        id: "3-2",
        title: "Idghaam (الإدغام)",
        content: `Idghaam means "merging" - the noon saakinah or tanween merges into the following letter.

Occurs before 6 letters: ي ر م ل و ن (يَرْمَلُونَ)

Two types:
• With Ghunnah (nasal sound): ي ن م و
• Without Ghunnah: ر ل`,
        examples: [
          { arabic: "مِن يَّقُولُ", transliteration: "miy-yaqoolu", meaning: "whoever says" },
          { arabic: "مِن رَّبِّهِمْ", transliteration: "mir-rabbihim", meaning: "from their Lord" },
          { arabic: "هُدًى لِّلْمُتَّقِينَ", transliteration: "hudal-lilmuttaqeen", meaning: "guidance for the righteous" }
        ]
      },
      {
        id: "3-3",
        title: "Iqlaab (الإقلاب)",
        content: `Iqlaab means "conversion" - the noon saakinah or tanween converts to a meem (م) sound with ghunnah before the letter ب.

Only occurs before: ب

The noon changes to meem but you don't close your lips completely.`,
        examples: [
          { arabic: "مِن بَعْدِ", transliteration: "mim ba'di", meaning: "after" },
          { arabic: "أَنبِئْهُم", transliteration: "ambi'hum", meaning: "inform them" },
          { arabic: "سَمِيعٌۢ بَصِيرٌ", transliteration: "samee'um baseer", meaning: "All-Hearing, All-Seeing" }
        ]
      },
      {
        id: "3-4",
        title: "Ikhfaa (الإخفاء)",
        content: `Ikhfaa means "hiding" - the noon is hidden (not fully pronounced) with a nasal sound (ghunnah).

Occurs before 15 letters: ت ث ج د ذ ز س ش ص ض ط ظ ف ق ك

The tongue doesn't touch the articulation point of noon.`,
        examples: [
          { arabic: "مِن تَحْتِهَا", transliteration: "min tahtihaa", meaning: "beneath it" },
          { arabic: "أَنصَارًا", transliteration: "ansaaran", meaning: "helpers" },
          { arabic: "مَنصُورًا", transliteration: "mansooran", meaning: "helped/victorious" }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Meem Saakinah Rules",
    arabicTitle: "أحكام الميم الساكنة",
    description: "Rules for مْ (meem with sukoon)",
    lessons: [
      {
        id: "4-1",
        title: "Ikhfaa Shafawi (الإخفاء الشفوي)",
        content: `When meem saakinah is followed by ب (baa), the meem is hidden with ghunnah.

The lips come close together but don't fully touch.`,
        examples: [
          { arabic: "تَرْمِيهِم بِحِجَارَةٍ", transliteration: "tarmeehim bihijaaratin", meaning: "pelting them with stones" },
          { arabic: "هُم بِرَبِّهِمْ", transliteration: "hum birabbihim", meaning: "they in their Lord" }
        ]
      },
      {
        id: "4-2",
        title: "Idghaam Shafawi (الإدغام الشفوي)",
        content: `When meem saakinah is followed by another meem, they merge together with ghunnah.`,
        examples: [
          { arabic: "لَهُم مَّا", transliteration: "lahum maa", meaning: "for them what" },
          { arabic: "كُنتُم مُّؤْمِنِينَ", transliteration: "kuntum mu'mineen", meaning: "you are believers" }
        ]
      },
      {
        id: "4-3",
        title: "Idhaar Shafawi (الإظهار الشفوي)",
        content: `When meem saakinah is followed by any letter except ب or م, pronounce it clearly.

This applies to all 26 remaining letters.`,
        examples: [
          { arabic: "الْحَمْدُ", transliteration: "alhamdu", meaning: "praise" },
          { arabic: "أَمْ لَمْ", transliteration: "am lam", meaning: "or not" }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Madd (Elongation)",
    arabicTitle: "المد",
    description: "Rules for lengthening vowels",
    lessons: [
      {
        id: "5-1",
        title: "Natural Madd (المد الطبيعي)",
        content: `Natural madd is 2 counts (harakaat) and occurs with:

• Alif (ا) after fatha
• Waw (و) after dammah  
• Yaa (ي) after kasrah

This is the basic elongation found in every recitation.`,
        examples: [
          { arabic: "قَالَ", transliteration: "qaala", meaning: "he said" },
          { arabic: "يَقُولُ", transliteration: "yaqoolu", meaning: "he says" },
          { arabic: "فِي", transliteration: "fee", meaning: "in" }
        ]
      },
      {
        id: "5-2",
        title: "Connected Madd (المد المتصل)",
        content: `When a madd letter is followed by hamza in the same word, elongate 4-5 counts.

This is obligatory (waajib).`,
        examples: [
          { arabic: "جَاءَ", transliteration: "jaa'a", meaning: "he came" },
          { arabic: "سُوءَ", transliteration: "soo'a", meaning: "evil" },
          { arabic: "سِيءَ", transliteration: "see'a", meaning: "was evil" }
        ]
      },
      {
        id: "5-3",
        title: "Separated Madd (المد المنفصل)",
        content: `When a word ends with a madd letter and the next word begins with hamza, elongate 4-5 counts.

This is permissible (jaa'iz).`,
        examples: [
          { arabic: "يَا أَيُّهَا", transliteration: "yaa ayyuhaa", meaning: "O you" },
          { arabic: "فِي أَنفُسِهِمْ", transliteration: "fee anfusihim", meaning: "within themselves" }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Qalqalah",
    arabicTitle: "القلقلة",
    description: "Echo/bouncing sound on certain letters",
    lessons: [
      {
        id: "6-1",
        title: "Qalqalah Letters",
        content: `Qalqalah is an echoing/bouncing sound that occurs on 5 letters when they have sukoon:

ق ط ب ج د (Qutub Jad - قُطْبُ جَدٍّ)

There are three levels:
• Smallest: In the middle of a word
• Medium: At the end of a word (continuing)
• Strongest: At the end of a word (stopping)`,
        examples: [
          { arabic: "يَقْطَعُونَ", transliteration: "yaqta'oon", meaning: "they cut" },
          { arabic: "أَحَدْ", transliteration: "ahad", meaning: "one" },
          { arabic: "الْفَلَقْ", transliteration: "al-falaq", meaning: "the daybreak" }
        ]
      }
    ]
  }
];

function TajweedKitab() {
  const { addXp } = useApp();
  
  const [completedLessons, setCompletedLessons] = useState(() => {
    const saved = localStorage.getItem('qawaam_tajweed_progress');
    return saved ? JSON.parse(saved) : [];
  });

  const [expandedChapter, setExpandedChapter] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showExternalBook, setShowExternalBook] = useState(false);

  useEffect(() => {
    localStorage.setItem('qawaam_tajweed_progress', JSON.stringify(completedLessons));
  }, [completedLessons]);

  const markLessonComplete = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
      addXp(25);
    }
  };

  const totalLessons = TAJWEED_CHAPTERS.reduce((acc, ch) => acc + ch.lessons.length, 0);
  const progress = (completedLessons.length / totalLessons) * 100;

  // Lesson View
  if (selectedLesson) {
    const chapter = TAJWEED_CHAPTERS.find(ch => ch.lessons.some(l => l.id === selectedLesson));
    const lesson = chapter?.lessons.find(l => l.id === selectedLesson);
    const isComplete = completedLessons.includes(selectedLesson);

    return (
      <div className="lesson-view">
        <button className="back-btn" onClick={() => setSelectedLesson(null)}>
          ← Back to Chapters
        </button>

        <div className="lesson-header">
          <span className="chapter-name">{chapter?.title}</span>
          <h2>{lesson?.title}</h2>
        </div>

        <div className="lesson-content">
          {lesson?.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>

        {lesson?.examples?.length > 0 && (
          <div className="examples-section">
            <h3>Examples</h3>
            <div className="examples-grid">
              {lesson.examples.map((ex, i) => (
                <div key={i} className="example-card">
                  <p className="arabic example-arabic">{ex.arabic}</p>
                  <p className="transliteration">{ex.transliteration}</p>
                  <p className="meaning">{ex.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isComplete ? (
          <button 
            className="btn btn-primary complete-btn"
            onClick={() => markLessonComplete(selectedLesson)}
          >
            <Check size={18} />
            Mark as Complete (+25 XP)
          </button>
        ) : (
          <div className="completed-badge">
            <Check size={18} />
            Lesson Completed
          </div>
        )}

        <style>{`
          .lesson-view {
            animation: fadeIn 0.3s ease-out;
          }
          .back-btn {
            background: none;
            border: none;
            color: var(--gold);
            font-size: 14px;
            cursor: pointer;
            padding: 8px 0;
            margin-bottom: 16px;
          }
          .lesson-header {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .chapter-name {
            font-size: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .lesson-header h2 {
            font-size: 22px;
            margin-top: 8px;
          }
          .lesson-content {
            background: var(--bg-surface);
            padding: 24px;
            border-radius: 16px;
            margin-bottom: 20px;
          }
          .lesson-content p {
            font-size: 14px;
            line-height: 1.8;
            color: var(--text-secondary);
            margin-bottom: 16px;
            white-space: pre-wrap;
          }
          .lesson-content p:last-child {
            margin-bottom: 0;
          }
          .examples-section {
            margin-bottom: 20px;
          }
          .examples-section h3 {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 12px;
          }
          .examples-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 12px;
          }
          .example-card {
            background: var(--bg-surface);
            padding: 16px;
            border-radius: 12px;
            text-align: center;
          }
          .example-arabic {
            font-size: 24px;
            color: var(--gold);
            margin-bottom: 8px;
          }
          .transliteration {
            font-size: 12px;
            color: var(--text-secondary);
            font-style: italic;
            margin-bottom: 4px;
          }
          .meaning {
            font-size: 11px;
            color: var(--text-muted);
          }
          .complete-btn {
            width: 100%;
          }
          .completed-badge {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 16px;
            background: rgba(46,204,113,0.2);
            border-radius: 12px;
            color: var(--success);
            font-weight: 600;
          }
        `}</style>
      </div>
    );
  }

  // Chapter List View
  return (
    <div className="tajweed-kitab">
      {/* External Book Link */}
      <div className="external-book-card">
        <div className="book-info">
          <span className="book-icon">📕</span>
          <div>
            <h3>Full Tajweed Mushaf</h3>
            <p>Color-coded Quran with Tajweed rules</p>
          </div>
        </div>
        <a 
          href="https://app.quranflash.com/book/Tajweed?en#/reader" 
          target="_blank" 
          rel="noopener noreferrer"
          className="open-book-btn"
        >
          Open Book →
        </a>
      </div>

      {/* Progress */}
      <div className="progress-card">
        <div className="progress-header">
          <BookOpen size={20} />
          <div>
            <span className="progress-title">Tajweed Progress</span>
            <span className="progress-stats">{completedLessons.length}/{totalLessons} lessons</span>
          </div>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Chapters */}
      <div className="chapters-list">
        {TAJWEED_CHAPTERS.map((chapter) => {
          const chapterLessons = chapter.lessons;
          const completedInChapter = chapterLessons.filter(l => completedLessons.includes(l.id)).length;
          const isExpanded = expandedChapter === chapter.id;

          return (
            <div key={chapter.id} className="chapter-card">
              <div 
                className="chapter-header"
                onClick={() => setExpandedChapter(isExpanded ? null : chapter.id)}
              >
                <div className="chapter-number">{chapter.id}</div>
                <div className="chapter-info">
                  <h3>{chapter.title}</h3>
                  <span className="arabic-title">{chapter.arabicTitle}</span>
                  <p className="chapter-desc">{chapter.description}</p>
                </div>
                <div className="chapter-progress">
                  <span>{completedInChapter}/{chapterLessons.length}</span>
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </div>

              {isExpanded && (
                <div className="lessons-list">
                  {chapterLessons.map((lesson) => {
                    const isComplete = completedLessons.includes(lesson.id);
                    return (
                      <div 
                        key={lesson.id}
                        className={`lesson-item ${isComplete ? 'completed' : ''}`}
                        onClick={() => setSelectedLesson(lesson.id)}
                      >
                        <div className={`lesson-check ${isComplete ? 'done' : ''}`}>
                          {isComplete && <Check size={12} />}
                        </div>
                        <span className="lesson-title">{lesson.title}</span>
                        <ChevronRight size={16} className="chevron" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .tajweed-kitab {
          animation: fadeIn 0.3s ease-out;
        }
        .external-book-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(135deg, #1a472a 0%, #2d5a3f 100%);
          padding: 16px 20px;
          border-radius: 16px;
          margin-bottom: 16px;
          border: 1px solid rgba(212,175,55,0.3);
        }
        .book-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .book-icon {
          font-size: 28px;
        }
        .book-info h3 {
          font-size: 15px;
          margin-bottom: 2px;
        }
        .book-info p {
          font-size: 12px;
          color: var(--text-secondary);
        }
        .open-book-btn {
          background: var(--gold);
          color: var(--bg-primary);
          padding: 10px 16px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
        }
        .open-book-btn:hover {
          background: var(--gold-light);
          transform: translateY(-2px);
        }
        .progress-card {
          background: var(--bg-surface);
          padding: 20px;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .progress-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .progress-header svg {
          color: var(--gold);
        }
        .progress-title {
          display: block;
          font-size: 14px;
          font-weight: 600;
        }
        .progress-stats {
          font-size: 12px;
          color: var(--text-muted);
        }
        .progress-bar {
          height: 8px;
          background: var(--bg-surface-light);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-light), var(--gold));
          border-radius: 4px;
          transition: width 0.5s ease;
        }
        .chapters-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .chapter-card {
          background: var(--bg-surface);
          border-radius: 16px;
          overflow: hidden;
        }
        .chapter-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          cursor: pointer;
        }
        .chapter-number {
          width: 36px;
          height: 36px;
          background: var(--primary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          flex-shrink: 0;
        }
        .chapter-info {
          flex: 1;
        }
        .chapter-info h3 {
          font-size: 15px;
          margin-bottom: 2px;
        }
        .arabic-title {
          font-family: 'Amiri', serif;
          font-size: 14px;
          color: var(--gold);
        }
        .chapter-desc {
          font-size: 12px;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .chapter-progress {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 12px;
        }
        .lessons-list {
          border-top: 1px solid var(--bg-surface-light);
          padding: 8px;
          animation: fadeIn 0.2s ease-out;
        }
        .lesson-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .lesson-item:hover {
          background: var(--bg-surface-light);
        }
        .lesson-item.completed .lesson-title {
          color: var(--text-muted);
        }
        .lesson-check {
          width: 20px;
          height: 20px;
          border: 2px solid var(--text-muted);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .lesson-check.done {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }
        .lesson-title {
          flex: 1;
          font-size: 13px;
        }
        .chevron {
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

export default TajweedKitab;

