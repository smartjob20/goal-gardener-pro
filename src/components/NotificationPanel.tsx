import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Clock, CheckCircle2, X, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { notificationService } from '@/services/NotificationService';
import { useApp } from '@/context/AppContext';

export function NotificationPanel() {
  const { state } = useApp();
  const [isEnabled, setIsEnabled] = useState(notificationService.getEnabled());
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    updateUpcoming();
    
    const interval = setInterval(() => {
      updateUpcoming();
    }, 60000);

    return () => clearInterval(interval);
  }, [state.tasks, state.habits]);

  const updateUpcoming = () => {
    const reminders = notificationService.getUpcomingReminders(state.tasks, state.habits);
    setUpcoming(reminders);
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    setIsEnabled(enabled);
    notificationService.setEnabled(enabled);
    
    if (enabled) {
      await notificationService.requestPermission();
      notificationService.start(state.tasks, state.habits, updateUpcoming);
    } else {
      notificationService.stop();
    }
  };

  const formatTimeUntil = (minutes: number) => {
    if (minutes < 1) return 'اکنون';
    if (minutes < 60) return `${minutes} دقیقه دیگر`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) return `${hours} ساعت دیگر`;
    return `${hours} ساعت و ${remainingMinutes} دقیقه دیگر`;
  };

  return (
    <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
            >
              <Bell className="h-5 w-5 text-primary" />
            </motion.div>
            <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
              یادآوری‌ها
            </span>
          </CardTitle>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSettings(!showSettings)}
            className="h-8 w-8"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Settings Section */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pb-3 border-b border-border/40"
            >
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">فعال‌سازی یادآوری‌ها</span>
                </div>
                <Switch
                  checked={isEnabled}
                  onCheckedChange={handleToggleNotifications}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upcoming Reminders */}
        {isEnabled ? (
          upcoming.length > 0 ? (
            <ScrollArea className="h-[300px]">
              <div className="space-y-2 pe-3">
                {upcoming.map((reminder, index) => (
                  <motion.div
                    key={`${reminder.type}-${reminder.id}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-3 rounded-lg border transition-all hover:shadow-md ${
                      reminder.type === 'task'
                        ? 'bg-blue-500/5 border-blue-500/20 hover:border-blue-500/40'
                        : 'bg-green-500/5 border-green-500/20 hover:border-green-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {reminder.type === 'task' ? (
                        <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
                      ) : (
                        <Clock className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-foreground">
                          {reminder.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              reminder.type === 'task'
                                ? 'border-blue-500/30 text-blue-600 bg-blue-500/5'
                                : 'border-green-500/30 text-green-600 bg-green-500/5'
                            }`}
                          >
                            {reminder.type === 'task' ? '📋 وظیفه' : '🔥 عادت'}
                          </Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeUntil(reminder.minutesUntil)}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-primary">
                        {reminder.time}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p className="text-sm">هیچ یادآوری در انتظار نیست</p>
              <p className="text-xs mt-1">یادآوری‌های خود را در وظایف و عادات تنظیم کنید</p>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
            <p className="text-sm">یادآوری‌ها غیرفعال است</p>
            <p className="text-xs mt-1">برای دریافت یادآوری‌ها، آن را فعال کنید</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
