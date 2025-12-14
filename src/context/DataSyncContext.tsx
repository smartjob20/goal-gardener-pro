import React, { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { Task, Habit, Goal, Plan, Reward } from '@/types';

interface DataSyncContextType {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncNow: () => Promise<void>;
}

const DataSyncContext = createContext<DataSyncContextType | undefined>(undefined);

export const DataSyncProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { state, dispatch } = useApp();
  const syncingRef = useRef(false);
  const lastSyncRef = useRef<string | null>(null);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncTime, setLastSyncTime] = React.useState<Date | null>(null);
  const initialLoadDone = useRef(false);

  // Load data from Supabase on login
  const loadFromCloud = useCallback(async () => {
    if (!user || syncingRef.current || initialLoadDone.current) return;

    try {
      syncingRef.current = true;
      setIsSyncing(true);
      console.log('Loading data from cloud for user:', user.id);

      const [
        { data: tasks },
        { data: habits },
        { data: goals },
        { data: plans },
        { data: rewards }
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('plans').select('*').eq('user_id', user.id),
        supabase.from('rewards').select('*').eq('user_id', user.id)
      ]);

      // Transform and load tasks
      if (tasks && tasks.length > 0) {
        const transformedTasks: Task[] = tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          priority: t.priority as 'low' | 'medium' | 'high',
          category: t.category,
          deadline: t.deadline || undefined,
          completed: t.completed || false,
          completedAt: t.completed_at || undefined,
          xpReward: t.xp_reward || 10,
          subtasks: (t.subtasks as any[]) || [],
          createdAt: t.created_at || new Date().toISOString()
        }));
        
        // Merge with existing tasks (cloud takes priority)
        const existingIds = new Set(transformedTasks.map(t => t.id));
        const localOnlyTasks = state.tasks.filter(t => !existingIds.has(t.id));
        
        transformedTasks.forEach(task => {
          dispatch({ type: 'UPDATE_TASK', payload: task });
        });
        localOnlyTasks.forEach(task => {
          dispatch({ type: 'ADD_TASK', payload: task });
        });
      }

      // Transform and load habits
      if (habits && habits.length > 0) {
        const transformedHabits: Habit[] = habits.map(h => ({
          id: h.id,
          title: h.title,
          description: h.description || '',
          category: h.category,
          frequency: h.frequency as 'daily' | 'weekly' | 'custom',
          target: h.target || 1,
          targetUnit: 'بار',
          currentStreak: h.current_streak || 0,
          longestStreak: h.longest_streak || 0,
          completedDates: (h.completed_dates as string[]) || [],
          reminderTime: h.reminder_time || undefined,
          reminderEnabled: !!h.reminder_time,
          xpReward: h.xp_per_completion || 5,
          createdAt: h.created_at || new Date().toISOString(),
          isActive: h.active ?? true,
          color: '#10b981',
          habitType: 'quantitative' as const,
          difficulty: (h.difficulty || 'medium') as 'easy' | 'medium' | 'hard'
        }));
        
        transformedHabits.forEach(habit => {
          dispatch({ type: 'UPDATE_HABIT', payload: habit });
        });
      }

      // Transform and load goals
      if (goals && goals.length > 0) {
        const transformedGoals: Goal[] = goals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          category: g.category as any,
          targetDate: g.target_date || new Date().toISOString(),
          milestones: (g.milestones as any[]) || [],
          progress: g.progress || 0,
          xpReward: 50,
          status: g.completed ? 'completed' : 'active' as 'active' | 'completed' | 'paused',
          createdAt: g.created_at || new Date().toISOString()
        }));
        
        transformedGoals.forEach(goal => {
          dispatch({ type: 'UPDATE_GOAL', payload: goal });
        });
      }

      // Transform and load plans
      if (plans && plans.length > 0) {
        const transformedPlans: Plan[] = plans.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          type: p.type as 'habit' | 'goal' | 'routine',
          category: 'personal',
          priority: 'medium' as const,
          startDate: p.start_date || new Date().toISOString(),
          endDate: p.end_date || new Date().toISOString(),
          duration: 0,
          checklist: (p.checklist as any[]) || [],
          progress: 0,
          status: (p.status || 'active') as 'planning' | 'active' | 'completed' | 'paused',
          createdAt: p.created_at || new Date().toISOString()
        }));
        
        transformedPlans.forEach(plan => {
          dispatch({ type: 'UPDATE_PLAN', payload: plan });
        });
      }

      // Transform and load rewards
      if (rewards && rewards.length > 0) {
        const transformedRewards: Reward[] = rewards.map(r => ({
          id: r.id,
          title: r.title,
          description: r.description || '',
          category: 'custom' as const,
          icon: '🎁',
          xpRequired: r.xp_cost || 0,
          status: r.redeemed ? 'claimed' : 'available' as 'locked' | 'available' | 'claimed',
          claimedAt: r.redeemed_at || undefined,
          createdAt: r.created_at || new Date().toISOString()
        }));
        
        transformedRewards.forEach(reward => {
          dispatch({ type: 'UPDATE_REWARD', payload: reward });
        });
      }

      initialLoadDone.current = true;
      setLastSyncTime(new Date());
      console.log('Data loaded from cloud successfully');
    } catch (error) {
      console.error('Error loading from cloud:', error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [user, dispatch]);

  // Sync local changes to Supabase
  const syncToCloud = useCallback(async () => {
    if (!user || syncingRef.current || !initialLoadDone.current) return;

    const dataHash = JSON.stringify({
      tasks: state.tasks.length,
      habits: state.habits.length,
      goals: state.goals.length,
      plans: state.plans.length,
      rewards: state.rewards.length
    });
    
    if (dataHash === lastSyncRef.current) return;

    try {
      syncingRef.current = true;
      setIsSyncing(true);
      lastSyncRef.current = dataHash;

      // Sync tasks
      if (state.tasks.length > 0) {
        for (const task of state.tasks) {
          await supabase.from('tasks').upsert({
            id: task.id,
            user_id: user.id,
            title: task.title,
            description: task.description || null,
            priority: task.priority,
            category: task.category,
            deadline: task.deadline || null,
            completed: task.completed,
            completed_at: task.completedAt || null,
            xp_reward: task.xpReward,
            subtasks: JSON.parse(JSON.stringify(task.subtasks || []))
          }, { onConflict: 'id' });
        }
      }

      // Sync habits
      if (state.habits.length > 0) {
        for (const habit of state.habits) {
          await supabase.from('habits').upsert({
            id: habit.id,
            user_id: user.id,
            title: habit.title,
            description: habit.description || null,
            category: habit.category,
            frequency: habit.frequency,
            target: habit.target,
            current_streak: habit.currentStreak,
            longest_streak: habit.longestStreak,
            completed_dates: habit.completedDates,
            reminder_time: habit.reminderTime || null,
            xp_per_completion: habit.xpReward,
            active: habit.isActive,
            difficulty: habit.difficulty
          }, { onConflict: 'id' });
        }
      }

      // Sync goals
      if (state.goals.length > 0) {
        for (const goal of state.goals) {
          await supabase.from('goals').upsert({
            id: goal.id,
            user_id: user.id,
            title: goal.title,
            description: goal.description || null,
            category: goal.category,
            target_date: goal.targetDate || null,
            milestones: JSON.parse(JSON.stringify(goal.milestones || [])),
            progress: goal.progress,
            completed: goal.status === 'completed'
          }, { onConflict: 'id' });
        }
      }

      // Sync plans
      if (state.plans.length > 0) {
        for (const plan of state.plans) {
          await supabase.from('plans').upsert({
            id: plan.id,
            user_id: user.id,
            title: plan.title,
            description: plan.description || null,
            type: plan.type,
            start_date: plan.startDate || null,
            end_date: plan.endDate || null,
            checklist: JSON.parse(JSON.stringify(plan.checklist || [])),
            status: plan.status
          }, { onConflict: 'id' });
        }
      }

      // Sync rewards
      if (state.rewards.length > 0) {
        for (const reward of state.rewards) {
          await supabase.from('rewards').upsert({
            id: reward.id,
            user_id: user.id,
            title: reward.title,
            description: reward.description || null,
            xp_cost: reward.xpRequired,
            redeemed: reward.status === 'claimed',
            redeemed_at: reward.claimedAt || null
          }, { onConflict: 'id' });
        }
      }

      setLastSyncTime(new Date());
      console.log('Data synced to cloud');
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    } finally {
      syncingRef.current = false;
      setIsSyncing(false);
    }
  }, [user, state.tasks, state.habits, state.goals, state.plans, state.rewards]);

  // Load from cloud on login
  useEffect(() => {
    if (user && !initialLoadDone.current) {
      loadFromCloud();
    }
  }, [user, loadFromCloud]);

  // Reset on logout
  useEffect(() => {
    if (!user) {
      initialLoadDone.current = false;
      lastSyncRef.current = null;
    }
  }, [user]);

  // Debounced sync to cloud when state changes
  useEffect(() => {
    if (!user || !initialLoadDone.current) return;

    const timeoutId = setTimeout(() => {
      syncToCloud();
    }, 3000); // Debounce 3 seconds

    return () => clearTimeout(timeoutId);
  }, [user, state.tasks, state.habits, state.goals, state.plans, state.rewards, syncToCloud]);

  const syncNow = async () => {
    await syncToCloud();
  };

  return (
    <DataSyncContext.Provider value={{ isSyncing, lastSyncTime, syncNow }}>
      {children}
    </DataSyncContext.Provider>
  );
};

export const useDataSync = () => {
  const context = useContext(DataSyncContext);
  if (!context) {
    throw new Error('useDataSync must be used within DataSyncProvider');
  }
  return context;
};
