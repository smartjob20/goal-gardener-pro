import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { getGreeting, getMotivationalQuote, getTodayString } from '@/utils/dateUtils';
import { CheckCircle2, Flame, Clock, Trophy, TrendingUp, Zap } from 'lucide-react';

export default function Dashboard() {
  const { state } = useApp();
  const { user, tasks, habits, focusSessions, achievements } = state;
  
  const greeting = getGreeting();
  const quote = getMotivationalQuote();
  
  // Calculate today's stats
  const today = getTodayString();
  const todayTasks = tasks.filter(t => t.createdAt.startsWith(today));
  const completedTasks = todayTasks.filter(t => t.completed).length;
  const totalTasks = todayTasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  
  const todayHabits = habits.filter(h => h.isActive);
  const completedHabits = todayHabits.filter(h => h.completedDates.includes(today)).length;
  const habitProgress = todayHabits.length > 0 ? (completedHabits / todayHabits.length) * 100 : 0;
  
  const todayFocus = focusSessions
    .filter(s => s.startTime.startsWith(today))
    .reduce((acc, s) => acc + s.duration, 0);
  
  const activeStreak = Math.max(...habits.map(h => h.currentStreak), 0);
  const levelProgress = (user.xp / (user.level * 100)) * 100;
  
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const recentAchievements = unlockedAchievements.slice(-3);

  return (
    <div className="min-h-screen pb-24 p-4 custom-scrollbar overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2 py-6"
        >
          <div className="text-5xl mb-2">{greeting.emoji}</div>
          <h1 className="text-3xl font-bold">
            {greeting.text}، {user.name}
          </h1>
          <p className="text-lg text-muted-foreground gradient-text font-semibold">
            {quote}
          </p>
        </motion.div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-4 glass hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <CheckCircle2 className="w-8 h-8 text-success" />
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  امروز
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{completedTasks}/{totalTasks}</h3>
                <p className="text-sm text-muted-foreground">وظایف تکمیل شده</p>
                <Progress value={taskProgress} className="h-2" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-4 glass hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <Flame className="w-8 h-8 text-warning" />
                <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                  فعال
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{completedHabits}/{todayHabits.length}</h3>
                <p className="text-sm text-muted-foreground">عادت‌های امروز</p>
                <Progress value={habitProgress} className="h-2" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-4 glass hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <Clock className="w-8 h-8 text-info" />
                <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                  ⏱️
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{todayFocus}</h3>
                <p className="text-sm text-muted-foreground">دقیقه تمرکز</p>
                <div className="flex items-center gap-1 text-xs text-info">
                  <TrendingUp className="w-3 h-3" />
                  <span>امروز</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-4 glass hover:scale-105 transition-transform cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <Flame className="w-8 h-8 text-destructive animate-glow" />
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                  🔥
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{activeStreak}</h3>
                <p className="text-sm text-muted-foreground">روز Streak</p>
                <div className="flex items-center gap-1 text-xs text-destructive">
                  <Zap className="w-3 h-3" />
                  <span>ادامه بده!</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="p-6 glass">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div>
                  <h3 className="font-semibold">سطح {user.level}</h3>
                  <p className="text-sm text-muted-foreground">{user.xp} / {user.level * 100} XP</p>
                </div>
              </div>
              <Badge className="bg-primary text-primary-foreground">
                <Trophy className="w-4 h-4 ml-1" />
                {unlockedAchievements.length} دستاورد
              </Badge>
            </div>
            <Progress value={levelProgress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {user.xpToNextLevel} XP تا سطح بعد
            </p>
          </Card>
        </motion.div>

        {/* Recent Achievements */}
        {recentAchievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-warning" />
                آخرین دستاوردها
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="text-3xl animate-bounce-in">{achievement.icon}</div>
                    <p className="text-xs font-medium text-center">{achievement.title}</p>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Quick Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="p-6 glass">
            <h3 className="text-lg font-semibold mb-4">خلاصه کلی</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{user.totalTasksCompleted}</p>
                <p className="text-sm text-muted-foreground mt-1">وظیفه انجام شده</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{habits.length}</p>
                <p className="text-sm text-muted-foreground mt-1">عادت فعال</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-info">{Math.floor(user.totalFocusTime / 60)}</p>
                <p className="text-sm text-muted-foreground mt-1">ساعت تمرکز</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-warning">{user.longestStreak}</p>
                <p className="text-sm text-muted-foreground mt-1">طولانی‌ترین Streak</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
