// Core Types for TimeManager Pro

export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'study' | 'health' | 'personal' | 'project';
export type HabitCategory = 'health' | 'fitness' | 'nutrition' | 'productivity' | 'learning' | 'mindfulness' | 'social' | 'creativity' | 'finance' | 'relationship';
export type HabitFrequency = 'daily' | 'weekly' | 'custom';
export type HabitType = 'quantitative' | 'qualitative';
export type HabitDifficulty = 'easy' | 'medium' | 'hard';
export type GoalCategory = 'health' | 'learning' | 'career' | 'finance' | 'personal' | 'family' | 'hobby' | 'travel';
export type PlanType = 'habit' | 'goal' | 'routine';
export type PlanStatus = 'planning' | 'active' | 'completed' | 'paused';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory | string;
  priority: Priority;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
  deadline?: string;
  subtasks?: SubTask[];
  dollarReward: number;
  timeSpent?: number;
  imageUrl?: string;
  order?: number;
  reminderTime?: string;
}

export interface Habit {
  id: string;
  title: string;
  description?: string;
  category: HabitCategory | string;
  target: number;
  targetUnit: string;
  currentStreak: number;
  longestStreak: number;
  completedDates: string[];
  dollarReward: number;
  color: string;
  frequency: HabitFrequency;
  reminderTime?: string;
  reminderEnabled: boolean;
  habitType: HabitType;
  difficulty: HabitDifficulty;
  createdAt: string;
  isActive: boolean;
  imageUrl?: string;
  order?: number;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: GoalCategory;
  progress: number;
  targetDate: string;
  milestones: Milestone[];
  dollarReward: number;
  status: 'active' | 'completed' | 'paused';
  imageUrl?: string;
  createdAt: string;
}

export interface FocusSession {
  id: string;
  taskId?: string;
  startTime: string;
  endTime?: string;
  duration: number;
  dollarsEarned: number;
  completed: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  dollarReward: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface DailyStats {
  date: string;
  tasksCompleted: number;
  habitsCompleted: number;
  focusTime: number;
  dollarsEarned: number;
}

export interface User {
  id: string;
  name: string;
  level: number;
  dollars: number;
  dollarsToNextLevel: number;
  avatar: string;
  bio?: string;
  achievements: string[];
  totalTasksCompleted: number;
  totalFocusTime: number;
  longestStreak: number;
  createdAt: string;
}

export interface Plan {
  id: string;
  title: string;
  description?: string;
  type: PlanType;
  category: string;
  priority: Priority;
  status: PlanStatus;
  startDate: string;
  endDate: string;
  duration: number;
  checklist: { id: string; title: string; completed: boolean }[];
  progress: number;
  createdAt: string;
  imageUrl?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'auto';
  language: 'fa' | 'en' | 'ar';
  calendar: 'jalali' | 'gregorian';
  notifications: boolean;
  sounds: boolean;
  volume: number;
  haptics: boolean;
  dailyReminderTime: string;
  habitReminders: boolean;
  customTaskCategories: string[];
  customHabitCategories: string[];
  customGoalCategories: string[];
}

export interface AICoachSuggestion {
  id: string;
  type: 'motivation' | 'tip' | 'achievement' | 'goal' | 'habit' | 'focus';
  title: string;
  message: string;
  priority: Priority;
  actionable: boolean;
  dismissed: boolean;
  createdAt: string;
}

export type RewardCategory = 'entertainment' | 'food' | 'shopping' | 'travel' | 'self-care' | 'custom';
export type RewardStatus = 'available' | 'locked' | 'claimed' | 'expired';

export interface Reward {
  id: string;
  title: string;
  description?: string;
  category: RewardCategory;
  dollarsRequired: number;
  icon: string;
  status: RewardStatus;
  claimedAt?: string;
  expiresAt?: string;
  customValue?: string;
  motivationalMessage?: string;
  createdAt: string;
  imageUrl?: string;
}

export interface AppState {
  user: User;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  plans: Plan[];
  focusSessions: FocusSession[];
  dailyStats: DailyStats[];
  achievements: Achievement[];
  settings: AppSettings;
  aiSuggestions: AICoachSuggestion[];
  rewards: Reward[];
}
