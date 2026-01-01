import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// XP required for each level (cumulative)
const LEVEL_XP = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000, 50000];
const LEVEL_NAMES = [
  'Beginner', 'Seeker', 'Steadfast', 'Consistent', 'Dedicated',
  'Committed', 'Disciplined', 'Firm', 'Unwavering', 'Master', 'Legend'
];

export const AppProvider = ({ children }) => {
  const [userXp, setUserXp] = useState(0);
  const [userLevel, setUserLevel] = useState(1);
  const [userStreak, setUserStreak] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    const savedXp = localStorage.getItem('qawaam_xp');
    const savedStreak = localStorage.getItem('qawaam_streak');
    
    if (savedXp) setUserXp(parseInt(savedXp));
    if (savedStreak) setUserStreak(parseInt(savedStreak));
  }, []);

  // Save to localStorage when XP changes
  useEffect(() => {
    localStorage.setItem('qawaam_xp', userXp.toString());
    const level = calculateLevel(userXp);
    setUserLevel(level.level);
  }, [userXp]);

  useEffect(() => {
    localStorage.setItem('qawaam_streak', userStreak.toString());
  }, [userStreak]);

  // Calculate level from XP
  const calculateLevel = (xp) => {
    let level = 1;
    for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP[i]) {
        level = i + 1;
        break;
      }
    }

    const currentLevelXp = LEVEL_XP[level - 1] || 0;
    const nextLevelXp = LEVEL_XP[level] || LEVEL_XP[LEVEL_XP.length - 1];
    const xpInLevel = xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    const progress = Math.min((xpInLevel / xpNeeded) * 100, 100);

    return {
      level,
      levelName: LEVEL_NAMES[level - 1] || 'Legend',
      xp,
      progress,
      xpToNext: nextLevelXp - xp,
      currentLevelXp,
      nextLevelXp
    };
  };

  // Add XP
  const addXp = (amount) => {
    setUserXp(prev => {
      const newXp = prev + amount;
      return newXp;
    });
  };

  // Increment streak
  const incrementStreak = () => {
    setUserStreak(prev => prev + 1);
  };

  // Reset streak
  const resetStreak = () => {
    setUserStreak(0);
  };

  const value = {
    userXp,
    userLevel,
    userStreak,
    addXp,
    incrementStreak,
    resetStreak,
    calculateLevel,
    LEVEL_NAMES
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
