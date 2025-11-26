import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, CheckCircle2, Circle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersianCalendar } from '@/components/ui/persian-calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Task, Habit } from '@/types';
import { formatPersianDate } from '@/utils/persianDateUtils';
import { format, isSameDay } from 'date-fns';

interface CalendarWidgetProps {
  tasks: Task[];
  habits: Habit[];
  onDateSelect?: (date: Date) => void;
}

export function CalendarWidget({ tasks, habits, onDateSelect }: CalendarWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());

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

            {/* Tasks and Habits List */}
            {(totalTasks > 0 || completedHabits > 0) ? (
              <ScrollArea className="h-[200px] rounded-lg border border-border/40 bg-background/30 p-3">
                <div className="space-y-3">
                  {/* Tasks */}
                  {selectedDateItems.tasks.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Target className="h-4 w-4 text-blue-500" />
                        وظایف
                      </h4>
                      {selectedDateItems.tasks.map((task) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          ) : (
                            <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {task.title}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs h-5">
                                {task.category}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                className={`text-xs h-5 ${
                                  task.priority === 'high' 
                                    ? 'border-red-500/30 text-red-600' 
                                    : task.priority === 'medium'
                                    ? 'border-orange-500/30 text-orange-600'
                                    : 'border-blue-500/30 text-blue-600'
                                }`}
                              >
                                {task.priority === 'high' ? 'فوری' : task.priority === 'medium' ? 'مهم' : 'عادی'}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* Habits */}
                  {selectedDateItems.habits.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        عادات انجام شده
                      </h4>
                      {selectedDateItems.habits.map((habit) => (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-start gap-2 p-2 rounded-lg bg-green-500/5 border border-green-500/10"
                        >
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground">{habit.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs h-5">
                                {habit.category}
                              </Badge>
                              {habit.xpReward && (
                                <Badge variant="secondary" className="text-xs h-5 bg-amber-500/10 text-amber-600 border-amber-500/20">
                                  +{habit.xpReward} XP
                                </Badge>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p className="text-sm">هیچ رویدادی در این تاریخ ثبت نشده</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
