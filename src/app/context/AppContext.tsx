import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface LessonProgress {
  completed: boolean;
  score: number;       // 0-100
  stars: number;       // 0-3
  exerciseIndex: number;
  xpEarned: number;
}

interface AppState {
  user: {
    name: string;
    xp: number;
    streak: number;
    totalMinutes: number;
  };
  lessonProgress: Record<string, LessonProgress>;
  onboardingCompleted: boolean;
  sound: boolean;
  notifications: boolean;
  highContrast: boolean;
}

const defaultState: AppState = {
  user: {
    name: 'Alex',
    xp: 340,
    streak: 7,
    totalMinutes: 135,
  },
  lessonProgress: {
    'lesson-1': { completed: true, score: 100, stars: 3, exerciseIndex: 5, xpEarned: 50 },
    'lesson-2': { completed: true, score: 80, stars: 2, exerciseIndex: 5, xpEarned: 60 },
    'lesson-3': { completed: false, score: 0, stars: 0, exerciseIndex: 1, xpEarned: 0 },
  },
  onboardingCompleted: false,
  sound: true,
  notifications: true,
  highContrast: false,
};

export function getLevel(xp: number): string {
  if (xp < 200) return 'A1';
  if (xp < 500) return 'A2';
  if (xp < 900) return 'B1';
  if (xp < 1400) return 'B2';
  return 'C1';
}

export function getNextLevel(xp: number): string {
  if (xp < 200) return 'A2';
  if (xp < 500) return 'B1';
  if (xp < 900) return 'B2';
  if (xp < 1400) return 'C1';
  return 'C1';
}

export function getXpProgress(xp: number): { current: number; needed: number; percent: number } {
  const thresholds = [0, 200, 500, 900, 1400, 2000];
  for (let i = 0; i < thresholds.length - 1; i++) {
    if (xp < thresholds[i + 1]) {
      const current = xp - thresholds[i];
      const needed = thresholds[i + 1] - thresholds[i];
      return { current, needed, percent: Math.round((current / needed) * 100) };
    }
  }
  return { current: xp - 1400, needed: 600, percent: Math.min(100, Math.round(((xp - 1400) / 600) * 100)) };
}

interface AppContextType {
  state: AppState;
  completeLesson: (lessonId: string, score: number, stars: number, xpEarned: number, timeMinutes: number) => void;
  saveProgress: (lessonId: string, exerciseIndex: number) => void;
  setOnboardingCompleted: () => void;
  resetLesson: (lessonId: string) => void;
  updateSettings: (settings: Partial<Pick<AppState, 'sound' | 'notifications' | 'highContrast'>>) => void;
  resetAllProgress: () => void;
  updateUserName: (name: string) => void;
  isLessonLocked: (lessonId: string) => boolean;
  getInProgressLesson: () => string | null;
}

const AppContext = createContext<AppContextType | null>(null);
const STORAGE_KEY = 'linguaflow_state_v2';

const LESSON_ORDER = [
  'lesson-1','lesson-2','lesson-3','lesson-4',
  'lesson-5','lesson-6','lesson-7','lesson-8',
  'lesson-9','lesson-10','lesson-11','lesson-12',
];

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultState, ...JSON.parse(saved) };
    } catch { /* ignore */ }
    return defaultState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Aplica el modo de alto contraste a toda la app en cuanto cambia el ajuste.
  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', state.highContrast);
  }, [state.highContrast]);

  const completeLesson = useCallback((lessonId: string, score: number, stars: number, xpEarned: number, timeMinutes: number) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        xp: prev.user.xp + xpEarned,
        totalMinutes: prev.user.totalMinutes + timeMinutes,
        streak: prev.user.streak, // could increment if first lesson of the day
      },
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: { completed: true, score, stars, exerciseIndex: 999, xpEarned },
      },
    }));
  }, []);

  const saveProgress = useCallback((lessonId: string, exerciseIndex: number) => {
    setState(prev => ({
      ...prev,
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: {
          ...(prev.lessonProgress[lessonId] ?? { completed: false, score: 0, stars: 0, xpEarned: 0 }),
          exerciseIndex,
        },
      },
    }));
  }, []);

  const setOnboardingCompleted = useCallback(() => {
    setState(prev => ({ ...prev, onboardingCompleted: true }));
  }, []);

  const resetLesson = useCallback((lessonId: string) => {
    setState(prev => ({
      ...prev,
      lessonProgress: {
        ...prev.lessonProgress,
        [lessonId]: { completed: false, score: 0, stars: 0, exerciseIndex: 0, xpEarned: 0 },
      },
    }));
  }, []);

  const updateSettings = useCallback((settings: Partial<Pick<AppState, 'sound' | 'notifications' | 'highContrast'>>) => {
    setState(prev => ({ ...prev, ...settings }));
  }, []);

  const resetAllProgress = useCallback(() => {
    setState({ ...defaultState, onboardingCompleted: true });
  }, []);

  const updateUserName = useCallback((name: string) => {
    setState(prev => ({ ...prev, user: { ...prev.user, name } }));
  }, []);

  const isLessonLocked = useCallback((lessonId: string): boolean => {
    const index = LESSON_ORDER.indexOf(lessonId);
    if (index <= 0) return false;
    const prevId = LESSON_ORDER[index - 1];
    return !state.lessonProgress[prevId]?.completed;
  }, [state.lessonProgress]);

  const getInProgressLesson = useCallback((): string | null => {
    // Find last lesson that has progress but isn't completed
    for (const lessonId of LESSON_ORDER) {
      const p = state.lessonProgress[lessonId];
      if (p && !p.completed && p.exerciseIndex > 0) return lessonId;
    }
    // Otherwise return first unlocked & not completed
    for (const lessonId of LESSON_ORDER) {
      const p = state.lessonProgress[lessonId];
      const idx = LESSON_ORDER.indexOf(lessonId);
      const prevCompleted = idx === 0 || state.lessonProgress[LESSON_ORDER[idx - 1]]?.completed;
      if (prevCompleted && (!p || !p.completed)) return lessonId;
    }
    return null;
  }, [state.lessonProgress]);

  return (
    <AppContext.Provider value={{
      state,
      completeLesson,
      saveProgress,
      setOnboardingCompleted,
      resetLesson,
      updateSettings,
      resetAllProgress,
      updateUserName,
      isLessonLocked,
      getInProgressLesson,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
