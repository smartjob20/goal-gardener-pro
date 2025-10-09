import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AppState, Task, Habit, Goal, FocusSession, Achievement, User, Plan, AppSettings, AICoachSuggestion } from '@/types';
import { toast } from 'sonner';

// Initial State
const initialUser: User = {
  id: '1',
  name: 'کاربر عزیز',
  level: 1,
  xp: 0,
  xpToNextLevel: 100,
  avatar: '👤',
  achievements: [],
  totalTasksCompleted: 0,
  totalFocusTime: 0,
  longestStreak: 0,
  createdAt: new Date().toISOString(),
};

const initialSettings: AppSettings = {
  theme: 'light',
  language: 'fa',
  calendar: 'jalali',
  notifications: true,
  sounds: true,
  volume: 50,
  haptics: true,
  dailyReminderTime: '09:00',
  habitReminders: true,
};

const initialAchievements: Achievement[] = [
  { id: '1', title: 'اولین قدم', description: 'اولین وظیفه را تکمیل کنید', icon: '🎯', xpReward: 10, unlocked: false },
  { id: '2', title: 'هفته‌ای پرانرژی', description: '7 روز پشت سر هم عادت انجام دهید', icon: '🔥', xpReward: 50, unlocked: false },
  { id: '3', title: 'استاد تمرکز', description: '2 ساعت متوالی تمرکز کنید', icon: '🧘', xpReward: 30, unlocked: false },
  { id: '4', title: 'پیشرفت چشمگیر', description: 'به سطح 5 برسید', icon: '⭐', xpReward: 100, unlocked: false },
  { id: '5', title: 'سازمان‌دهنده ماهر', description: '50 وظیفه تکمیل کنید', icon: '📋', xpReward: 75, unlocked: false },
  { id: '6', title: 'قهرمان عادت', description: '30 روز پیاپی عادت انجام دهید', icon: '💪', xpReward: 100, unlocked: false },
  { id: '7', title: 'استاد زمان', description: '10 ساعت تمرکز در هفته', icon: '🏆', xpReward: 80, unlocked: false },
  { id: '8', title: 'افسانه‌ای', description: 'به سطح 10 برسید', icon: '🌟', xpReward: 200, unlocked: false },
];

const initialState: AppState = {
  user: initialUser,
  tasks: [],
  habits: [],
  goals: [],
  plans: [],
  focusSessions: [],
  dailyStats: [],
  achievements: initialAchievements,
  settings: initialSettings,
  aiSuggestions: [],
};

// Action Types
type Action =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'ADD_HABIT'; payload: Habit }
  | { type: 'UPDATE_HABIT'; payload: Habit }
  | { type: 'DELETE_HABIT'; payload: string }
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_PLAN'; payload: Plan }
  | { type: 'UPDATE_PLAN'; payload: Plan }
  | { type: 'DELETE_PLAN'; payload: string }
  | { type: 'ADD_FOCUS_SESSION'; payload: FocusSession }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'ADD_AI_SUGGESTION'; payload: AICoachSuggestion }
  | { type: 'DISMISS_SUGGESTION'; payload: string }
  | { type: 'LOAD_STATE'; payload: AppState };

