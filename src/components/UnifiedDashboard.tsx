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

// Memoized Task Card Component
const SortableTaskItem = memo(({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const priorityColors: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    high: 'destructive',
    medium: 'secondary',
    low: 'secondary',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="touch-none"
    >
      <div className={`
        p-3 rounded-3xl border transition-all
        ${task.completed 
          ? 'bg-success/5 border-success/20' 
          : 'bg-card border-border/40 hover:border-primary/30'
        }
        soft-shadow-sm
      `}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant={priorityColors[task.priority as keyof typeof priorityColors]} className="text-xs px-2 py-0.5 rounded-full">
                {task.priority === 'high' ? 'فوری' : task.priority === 'medium' ? 'متوسط' : 'کم'}
              </Badge>
              {task.category && (
                <span className="text-xs text-muted-foreground">{task.category}</span>
              )}
            </div>
            <h4 className={`text-sm font-medium mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h4>
            {task.xpReward && (
              <span className="text-xs text-primary font-medium">+{task.xpReward} XP</span>
            )}
          </div>
          <Button
            variant={task.completed ? 'default' : 'outline'}
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            className="shrink-0 h-9 w-9 rounded-full"
          >
            <CheckCircle2 className="h-4 w-4" />
          </Button>
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

        {/* Stats Grid - Compact Mobile Design */}
        <div className="px-3 py-3">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'وظایف', value: stats.completedTasks, total: stats.totalTasks, color: 'primary', icon: '✓', progress: stats.taskProgress },
              { label: 'عادات', value: stats.habitsCompletedToday, total: stats.totalHabits, color: 'secondary', icon: '⚡', progress: stats.habitProgress },
              { label: 'تمرکز', value: `${stats.focusTime}د`, total: '', color: 'accent', icon: '🎯' },
              { label: 'XP', value: userXP, total: '', color: 'success', icon: '⭐' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-card rounded-3xl p-3 soft-shadow-sm border border-border/30"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{stat.icon}</span>
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1.5">
                  <span className="text-xl font-bold text-foreground">{stat.value}</span>
                  {stat.total && (
                    <span className="text-xs text-muted-foreground">/{stat.total}</span>
                  )}
                </div>
                {stat.progress !== undefined && (
                  <Progress value={stat.progress} className="h-1.5" />
                )}
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
            {/* Habits Card */}
            <Card className="rounded-3xl border-border/30 soft-shadow-sm">
              <CardHeader className="pb-3 px-4 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Flame className="h-4 w-4 text-success" />
                  <span>عادات امروز</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <ScrollArea className="h-[200px]">
                  {filteredHabits.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      هنوز عادتی وجود ندارد
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredHabits.map(habit => {
                        const today = format(new Date(), 'yyyy-MM-dd');
                        const isCompleted = ((habit.completedDates || []) as string[]).includes(today);
                        
                        return (
                          <div
                            key={habit.id}
                            className={`p-2.5 rounded-2xl border transition-all ${
                              isCompleted 
                                ? 'bg-success/5 border-success/20' 
                                : 'bg-card border-border/40'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium ${isCompleted ? 'text-success' : 'text-foreground'}`}>
                                  {habit.title}
                                </p>
                              </div>
                              <Button
                                variant={isCompleted ? 'default' : 'outline'}
                                size="icon"
                                onClick={() => handleHabitCheck(habit.id)}
                                className="shrink-0 h-8 w-8 rounded-full"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

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