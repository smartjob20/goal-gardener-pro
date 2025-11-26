import { Task, Habit } from '@/types';
import { format, isToday, parseISO, isBefore, differenceInMinutes } from 'date-fns';
import { toast } from 'sonner';
import { triggerHaptic } from '@/utils/haptics';

interface UpcomingReminder {
  id: string;
  type: 'task' | 'habit';
  title: string;
  time: string;
  minutesUntil: number;
}

class NotificationService {
  private checkInterval: NodeJS.Timeout | null = null;
  private notifiedItems: Set<string> = new Set();
  private isEnabled: boolean = true;

  constructor() {
    const savedState = localStorage.getItem('notifications-enabled');
    this.isEnabled = savedState !== 'false';
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  start(tasks: Task[], habits: Habit[], onUpdate?: () => void) {
    if (this.checkInterval) {
      this.stop();
    }

    this.checkInterval = setInterval(() => {
      this.checkReminders(tasks, habits, onUpdate);
    }, 60000);

    this.checkReminders(tasks, habits, onUpdate);
  }

  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    localStorage.setItem('notifications-enabled', enabled.toString());
  }

  getEnabled(): boolean {
    return this.isEnabled;
  }

  clearCache() {
    this.notifiedItems.clear();
  }

  private checkReminders(tasks: Task[], habits: Habit[], onUpdate?: () => void) {
    if (!this.isEnabled) return;

    const now = new Date();
    const currentTime = format(now, 'HH:mm');

    tasks.forEach(task => {
      if (task.completed || !task.reminderTime) return;

      const itemKey = `task-${task.id}-${format(now, 'yyyy-MM-dd')}`;
      
      if (this.notifiedItems.has(itemKey)) return;

      if (task.deadline) {
        const deadlineDate = parseISO(task.deadline);
        if (isToday(deadlineDate) && task.reminderTime === currentTime) {
          this.showNotification(
            'یادآوری وظیفه',
            `⏰ ${task.title}`,
            task.priority === 'high' ? '🔴 اولویت بالا' : task.priority === 'medium' ? '🟡 اولویت متوسط' : '🟢 اولویت پایین'
          );
          this.notifiedItems.add(itemKey);
          onUpdate?.();
        }
      }
    });

    habits.forEach(habit => {
      if (!habit.isActive || !habit.reminderTime) return;

      const itemKey = `habit-${habit.id}-${format(now, 'yyyy-MM-dd')}`;
      
      if (this.notifiedItems.has(itemKey)) return;

      const todayString = format(now, 'yyyy-MM-dd');
      const completedToday = habit.completedDates?.includes(todayString);
      
      if (!completedToday && habit.reminderTime === currentTime) {
        this.showNotification(
          'یادآوری عادت',
          `🔥 ${habit.title}`,
          habit.frequency === 'daily' ? '📅 روزانه' : habit.frequency === 'weekly' ? '📆 هفتگی' : '📊 ماهانه'
        );
        this.notifiedItems.add(itemKey);
        onUpdate?.();
      }
    });
  }

  private async showNotification(title: string, message: string, description?: string) {
    await triggerHaptic('light');

    const fullMessage = description ? `${message}\n${description}` : message;

    toast(title, {
      description: fullMessage,
      duration: 8000,
      action: {
        label: 'بستن',
        onClick: () => {},
      },
    });

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body: message,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'reminder',
          requireInteraction: false,
        });
      } catch (error) {
        console.log('Browser notification failed:', error);
      }
    }
  }

  getUpcomingReminders(tasks: Task[], habits: Habit[]): UpcomingReminder[] {
    const now = new Date();
    const upcoming: UpcomingReminder[] = [];

    tasks.forEach(task => {
      if (task.completed || !task.reminderTime || !task.deadline) return;
      
      const deadlineDate = parseISO(task.deadline);
      if (isToday(deadlineDate)) {
        const [hours, minutes] = task.reminderTime.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        if (!isBefore(reminderTime, now)) {
          const minutesUntil = differenceInMinutes(reminderTime, now);
          upcoming.push({
            id: task.id,
            type: 'task',
            title: task.title,
            time: task.reminderTime,
            minutesUntil,
          });
        }
      }
    });

    const todayString = format(now, 'yyyy-MM-dd');
    habits.forEach(habit => {
      if (!habit.isActive || !habit.reminderTime) return;
      
      const completedToday = habit.completedDates?.includes(todayString);
      if (!completedToday) {
        const [hours, minutes] = habit.reminderTime.split(':').map(Number);
        const reminderTime = new Date();
        reminderTime.setHours(hours, minutes, 0, 0);
        
        if (!isBefore(reminderTime, now)) {
          const minutesUntil = differenceInMinutes(reminderTime, now);
          upcoming.push({
            id: habit.id,
            type: 'habit',
            title: habit.title,
            time: habit.reminderTime,
            minutesUntil,
          });
        }
      }
    });

    return upcoming.sort((a, b) => a.minutesUntil - b.minutesUntil);
  }
}

export const notificationService = new NotificationService();
