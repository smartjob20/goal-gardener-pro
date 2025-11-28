import { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Circle, Flame, Clock, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { format, startOfDay, endOfDay, isSameDay, addDays } from 'date-fns';
import { formatPersianDate, getPersianDayName } from '@/utils/persianDateUtils';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';

// Minimal Sortable Task Item
function SortableTaskItem({ task, onComplete }: { task: Task; onComplete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="mb-4"
    >
      <div className={`group p-4 rounded-2xl border transition-all hover:border-primary/40 ${
        task.completed ? 'border-muted bg-muted/30' : 'border-border bg-card'
      }`}>
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-2 opacity-0 group-hover:opacity-100 transition-opacity touch-none min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </button>
          
          {/* Checkbox */}
          <button
            onClick={() => onComplete(task.id)}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center transition-transform hover:scale-110"
          >
            {task.completed ? (
              <CheckCircle2 className="h-6 w-6 text-foreground" />
            ) : (
              <Circle className="h-6 w-6 text-muted-foreground" />
            )}
          </button>

          {/* Task Content */}
          <div className="flex-1 text-right min-w-0">
            <h4 className={`font-medium text-base mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                {task.description}
              </p>
            )}
            <div className="flex items-center gap-3 text-xs text-muted-foreground justify-end">
              {task.deadline && (
                <span>{format(new Date(task.deadline), 'yyyy/MM/dd')}</span>
              )}
              <span className="text-foreground/60">+{task.xpReward} XP</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

const UnifiedDashboard = () => {
  const {
    state,
    completeTask,
    dispatch,
    addXP,
    reorderTasks
  } = useApp();
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

  // Get today's date range
  const dateRange = {
    start: startOfDay(selectedDate),
    end: endOfDay(selectedDate)
  };

  // Filter today's tasks
  const todayTasks = useMemo(() => {
    return state.tasks.filter(task => {
      if (task.completed && task.completedAt) {
        return isSameDay(new Date(task.completedAt), selectedDate);
      }
      if (!task.completed && task.deadline) {
        return isSameDay(new Date(task.deadline), selectedDate);
      }
      if (!task.completed && !task.deadline) {
        return isSameDay(new Date(task.createdAt), selectedDate);
      }
      return false;
    }).sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [state.tasks, selectedDate]);

  // Today's habits
  const activeHabits = useMemo(() => {
    return state.habits.filter(h => h.isActive);
  }, [state.habits]);

  // Calculate stats
  const stats = useMemo(() => {
    const completedTasks = todayTasks.filter(t => t.completed).length;
    const totalTasks = todayTasks.length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const todayString = format(new Date(), 'yyyy-MM-dd');
    const habitsCompletedToday = activeHabits.filter(h => h.completedDates.includes(todayString)).length;
    const habitsTotal = activeHabits.length;
    const habitCompletionRate = habitsTotal > 0 ? (habitsCompletedToday / habitsTotal) * 100 : 0;

    return {
      completedTasks,
      totalTasks,
      completionRate,
      habitsCompletedToday,
      habitsTotal,
      habitCompletionRate,
    };
  }, [todayTasks, activeHabits]);

  // Format date label
  const getDateLabel = () => {
    if (useJalali) {
      return `${getPersianDayName(selectedDate)} ${formatPersianDate(selectedDate)}`;
    } else {
      return format(selectedDate, 'EEEE, d MMMM yyyy');
    }
  };

  const handleTaskComplete = (taskId: string) => {
    completeTask(taskId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = todayTasks.findIndex((task) => task.id === active.id);
      const newIndex = todayTasks.findIndex((task) => task.id === over.id);

      const reorderedTasks = arrayMove(todayTasks, oldIndex, newIndex);
      reorderTasks(reorderedTasks);
      toast.success('ترتیب ذخیره شد');
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
      toast.info('عادت لغو شد');
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
      addXP(habit.xpReward, `عادت: ${habit.title}`);
      toast.success(`+${habit.xpReward} XP`);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(direction === 'next' ? addDays(selectedDate, 1) : addDays(selectedDate, -1));
  };

  return (
    <div className="min-h-screen pb-32" dir="rtl">
      <div className="container mx-auto px-4 max-w-4xl pt-8">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Minimal Header */}
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold text-foreground">
              داشبورد
            </h1>
          </div>

          {/* Date Navigator - Minimal */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('next')}
              className="min-h-[44px] min-w-[44px] rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>

            <div className="text-center flex-1">
              <h2 className="text-lg font-medium text-foreground">
                {getDateLabel()}
              </h2>
              {!isSameDay(selectedDate, new Date()) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="text-xs text-muted-foreground hover:text-foreground mt-1 h-8"
                >
                  امروز
                </Button>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDate('prev')}
              className="min-h-[44px] min-w-[44px] rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </div>

          {/* Minimal Stats */}
          <div className="grid grid-cols-2 gap-6">
            {/* Tasks Stat */}
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground">
                  {stats.completedTasks}<span className="text-muted-foreground text-2xl">/{stats.totalTasks}</span>
                </p>
                <p className="text-sm text-muted-foreground">وظایف</p>
              </div>
              <Progress value={stats.completionRate} className="h-1" />
            </div>

            {/* Habits Stat */}
            <div className="text-center space-y-3">
              <div className="space-y-1">
                <p className="text-4xl font-bold text-foreground">
                  {stats.habitsCompletedToday}<span className="text-muted-foreground text-2xl">/{stats.habitsTotal}</span>
                </p>
                <p className="text-sm text-muted-foreground">عادت‌ها</p>
              </div>
              <Progress value={stats.habitCompletionRate} className="h-1" />
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-right">
                <h3 className="text-lg font-semibold text-foreground">وظایف امروز</h3>
                <p className="text-sm text-muted-foreground mt-0.5">{todayTasks.length} وظیفه</p>
              </div>
            </div>

            {todayTasks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 space-y-3"
              >
                <Circle className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                <p className="text-muted-foreground">هنوز وظیفه‌ای وجود ندارد</p>
              </motion.div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={todayTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <AnimatePresence>
                    {todayTasks.map((task) => (
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
          </div>

          {/* Habits Section */}
          {activeHabits.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="text-right">
                  <h3 className="text-lg font-semibold text-foreground">عادت‌های امروز</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{activeHabits.length} عادت</p>
                </div>
              </div>

              <div className="space-y-4">
                {activeHabits.map((habit, index) => {
                  const todayString = format(new Date(), 'yyyy-MM-dd');
                  const isCompleted = habit.completedDates.includes(todayString);
                  
                  return (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => handleHabitCheck(habit.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isCompleted
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-card hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 text-right min-w-0">
                          <p className={`font-medium text-base ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {habit.title}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground justify-end">
                            <span className="flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              {habit.currentStreak} روز
                            </span>
                            <span>+{habit.xpReward} XP</span>
                          </div>
                        </div>
                        <div className="min-h-[44px] min-w-[44px] flex items-center justify-center">
                          {isCompleted ? (
                            <CheckCircle2 className="h-6 w-6 text-foreground" />
                          ) : (
                            <Circle className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* User Level - Minimal */}
          <div className="text-center py-8 space-y-2">
            <p className="text-sm text-muted-foreground">سطح {state.user.level}</p>
            <p className="text-2xl font-bold text-foreground">{state.user.xp} XP</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default UnifiedDashboard;
