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
import { CheckCircle2, Circle, Target, Flame, Calendar as CalendarIcon, Clock, TrendingUp, Zap, Star, Award, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, addDays, addWeeks, addMonths, addYears, isSameDay } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { formatPersianDate, getPersianDayName } from '@/utils/persianDateUtils';
import { toast } from 'sonner';
import { PremiumBanner } from './PremiumBanner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';

// Sortable Task Item Component
interface SortableTaskItemProps {
  task: Task;
  onComplete: (id: string) => void;
}

const SortableTaskItem = ({ task, onComplete }: SortableTaskItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="p-3 sm:p-4 bg-card border rounded-lg hover:shadow-lg hover:border-primary/20 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 text-right min-w-0">
          <h4 className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
            {task.title}
          </h4>
          {task.description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
          <div className="flex gap-2 mt-2 flex-wrap justify-end">
            <Badge variant="outline" className="text-xs">
              {task.category}
            </Badge>
            <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
              {task.priority === 'high' ? '🔴 بالا' : task.priority === 'medium' ? '🟡 متوسط' : '🟢 پایین'}
            </Badge>
            {task.deadline && <Badge variant="outline" className="text-xs">
                📅 {format(new Date(task.deadline), 'dd MMM')}
              </Badge>}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            {...attributes} 
            {...listeners} 
            className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-accent/20 rounded-lg transition-colors cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </button>
          <button onClick={() => onComplete(task.id)} className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-110 transition-transform">
            {task.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
          </button>
        </div>
      </div>
    </div>
  );
};

type ViewMode = 'day' | 'week' | 'month' | 'year';
const UnifiedDashboard = () => {
  const {
    state,
    completeTask,
    checkHabit,
    dispatch,
    addXP,
    reorderTasks
  } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const useJalali = state.settings.calendar === 'jalali';

  // Setup drag & drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get date range based on view mode
  const getDateRange = () => {
    switch (viewMode) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        };
      case 'week':
        return {
          start: startOfWeek(selectedDate, {
            weekStartsOn: 6
          }),
          end: endOfWeek(selectedDate, {
            weekStartsOn: 6
          })
        };
      case 'month':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        };
      case 'year':
        return {
          start: startOfYear(selectedDate),
          end: endOfYear(selectedDate)
        };
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
      const priorityOrder = {
        high: 0,
        medium: 1,
        low: 2
      };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [state.tasks, dateRange, viewMode, selectedDate]);
  const filteredHabits = useMemo(() => {
    return state.habits.filter(h => h.isActive);
  }, [state.habits]);
  const filteredGoals = useMemo(() => {
    return state.goals.filter(goal => {
      return isWithinInterval(new Date(goal.targetDate), dateRange) || isWithinInterval(new Date(goal.createdAt), dateRange);
    });
  }, [state.goals, dateRange]);
  const filteredPlans = useMemo(() => {
    return state.plans.filter(plan => {
      return isWithinInterval(new Date(plan.startDate), dateRange) || isWithinInterval(new Date(plan.endDate), dateRange) || new Date(plan.startDate) <= dateRange.start && new Date(plan.endDate) >= dateRange.end;
    });
  }, [state.plans, dateRange]);
  const filteredFocusSessions = useMemo(() => {
    return state.focusSessions.filter(session => session.completed && isWithinInterval(new Date(session.startTime), dateRange));
  }, [state.focusSessions, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completedTasks = filteredTasks.filter(t => t.completed).length;
    const totalTasks = filteredTasks.length;
    const completionRate = totalTasks > 0 ? completedTasks / totalTasks * 100 : 0;
    const todayString = format(new Date(), 'yyyy-MM-dd');
    const habitsCompletedToday = filteredHabits.filter(h => h.completedDates.includes(todayString)).length;
    const habitsTotal = filteredHabits.length;
    const habitCompletionRate = habitsTotal > 0 ? habitsCompletedToday / habitsTotal * 100 : 0;
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
    if (useJalali) {
      switch (viewMode) {
        case 'day':
          return `${getPersianDayName(selectedDate)} ${formatPersianDate(selectedDate)}`;
        case 'week':
          {
            const start = startOfWeek(selectedDate, {
              weekStartsOn: 6
            });
            const end = endOfWeek(selectedDate, {
              weekStartsOn: 6
            });
            return `${formatPersianDate(start)} - ${formatPersianDate(end)}`;
          }
        case 'month':
          return formatPersianDate(selectedDate, 'MMMM yyyy');
        case 'year':
          return formatPersianDate(selectedDate, 'yyyy');
      }
    } else {
      switch (viewMode) {
        case 'day':
          return format(selectedDate, 'EEEE، d MMMM yyyy', {
            locale: faIR
          });
        case 'week':
          return `${format(dateRange.start, 'd MMM')} - ${format(dateRange.end, 'd MMM yyyy')}`;
        case 'month':
          return format(selectedDate, 'MMMM yyyy', {
            locale: faIR
          });
        case 'year':
          return format(selectedDate, 'yyyy');
      }
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
  return <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/20 to-accent-light/20 pb-24" dir="rtl">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => <motion.div key={i} className="absolute rounded-full bg-primary/5" style={{
        width: Math.random() * 150 + 50,
        height: Math.random() * 150 + 50,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`
      }} animate={{
        y: [0, Math.random() * 50 - 25],
        x: [0, Math.random() * 50 - 25],
        scale: [1, Math.random() + 0.5, 1],
        opacity: [0.05, 0.15, 0.05]
      }} transition={{
        duration: Math.random() * 15 + 10,
        repeat: Infinity,
        ease: "easeInOut"
      }} />)}
      </div>

      <div className="container mx-auto p-4 md:p-6 max-w-7xl relative z-10 mt-[70px]">
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <motion.div initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.1
          }}>
              <h1 className="text-3xl md:text-4xl font-bold gradient-text">
                داشبورد یکپارچه
              </h1>
              <p className="text-muted-foreground mt-1 text-lg">
                کنترل کامل زندگی در یک نگاه
              </p>
            </motion.div>
            
            {/* View Mode Selector */}
            <motion.div className="grid grid-cols-2 sm:flex sm:flex-row-reverse gap-2 w-full sm:w-auto" initial={{
            opacity: 0,
            x: -20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            delay: 0.2
          }}>
              <Button variant={viewMode === 'day' ? 'default' : 'outline'} onClick={() => setViewMode('day')} size="sm" className={`min-h-[44px] transition-all ${viewMode === 'day' ? 'gradient-bg-primary shadow-lg scale-105' : 'hover:scale-102'}`}>
                📅 روزانه
              </Button>
              <Button variant={viewMode === 'week' ? 'default' : 'outline'} onClick={() => setViewMode('week')} size="sm" className={`min-h-[44px] transition-all ${viewMode === 'week' ? 'gradient-bg-primary shadow-lg scale-105' : 'hover:scale-102'}`}>
                📆 هفتگی
              </Button>
              <Button variant={viewMode === 'month' ? 'default' : 'outline'} onClick={() => setViewMode('month')} size="sm" className={`min-h-[44px] transition-all ${viewMode === 'month' ? 'gradient-bg-primary shadow-lg scale-105' : 'hover:scale-102'}`}>
                🗓️ ماهانه
              </Button>
              <Button variant={viewMode === 'year' ? 'default' : 'outline'} onClick={() => setViewMode('year')} size="sm" className={`min-h-[44px] transition-all ${viewMode === 'year' ? 'gradient-bg-primary shadow-lg scale-105' : 'hover:scale-102'}`}>
                📊 سالانه
              </Button>
            </motion.div>
          </div>

          {/* Premium Banner */}
          <PremiumBanner />

          {/* Date Navigator */}
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <Card className="glass-strong hover-lift">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigateDate('next')} className="hover:bg-primary/10 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] order-1">
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                  <div className="text-center order-2 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold gradient-text">{getDateRangeLabel()}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date())} className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 min-h-[36px] mt-1">
                      برگشت به امروز ✨
                    </Button>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => navigateDate('prev')} className="hover:bg-primary/10 hover:scale-110 transition-transform min-h-[44px] min-w-[44px] order-3">
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview - Mobile Friendly */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            <motion.div initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.4
          }}>
              <Card className="glass-strong hover-lift border-2 border-transparent hover:border-primary/20 hover:shadow-xl transition-all">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl sm:text-2xl font-bold">{stats.completedTasks}/{stats.totalTasks}</p>
                      <p className="text-xs text-muted-foreground">وظایف</p>
                    </div>
                  </div>
                  <Progress value={stats.completionRate} className="mt-2 h-1.5" />
                </CardContent>
              </Card>
            </motion.div>

            <Card className="glass-strong hover-lift border-2 border-transparent hover:border-success/20 hover:shadow-xl transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="p-2 bg-success/10 rounded-lg">
                      <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold">{stats.habitsCompletedToday}/{stats.habitsTotal}</p>
                    <p className="text-xs text-muted-foreground">عادات</p>
                  </div>
                </div>
                <Progress value={stats.habitCompletionRate} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="glass-strong hover-lift border-2 border-transparent hover:border-info/20 hover:shadow-xl transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="p-2 bg-info/10 rounded-lg">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-info" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold">{stats.totalFocusTime}</p>
                    <p className="text-xs text-muted-foreground">دقیقه تمرکز</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-strong hover-lift border-2 border-transparent hover:border-warning/20 hover:shadow-xl transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="p-2 bg-warning/10 rounded-lg">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-warning" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold">{stats.activeGoals}</p>
                    <p className="text-xs text-muted-foreground">اهداف فعال</p>
                  </div>
                </div>
                <Progress value={stats.goalsProgress} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="glass-strong hover-lift border-2 border-transparent hover:border-accent/20 hover:shadow-xl transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="p-2 bg-accent/10 rounded-lg">
                      <CalendarIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold">{stats.activePlans}</p>
                    <p className="text-xs text-muted-foreground">برنامه‌ها</p>
                  </div>
                </div>
                <Progress value={stats.plansProgress} className="mt-2 h-1.5" />
              </CardContent>
            </Card>

            <Card className="glass-strong hover-lift border-2 border-transparent hover:border-purple-500/20 hover:shadow-xl transition-all">
              <CardContent className="p-3 sm:p-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 justify-end">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl sm:text-2xl font-bold">{state.user.xp}</p>
                    <p className="text-xs text-muted-foreground">XP امروز</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - Mobile Friendly */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Tasks Section */}
            <motion.div className="lg:col-span-2" initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: 0.5
          }}>
                <Card className="glass-strong border-2 border-transparent hover:border-primary/20 transition-all">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-end gap-2 text-right text-base sm:text-lg">
                      <span>وظایف ({filteredTasks.length})</span>
                      <CheckCircle2 className="h-5 w-5" />
                    </CardTitle>
                  </CardHeader>
              <CardContent>
                <ScrollArea className="h-[350px] sm:h-[400px] pe-2 sm:pe-4">
                  <AnimatePresence mode="popLayout">
                    {filteredTasks.length === 0 ? <div className="text-center py-12 text-muted-foreground">
                        <Circle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm sm:text-base">بدون وظیفه در این بازه زمانی</p>
                      </div> : <div className="space-y-2 sm:space-y-3">
                        {filteredTasks.map((task, index) => <motion.div key={task.id} initial={{
                        opacity: 0,
                        x: 20
                      }} animate={{
                        opacity: 1,
                        x: 0
                      }} exit={{
                        opacity: 0,
                        scale: 0.9
                      }} transition={{
                        delay: index * 0.05
                      }} className="p-3 sm:p-4 bg-card border rounded-lg hover:shadow-lg hover:border-primary/20 transition-all">
                            <div className="flex items-start gap-3">
                              <div className="flex-1 text-right min-w-0">
                                <h4 className={`font-medium text-sm sm:text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                  {task.title}
                                </h4>
                                {task.description && <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>}
                                <div className="flex gap-2 mt-2 flex-wrap justify-end">
                                  <Badge variant="outline" className="text-xs">
                                    {task.category}
                                  </Badge>
                                  <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                                    {task.priority === 'high' ? '🔴 بالا' : task.priority === 'medium' ? '🟡 متوسط' : '🟢 پایین'}
                                  </Badge>
                                  {task.deadline && <Badge variant="outline" className="text-xs">
                                      📅 {format(new Date(task.deadline), 'dd MMM')}
                                    </Badge>}
                                </div>
                              </div>
                              <button onClick={() => handleTaskComplete(task.id)} className="mt-1 min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-110 transition-transform">
                                {task.completed ? <CheckCircle2 className="h-5 w-5 text-success" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                              </button>
                            </div>
                          </motion.div>)}
                      </div>}
                  </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Habits Section */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.6
            }}>
                <Card className="glass-strong border-2 border-transparent hover:border-success/20 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-end gap-2 text-right text-base sm:text-lg">
                    <span>عادات امروز</span>
                    <Flame className="h-5 w-5 text-success" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px] sm:h-[300px]">
                    <div className="space-y-2 sm:space-y-3">
                      {filteredHabits.length === 0 ? <p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
                          بدون عادت فعال
                        </p> : filteredHabits.map(habit => {
                        const todayString = format(new Date(), 'yyyy-MM-dd');
                        const isCompleted = habit.completedDates.includes(todayString);
                        return <div key={habit.id} className="p-3 bg-card border rounded-lg hover:shadow-lg hover:border-success/20 transition-all cursor-pointer min-h-[60px]" onClick={() => handleHabitCheck(habit.id)}>
                              <div className="flex items-center gap-3">
                                <div className="flex-1 min-w-0 text-right">
                                  <p className={`font-medium text-sm sm:text-base ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                    {habit.title}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 justify-end">
                                    <Badge variant="outline" className="text-xs">
                                      {habit.currentStreak} 🔥
                                    </Badge>
                                  </div>
                                </div>
                                <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                                  {isCompleted ? <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />}
                                </div>
                              </div>
                            </div>;
                      })}
                    </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              delay: 0.7
            }}>
                <Card className="glass-strong border-2 border-transparent hover:border-info/20 transition-all">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-end gap-2 text-right text-base sm:text-lg">
                    <span>آمار سریع</span>
                    <TrendingUp className="h-5 w-5" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-2 hover:bg-accent/5 rounded-lg transition-colors">
                    <span className="font-bold text-lg">{filteredGoals.filter(g => g.status === 'active').length}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground text-right">اهداف در حال انجام</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-accent/5 rounded-lg transition-colors">
                    <span className="font-bold text-lg">{filteredPlans.filter(p => p.status === 'active').length}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground text-right">برنامه‌های فعال</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-accent/5 rounded-lg transition-colors">
                    <span className="font-bold text-lg">{stats.focusSessions}</span>
                    <span className="text-xs sm:text-sm text-muted-foreground text-right">جلسات تمرکز</span>
                  </div>
                  <div className="flex justify-between items-center p-2 hover:bg-accent/5 rounded-lg transition-colors">
                    <span className="font-bold text-lg flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {state.user.level}
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground text-right">سطح</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
};
export default UnifiedDashboard;