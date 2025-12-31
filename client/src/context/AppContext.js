import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // User Info
  const [userName, setUserName] = useState(() => {
    return localStorage.getItem('qawaam_username') || '';
  });

  // XP & Leveling
  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('qawaam_xp');
    return saved ? parseInt(saved) : 0;
  });
  
  const [level, setLevel] = useState(() => {
    const saved = localStorage.getItem('qawaam_level');
    return saved ? parseInt(saved) : 1;
  });

  // Streak tracking
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('qawaam_streak');
    if (saved) {
      const { count, lastDate } = JSON.parse(saved);
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      if (lastDate === today || lastDate === yesterday) return count;
    }
    return 0;
  });

  // Prayer times & data
  const [prayerTimes, setPrayerTimes] = useState(null);
  const [todayPrayers, setTodayPrayers] = useState(() => {
    const saved = localStorage.getItem('qawaam_today_prayers');
    const today = new Date().toDateString();
    if (saved) {
      const { date, prayers } = JSON.parse(saved);
      if (date === today) return prayers;
    }
    return {};
  });

  // Quran Stats
  const [quranStats, setQuranStats] = useState(() => {
    const saved = localStorage.getItem('qawaam_quran_stats');
    return saved ? JSON.parse(saved) : {
      pagesMemorized: 0,
      pagesRevised: 0,
      quizzesTaken: 0,
      todayProgress: 0,
      lastUpdated: null
    };
  });

  // Quiz History
  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('qawaam_quiz_history');
    return saved ? JSON.parse(saved) : {
      totalQuizzes: 0,
      totalPassed: 0,
      totalMistakes: 0,
      averageScore: 0,
      history: []
    };
  });

  // Workout Stats
  const [workoutStats, setWorkoutStats] = useState(() => {
    const saved = localStorage.getItem('qawaam_workout_stats');
    return saved ? JSON.parse(saved) : {
      workoutsCompleted: 0,
      currentWeight: null,
      startWeight: null,
      weekStreak: 0,
      todayProgress: 0,
      weightHistory: [],
      lastWorkoutDate: null
    };
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('qawaam_username', userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem('qawaam_xp', xp.toString());
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('qawaam_level', level.toString());
  }, [level]);

  useEffect(() => {
    localStorage.setItem('qawaam_streak', JSON.stringify({
      count: streak,
      lastDate: new Date().toDateString()
    }));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('qawaam_today_prayers', JSON.stringify({
      date: new Date().toDateString(),
      prayers: todayPrayers
    }));
  }, [todayPrayers]);

  useEffect(() => {
    localStorage.setItem('qawaam_quran_stats', JSON.stringify(quranStats));
  }, [quranStats]);

  useEffect(() => {
    localStorage.setItem('qawaam_quiz_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem('qawaam_workout_stats', JSON.stringify(workoutStats));
  }, [workoutStats]);

  // XP Functions
  const addXp = (amount) => {
    setXp(prev => {
      const newXp = prev + amount;
      // Level up every 100 XP
      const newLevel = Math.floor(newXp / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
      }
      return newXp;
    });
  };

  // Quran Functions
  const updateQuranStats = (updates) => {
    setQuranStats(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date().toISOString()
    }));
  };

  const addMemorizedPages = (count) => {
    setQuranStats(prev => ({
      ...prev,
      pagesMemorized: prev.pagesMemorized + count,
      todayProgress: Math.min(100, prev.todayProgress + (count * 25)),
      lastUpdated: new Date().toISOString()
    }));
    addXp(count * 30);
  };

  const addRevisedPages = (count) => {
    setQuranStats(prev => ({
      ...prev,
      pagesRevised: prev.pagesRevised + count,
      todayProgress: Math.min(100, prev.todayProgress + (count * 15)),
      lastUpdated: new Date().toISOString()
    }));
    addXp(count * 15);
  };

  // Quiz Functions
  const recordQuizResult = (passed, totalQuestions, mistakes) => {
    setQuizHistory(prev => {
      const newTotal = prev.totalQuizzes + 1;
      const newPassed = prev.totalPassed + (passed ? 1 : 0);
      const newMistakes = prev.totalMistakes + mistakes;
      const passRate = Math.round((newPassed / newTotal) * 100);
      
      return {
        totalQuizzes: newTotal,
        totalPassed: newPassed,
        totalMistakes: newMistakes,
        averageScore: passRate,
        history: [
          ...prev.history.slice(-49), // Keep last 50
          {
            date: new Date().toISOString(),
            passed,
            totalQuestions,
            mistakes
          }
        ]
      };
    });

    setQuranStats(prev => ({
      ...prev,
      quizzesTaken: prev.quizzesTaken + 1
    }));
  };

  // Workout Functions
  const completeWorkout = () => {
    const today = new Date().toDateString();
    
    setWorkoutStats(prev => {
      const isConsecutive = prev.lastWorkoutDate === new Date(Date.now() - 86400000).toDateString();
      
      return {
        ...prev,
        workoutsCompleted: prev.workoutsCompleted + 1,
        todayProgress: 100,
        weekStreak: isConsecutive ? prev.weekStreak + 1 : 1,
        lastWorkoutDate: today
      };
    });
    
    addXp(50);
  };

  const updateWeight = (weight) => {
    setWorkoutStats(prev => ({
      ...prev,
      currentWeight: weight,
      startWeight: prev.startWeight || weight,
      weightHistory: [
        ...prev.weightHistory.slice(-29), // Keep last 30
        {
          date: new Date().toISOString(),
          weight
        }
      ]
    }));
  };

  // Prayer Functions
  const markPrayer = (prayer, status) => {
    setTodayPrayers(prev => ({
      ...prev,
      [prayer]: status
    }));
    
    if (status === 'on_time') addXp(50);
    else if (status === 'late') addXp(20);
  };

  const value = {
    // User
    userName,
    setUserName,
    
    // XP & Level
    xp,
    level,
    addXp,
    
    // Streak
    streak,
    setStreak,
    
    // Prayers
    prayerTimes,
    setPrayerTimes,
    todayPrayers,
    setTodayPrayers,
    markPrayer,
    
    // Quran
    quranStats,
    updateQuranStats,
    addMemorizedPages,
    addRevisedPages,
    
    // Quiz
    quizHistory,
    recordQuizResult,
    
    // Workout
    workoutStats,
    completeWorkout,
    updateWeight
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
