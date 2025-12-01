import { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Play, Pause, RotateCcw, Settings, Clock, Target, Zap, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format } from 'date-fns';

type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak' | 'custom';

const Focus = () => {
  const { state, addXP, dispatch } = useApp();
  
  // Timer settings
  const [pomodoroDuration, setPomodoroDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [customDuration, setCustomDuration] = useState(30);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  
  // Timer state
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(pomodoroDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  // Settings
  const [autoStartBreaks, setAutoStartBreaks] = useState(false);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dailyGoal, setDailyGoal] = useState(8); // 8 pomodoros per day
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Calculate today's sessions
  const todaySessions = state.focusSessions.filter(
    session => format(new Date(session.startTime), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
  );
  
  const todayFocusTime = todaySessions.reduce((acc, session) => acc + session.duration, 0);
  const todaySessionsCount = todaySessions.filter(s => s.completed).length;

  // Get initial duration based on mode
  const getInitialDuration = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'pomodoro': return pomodoroDuration * 60;
      case 'shortBreak': return shortBreakDuration * 60;
      case 'longBreak': return longBreakDuration * 60;
      case 'custom': return customDuration * 60;
      default: return pomodoroDuration * 60;
    }
  };

  // Change mode
  const changeMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(getInitialDuration(newMode));
    setIsRunning(false);
  };

  // Start/Pause timer
  const toggleTimer = () => {
    if (!isRunning && mode === 'pomodoro' && !selectedTaskId && state.tasks.filter(t => !t.completed).length > 0) {
      toast.error('لطفاً یک وظیفه انتخاب کنید');
      return;
    }
    setIsRunning(!isRunning);
    
    if (!isRunning && timeLeft === getInitialDuration(mode)) {
      // Starting new session
      const sessionId = `session-${Date.now()}`;
      dispatch({
        type: 'ADD_FOCUS_SESSION',
        payload: {
          id: sessionId,
          taskId: selectedTaskId || undefined,
          startTime: new Date().toISOString(),
          duration: 0,
          dollarsEarned: 0,
          completed: false,
        }
      });
    }
  };

  // Reset timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getInitialDuration(mode));
  };

  // Complete session
  const completeSession = () => {
    if (mode === 'pomodoro') {
      const newSessionCount = sessionCount + 1;
      setSessionCount(newSessionCount);
      
      // Add XP
      const xpReward = 50;
      addXP(xpReward, 'تکمیل جلسه تمرکز');
      
      // Update focus session
      const lastSession = [...state.focusSessions].reverse().find(s => !s.completed);
      if (lastSession) {
        dispatch({
          type: 'UPDATE_FOCUS_SESSION',
          payload: {
            ...lastSession,
            endTime: new Date().toISOString(),
            duration: pomodoroDuration,
            dollarsEarned: xpReward,
            completed: true,
          }
        });
      }
      
      // Update task time
      if (selectedTaskId) {
        const task = state.tasks.find(t => t.id === selectedTaskId);
        if (task) {
          dispatch({
            type: 'UPDATE_TASK',
            payload: {
              ...task,
              timeSpent: (task.timeSpent || 0) + pomodoroDuration,
            }
          });
        }
      }
      
      toast.success(`جلسه تمرکز تمام شد! ${xpReward} XP دریافت کردید 🎉`);
      
      // Play sound
      if (soundEnabled) {
        playSound();
      }
      
      // Auto-start next session
      const shouldStartLongBreak = newSessionCount % sessionsUntilLongBreak === 0;
      const nextMode = shouldStartLongBreak ? 'longBreak' : 'shortBreak';
      changeMode(nextMode);
      
      if (autoStartBreaks) {
        setIsRunning(true);
      }
    } else {
      // Break completed
      toast.success('استراحت تمام شد! آماده برای جلسه بعدی؟');
      
      if (soundEnabled) {
        playSound();
      }
      
      changeMode('pomodoro');
      
      if (autoStartPomodoros) {
        setIsRunning(true);
      }
    }
  };

  // Play completion sound
  const playSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGJ0fPTgjMGHm7A7+OZTRA');
    }
    audioRef.current.play().catch(() => {});
  };

  // Timer effect
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeSession();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = getInitialDuration(mode);
  const progress = ((totalDuration - timeLeft) / totalDuration) * 100;

  return (
    <div className="container mx-auto p-4 pb-24 max-w-6xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">حالت تمرکز</h1>
          <p className="text-muted-foreground">با تکنیک پومودورو بهره‌وری خود را افزایش دهید</p>
        </div>

        {/* Stats Cards - Mobile Friendly */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">امروز</p>
                  <p className="text-xl sm:text-2xl font-bold">{todaySessionsCount}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">جلسه</p>
                </div>
                <Target className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">زمان تمرکز</p>
                  <p className="text-xl sm:text-2xl font-bold">{todayFocusTime}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">دقیقه</p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">هدف روزانه</p>
                  <p className="text-xl sm:text-2xl font-bold">{Math.round((todaySessionsCount / dailyGoal) * 100)}%</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">{todaySessionsCount}/{dailyGoal}</p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">کل جلسات</p>
                  <p className="text-xl sm:text-2xl font-bold">{state.focusSessions.filter(s => s.completed).length}</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">تکمیل شده</p>
                </div>
                <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Timer Section */}
          <div className="md:col-span-2">
            <Card>
              <CardContent className="p-4 sm:p-6">
                {/* Mode Selector - Mobile Friendly */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <Button
                    variant={mode === 'pomodoro' ? 'default' : 'outline'}
                    onClick={() => changeMode('pomodoro')}
                    disabled={isRunning}
                    className="h-auto py-2 sm:py-2.5 text-xs sm:text-sm"
                  >
                    <span className="truncate">پومودورو ({pomodoroDuration}د)</span>
                  </Button>
                  <Button
                    variant={mode === 'shortBreak' ? 'default' : 'outline'}
                    onClick={() => changeMode('shortBreak')}
                    disabled={isRunning}
                    className="h-auto py-2 sm:py-2.5 text-xs sm:text-sm"
                  >
                    <span className="truncate">استراحت کوتاه ({shortBreakDuration}د)</span>
                  </Button>
                  <Button
                    variant={mode === 'longBreak' ? 'default' : 'outline'}
                    onClick={() => changeMode('longBreak')}
                    disabled={isRunning}
                    className="h-auto py-2 sm:py-2.5 text-xs sm:text-sm"
                  >
                    <span className="truncate">استراحت بلند ({longBreakDuration}د)</span>
                  </Button>
                  <Button
                    variant={mode === 'custom' ? 'default' : 'outline'}
                    onClick={() => changeMode('custom')}
                    disabled={isRunning}
                    className="h-auto py-2 sm:py-2.5 text-xs sm:text-sm"
                  >
                    <span className="truncate">سفارشی ({customDuration}د)</span>
                  </Button>
                </div>

                {/* Timer Display */}
                <div className="text-center mb-6">
                  <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-4 font-mono leading-tight">
                    {formatTime(timeLeft)}
                  </div>
                  <Progress value={progress} className="mb-4 h-2 sm:h-3" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {mode === 'pomodoro' ? 'جلسه تمرکز' : mode === 'shortBreak' ? 'استراحت کوتاه' : mode === 'longBreak' ? 'استراحت بلند' : 'زمان سفارشی'}
                  </p>
                  {mode === 'pomodoro' && (
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      جلسه {sessionCount % sessionsUntilLongBreak + 1} از {sessionsUntilLongBreak}
                    </p>
                  )}
                </div>

                {/* Task Selection */}
                {mode === 'pomodoro' && state.tasks.filter(t => !t.completed).length > 0 && (
                  <div className="mb-6">
                    <Label className="text-sm sm:text-base">روی چه وظیفه‌ای کار می‌کنید؟</Label>
                    <Select value={selectedTaskId} onValueChange={setSelectedTaskId} disabled={isRunning}>
                      <SelectTrigger className="mt-2 h-11 text-sm sm:text-base">
                        <SelectValue placeholder="انتخاب وظیفه..." />
                      </SelectTrigger>
                      <SelectContent>
                        {state.tasks.filter(t => !t.completed).map(task => (
                          <SelectItem key={task.id} value={task.id} className="text-sm sm:text-base">
                            {task.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Controls */}
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={toggleTimer}
                    className="flex-1 min-w-[120px] sm:flex-initial sm:w-32 h-11 sm:h-12 text-sm sm:text-base"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="ms-2 h-4 w-4 sm:h-5 sm:w-5" />
                        توقف
                      </>
                    ) : (
                      <>
                        <Play className="ms-2 h-4 w-4 sm:h-5 sm:w-5" />
                        شروع
                      </>
                    )}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={resetTimer}
                    className="flex-1 min-w-[100px] sm:flex-initial h-11 sm:h-12 text-sm sm:text-base"
                  >
                    <RotateCcw className="ms-2 h-4 w-4 sm:h-5 sm:w-5" />
                    ریست
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="lg" variant="outline" className="flex-1 min-w-[120px] sm:flex-initial h-11 sm:h-12 text-sm sm:text-base">
                        <Settings className="ms-2 h-4 w-4 sm:h-5 sm:w-5" />
                        تنظیمات
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md mx-4">
                      <DialogHeader>
                        <DialogTitle className="text-base sm:text-lg">تنظیمات تایمر</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        <div>
                          <Label>مدت پومودورو (دقیقه)</Label>
                          <Input
                            type="number"
                            value={pomodoroDuration}
                            onChange={(e) => setPomodoroDuration(Number(e.target.value))}
                            min={1}
                            max={60}
                          />
                        </div>
                        <div>
                          <Label>مدت استراحت کوتاه (دقیقه)</Label>
                          <Input
                            type="number"
                            value={shortBreakDuration}
                            onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                            min={1}
                            max={30}
                          />
                        </div>
                        <div>
                          <Label>مدت استراحت بلند (دقیقه)</Label>
                          <Input
                            type="number"
                            value={longBreakDuration}
                            onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                            min={1}
                            max={60}
                          />
                        </div>
                        <div>
                          <Label>مدت زمان سفارشی (دقیقه)</Label>
                          <Input
                            type="number"
                            value={customDuration}
                            onChange={(e) => setCustomDuration(Number(e.target.value))}
                            min={1}
                            max={120}
                          />
                        </div>
                        <div>
                          <Label>جلسات تا استراحت بلند</Label>
                          <Input
                            type="number"
                            value={sessionsUntilLongBreak}
                            onChange={(e) => setSessionsUntilLongBreak(Number(e.target.value))}
                            min={2}
                            max={10}
                          />
                        </div>
                        <div>
                          <Label>هدف روزانه (تعداد جلسات)</Label>
                          <Input
                            type="number"
                            value={dailyGoal}
                            onChange={(e) => setDailyGoal(Number(e.target.value))}
                            min={1}
                            max={20}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>شروع خودکار استراحت</Label>
                          <Switch
                            checked={autoStartBreaks}
                            onCheckedChange={setAutoStartBreaks}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>شروع خودکار پومودورو</Label>
                          <Switch
                            checked={autoStartPomodoros}
                            onCheckedChange={setAutoStartPomodoros}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label>صدای اعلان</Label>
                          <Switch
                            checked={soundEnabled}
                            onCheckedChange={setSoundEnabled}
                          />
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Section */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">تاریخچه جلسات امروز</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  {todaySessionsCount} جلسه تکمیل شده
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[500px] overflow-y-auto">
                  {todaySessions.length === 0 ? (
                    <p className="text-xs sm:text-sm text-muted-foreground text-center py-6 sm:py-8">
                      هنوز جلسه‌ای تکمیل نکرده‌اید
                    </p>
                  ) : (
                    todaySessions.slice().reverse().map((session) => {
                      const task = session.taskId ? state.tasks.find(t => t.id === session.taskId) : null;
                      return (
                        <div
                          key={session.id}
                          className="p-2.5 sm:p-3 bg-secondary/50 rounded-lg"
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="text-xs sm:text-sm font-medium truncate flex-1">
                              {task ? task.title : 'بدون وظیفه'}
                            </p>
                            {session.completed && (
                              <span className="text-[10px] sm:text-xs bg-primary/20 text-primary px-1.5 sm:px-2 py-0.5 sm:py-1 rounded whitespace-nowrap">
                                +{session.dollarsEarned} دلار
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[10px] sm:text-xs text-muted-foreground">
                            <span>{format(new Date(session.startTime), 'HH:mm')}</span>
                            <span>{session.duration} دقیقه</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Focus;
