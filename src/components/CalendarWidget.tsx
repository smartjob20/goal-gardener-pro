import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Target, Edit2, Trash2, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersianCalendar } from '@/components/ui/persian-calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task, Habit } from '@/types';
import { formatPersianDate } from '@/utils/persianDateUtils';
import { format, isSameDay } from 'date-fns';

interface CalendarWidgetProps {
  tasks: Task[];
  habits: Habit[];
  onDateSelect?: (date: Date) => void;
  onCompleteTask?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onCheckHabit?: (habitId: string) => void;
  onEditTask?: (task: Task) => void;
  onEditHabit?: (habit: Habit) => void;
}

export function CalendarWidget({ 
  tasks, 
  habits, 
  onDateSelect, 
  onCompleteTask, 
  onDeleteTask,
  onCheckHabit,
  onEditTask,
  onEditHabit 
}: CalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get tasks and habits for a specific date
  const getItemsForDate = (date: Date) => {
    const tasksForDate = tasks.filter(task => {
      if (task.deadline) {
        return isSameDay(new Date(task.deadline), date);
      }
      return false;
    });

    const habitsForDate = habits.filter(habit => {
      if (habit.completedDates && Array.isArray(habit.completedDates)) {
        return habit.completedDates.some((d: string) => isSameDay(new Date(d), date));
      }
      return false;
    });

    return { tasks: tasksForDate, habits: habitsForDate };
  };

  // Check if a date has any items
  const hasItemsOnDate = (date: Date) => {
    const { tasks: tasksForDate, habits: habitsForDate } = getItemsForDate(date);
    return tasksForDate.length > 0 || habitsForDate.length > 0;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect?.(date);
      setDialogOpen(true);
    }
  };

  const selectedDateItems = getItemsForDate(selectedDate);
  const completedTasks = selectedDateItems.tasks.filter(t => t.completed).length;
  const totalTasks = selectedDateItems.tasks.length;
  const completedHabits = selectedDateItems.habits.length;

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3 space-y-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg sm:text-xl font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              تقویم رویدادها
            </span>
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {formatPersianDate(month, 'MMMM yyyy')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-3 sm:p-6 space-y-4">
        {/* Calendar */}
        <div className="relative">
          <PersianCalendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            className="rounded-lg border border-border/40 bg-background/50 backdrop-blur-sm"
            modifiers={{
              hasItems: (date) => hasItemsOnDate(date)
            }}
            modifiersClassNames={{
              hasItems: "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary"
            }}
          />
        </div>

        {/* Selected Date Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* Date Header */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <div>
                <h3 className="font-bold text-foreground">
                  {formatPersianDate(selectedDate, 'yyyy/MM/dd')}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {formatPersianDate(selectedDate, 'EEEE')}
                </p>
              </div>
              <div className="flex gap-2">
                {totalTasks > 0 && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    {completedTasks}/{totalTasks} وظیفه
                  </Badge>
                )}
                {completedHabits > 0 && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {completedHabits} عادت
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Preview */}
            {(totalTasks > 0 || completedHabits > 0) ? (
              <div className="text-center py-4">
                <Button 
                  onClick={() => setDialogOpen(true)}
                  className="w-full bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <CalendarIcon className="h-4 w-4 me-2" />
                  مشاهده جزئیات کامل این روز
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">هیچ رویدادی در این تاریخ ثبت نشده</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>

      {/* Detailed Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 pb-3 border-b border-border/40 bg-gradient-to-br from-primary/10 to-primary/5">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" />
                {formatPersianDate(selectedDate, 'yyyy/MM/dd')}
              </DialogTitle>
              <div className="flex gap-2">
                {totalTasks > 0 && (
                  <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                    {completedTasks}/{totalTasks} وظیفه
                  </Badge>
                )}
                {completedHabits > 0 && (
                  <Badge variant="secondary" className="bg-green-500/10 text-green-600 border-green-500/20">
                    {completedHabits} عادت
                  </Badge>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {formatPersianDate(selectedDate, 'EEEE')}
            </p>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 sm:p-6">
            <div className="space-y-6">
              {/* Tasks Section */}
              {selectedDateItems.tasks.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-500" />
                    وظایف ({selectedDateItems.tasks.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedDateItems.tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-blue-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={() => onCompleteTask?.(task.id)}
                            className="mt-1 transition-transform hover:scale-110"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground hover:text-blue-500" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-base font-medium ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {task.title}
                            </p>
                            {task.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  task.priority === 'high' 
                                    ? 'border-red-500/30 text-red-600 bg-red-500/5' 
                                    : task.priority === 'medium'
                                    ? 'border-orange-500/30 text-orange-600 bg-orange-500/5'
                                    : 'border-blue-500/30 text-blue-600 bg-blue-500/5'
                                }`}
                              >
                                {task.priority === 'high' ? '🔥 فوری' : task.priority === 'medium' ? '⚡ مهم' : '📌 عادی'}
                              </Badge>
                              {task.xpReward && (
                                <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  +{task.xpReward} XP
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEditTask && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => onEditTask(task)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                            {onDeleteTask && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                onClick={() => onDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Habits Section */}
              {selectedDateItems.habits.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    عادات انجام شده ({selectedDateItems.habits.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedDateItems.habits.map((habit) => (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group relative p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20 hover:border-green-500/40 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mt-1 shrink-0" />
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-medium text-foreground">{habit.title}</p>
                            {habit.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {habit.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <Badge variant="outline" className="text-xs">
                                {habit.category}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-purple-500/30 text-purple-600 bg-purple-500/5">
                                {habit.frequency}
                              </Badge>
                              {habit.xpReward && (
                                <Badge variant="secondary" className="text-xs bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  +{habit.xpReward} XP
                                </Badge>
                              )}
                              {habit.currentStreak && habit.currentStreak > 0 && (
                                <Badge variant="secondary" className="text-xs bg-orange-500/10 text-orange-600 border-orange-500/20">
                                  🔥 {habit.currentStreak} روز
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {onEditHabit && (
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => onEditHabit(habit)}
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {selectedDateItems.tasks.length === 0 && selectedDateItems.habits.length === 0 && (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-20 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    هیچ رویدادی در این تاریخ ثبت نشده
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    وظایف و عادات خود را برای این روز اضافه کنید
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
