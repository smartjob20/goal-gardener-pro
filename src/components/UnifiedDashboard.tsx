import { useState, useEffect, useMemo, memo } from 'react';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, Clock, Target, Calendar as CalendarIcon, 
  Zap, Circle, ChevronLeft, ChevronRight, Flame
} from 'lucide-react';
import { Task } from '@/types';
import { DndContext, closestCenter, DragEndEvent, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { NotificationPanel } from './NotificationPanel';
import { CalendarWidget } from './CalendarWidget';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, addDays, addWeeks, addMonths, addYears, subDays, subWeeks, subMonths, subYears, isWithinInterval } from 'date-fns';
import { formatPersianDate } from '@/utils/persianDateUtils';
import { PremiumBanner } from './PremiumBanner';

type ViewMode = 'day' | 'week' | 'month' | 'year';

// Artistic Task Card Component - Soft UI Masterpiece
const SortableTaskItem = memo(({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityConfig = {
    high: { 
      gradient: 'from-red-soft/20 to-coral/10',
      iconBg: 'bg-red-soft/30',
      label: 'فوری',
      icon: '🔥'
    },
    medium: { 
      gradient: 'from-amber-soft/20 to-yellow-warm/10',
      iconBg: 'bg-amber-soft/30',
      label: 'متوسط',
      icon: '⚡'
    },
    low: { 
      gradient: 'from-blue-sky/20 to-blue-pastel/10',
      iconBg: 'bg-blue-sky/30',
      label: 'کم',
      icon: '💫'
    },
  };

  const priority = priorityConfig[task.priority as keyof typeof priorityConfig] || priorityConfig.low;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="touch-none"
    >
      <div className={`
        relative overflow-hidden
        bg-gradient-to-br ${task.completed ? 'from-green-mint/15 to-green-mint/5' : priority.gradient}
        backdrop-blur-sm
        rounded-[28px] p-4
        soft-shadow
        border border-white/40
        transition-all duration-300
        ${!task.completed && 'hover:border-white/60'}
      `}>
        {/* Decorative Elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/3 rounded-full blur-xl" />
        
        <div className="relative flex items-start justify-between gap-3">
          {/* Right Side - Complete Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            whileTap={{ scale: 0.9 }}
            className={`
              shrink-0 w-12 h-12 rounded-[18px]
              flex items-center justify-center
              transition-all duration-300
              soft-shadow-sm
              ${task.completed 
                ? 'bg-green-mint/40 border-2 border-green-mint/50' 
                : 'bg-white/60 border-2 border-white/40 hover:bg-white/80'
              }
            `}
          >
            <CheckCircle2 className={`h-5 w-5 transition-colors ${
              task.completed ? 'text-green-mint' : 'text-muted-foreground'
            }`} />
          </motion.button>

          {/* Left Side - Content */}
          <div className="flex-1 min-w-0 text-right">
            {/* Priority & Category */}
            <div className="flex items-center justify-end gap-2 mb-2">
              <div className={`
                ${priority.iconBg}
                px-3 py-1 rounded-full
                flex items-center gap-1.5
                soft-shadow-sm
              `}>
                <span className="text-xs font-medium text-foreground/80">
                  {priority.label}
                </span>
                <span className="text-sm">{priority.icon}</span>
              </div>
              {task.category && (
                <span className="text-xs text-muted-foreground font-medium px-2.5 py-1 bg-white/30 rounded-full">
                  {task.category}
                </span>
              )}
            </div>

            {/* Title */}
            <h4 className={`
              text-base font-semibold mb-2 leading-snug
              ${task.completed ? 'line-through text-muted-foreground/60' : 'text-foreground'}
            `}>
              {task.title}
            </h4>

            {/* XP Reward */}
            {task.xpReward && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-soft/20 rounded-full">
                <span className="text-xs font-bold text-amber-soft">+{task.xpReward}</span>
                <span className="text-xs font-medium text-amber-soft/80">امتیاز</span>
                <span className="text-sm">⭐</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SortableTaskItem.displayName = 'SortableTaskItem';

const UnifiedDashboard = () => {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const getDateRange = () => {
    const baseDate = selectedDate;
    switch (viewMode) {
      case 'day':
        return { start: startOfDay(baseDate), end: endOfDay(baseDate) };
      case 'week':
        return { start: startOfWeek(baseDate, { weekStartsOn: 6 }), end: endOfWeek(baseDate, { weekStartsOn: 6 }) };
      case 'month':
        return { start: startOfMonth(baseDate), end: endOfMonth(baseDate) };
      case 'year':
        return { start: startOfYear(baseDate), end: endOfYear(baseDate) };
    }
  };

  const navigateDate = (direction: 'next' | 'prev') => {
    setSelectedDate(prev => {
      switch (viewMode) {
        case 'day':
          return direction === 'next' ? addDays(prev, 1) : subDays(prev, 1);
        case 'week':
          return direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1);
        case 'month':
          return direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1);
        case 'year':
          return direction === 'next' ? addYears(prev, 1) : subYears(prev, 1);
      }
    });
  };

  const dateRange = getDateRange();
  
  const filteredTasks = useMemo(() => 
    state.tasks.filter(task => {
      if (!task.deadline) return viewMode === 'day';
      const taskDate = new Date(task.deadline);
      return isWithinInterval(taskDate, dateRange);
    }),
    [state.tasks, dateRange, viewMode]
  );

  const filteredHabits = useMemo(() => state.habits.filter(h => h.isActive), [state.habits]);

  const stats = useMemo(() => {
    const completedTasks = filteredTasks.filter(t => t.completed).length;
    const totalTasks = filteredTasks.length;
    const habitsCompletedToday = filteredHabits.filter(h => {
      const dates = (h.completedDates || []) as string[];
      return dates.includes(format(new Date(), 'yyyy-MM-dd'));
    }).length;
    const totalFocusTime = Math.floor(
      state.focusSessions
        .filter(s => isWithinInterval(new Date(s.startTime), dateRange))
        .reduce((acc, s) => acc + (s.duration || 0), 0) / 60
    );

    return {
      completedTasks,
      totalTasks,
      taskProgress: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      habitsCompletedToday,
      totalHabits: filteredHabits.length,
      habitProgress: filteredHabits.length > 0 ? (habitsCompletedToday / filteredHabits.length) * 100 : 0,
      focusTime: totalFocusTime,
      activeGoals: state.goals.filter(g => g.status !== 'completed').length,
      activePlans: state.plans.filter(p => p.status === 'active').length,
    };
  }, [filteredTasks, filteredHabits, state.focusSessions, state.goals, state.plans, dateRange]);

  const handleTaskComplete = (taskId: string) => {
    const task = filteredTasks.find(t => t.id === taskId);
    if (!task) return;

    dispatch({
      type: 'UPDATE_TASK',
      payload: {
        ...task,
        completed: !task.completed,
        completedAt: !task.completed ? new Date().toISOString() : null,
      },
    });

    if (!task.completed && task.xpReward) {
      dispatch({
        type: 'ADD_XP',
        payload: task.xpReward,
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filteredTasks.findIndex(t => t.id === active.id);
    const newIndex = filteredTasks.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedTasks = arrayMove(filteredTasks, oldIndex, newIndex);
      reorderedTasks.forEach((task, index) => {
        dispatch({
          type: 'UPDATE_TASK',
          payload: { ...task, order: index },
        });
      });
    }
  };

  const handleHabitCheck = (habitId: string) => {
    const habit = filteredHabits.find(h => h.id === habitId);
    if (!habit) return;

    const today = format(new Date(), 'yyyy-MM-dd');
    const dates = (habit.completedDates || []) as string[];
    const isCompleted = dates.includes(today);

    const newDates = isCompleted ? dates.filter(d => d !== today) : [...dates, today];

    dispatch({
      type: 'UPDATE_HABIT',
      payload: {
        ...habit,
        completedDates: newDates,
      },
    });

    if (!isCompleted && habit.xpReward) {
      dispatch({
        type: 'ADD_XP',
        payload: habit.xpReward,
      });
    }
  };

  const formattedDate = useMemo(() => {
    return formatPersianDate(selectedDate, 'dd MMMM yyyy');
  }, [selectedDate]);

  const userXP = state.user.xp || 0;

  return (
    <div className="min-h-screen pb-24" dir="rtl">
      {/* Organic Background Shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-accent/8 rounded-full blur-3xl" />
      </div>

      {/* Header - Compact & Clean */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50 px-3 py-2.5 safe-area-top"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div>
            <h1 className="text-base font-semibold text-foreground">داشبورد</h1>
            <p className="text-xs text-muted-foreground">{formattedDate}</p>
          </div>
          <div className="flex items-center gap-1.5">
            {['day', 'week', 'month', 'year'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as ViewMode)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-primary text-primary-foreground soft-shadow-sm'
                    : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                }`}
              >
                {mode === 'day' ? 'روز' : mode === 'week' ? 'هفته' : mode === 'month' ? 'ماه' : 'سال'}
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Date Navigator */}
        <div className="px-3 py-3">
          <div className="flex items-center justify-between gap-2 bg-card/50 rounded-3xl p-2 soft-shadow-sm border border-border/20">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-muted/50 rounded-full transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            
            <button
              onClick={() => setSelectedDate(new Date())}
              className="flex-1 text-center px-3 py-1.5 hover:bg-muted/50 rounded-full transition-all"
            >
              <p className="text-sm font-medium text-foreground">{formattedDate}</p>
            </button>
            
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-muted/50 rounded-full transition-all"
            >
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Premium Banner */}
        <div className="px-3">
          <PremiumBanner />
        </div>

        {/* Stats Grid - Artistic Mobile Design */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { 
                label: 'وظایف', 
                value: stats.completedTasks, 
                total: stats.totalTasks, 
                gradient: 'from-coral-light/20 to-coral/10',
                iconBg: 'bg-coral-light/20',
                icon: '✓', 
                progress: stats.taskProgress 
              },
              { 
                label: 'عادات', 
                value: stats.habitsCompletedToday, 
                total: stats.totalHabits, 
                gradient: 'from-purple-light/20 to-purple-pastel/10',
                iconBg: 'bg-purple-light/20',
                icon: '⚡', 
                progress: stats.habitProgress 
              },
              { 
                label: 'تمرکز', 
                value: `${stats.focusTime}د`, 
                total: '', 
                gradient: 'from-blue-pastel/20 to-blue-sky/10',
                iconBg: 'bg-blue-pastel/20',
                icon: '🎯' 
              },
              { 
                label: 'امتیاز', 
                value: userXP, 
                total: '', 
                gradient: 'from-amber-soft/20 to-yellow-warm/10',
                iconBg: 'bg-amber-soft/20',
                icon: '⭐' 
              },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: idx * 0.08,
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
                className={`
                  relative overflow-hidden
                  bg-gradient-to-br ${stat.gradient}
                  backdrop-blur-sm
                  rounded-[24px] p-4
                  soft-shadow
                  border border-white/40
                  hover:scale-[1.02] transition-transform duration-300
                `}
              >
                {/* Icon Container */}
                <div className="flex items-center justify-between mb-3">
                  <div className={`
                    ${stat.iconBg}
                    w-10 h-10 rounded-[16px]
                    flex items-center justify-center
                    soft-shadow-sm
                  `}>
                    <span className="text-2xl">{stat.icon}</span>
                  </div>
                  <span className="text-xs font-medium text-foreground/60 tracking-wide">
                    {stat.label}
                  </span>
                </div>

                {/* Value Display */}
                <div className="flex items-baseline justify-end gap-1.5 mb-2">
                  <span className="text-2xl font-bold text-foreground tracking-tight">
                    {stat.value}
                  </span>
                  {stat.total && (
                    <span className="text-sm font-medium text-muted-foreground">
                      /{stat.total}
                    </span>
                  )}
                </div>

                {/* Progress Bar */}
                {stat.progress !== undefined && (
                  <div className="relative h-2 bg-white/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.progress}%` }}
                      transition={{ 
                        delay: idx * 0.08 + 0.3,
                        duration: 0.8,
                        ease: "easeOut"
                      }}
                      className="absolute inset-y-0 right-0 bg-gradient-to-l from-foreground/80 to-foreground/60 rounded-full"
                    />
                  </div>
                )}

                {/* Decorative Element */}
                <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-xl" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-3">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <Card className="rounded-3xl border-border/30 soft-shadow-sm">
              <CardHeader className="pb-3 px-4 pt-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    <span>وظایف امروز</span>
                  </CardTitle>
                  <Badge variant="secondary" className="text-xs rounded-full">
                    {stats.completedTasks}/{stats.totalTasks}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ScrollArea className="h-[400px] pe-2">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-12 space-y-2">
                      <div className="flex justify-center">
                        <div className="p-3 bg-muted/30 rounded-full">
                          <Circle className="h-10 w-10 text-muted-foreground/40" />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">هنوز وظیفه‌ای وجود ندارد</p>
                    </div>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={filteredTasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2.5">
                          <AnimatePresence>
                            {filteredTasks.map(task => (
                              <SortableTaskItem key={task.id} task={task} onComplete={handleTaskComplete} />
                            ))}
                          </AnimatePresence>
                        </div>
                      </SortableContext>
                    </DndContext>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Habits Card - Artistic Masterpiece */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-pastel/10 via-purple-light/5 to-transparent backdrop-blur-sm rounded-[32px] p-5 soft-shadow border border-white/40">
              {/* Decorative Background */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-purple-pastel/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-purple-light/10 rounded-full blur-2xl" />
              
              {/* Header */}
              <div className="relative flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[16px] bg-gradient-to-br from-purple-pastel/30 to-purple-light/20 flex items-center justify-center soft-shadow-sm">
                    <Flame className="h-5 w-5 text-purple-pastel" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">عادات امروز</h3>
                </div>
                {filteredHabits.length > 0 && (
                  <div className="px-3 py-1.5 bg-purple-pastel/20 rounded-full">
                    <span className="text-xs font-bold text-purple-pastel">
                      {filteredHabits.filter(h => ((h.completedDates || []) as string[]).includes(format(new Date(), 'yyyy-MM-dd'))).length}/{filteredHabits.length}
                    </span>
                  </div>
                )}
              </div>

              {/* Habits List */}
              <ScrollArea className="h-[240px] -mx-2 px-2">
                {filteredHabits.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex p-4 bg-purple-pastel/10 rounded-[20px] mb-3">
                      <Circle className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <p className="text-sm text-muted-foreground font-medium">
                      هنوز عادتی وجود ندارد
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredHabits.map((habit, idx) => {
                      const today = format(new Date(), 'yyyy-MM-dd');
                      const isCompleted = ((habit.completedDates || []) as string[]).includes(today);
                      const streak = habit.currentStreak || 0;
                      
                      return (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className={`
                            relative overflow-hidden
                            bg-gradient-to-br 
                            ${isCompleted 
                              ? 'from-green-mint/20 to-green-mint/5' 
                              : 'from-white/60 to-white/30'
                            }
                            backdrop-blur-sm
                            rounded-[24px] p-4
                            soft-shadow-sm
                            border border-white/40
                            transition-all duration-300
                            hover:scale-[1.01]
                          `}
                        >
                          {/* Streak Fire Effect */}
                          {isCompleted && streak > 0 && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-orange-warm/20 rounded-full">
                              <span className="text-xs font-bold text-orange-warm">{streak}</span>
                              <Flame className="h-3 w-3 text-orange-warm" />
                            </div>
                          )}

                          <div className="flex items-center gap-3">
                            {/* Complete Button */}
                            <motion.button
                              onClick={() => handleHabitCheck(habit.id)}
                              whileTap={{ scale: 0.9 }}
                              className={`
                                shrink-0 w-14 h-14 rounded-[20px]
                                flex items-center justify-center
                                transition-all duration-300
                                soft-shadow-sm
                                ${isCompleted
                                  ? 'bg-green-mint/40 border-2 border-green-mint/50' 
                                  : 'bg-white/70 border-2 border-white/50 hover:bg-white/90'
                                }
                              `}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-6 w-6 text-green-mint" />
                              ) : (
                                <Circle className="h-6 w-6 text-muted-foreground/40" />
                              )}
                            </motion.button>

                            {/* Content */}
                            <div className="flex-1 min-w-0 text-right">
                              <h4 className={`
                                text-base font-semibold mb-1 leading-tight
                                ${isCompleted ? 'text-green-mint' : 'text-foreground'}
                              `}>
                                {habit.title}
                              </h4>
                              
                              {/* Category & XP */}
                              <div className="flex items-center justify-end gap-2">
                                {habit.category && (
                                  <span className="text-xs text-muted-foreground font-medium px-2 py-0.5 bg-white/40 rounded-full">
                                    {habit.category}
                                  </span>
                                )}
                                {habit.xpReward && (
                                  <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-soft/20 rounded-full">
                                    <span className="text-xs font-bold text-amber-soft">+{habit.xpReward}</span>
                                    <span className="text-xs">⭐</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Decorative Element */}
                          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-white/5 rounded-full blur-xl" />
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Calendar Widget */}
            <CalendarWidget 
              tasks={filteredTasks}
              habits={filteredHabits}
              onCompleteTask={handleTaskComplete}
              onCheckHabit={handleHabitCheck}
            />

            {/* Notifications */}
            <NotificationPanel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;