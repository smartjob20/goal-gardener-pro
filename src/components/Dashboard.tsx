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
    <div className="min-h-screen pb-24 custom-scrollbar overflow-y-auto bg-gradient-to-br from-background via-background to-primary/5">
      <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
        {/* Hero Greeting Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3 py-8 md:py-12"
        >
          <motion.div 
            className="text-6xl md:text-7xl mb-3 animate-bounce-in"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            {greeting.emoji}
          </motion.div>
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-glow to-accent">
            {greeting.text}، {user.name} 👋
          </h1>
          <motion.p 
            className="text-base md:text-xl font-semibold gradient-text px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {quote}
          </motion.p>
          <motion.div 
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Zap className="w-4 h-4 text-warning" />
            <span>آماده برای یک روز پرانرژی؟</span>
          </motion.div>
        </motion.div>

        {/* Enhanced Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-4 md:p-5 glass-strong hover-lift cursor-pointer border-success/20 hover:border-success/40 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors">
                  <CheckCircle2 className="w-6 h-6 md:w-7 md:h-7 text-success group-hover:scale-110 transition-transform" />
                </div>
                <Badge variant="outline" className="bg-success/15 text-success border-success/30 font-semibold">
                  امروز
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{completedTasks}/{totalTasks}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">وظایف تکمیل شده</p>
                <Progress value={taskProgress} className="h-2.5" />
                <p className="text-[10px] md:text-xs text-success font-semibold">{Math.round(taskProgress)}% پیشرفت</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-4 md:p-5 glass-strong hover-lift cursor-pointer border-warning/20 hover:border-warning/40 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-warning/10 group-hover:bg-warning/20 transition-colors">
                  <Flame className="w-6 h-6 md:w-7 md:h-7 text-warning group-hover:scale-110 transition-transform" />
                </div>
                <Badge variant="outline" className="bg-warning/15 text-warning border-warning/30 font-semibold">
                  فعال
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{completedHabits}/{todayHabits.length}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">عادت‌های امروز</p>
                <Progress value={habitProgress} className="h-2.5" />
                <p className="text-[10px] md:text-xs text-warning font-semibold">{Math.round(habitProgress)}% پیشرفت</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-4 md:p-5 glass-strong hover-lift cursor-pointer border-info/20 hover:border-info/40 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-info/10 group-hover:bg-info/20 transition-colors">
                  <Clock className="w-6 h-6 md:w-7 md:h-7 text-info group-hover:scale-110 transition-transform" />
                </div>
                <Badge variant="outline" className="bg-info/15 text-info border-info/30 font-semibold">
                  ⏱️
                </Badge>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{todayFocus}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">دقیقه تمرکز</p>
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-info font-semibold bg-info/10 px-2 py-1 rounded-md">
                  <TrendingUp className="w-3 h-3" />
                  <span>امروز در حال پیشرفت</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="p-4 md:p-5 glass-strong hover-lift cursor-pointer border-destructive/20 hover:border-destructive/40 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-warning/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-start justify-between mb-3 relative z-10">
                <div className="p-2 rounded-xl bg-destructive/10 group-hover:bg-destructive/20 transition-colors">
                  <Flame className="w-6 h-6 md:w-7 md:h-7 text-destructive animate-pulse-glow group-hover:animate-heartbeat" />
                </div>
                <Badge variant="outline" className="bg-destructive/15 text-destructive border-destructive/30 font-semibold">
                  🔥
                </Badge>
              </div>
              <div className="space-y-2 relative z-10">
                <h3 className="text-2xl md:text-3xl font-bold text-foreground">{activeStreak}</h3>
                <p className="text-xs md:text-sm text-muted-foreground font-medium">روز Streak فعال</p>
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-destructive font-semibold bg-destructive/10 px-2 py-1 rounded-md">
                  <Zap className="w-3 h-3 animate-wiggle" />
                  <span>فوق‌العاده! ادامه بده 💪</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Level Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="p-6 md:p-8 glass-strong hover-glow transition-all duration-300 border-primary/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-4xl md:text-5xl border-4 border-primary/30 shadow-lg"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {user.avatar}
                </motion.div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                    <span className="gradient-text">سطح {user.level}</span>
                    <Zap className="w-5 h-5 text-warning" />
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground font-medium">
                    {user.xp} / {user.level * 100} XP
                  </p>
                  <p className="text-xs text-primary font-semibold mt-1">
                    {user.xpToNextLevel} XP تا سطح بعد
                  </p>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Badge className="gradient-bg-primary text-primary-foreground shadow-lg px-4 py-2 text-sm md:text-base">
                  <Trophy className="w-5 h-5 ml-2" />
                  {unlockedAchievements.length} دستاورد
                </Badge>
              </motion.div>
            </div>
            <div className="relative z-10 space-y-3">
              <Progress value={levelProgress} className="h-4 shadow-inner" />
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-primary">پیشرفت: {Math.round(levelProgress)}%</span>
                <span className="text-muted-foreground">سطح بعد: {user.level + 1}</span>
              </div>
            </div>
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
