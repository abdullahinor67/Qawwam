import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Subscription Tiers
export const TIERS = {
  FREE: 'free',
  PRO: 'pro',
  PRO_PLUS: 'pro_plus'
};

export const TIER_LABELS = {
  [TIERS.FREE]: 'Free',
  [TIERS.PRO]: 'Pro',
  [TIERS.PRO_PLUS]: 'Pro+'
};

export const TIER_COLORS = {
  [TIERS.FREE]: { bg: '#374151', text: '#9ca3af' },
  [TIERS.PRO]: { bg: '#92400e', text: '#fbbf24' },
  [TIERS.PRO_PLUS]: { bg: '#5b21b6', text: '#a78bfa' }
};

// Feature Access by Tier
export const FEATURES = {
  // Free features
  dashboard: [TIERS.FREE, TIERS.PRO, TIERS.PRO_PLUS],
  basic_prayer: [TIERS.FREE, TIERS.PRO, TIERS.PRO_PLUS],
  quran_read_limited: [TIERS.FREE, TIERS.PRO, TIERS.PRO_PLUS],
  habits_limited: [TIERS.FREE, TIERS.PRO, TIERS.PRO_PLUS],
  
  // Pro features
  salah_tracking: [TIERS.PRO, TIERS.PRO_PLUS],
  salah_history: [TIERS.PRO, TIERS.PRO_PLUS],
  quran_full: [TIERS.PRO, TIERS.PRO_PLUS],
  memorization: [TIERS.PRO, TIERS.PRO_PLUS],
  revision: [TIERS.PRO, TIERS.PRO_PLUS],
  musabaqah: [TIERS.PRO, TIERS.PRO_PLUS],
  tajweed: [TIERS.PRO, TIERS.PRO_PLUS],
  habits_unlimited: [TIERS.PRO, TIERS.PRO_PLUS],
  workout: [TIERS.PRO, TIERS.PRO_PLUS],
  
  // Pro+ features
  weight_tracking: [TIERS.PRO_PLUS],
  custom_workout_pdf: [TIERS.PRO_PLUS],
  advanced_analytics: [TIERS.PRO_PLUS],
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchUserProfile(firebaseUser.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const fetchUserProfile = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      } else {
        // Create default profile for new users
        const defaultProfile = {
          name: user?.displayName || 'User',
          email: user?.email,
          tier: TIERS.FREE,
          createdAt: new Date().toISOString(),
          workoutEnabled: false,
          customWorkoutPdf: null
        };
        await setDoc(userRef, defaultProfile);
        setUserProfile(defaultProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const signup = async (email, password, name) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    
    const userRef = doc(db, 'users', userCredential.user.uid);
    const newProfile = {
      name: name,
      email: email,
      tier: TIERS.FREE,
      createdAt: new Date().toISOString(),
      workoutEnabled: false,
      customWorkoutPdf: null
    };
    await setDoc(userRef, newProfile);
    setUserProfile(newProfile);
    
    return userCredential;
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    
    // Check if user profile exists
    const userRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      const newProfile = {
        name: result.user.displayName || 'User',
        email: result.user.email,
        tier: TIERS.FREE,
        createdAt: new Date().toISOString(),
        workoutEnabled: false,
        customWorkoutPdf: null
      };
      await setDoc(userRef, newProfile);
      setUserProfile(newProfile);
    } else {
      setUserProfile(docSnap.data());
    }
    
    return result;
  };

  const logout = () => {
    return signOut(auth);
  };

  const updateUserProfile = async (updates) => {
    if (!user) return;
    
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, updates, { merge: true });
      setUserProfile(prev => ({ ...prev, ...updates }));
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updateTier = async (newTier) => {
    if (!user) return;
    await updateUserProfile({ tier: newTier });
  };

  // Check if user has access to a feature
  const hasAccess = (feature) => {
    const userTier = userProfile?.tier || TIERS.FREE;
    const allowedTiers = FEATURES[feature] || [];
    return allowedTiers.includes(userTier);
  };

  // Get current tier
  const getTier = () => {
    return userProfile?.tier || TIERS.FREE;
  };

  // Get tier label
  const getTierLabel = () => {
    return TIER_LABELS[getTier()];
  };

  const value = {
    user,
    userProfile,
    signup,
    login,
    loginWithGoogle,
    logout,
    updateUserProfile,
    updateTier,
    hasAccess,
    getTier,
    getTierLabel,
    loading,
    TIERS,
    TIER_LABELS,
    FEATURES
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
