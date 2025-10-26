import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Circle, 
  Target, 
  Flame, 
  Calendar as CalendarIcon,
  Clock,
  TrendingUp,
  Zap,
  Star,
  Award,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, addDays, addWeeks, addMonths, addYears, isSameDay } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { toast } from 'sonner';

type ViewMode = 'day' | 'week' | 'month' | 'year';

const UnifiedDashboard = () => {
  const { state, completeTask, checkHabit, dispatch, addXP } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Get date range based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };
      case 'week':
        return { start: startOfWeek(selectedDate, { weekStartsOn: 6 }), end: endOfWeek(selectedDate, { weekStartsOn: 6 }) };
      case 'month':
        return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) };
      case 'year':
        return { start: startOfYear(selectedDate), end: endOfYear(selectedDate) };
    }
  };

  const dateRange = getDateRange();

  // Navigate dates
  const navigateDate = (direction: 'prev' | 'next') => {
    switch (viewMode) {
      case 'day':
        setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : addDays(selectedDate, -1));
        break;
      case 'week':
        setSelectedDate(direction === 'next' ? addWeeks(selectedDate, 1) : addWeeks(selectedDate, -1));
        break;
      case 'month':
        setSelectedDate(direction === 'next' ? addMonths(selectedDate, 1) : addMonths(selectedDate, -1));
        break;
      case 'year':
        setSelectedDate(direction === 'next' ? addYears(selectedDate, 1) : addYears(selectedDate, -1));
        break;
    }
  };

  // Filter items by date range
  const filteredTasks = useMemo(() => {
    return state.tasks.filter(task => {
      if (task.completed && task.completedAt) {
        return isWithinInterval(new Date(task.completedAt), dateRange);
      }
      if (!task.completed && task.deadline) {
        return isWithinInterval(new Date(task.deadline), dateRange);
      }
      if (!task.completed && !task.deadline) {
        return viewMode === 'day' && isSameDay(new Date(task.createdAt), selectedDate);
      }
      return false;
    }).sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [state.tasks, dateRange, viewMode, selectedDate]);

  const filteredHabits = useMemo(() => {
    return state.habits.filter(h => h.isActive);
  }, [state.habits]);

  const filteredGoals = useMemo(() => {
    return state.goals.filter(goal => {
      return isWithinInterval(new Date(goal.targetDate), dateRange) ||
             isWithinInterval(new Date(goal.createdAt), dateRange);
    });
  }, [state.goals, dateRange]);

  const filteredPlans = useMemo(() => {
    return state.plans.filter(plan => {
      return isWithinInterval(new Date(plan.startDate), dateRange) || 
             isWithinInterval(new Date(plan.endDate), dateRange) ||
             (new Date(plan.startDate) <= dateRange.start && new Date(plan.endDate) >= dateRange.end);
    });
  }, [state.plans, dateRange]);

  const filteredFocusSessions = useMemo(() => {
    return state.focusSessions.filter(session => 
      session.completed && isWithinInterval(new Date(session.startTime), dateRange)
    );
  }, [state.focusSessions, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedTasks = filteredTasks.filter(t => t.completed).length;
    const totalTasks = filteredTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const todayString = format(new Date(), 'yyyy-MM-dd');
    const habitsCompletedToday = filteredHabits.filter(h => 
      h.completedDates.includes(todayString)
    ).length;
    const habitsTotal = filteredHabits.length;
    const habitCompletionRate = habitsTotal > 0 ? (habitsCompletedToday / habitsTotal) * 100 : 0;

    const totalFocusTime = filteredFocusSessions.reduce((sum, s) => sum + s.duration, 0);
    
    const goalsProgress = filteredGoals.reduce((sum, g) => sum + g.progress, 0) / (filteredGoals.length || 1);
    
    const plansProgress = filteredPlans.reduce((sum, p) => sum + p.progress, 0) / (filteredPlans.length || 1);

    return {
      completedTasks,
      totalTasks,
      completionRate,
      habitsCompletedToday,
      habitsTotal,
      habitCompletionRate,
      totalFocusTime,
      focusSessions: filteredFocusSessions.length,
      goalsProgress,
      activeGoals: filteredGoals.filter(g => g.status === 'active').length,
      plansProgress,
      activePlans: filteredPlans.filter(p => p.status === 'active').length
    };
  }, [filteredTasks, filteredHabits, filteredFocusSessions, filteredGoals, filteredPlans]);

  // Format date range label
  const getDateRangeLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'EEEE، d MMMM yyyy', { locale: faIR });
      case 'week':
        return `${format(dateRange.start, 'd MMM')} - ${format(dateRange.end, 'd MMM yyyy')}`;
      case 'month':
        return format(selectedDate, 'MMMM yyyy', { locale: faIR });
      case 'year':
        return format(selectedDate, 'yyyy');
    }
  };

  const handleTaskComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleHabitCheck = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    const isCompleted = habit.completedDates.includes(today);
    
    if (isCompleted) {
      // Remove today from completed dates
      const updatedDates = habit.completedDates.filter(d => d !== today);
      dispatch({
        type: 'UPDATE_HABIT',
        payload: {
          ...habit,
          completedDates: updatedDates,
          currentStreak: habit.currentStreak > 0 ? habit.currentStreak - 1 : 0
        }
      });
      toast.info('عادت از لیست امروز حذف شد');
    } else {
      // Add today to completed dates
      const updatedDates = [...habit.completedDates, today];
      dispatch({
        type: 'UPDATE_HABIT',
        payload: {
          ...habit,
          completedDates: updatedDates,
          currentStreak: habit.currentStreak + 1,
          longestStreak: Math.max(habit.longestStreak, habit.currentStreak + 1)
        }
      });
      addXP(habit.xpReward, `تکمیل عادت: ${habit.title}`);
      toast.success(`عادت تکمیل شد! +${habit.xpReward} XP 🎉`);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24" dir="rtl">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                داشبورد یکپارچه
              </h1>
              <p className="text-muted-foreground mt-1">
                کنترل کامل زندگی در یک نگاه
              </p>
            </div>
            
            {/* View Mode Selector */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'day' ? 'default' : 'outline'}
                onClick={() => setViewMode('day')}
                size="sm"
              >
                روزانه
              </Button>
              <Button
                variant={viewMode === 'week' ? 'default' : 'outline'}
                onClick={() => setViewMode('week')}
                size="sm"
              >
                هفتگی
              </Button>
              <Button
                variant={viewMode === 'month' ? 'default' : 'outline'}
                onClick={() => setViewMode('month')}
                size="sm"
              >
                ماهانه
              </Button>
              <Button
                variant={viewMode === 'year' ? 'default' : 'outline'}
                onClick={() => setViewMode('year')}
                size="sm"
              >
                سالانه
              </Button>
            </div>
          </div>

          {/* Date Navigator */}
          <Card className="glass">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{getDateRangeLabel()}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedDate(new Date())}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    برگشت به امروز
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => navigateDate('next')}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="glass hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</p>
                    <p className="text-xs text-muted-foreground">وظایف</p>
                  </div>
                </div>
                <Progress value={stats.completionRate} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="glass hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-success/10 rounded-lg">
                    <Flame className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.habitsCompletedToday}/{stats.habitsTotal}</p>
                    <p className="text-xs text-muted-foreground">عادات</p>
                  </div>
                </div>
                <Progress value={stats.habitCompletionRate} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="glass hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-info/10 rounded-lg">
                    <Clock className="h-5 w-5 text-info" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.totalFocusTime}</p>
                    <p className="text-xs text-muted-foreground">دقیقه تمرکز</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning/10 rounded-lg">
                    <Target className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activeGoals}</p>
                    <p className="text-xs text-muted-foreground">اهداف فعال</p>
                  </div>
                </div>
                <Progress value={stats.goalsProgress} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="glass hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <CalendarIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats.activePlans}</p>
                    <p className="text-xs text-muted-foreground">برنامه‌ها</p>
                  </div>
                </div>
                <Progress value={stats.plansProgress} className="mt-2 h-1" />
              </CardContent>
            </Card>

            <Card className="glass hover-scale">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <Zap className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{state.user.xp}</p>
                    <p className="text-xs text-muted-foreground">XP امروز</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Tasks Section */}
            <Card className="lg:col-span-2 glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  وظایف ({filteredTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>بدون وظیفه در این بازه زمانی</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredTasks.map((task, index) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                            className="p-4 bg-card border rounded-lg hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => handleTaskComplete(task.id)}
                                className="mt-1"
                              >
                                {task.completed ? (
                                  <CheckCircle2 className="h-5 w-5 text-success" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground" />
                                )}
                              </button>
                              <div className="flex-1">
                                <h4 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                                <div className="flex gap-2 mt-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs">
                                    {task.category}
                                  </Badge>
                                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                    {task.priority}
                                  </Badge>
                                  {task.deadline && (
                                    <Badge variant="outline" className="text-xs">
                                      📅 {format(new Date(task.deadline), 'dd MMM')}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </AnimatePresence>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Habits Section */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-success" />
                    عادات امروز
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-3">
                      {filteredHabits.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">
                          بدون عادت فعال
                        </p>
                      ) : (
                        filteredHabits.map((habit) => {
                          const todayString = format(new Date(), 'yyyy-MM-dd');
                          const isCompleted = habit.completedDates.includes(todayString);
                          
                          return (
                            <div
                              key={habit.id}
                              className="p-3 bg-card border rounded-lg hover:shadow-md transition-all cursor-pointer"
                              onClick={() => handleHabitCheck(habit.id)}
                            >
                              <div className="flex items-center gap-3">
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                                ) : (
                                  <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className={`font-medium text-sm ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {habit.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {habit.currentStreak} 🔥
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    آمار سریع
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">اهداف در حال انجام</span>
                    <span className="font-bold">{filteredGoals.filter(g => g.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">برنامه‌های فعال</span>
                    <span className="font-bold">{filteredPlans.filter(p => p.status === 'active').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">جلسات تمرکز</span>
                    <span className="font-bold">{stats.focusSessions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">سطح</span>
                    <span className="font-bold flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {state.user.level}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
