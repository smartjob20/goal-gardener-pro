import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, Zap, Clock, Award, CheckCircle, BarChart3, Calendar, Download, Trophy, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { format, subDays, isAfter, isBefore, startOfDay, endOfDay, differenceInDays } from 'date-fns';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { generatePDFReport } from './PDFExport';
type TimeRange = '7' | '30' | '90' | '365' | 'all';
const Analytics = () => {
  const {
    state
  } = useApp();
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
    const totalXP = filteredTasks.reduce((acc, task) => acc + task.xpReward, 0) + filteredFocusSessions.reduce((acc, session) => acc + session.xpEarned, 0) + filteredGoals.reduce((acc, goal) => acc + goal.xpReward, 0);
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
    const days: {
      [key: string]: {
        tasks: number;
        habits: number;
        focus: number;
        xp: number;
      };
    } = {};

    // Initialize days
    const dayCount = timeRange === 'all' ? 30 : parseInt(timeRange);
    for (let i = 0; i < Math.min(dayCount, 30); i++) {
      const date = format(subDays(new Date(), dayCount - i - 1), 'yyyy-MM-dd');
      days[date] = {
        tasks: 0,
        habits: 0,
        focus: 0,
        xp: 0
      };
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
    const categories: {
      [key: string]: number;
    } = {};
    filteredTasks.forEach(task => {
      categories[task.category] = (categories[task.category] || 0) + 1;
    });
    const labels: {
      [key: string]: string;
    } = {
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
    const categories: {
      [key: string]: number;
    } = {};
    filteredHabits.forEach(habit => {
      const count = habit.completedDates.filter(date => isAfter(new Date(date), startDate)).length;
      categories[habit.category] = (categories[habit.category] || 0) + count;
    });
    const labels: {
      [key: string]: string;
    } = {
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
    const priorities: {
      [key: string]: number;
    } = {
      high: 0,
      medium: 0,
      low: 0
    };
    filteredTasks.forEach(task => {
      priorities[task.priority] += 1;
    });
    const labels: {
      [key: string]: string;
    } = {
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
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
  };
  return <div className="container mx-auto p-4 pb-24 max-w-7xl" dir="rtl">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="mt-[70px]">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">آمار و تحلیل</h1>
            <p className="text-muted-foreground">بررسی عملکرد و پیشرفت شما</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={v => setTimeRange(v as TimeRange)}>
              <SelectTrigger className="w-40">
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
            <Button variant="outline" onClick={() => generatePDFReport(state)}>
              <FileText className="ml-2 h-4 w-4" />
              گزارش PDF
            </Button>
            <Button variant="outline" onClick={exportData}>
              <Download className="ml-2 h-4 w-4" />
              دانلود JSON
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">نمای کلی</TabsTrigger>
            <TabsTrigger value="tasks">وظایف</TabsTrigger>
            <TabsTrigger value="habits">عادات</TabsTrigger>
            <TabsTrigger value="focus">تمرکز</TabsTrigger>
            <TabsTrigger value="achievements">دستاوردها</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Grid - Mobile Friendly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.totalTasks}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">وظایف تکمیل شده</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.totalHabitsCompleted}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">عادات انجام شده</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.totalFocusTime}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">دقیقه تمرکز</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.totalXP}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">XP کسب شده</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{stats.currentStreak}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">روز استریک فعلی</p>
                </CardContent>
              </Card>
            </div>

            {/* Additional Stats - Mobile Friendly */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>نرخ تکمیل وظایف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>پیشرفت</span>
                      <span className="font-bold">{stats.completionRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={stats.completionRate} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>میانگین جلسه تمرکز</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {stats.avgFocusSession.toFixed(0)} دقیقه
                  </div>
                  <p className="text-sm text-muted-foreground">
                    از {stats.focusSessions} جلسه
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>بهترین استریک</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-2">
                    {stats.longestStreak} روز
                  </div>
                  <p className="text-sm text-muted-foreground">
                    استریک فعلی: {stats.currentStreak} روز
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Productivity Chart */}
            <Card>
              <CardHeader>
                <CardTitle>روند بهره‌وری</CardTitle>
                <CardDescription>فعالیت‌های روزانه در بازه زمانی انتخابی</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={productivityData}>
                    <defs>
                      <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="وظایف" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorTasks)" />
                    <Area type="monotone" dataKey="عادات" stroke="hsl(var(--secondary))" fillOpacity={1} fill="hsl(var(--secondary))" />
                    <Area type="monotone" dataKey="XP" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#colorXP)" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab - Mobile Friendly */}
          <TabsContent value="tasks" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزیع بر اساس دسته‌بندی</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={taskCategoryData} cx="50%" cy="50%" labelLine={false} label={entry => `${entry.name}: ${entry.value}`} outerRadius={80} fill="hsl(var(--primary))" dataKey="value">
                        {taskCategoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزیع اولویت</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={priorityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>وظایف برتر بر اساس XP</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredTasks.sort((a, b) => b.xpReward - a.xpReward).slice(0, 10).map((task, index) => <div key={task.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{task.title}</p>
                            <p className="text-xs text-muted-foreground">{task.category}</p>
                          </div>
                        </div>
                        <span className="font-bold text-primary">{task.xpReward} XP</span>
                      </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Habits Tab */}
          <TabsContent value="habits" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>توزیع عادات بر اساس دسته‌بندی</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={habitCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>عادات برتر</CardTitle>
                <CardDescription>بر اساس استریک و تعداد تکمیل</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {state.habits.sort((a, b) => b.longestStreak - a.longestStreak).slice(0, 10).map((habit, index) => <div key={habit.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-lg">#{index + 1}</span>
                          <div>
                            <p className="font-medium">{habit.title}</p>
                            <p className="text-xs text-muted-foreground">
                              استریک فعلی: {habit.currentStreak} | بهترین: {habit.longestStreak}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-primary">{habit.completedDates.length} بار</span>
                      </div>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Focus Tab */}
          <TabsContent value="focus" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>کل جلسات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.focusSessions}</div>
                  <p className="text-sm text-muted-foreground">جلسه تکمیل شده</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>کل زمان تمرکز</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.totalFocusTime}</div>
                  <p className="text-sm text-muted-foreground">دقیقه</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>میانگین جلسه</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stats.avgFocusSession.toFixed(0)}</div>
                  <p className="text-sm text-muted-foreground">دقیقه</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>تاریخچه جلسات اخیر</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredFocusSessions.slice().reverse().slice(0, 20).map(session => {
                  const task = session.taskId ? state.tasks.find(t => t.id === session.taskId) : null;
                  return <div key={session.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div>
                          <p className="font-medium">{task ? task.title : 'بدون وظیفه'}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(session.startTime), 'yyyy/MM/dd HH:mm')}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="font-bold">{session.duration} دقیقه</p>
                          <p className="text-xs text-primary">+{session.xpEarned} XP</p>
                        </div>
                      </div>;
                })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Award className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{state.user.achievements.length}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">دستاوردهای باز شده</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{state.user.level}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">سطح فعلی</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{state.user.xp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">XP کل</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 text-primary" />
                    <span className="text-2xl font-bold">{state.user.totalTasksCompleted}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">وظایف کل</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>دستاوردها</CardTitle>
                <CardDescription>
                  {state.achievements.filter(a => a.unlocked).length} از {state.achievements.length} دستاورد
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {state.achievements.map(achievement => <Card key={achievement.id} className={achievement.unlocked ? 'bg-primary/10' : 'opacity-50'}>
                      <CardContent className="p-4 text-center">
                        <div className="text-4xl mb-2">{achievement.icon}</div>
                        <p className="font-bold text-sm mb-1">{achievement.title}</p>
                        <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                        <span className="text-xs font-bold text-primary">+{achievement.xpReward} XP</span>
                        {achievement.unlocked && achievement.unlockedAt && <p className="text-xs text-muted-foreground mt-2">
                            {format(new Date(achievement.unlockedAt), 'yyyy/MM/dd')}
                          </p>}
                      </CardContent>
                    </Card>)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>;
};
export default Analytics;