// Reducer
const appReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK': {
      const updatedTasks = state.tasks.map(t => t.id === action.payload.id ? action.payload : t);
      return { ...state, tasks: updatedTasks };
    }
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(t => t.id !== action.payload) };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.payload] };
    case 'UPDATE_HABIT': {
      const updatedHabits = state.habits.map(h => h.id === action.payload.id ? action.payload : h);
      return { ...state, habits: updatedHabits };
    }
    case 'DELETE_HABIT':
      return { ...state, habits: state.habits.filter(h => h.id !== action.payload) };
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    case 'UPDATE_GOAL': {
      const updatedGoals = state.goals.map(g => g.id === action.payload.id ? action.payload : g);
      return { ...state, goals: updatedGoals };
    }
    case 'DELETE_GOAL':
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) };
    case 'ADD_PLAN':
      return { ...state, plans: [...state.plans, action.payload] };
    case 'UPDATE_PLAN': {
      const updatedPlans = state.plans.map(p => p.id === action.payload.id ? action.payload : p);
      return { ...state, plans: updatedPlans };
    }
    case 'DELETE_PLAN':
      return { ...state, plans: state.plans.filter(p => p.id !== action.payload) };
    case 'ADD_FOCUS_SESSION':
      return { ...state, focusSessions: [...state.focusSessions, action.payload] };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'ADD_XP': {
      const newXP = state.user.xp + action.payload;
      const newLevel = Math.floor(newXP / 100) + 1;
      const xpToNext = (newLevel * 100) - newXP;
      return {
        ...state,
        user: { ...state.user, xp: newXP, level: newLevel, xpToNextLevel: xpToNext }
      };
    }
    case 'UNLOCK_ACHIEVEMENT': {
      const updatedAchievements = state.achievements.map(a =>
        a.id === action.payload ? { ...a, unlocked: true, unlockedAt: new Date().toISOString() } : a
      );
      return { ...state, achievements: updatedAchievements };
    }
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_AI_SUGGESTION':
      return { ...state, aiSuggestions: [...state.aiSuggestions, action.payload] };
    case 'DISMISS_SUGGESTION': {
      const updatedSuggestions = state.aiSuggestions.map(s =>
        s.id === action.payload ? { ...s, dismissed: true } : s
      );
      return { ...state, aiSuggestions: updatedSuggestions };
    }
    case 'LOAD_STATE':
      return action.payload;
    default:
      return state;
  }
};

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => void;
  completeTask: (id: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completedDates'>) => void;
  checkHabit: (id: string, date: string) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'status'>) => void;
  addXP: (amount: number, reason: string) => void;
  checkAchievements: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('timemanager-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        dispatch({ type: 'LOAD_STATE', payload: { ...initialState, ...parsed } });
      } catch (error) {
        console.error('Failed to load state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  useEffect(() => {
    localStorage.setItem('timemanager-state', JSON.stringify(state));
  }, [state]);

  // Helper functions
  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      completed: false,
    };
    dispatch({ type: 'ADD_TASK', payload: newTask });
    toast.success('وظیفه جدید اضافه شد! 🎯');
  };

  const completeTask = (id: string) => {
    const task = state.tasks.find(t => t.id === id);
    if (task && !task.completed) {
      const updatedTask = { ...task, completed: true, completedAt: new Date().toISOString() };
      dispatch({ type: 'UPDATE_TASK', payload: updatedTask });
      addXP(task.xpReward, 'تکمیل وظیفه');
      dispatch({ type: 'UPDATE_USER', payload: { totalTasksCompleted: state.user.totalTasksCompleted + 1 } });
    }
  };

  const addHabit = (habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak' | 'completedDates'>) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      currentStreak: 0,
      longestStreak: 0,
      completedDates: [],
    };
    dispatch({ type: 'ADD_HABIT', payload: newHabit });
    toast.success('عادت جدید ایجاد شد! 🔥');
  };

  const checkHabit = (id: string, date: string) => {
    const habit = state.habits.find(h => h.id === id);
    if (habit) {
      const isCompleted = habit.completedDates.includes(date);
      const updatedDates = isCompleted
        ? habit.completedDates.filter(d => d !== date)
        : [...habit.completedDates, date];
      
      const updatedHabit = { ...habit, completedDates: updatedDates };
      dispatch({ type: 'UPDATE_HABIT', payload: updatedHabit });
      
      if (!isCompleted) {
        addXP(habit.xpReward, 'انجام عادت');
      }
    }
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'createdAt' | 'progress' | 'status'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      progress: 0,
      status: 'active',
    };
    dispatch({ type: 'ADD_GOAL', payload: newGoal });
    toast.success('هدف جدید ایجاد شد! 🎯');
  };

  const addXP = (amount: number, reason: string) => {
    dispatch({ type: 'ADD_XP', payload: amount });
    toast.success(`${amount} XP کسب کردید! ${reason} 🌟`);
    checkAchievements();
  };

  const checkAchievements = () => {
    // Check for achievement unlocks
    const { totalTasksCompleted, level, totalFocusTime } = state.user;
    
    if (totalTasksCompleted >= 1 && !state.achievements[0].unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: '1' });
      toast.success('دستاورد جدید! 🎯 اولین قدم');
    }
    if (level >= 5 && !state.achievements[3].unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: '4' });
      toast.success('دستاورد جدید! ⭐ پیشرفت چشمگیر');
    }
    if (totalTasksCompleted >= 50 && !state.achievements[4].unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: '5' });
      toast.success('دستاورد جدید! 📋 سازمان‌دهنده ماهر');
    }
    if (totalFocusTime >= 120 && !state.achievements[2].unlocked) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: '3' });
      toast.success('دستاورد جدید! 🧘 استاد تمرکز');
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, addTask, completeTask, addHabit, checkHabit, addGoal, addXP, checkAchievements }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
