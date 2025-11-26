import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, Clock, Award, CheckCircle, BarChart3, Calendar, Download, Trophy, FileText, Sparkles, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { format, subDays, isAfter } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { generatePDFReport } from './PDFExport';

type TimeRange = '7' | '30' | '90' | '365' | 'all';

const Analytics = () => {
  const { state } = useApp();
  const { isPro } = useSubscription();
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate date range
  const getDateRange = () => {
    const now = new Date();
    switch (timeRange) {
      case '7':
        return subDays(now, 7);
      case '30':
        return subDays(now, 30);
      case '90':
        return subDays(now, 90);
      case '365':
        return subDays(now, 365);
      case 'all':
        return new Date(0);
      default:
        return subDays(now, 30);
    }
  };
  const startDate = getDateRange();

  // Filter data by date range
  const filteredTasks = state.tasks.filter(task => task.completedAt && isAfter(new Date(task.completedAt), startDate));
  const filteredHabits = state.habits.filter(habit => habit.completedDates.some(date => isAfter(new Date(date), startDate)));
  const filteredFocusSessions = state.focusSessions.filter(session => session.completed && isAfter(new Date(session.startTime), startDate));
  const filteredGoals = state.goals.filter(goal => goal.status === 'completed' && isAfter(new Date(goal.createdAt), startDate));

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTasks = filteredTasks.length;
    const totalHabitsCompleted = filteredHabits.reduce((acc, habit) => acc + habit.completedDates.filter(date => isAfter(new Date(date), startDate)).length, 0);
    const totalFocusTime = filteredFocusSessions.reduce((acc, session) => acc + session.duration, 0);
    const totalXP = filteredTasks.reduce((acc, task) => acc + task.xpReward, 0) + filteredFocusSessions.reduce((acc, session) => acc + session.xpEarned, 0) + filteredGoals.reduce((acc, goal) => goal.xpReward || 0, 0);
    const currentStreak = Math.max(...state.habits.map(h => h.currentStreak), 0);
    const longestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);
    const completionRate = state.tasks.length > 0 ? state.tasks.filter(t => t.completed).length / state.tasks.length * 100 : 0;
    const avgFocusSession = filteredFocusSessions.length > 0 ? totalFocusTime / filteredFocusSessions.length : 0;

    return {
      totalTasks,
      totalHabitsCompleted,
      totalFocusTime,
      totalXP,
      currentStreak,
      longestStreak,
      completionRate,
      avgFocusSession,
      totalGoals: filteredGoals.length,
      focusSessions: filteredFocusSessions.length
    };
  }, [filteredTasks, filteredHabits, filteredFocusSessions, filteredGoals, state.habits, state.tasks, startDate]);

  // Productivity over time data
  const productivityData = useMemo(() => {
    const days: { [key: string]: { tasks: number; habits: number; focus: number; xp: number } } = {};

    // Initialize days
    const dayCount = timeRange === 'all' ? 30 : parseInt(timeRange);
    for (let i = 0; i < Math.min(dayCount, 30); i++) {
      const date = format(subDays(new Date(), dayCount - i - 1), 'yyyy-MM-dd');
      days[date] = { tasks: 0, habits: 0, focus: 0, xp: 0 };
    }

    // Aggregate data
    filteredTasks.forEach(task => {
      if (task.completedAt) {
        const date = format(new Date(task.completedAt), 'yyyy-MM-dd');
        if (days[date]) {
          days[date].tasks += 1;
          days[date].xp += task.xpReward;
        }
      }
    });

    filteredFocusSessions.forEach(session => {
      const date = format(new Date(session.startTime), 'yyyy-MM-dd');
      if (days[date]) {
        days[date].focus += session.duration;
        days[date].xp += session.xpEarned;
      }
    });

    filteredHabits.forEach(habit => {
      habit.completedDates.forEach(dateStr => {
        const date = format(new Date(dateStr), 'yyyy-MM-dd');
        if (days[date]) {
          days[date].habits += 1;
        }
      });
    });

    return Object.entries(days).map(([date, data]) => ({
      date: format(new Date(date), 'MM/dd'),
      وظایف: data.tasks,
      عادات: data.habits,
      'تمرکز (دقیقه)': data.focus,
      XP: data.xp
    }));
  }, [filteredTasks, filteredFocusSessions, filteredHabits, timeRange]);

  // Category breakdown
  const taskCategoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredTasks.forEach(task => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });

    const labels: { [key: string]: string } = {
      work: 'کار',
      study: 'مطالعه',
      health: 'سلامت',
      personal: 'شخصی',
      project: 'پروژه'
    };

    return Object.entries(categories).map(([name, value]) => ({
      name: labels[name] || name,
      value
    }));
  }, [filteredTasks]);

  const habitCategoryData = useMemo(() => {
    const categories: { [key: string]: number } = {};
    filteredHabits.forEach(habit => {
      const count = habit.completedDates.filter(date => isAfter(new Date(date), startDate)).length;
      categories[habit.category] = (categories[habit.category] || 0) + count;
    });

    const labels: { [key: string]: string } = {
      health: 'سلامت',
      fitness: 'ورزش',
      nutrition: 'تغذیه',
      productivity: 'بهره‌وری',
      learning: 'یادگیری',
      mindfulness: 'آرامش',
      social: 'اجتماعی',
      creativity: 'خلاقیت',
      finance: 'مالی',
      relationship: 'روابط'
    };

    return Object.entries(categories).map(([name, value]) => ({
      name: labels[name] || name,
      value
    }));
  }, [filteredHabits, startDate]);

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorities: { [key: string]: number } = {
      high: 0,
      medium: 0,
      low: 0
    };

    filteredTasks.forEach(task => {
      priorities[task.priority] += 1;
    });

    const labels: { [key: string]: string } = {
      high: 'بالا',
      medium: 'متوسط',
      low: 'پایین'
    };

    return Object.entries(priorities).map(([name, value]) => ({
      name: labels[name],
      value
    }));
  }, [filteredTasks]);

  // Colors for charts
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6'];

  // Export data
  const exportData = () => {
    const data = {
      timeRange,
      stats,
      tasks: filteredTasks,
      habits: filteredHabits,
      focusSessions: filteredFocusSessions,
      goals: filteredGoals,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 pb-24 max-w-7xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-[80px] space-y-6"
      >
        {/* Header Section */}
        <div className="text-center space-y-3 mb-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <BarChart3 className="h-8 w-8 text-primary" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
              آمار و گزارش‌گیری
            </h1>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            تحلیل دقیق عملکرد، پیشرفت و دستاوردهای شما
          </p>
        </div>

        {/* Time Range & Export Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-center">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as TimeRange)}>
            <SelectTrigger className="w-full sm:w-[180px] min-h-[48px] text-base">
              <Calendar className="ms-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 روز اخیر</SelectItem>
              <SelectItem value="30">30 روز اخیر</SelectItem>
              <SelectItem value="90">90 روز اخیر</SelectItem>
              <SelectItem value="365">یک سال اخیر</SelectItem>
              <SelectItem value="all">همه زمان‌ها</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => generatePDFReport(state)}
            className="min-h-[48px] w-full sm:w-auto text-base"
          >
            <FileText className="ms-2 h-4 w-4" />
            گزارش PDF
          </Button>

          <Button
            variant="outline"
            onClick={exportData}
            className="min-h-[48px] w-full sm:w-auto text-base"
          >
            <Download className="ms-2 h-4 w-4" />
            دانلود JSON
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 h-auto min-h-[48px] p-1 gap-1 mb-6">
            <TabsTrigger value="overview" className="min-h-[44px] text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BarChart3 className="ms-1 h-4 w-4" />
              نمای کلی
            </TabsTrigger>
            <TabsTrigger value="tasks" className="min-h-[44px] text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <CheckCircle className="ms-1 h-4 w-4" />
              وظایف
            </TabsTrigger>
            <TabsTrigger value="habits" className="min-h-[44px] text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Target className="ms-1 h-4 w-4" />
              عادات
            </TabsTrigger>
            <TabsTrigger value="focus" className="min-h-[44px] text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="ms-1 h-4 w-4" />
              تمرکز
            </TabsTrigger>
            <TabsTrigger value="achievements" className="min-h-[44px] text-sm sm:text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Trophy className="ms-1 h-4 w-4" />
              دستاوردها
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 mt-0">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-primary/20 hover:border-primary/40 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-3xl font-bold text-primary">{stats.totalTasks}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">وظایف تکمیل شده</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-accent/20 hover:border-accent/40 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Target className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-3xl font-bold text-accent">{stats.totalHabitsCompleted}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">عادات انجام شده</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-secondary/20 hover:border-secondary/40 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-secondary/10 rounded-lg">
                        <Clock className="h-5 w-5 text-secondary-foreground" />
                      </div>
                      <span className="text-3xl font-bold text-secondary-foreground">{stats.totalFocusTime}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">دقیقه تمرکز</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-amber-500/20 hover:border-amber-500/40 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Zap className="h-5 w-5 text-amber-500" />
                      </div>
                      <span className="text-3xl font-bold text-amber-500">{stats.totalXP}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">XP کسب شده</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-purple-500/20 hover:border-purple-500/40 transition-all">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Trophy className="h-5 w-5 text-purple-500" />
                      </div>
                      <span className="text-3xl font-bold text-purple-500">{stats.currentStreak}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">روز استریک فعلی</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-primary/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">نرخ تکمیل وظایف</CardTitle>
                    <Badge variant="secondary" className="text-xs">
                      {stats.completionRate >= 80 ? '🎉 عالی' : stats.completionRate >= 50 ? '👍 خوب' : '💪 ادامه بده'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">پیشرفت</span>
                    <span className="text-2xl font-bold text-primary">{stats.completionRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-3" />
                  <p className="text-xs text-muted-foreground text-center">
                    {state.tasks.filter(t => t.completed).length} از {state.tasks.length} وظیفه
                  </p>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">میانگین جلسه تمرکز</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-accent">{stats.avgFocusSession.toFixed(0)}</span>
                    <span className="text-lg text-muted-foreground">دقیقه</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    از {stats.focusSessions} جلسه تکمیل شده
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <Clock className="h-3 w-3" />
                    <span>هدف توصیه شده: 25-45 دقیقه</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-purple-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">استریک‌های شما</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">استریک فعلی</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-4 w-4 text-purple-500" />
                      <span className="text-2xl font-bold text-purple-500">{stats.currentStreak}</span>
                      <span className="text-sm">روز</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">بهترین استریک</span>
                    <div className="flex items-center gap-1">
                      <Award className="h-4 w-4 text-amber-500" />
                      <span className="text-2xl font-bold text-amber-500">{stats.longestStreak}</span>
                      <span className="text-sm">روز</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Productivity Chart */}
            <Card className={`border-primary/20 ${!isPro ? 'relative overflow-hidden' : ''}`}>
              {!isPro && (
                <div className="absolute inset-0 bg-background/90 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-3 p-6"
                  >
                    <div className="flex justify-center">
                      <div className="p-4 bg-primary/10 rounded-full">
                        <Sparkles className="h-8 w-8 text-primary" />
                      </div>
                    </div>
                    <p className="font-bold text-xl">نمودارهای تفصیلی ویژه کاربران Pro</p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      برای دسترسی به تحلیل‌های پیشرفته و نمودارهای دقیق، به نسخه Pro ارتقا دهید
                    </p>
                    <Button className="mt-4">ارتقا به Pro</Button>
                  </motion.div>
                </div>
              )}
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">روند بهره‌وری</CardTitle>
                    <CardDescription className="mt-1">تحلیل فعالیت‌های روزانه در بازه زمانی انتخابی</CardDescription>
                  </div>
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorHabits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis dataKey="date" style={{ fontSize: '12px' }} />
                    <YAxis style={{ fontSize: '12px' }} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                    <Legend wrapperStyle={{ fontSize: '14px' }} />
                    <Area type="monotone" dataKey="وظایف" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTasks)" />
                    <Area type="monotone" dataKey="عادات" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorHabits)" />
                    <Area type="monotone" dataKey="XP" stroke="#F59E0B" fillOpacity={1} fill="url(#colorXP)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    توزیع بر اساس دسته‌بندی
                  </CardTitle>
                  <CardDescription>تحلیل وظایف بر اساس دسته‌بندی</CardDescription>
                </CardHeader>
                <CardContent>
                  {taskCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={taskCategoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={(entry) => `${entry.name}: ${entry.value}`}
                          outerRadius={90}
                          fill="hsl(var(--primary))"
                          dataKey="value"
                        >
                          {taskCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-2">
                      <TrendingDown className="h-12 w-12 text-muted-foreground/40" />
                      <p className="text-muted-foreground">هنوز وظیفه‌ای تکمیل نشده</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <Target className="h-4 w-4 text-accent" />
                    </div>
                    توزیع اولویت
                  </CardTitle>
                  <CardDescription>تحلیل وظایف بر اساس اولویت</CardDescription>
                </CardHeader>
                <CardContent>
                  {priorityData.some(p => p.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={priorityData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex flex-col items-center justify-center text-center space-y-2">
                      <TrendingDown className="h-12 w-12 text-muted-foreground/40" />
                      <p className="text-muted-foreground">هنوز وظیفه‌ای تکمیل نشده</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Tasks by XP */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      وظایف برتر بر اساس XP
                    </CardTitle>
                    <CardDescription className="mt-1">10 وظیفه با بیشترین امتیاز</CardDescription>
                  </div>
                  <Badge variant="secondary">{filteredTasks.length} وظیفه</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredTasks.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTasks
                      .sort((a, b) => b.xpReward - a.xpReward)
                      .slice(0, 10)
                      .map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-l from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                              {index + 1}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-base">{task.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{task.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-amber-500" />
                            <span className="font-bold text-lg text-amber-500">{task.xpReward}</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-4 bg-muted/50 rounded-full">
                      <CheckCircle className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">هنوز وظیفه‌ای تکمیل نشده</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">با تکمیل وظایف، آمار خود را ببینید</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-6 mt-0">
            <Card className="border-accent/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <BarChart3 className="h-4 w-4 text-accent" />
                      </div>
                      توزیع عادات بر اساس دسته‌بندی
                    </CardTitle>
                    <CardDescription className="mt-1">تحلیل تکمیل عادات در هر دسته</CardDescription>
                  </div>
                </div>
              </CardHeader>
                <CardContent>
                  {habitCategoryData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={habitCategoryData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="name" style={{ fontSize: '12px' }} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="value" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex flex-col items-center justify-center text-center space-y-2">
                      <TrendingDown className="h-12 w-12 text-muted-foreground/40" />
                      <p className="text-muted-foreground">هنوز عادتی انجام نشده</p>
                    </div>
                  )}
                </CardContent>
            </Card>

            {/* Top Habits */}
            <Card className="border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-purple-500" />
                      عادات برتر
                    </CardTitle>
                    <CardDescription className="mt-1">بر اساس استریک و تعداد تکمیل</CardDescription>
                  </div>
                  <Badge variant="secondary">{state.habits.length} عادت</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {state.habits.length > 0 ? (
                  <div className="space-y-3">
                    {state.habits
                      .sort((a, b) => b.longestStreak - a.longestStreak)
                      .slice(0, 10)
                      .map((habit, index) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gradient-to-l from-purple-500/5 to-transparent rounded-lg border border-purple-500/10 hover:border-purple-500/20 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-500/10 text-purple-500 font-bold">
                              {index + 1}
                            </div>
                            <div className="text-right">
                              <p className="font-medium text-base">{habit.title}</p>
                              <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                <span>استریک فعلی: {habit.currentStreak}</span>
                                <span>•</span>
                                <span>بهترین: {habit.longestStreak}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-amber-500" />
                            <span className="font-bold text-lg text-purple-500">{habit.completedDates.length}</span>
                            <span className="text-sm text-muted-foreground">بار</span>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-4 bg-muted/50 rounded-full">
                      <Target className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">هنوز عادتی ثبت نشده</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">با ایجاد عادات، آمار خود را ببینید</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6 mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      کل جلسات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-primary mb-2">{stats.focusSessions}</div>
                    <p className="text-sm text-muted-foreground">جلسه تکمیل شده</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-accent/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-accent" />
                      کل زمان تمرکز
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-accent mb-2">{stats.totalFocusTime}</div>
                    <p className="text-sm text-muted-foreground">دقیقه</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-purple-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-purple-500" />
                      میانگین جلسه
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-purple-500 mb-2">{stats.avgFocusSession.toFixed(0)}</div>
                    <p className="text-sm text-muted-foreground">دقیقه</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Recent Focus Sessions */}
            <Card className="border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      تاریخچه جلسات اخیر
                    </CardTitle>
                    <CardDescription className="mt-1">20 جلسه تمرکز اخیر</CardDescription>
                  </div>
                  <Badge variant="secondary">{filteredFocusSessions.length} جلسه</Badge>
                </div>
              </CardHeader>
              <CardContent>
                {filteredFocusSessions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredFocusSessions
                      .slice()
                      .reverse()
                      .slice(0, 20)
                      .map((session, index) => {
                        const task = session.taskId ? state.tasks.find((t) => t.id === session.taskId) : null;
                        return (
                          <motion.div
                            key={session.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="flex items-center justify-between p-4 bg-gradient-to-l from-primary/5 to-transparent rounded-lg border border-primary/10 hover:border-primary/20 transition-all"
                          >
                            <div className="text-right">
                              <p className="font-medium text-base">{task ? task.title : 'بدون وظیفه'}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {format(new Date(session.startTime), 'yyyy/MM/dd - HH:mm')}
                              </p>
                            </div>
                            <div className="text-left space-y-1">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-primary" />
                                <span className="font-bold text-lg">{session.duration}</span>
                                <span className="text-sm text-muted-foreground">دقیقه</span>
                              </div>
                              <div className="flex items-center gap-1 justify-end">
                                <Zap className="h-3 w-3 text-amber-500" />
                                <span className="text-xs font-medium text-amber-500">+{session.xpEarned} XP</span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-4 bg-muted/50 rounded-full">
                      <Clock className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">هنوز جلسه تمرکزی نداشته‌اید</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">با شروع جلسات تمرکز، آمار خود را ببینید</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6 mt-0">
            {/* Achievement Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-amber-500/20">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg">
                        <Award className="h-5 w-5 text-amber-500" />
                      </div>
                      <span className="text-3xl font-bold text-amber-500">{state.user.achievements.length}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">دستاوردهای باز شده</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-primary/20">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-3xl font-bold text-primary">{state.user.level}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">سطح فعلی</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-purple-500/20">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Zap className="h-5 w-5 text-purple-500" />
                      </div>
                      <span className="text-3xl font-bold text-purple-500">{state.user.xp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">XP کل</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className="border-accent/20">
                  <CardContent className="p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="p-2 bg-accent/10 rounded-lg">
                        <Target className="h-5 w-5 text-accent" />
                      </div>
                      <span className="text-3xl font-bold text-accent">{state.user.totalTasksCompleted}</span>
                    </div>
                    <p className="text-sm text-muted-foreground text-right">وظایف کل</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Achievements Grid */}
            <Card className="border-amber-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      دستاوردها
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {state.achievements.filter((a) => a.unlocked).length} از {state.achievements.length} دستاورد باز شده
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {((state.achievements.filter((a) => a.unlocked).length / state.achievements.length) * 100).toFixed(0)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {state.achievements.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {state.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: achievement.unlocked ? 1.05 : 1 }}
                      >
                        <Card
                          className={`${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30'
                              : 'opacity-60 grayscale'
                          } transition-all`}
                        >
                          <CardContent className="p-4 text-center space-y-2">
                            <div className="text-5xl mb-2">{achievement.icon}</div>
                            <p className="font-bold text-base">{achievement.title}</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">{achievement.description}</p>
                            <div className="flex items-center justify-center gap-1 pt-2">
                              <Zap className="h-3 w-3 text-amber-500" />
                              <span className="text-xs font-bold text-amber-500">+{achievement.xpReward} XP</span>
                            </div>
                            {achievement.unlocked && achievement.unlockedAt && (
                              <p className="text-xs text-muted-foreground pt-1">
                                {format(new Date(achievement.unlockedAt), 'yyyy/MM/dd')}
                              </p>
                            )}
                            {!achievement.unlocked && (
                              <Badge variant="secondary" className="text-xs mt-2">
                                قفل شده
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex flex-col items-center justify-center text-center space-y-3">
                    <div className="p-4 bg-muted/50 rounded-full">
                      <Trophy className="h-12 w-12 text-muted-foreground/40" />
                    </div>
                    <div>
                      <p className="font-medium text-muted-foreground">هنوز دستاوردی باز نشده</p>
                      <p className="text-sm text-muted-foreground/60 mt-1">با تکمیل وظایف و عادات، دستاوردها را باز کنید</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Analytics;
