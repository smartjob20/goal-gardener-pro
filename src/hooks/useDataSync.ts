import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { AppState, Task, Habit, Goal, Plan, FocusSession, Reward } from '@/types';

interface SyncableData {
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  plans: Plan[];
  focusSessions: FocusSession[];
  rewards: Reward[];
}

export const useDataSync = (
  state: AppState,
  loadState: (data: Partial<AppState>) => void
) => {
  const { user } = useAuth();
  const lastSyncRef = useRef<string | null>(null);
  const syncingRef = useRef(false);

  // Load data from Supabase on login
  const loadFromCloud = useCallback(async () => {
    if (!user || syncingRef.current) return;

    try {
      syncingRef.current = true;
      console.log('Loading data from cloud...');

      // Load all data in parallel
      const [
        { data: tasks },
        { data: habits },
        { data: goals },
        { data: plans },
        { data: focusSessions },
        { data: rewards }
      ] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('plans').select('*').eq('user_id', user.id),
        supabase.from('focus_sessions').select('*').eq('user_id', user.id),
        supabase.from('rewards').select('*').eq('user_id', user.id)
      ]);

      // Transform database records to app format
      const transformedData: Partial<SyncableData> = {};

      if (tasks && tasks.length > 0) {
        transformedData.tasks = tasks.map(t => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          priority: t.priority as 'low' | 'medium' | 'high',
          category: t.category,
          deadline: t.deadline || undefined,
          completed: t.completed || false,
          completedAt: t.completed_at || undefined,
          xpReward: t.xp_reward || 10,
          subtasks: t.subtasks as any[] || [],
          createdAt: t.created_at || new Date().toISOString()
        }));
      }

      if (habits && habits.length > 0) {
        transformedData.habits = habits.map(h => ({
          id: h.id,
          title: h.title,
          description: h.description || '',
          category: h.category,
          frequency: h.frequency as 'daily' | 'weekly' | 'custom',
          target: h.target || 1,
          targetUnit: 'بار',
          currentStreak: h.current_streak || 0,
          longestStreak: h.longest_streak || 0,
          completedDates: h.completed_dates as string[] || [],
          reminderTime: h.reminder_time || undefined,
          reminderEnabled: !!h.reminder_time,
          xpReward: h.xp_per_completion || 5,
          createdAt: h.created_at || new Date().toISOString(),
          isActive: h.active ?? true,
          color: '#10b981',
          habitType: 'quantitative' as const,
          difficulty: (h.difficulty || 'medium') as 'easy' | 'medium' | 'hard'
        }));
      }

      if (goals && goals.length > 0) {
        transformedData.goals = goals.map(g => ({
          id: g.id,
          title: g.title,
          description: g.description || '',
          category: g.category as any,
          targetDate: g.target_date || new Date().toISOString(),
          milestones: g.milestones as any[] || [],
          progress: g.progress || 0,
          xpReward: 50,
          status: g.completed ? 'completed' : 'active' as 'active' | 'completed' | 'paused',
          createdAt: g.created_at || new Date().toISOString()
        }));
      }

      if (plans && plans.length > 0) {
        transformedData.plans = plans.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description || '',
          type: p.type as 'habit' | 'goal' | 'routine',
          category: 'personal',
          priority: 'medium' as const,
          startDate: p.start_date || new Date().toISOString(),
          endDate: p.end_date || new Date().toISOString(),
          duration: 0,
          checklist: p.checklist as any[] || [],
          progress: 0,
          status: (p.status || 'active') as 'planning' | 'active' | 'completed' | 'paused',
          createdAt: p.created_at || new Date().toISOString()
        }));
      }

      if (focusSessions && focusSessions.length > 0) {
        transformedData.focusSessions = focusSessions.map(f => ({
          id: f.id,
          startTime: f.start_time,
          endTime: f.end_time || undefined,
          duration: f.duration || 0,
          taskId: f.task_id || undefined,
          completed: !!f.end_time,
          xpEarned: Math.floor((f.duration || 0) / 60) * 2
        }));
      }

      if (rewards && rewards.length > 0) {
        transformedData.rewards = rewards.map(r => ({
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
      }

      // Only load if we have cloud data
      if (Object.keys(transformedData).length > 0) {
        loadState(transformedData);
        console.log('Data loaded from cloud successfully');
      }

    } catch (error) {
      console.error('Error loading from cloud:', error);
    } finally {
      syncingRef.current = false;
    }
  }, [user, loadState]);

  // Sync local changes to Supabase
  const syncToCloud = useCallback(async (data: SyncableData) => {
    if (!user || syncingRef.current) return;

    const dataHash = JSON.stringify(data);
    if (dataHash === lastSyncRef.current) return;

    try {
      syncingRef.current = true;
      lastSyncRef.current = dataHash;

      // Batch upsert tasks
      if (data.tasks.length > 0) {
        const tasksToUpsert = data.tasks.map(task => ({
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
        }));
        await supabase.from('tasks').upsert(tasksToUpsert, { onConflict: 'id' });
      }

      // Batch upsert habits
      if (data.habits.length > 0) {
        const habitsToUpsert = data.habits.map(habit => ({
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
        }));
        await supabase.from('habits').upsert(habitsToUpsert, { onConflict: 'id' });
      }

      // Batch upsert goals
      if (data.goals.length > 0) {
        const goalsToUpsert = data.goals.map(goal => ({
          id: goal.id,
          user_id: user.id,
          title: goal.title,
          description: goal.description || null,
          category: goal.category,
          target_date: goal.targetDate || null,
          milestones: JSON.parse(JSON.stringify(goal.milestones || [])),
          progress: goal.progress,
          completed: goal.status === 'completed'
        }));
        await supabase.from('goals').upsert(goalsToUpsert, { onConflict: 'id' });
      }

      // Batch upsert plans
      if (data.plans.length > 0) {
        const plansToUpsert = data.plans.map(plan => ({
          id: plan.id,
          user_id: user.id,
          title: plan.title,
          description: plan.description || null,
          type: plan.type,
          start_date: plan.startDate || null,
          end_date: plan.endDate || null,
          checklist: plan.checklist || [],
          status: plan.status
        }));
        await supabase.from('plans').upsert(plansToUpsert, { onConflict: 'id' });
      }

      // Batch upsert rewards
      if (data.rewards.length > 0) {
        const rewardsToUpsert = data.rewards.map(reward => ({
          id: reward.id,
          user_id: user.id,
          title: reward.title,
          description: reward.description || null,
          xp_cost: reward.xpRequired,
          redeemed: reward.status === 'claimed',
          redeemed_at: reward.claimedAt || null
        }));
        await supabase.from('rewards').upsert(rewardsToUpsert, { onConflict: 'id' });
      }

      console.log('Data synced to cloud');
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    } finally {
      syncingRef.current = false;
    }
  }, [user]);

  // Load from cloud on login
  useEffect(() => {
    if (user) {
      loadFromCloud();
    }
  }, [user, loadFromCloud]);

  // Debounced sync to cloud when state changes
  useEffect(() => {
    if (!user) return;

    const syncData: SyncableData = {
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      plans: state.plans,
      focusSessions: state.focusSessions,
      rewards: state.rewards
    };

    const timeoutId = setTimeout(() => {
      syncToCloud(syncData);
    }, 2000); // Debounce 2 seconds

    return () => clearTimeout(timeoutId);
  }, [user, state.tasks, state.habits, state.goals, state.plans, state.focusSessions, state.rewards, syncToCloud]);

  return { loadFromCloud, syncToCloud };
};
