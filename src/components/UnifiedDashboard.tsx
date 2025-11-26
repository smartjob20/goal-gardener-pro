import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Target, Flame, Calendar as CalendarIcon, Clock, TrendingUp, Zap, Star, Award, ChevronLeft, ChevronRight, GripVertical, Sparkles, BarChart3 } from 'lucide-react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval, addDays, addWeeks, addMonths, addYears, isSameDay } from 'date-fns';
import { formatPersianDate, getPersianDayName } from '@/utils/persianDateUtils';
import { toast } from 'sonner';
import { PremiumBanner } from './PremiumBanner';
import { CalendarWidget } from './CalendarWidget';
import { NotificationPanel } from './NotificationPanel';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';

type ViewMode = 'day' | 'week' | 'month' | 'year';

// Sortable Task Item Component
function SortableTaskItem({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors = {
    high: 'border-red-500/30 bg-red-500/5',
    medium: 'border-amber-500/30 bg-amber-500/5',
    low: 'border-green-500/30 bg-green-500/5',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="mb-3"
    >
      <Card className={`border-2 ${priorityColors[task.priority]} hover:shadow-lg transition-all ${isDragging ? 'shadow-2xl scale-105' : ''}`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-start gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-2 hover:bg-primary/10 rounded-lg transition-colors touch-none min-h-[48px] min-w-[48px] flex items-center justify-center"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
            
            <button
              onClick={() => onComplete(task.id)}
              className="min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-primary/10 rounded-lg transition-colors"
            >
              {task.completed ? (
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground" />
              )}
            </button>

            <div className="flex-1 text-right min-w-0">
              <div className="flex items-center gap-2 justify-end flex-wrap mb-1">
                <h4 className={`font-semibold text-base ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {task.priority === 'high' ? '🔴 بالا' : task.priority === 'medium' ? '🟡 متوسط' : '🟢 پایین'}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 justify-end flex-wrap">
                {task.deadline && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{format(new Date(task.deadline), 'yyyy/MM/dd')}</span>
                    <Clock className="h-3 w-3" />
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs font-medium text-amber-500">
                  <span>+{task.xpReward}</span>
                  <Zap className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const UnifiedDashboard = () => {
  const {
    state,
    completeTask,
    deleteTask,
    dispatch,
    addXP,
    reorderTasks
  } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const useJalali = state.settings.calendar === 'jalali';

  // Drag and Drop Sensors
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
          start: startOfWeek(selectedDate, { weekStartsOn: 6 }),
          end: endOfWeek(selectedDate, { weekStartsOn: 6 })
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
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
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
            const start = startOfWeek(selectedDate, { weekStartsOn: 6 });
            const end = endOfWeek(selectedDate, { weekStartsOn: 6 });
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
          return format(selectedDate, 'dd MMMM yyyy');
        case 'week':
          return `${format(dateRange.start, 'd MMM')} - ${format(dateRange.end, 'd MMM yyyy')}`;
        case 'month':
          return format(selectedDate, 'MMMM yyyy');
        case 'year':
          return format(selectedDate, 'yyyy');
      }
    }
  };

  const handleTaskComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = filteredTasks.findIndex((task) => task.id === active.id);
      const newIndex = filteredTasks.findIndex((task) => task.id === over.id);

      const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex);
      reorderTasks(reorderedTasks);
      toast.success('ترتیب وظایف ذخیره شد ✨');
    }
  };

  const handleHabitCheck = (habitId: string) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const isCompleted = habit.completedDates.includes(today);

    if (isCompleted) {
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
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-background" />
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/10"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5, 1],
              opacity: [0.03, 0.08, 0.03],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10 mt-[80px]">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header Section */}
          <div className="text-center space-y-3 mb-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-center gap-3 mb-2"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="h-8 w-8 text-primary" />
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-primary via-accent to-primary bg-clip-text text-transparent">
                داشبورد هوشمند
              </h1>
              <motion.div
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <BarChart3 className="h-8 w-8 text-accent" />
              </motion.div>
            </motion.div>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              کنترل کامل زندگی، مدیریت هوشمند اهداف و رویاها
            </p>
          </div>

          {/* View Mode Selector */}
          <div className="flex justify-center">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto max-w-2xl p-2 bg-muted/50 rounded-xl border border-border/50">
              {[
                { mode: 'day' as ViewMode, label: 'روزانه', icon: '📅' },
                { mode: 'week' as ViewMode, label: 'هفتگی', icon: '📆' },
                { mode: 'month' as ViewMode, label: 'ماهانه', icon: '🗓️' },
                { mode: 'year' as ViewMode, label: 'سالانه', icon: '📊' },
              ].map(({ mode, label, icon }) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? 'default' : 'ghost'}
                  onClick={() => setViewMode(mode)}
                  size="lg"
                  className={`min-h-[48px] text-base font-medium transition-all ${
                    viewMode === mode
                      ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                      : 'hover:bg-primary/10 hover:scale-102'
                  }`}
                >
                  <span className="ms-2">{icon}</span>
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Premium Banner */}
          <PremiumBanner />

          {/* Date Navigator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-primary/20 bg-gradient-to-l from-primary/5 to-transparent">
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('next')}
                    className="hover:bg-primary/10 hover:scale-110 transition-all min-h-[48px] min-w-[48px] rounded-full"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  <div className="text-center flex-1">
                    <h3 className="text-lg sm:text-xl font-bold bg-gradient-to-l from-primary to-accent bg-clip-text text-transparent">
                      {getDateRangeLabel()}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                      className="text-xs text-muted-foreground hover:text-primary hover:bg-primary/5 min-h-[36px] mt-1"
                    >
                      <CalendarIcon className="ms-1 h-3 w-3" />
                      بازگشت به امروز
                    </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateDate('prev')}
                    className="hover:bg-primary/10 hover:scale-110 transition-all min-h-[48px] min-w-[48px] rounded-full"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              {
                icon: CheckCircle2,
                value: `${stats.completedTasks}/${stats.totalTasks}`,
                label: 'وظایف',
                progress: stats.completionRate,
                color: 'primary',
                delay: 0.3,
              },
              {
                icon: Flame,
                value: `${stats.habitsCompletedToday}/${stats.habitsTotal}`,
                label: 'عادات',
                progress: stats.habitCompletionRate,
                color: 'green',
                delay: 0.35,
              },
              {
                icon: Clock,
                value: stats.totalFocusTime.toString(),
                label: 'دقیقه تمرکز',
                color: 'blue',
                delay: 0.4,
              },
              {
                icon: Target,
                value: stats.activeGoals.toString(),
                label: 'اهداف فعال',
                progress: stats.goalsProgress,
                color: 'amber',
                delay: 0.45,
              },
              {
                icon: CalendarIcon,
                value: stats.activePlans.toString(),
                label: 'برنامه‌ها',
                progress: stats.plansProgress,
                color: 'purple',
                delay: 0.5,
              },
              {
                icon: Zap,
                value: state.user.xp.toString(),
                label: 'امتیاز XP',
                color: 'yellow',
                delay: 0.55,
              },
            ].map(({ icon: Icon, value, label, progress, color, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className={`border-2 border-${color}-500/20 hover:border-${color}-500/40 hover:shadow-xl transition-all bg-gradient-to-br from-${color}-500/5 to-transparent`}>
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 justify-end">
                        <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
                          <Icon className={`h-5 w-5 text-${color}-500`} />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl sm:text-3xl font-bold">{value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{label}</p>
                      </div>
                      {progress !== undefined && (
                        <Progress value={progress} className="h-2 mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Tasks Section */}
            <motion.div
              className="lg:col-span-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="text-right">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <span>وظایف امروز</span>
                        <CheckCircle2 className="h-6 w-6 text-primary" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {filteredTasks.length} وظیفه • {stats.completionRate.toFixed(0)}% تکمیل شده
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[450px] sm:h-[500px] pe-3">
                    {filteredTasks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16 space-y-3"
                      >
                        <div className="flex justify-center">
                          <div className="p-4 bg-muted/50 rounded-full">
                            <Circle className="h-16 w-16 text-muted-foreground/40" />
                          </div>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-muted-foreground">هنوز وظیفه‌ای وجود ندارد</p>
                          <p className="text-sm text-muted-foreground/60 mt-1">از منوی اضافه کردن، وظیفه جدید ایجاد کنید</p>
                        </div>
                      </motion.div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={filteredTasks.map((task) => task.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <AnimatePresence>
                            {filteredTasks.map((task) => (
                              <SortableTaskItem
                                key={task.id}
                                task={task}
                                onComplete={handleTaskComplete}
                              />
                            ))}
                          </AnimatePresence>
                        </SortableContext>
                      </DndContext>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Sidebar */}
            <div className="space-y-4 sm:space-y-6">
              {/* Habits Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Card className="border-2 border-green-500/20 hover:border-green-500/40 transition-all">
                  <CardHeader className="pb-4">
                    <div className="text-right">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <span>عادات امروز</span>
                        <Flame className="h-6 w-6 text-green-500" />
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {stats.habitsCompletedToday} از {stats.habitsTotal} عادت
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[320px]">
                      {filteredHabits.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-12 space-y-3"
                        >
                          <div className="flex justify-center">
                            <div className="p-4 bg-muted/50 rounded-full">
                              <Flame className="h-12 w-12 text-muted-foreground/40" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">هنوز عادتی ثبت نشده</p>
                            <p className="text-sm text-muted-foreground/60 mt-1">عادت جدید ایجاد کنید</p>
                          </div>
                        </motion.div>
                      ) : (
                        <div className="space-y-3">
                          {filteredHabits.map((habit, index) => {
                            const todayString = format(new Date(), 'yyyy-MM-dd');
                            const isCompleted = habit.completedDates.includes(todayString);
                            return (
                              <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => handleHabitCheck(habit.id)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  isCompleted
                                    ? 'border-green-500/30 bg-green-500/5'
                                    : 'border-border hover:border-green-500/30 hover:bg-green-500/5'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="flex-1 text-right min-w-0">
                                    <p className={`font-medium text-base ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                      {habit.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2 justify-end">
                                      <Badge variant="outline" className="text-xs">
                                        <Flame className="ms-1 h-3 w-3" />
                                        {habit.currentStreak} روز
                                      </Badge>
                                      <Badge variant="outline" className="text-xs">
                                        <Zap className="ms-1 h-3 w-3 text-amber-500" />
                                        +{habit.xpReward}
                                      </Badge>
                                    </div>
                                  </div>
                                  <div className="min-h-[48px] min-w-[48px] flex items-center justify-center">
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-6 w-6 text-green-500" />
                                    ) : (
                                      <Circle className="h-6 w-6 text-muted-foreground" />
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Stats */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all">
                  <CardHeader className="pb-4">
                    <div className="text-right">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <span>آمار سریع</span>
                        <TrendingUp className="h-6 w-6 text-accent" />
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { label: 'اهداف در حال انجام', value: filteredGoals.filter(g => g.status === 'active').length, icon: Target, color: 'amber' },
                      { label: 'برنامه‌های فعال', value: filteredPlans.filter(p => p.status === 'active').length, icon: CalendarIcon, color: 'purple' },
                      { label: 'جلسات تمرکز', value: stats.focusSessions, icon: Clock, color: 'blue' },
                      { label: 'سطح فعلی', value: state.user.level, icon: Star, color: 'yellow' },
                    ].map(({ label, value, icon: Icon, color }) => (
                      <motion.div
                        key={label}
                        whileHover={{ scale: 1.02 }}
                        className={`flex justify-between items-center p-3 rounded-lg hover:bg-${color}-500/5 transition-all border border-transparent hover:border-${color}-500/20`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`p-2 bg-${color}-500/10 rounded-lg`}>
                            <Icon className={`h-4 w-4 text-${color}-500`} />
                          </div>
                          <span className="font-bold text-xl">{value}</span>
                        </div>
                        <span className="text-sm text-muted-foreground text-right">{label}</span>
                      </motion.div>
                  ))}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Calendar Widget */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <CalendarWidget 
                  tasks={filteredTasks}
                  habits={filteredHabits}
                  onDateSelect={(date) => {
                    console.log('Selected date:', date);
                  }}
                  onCompleteTask={completeTask}
                  onDeleteTask={deleteTask}
                  onCheckHabit={handleHabitCheck}
                />
              </motion.div>

              {/* Notification Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
              >
                <NotificationPanel />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
