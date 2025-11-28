import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { cloudSyncService, SyncData } from '@/services/CloudSyncService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Palette, Globe, Bell, Volume2, Shield, Database, Download, Upload, Trash2, Calendar, Moon, Sun, Monitor, Save, RotateCcw, Tags, Plus, X, Sparkles, TrendingUp, CheckCircle2, Cloud, CloudOff, RefreshCw, CloudUpload } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';

const Settings = () => {
  const { state, dispatch } = useApp();
  const [settings, setSettings] = useState({
    ...state.settings,
    customTaskCategories: state.settings.customTaskCategories || [],
    customHabitCategories: state.settings.customHabitCategories || [],
    customGoalCategories: state.settings.customGoalCategories || []
  });
  const [hasChanges, setHasChanges] = useState(false);

  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');

  // Cloud Sync State
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    // Check initial cloud sync status
    const syncStatus = cloudSyncService.getSyncStatus();
    setIsCloudConnected(syncStatus.isEnabled);
    setLastSyncTime(syncStatus.lastSyncTime);
  }, []);

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const saveSettings = () => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });

    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    setHasChanges(false);
    toast.success('تنظیمات با موفقیت ذخیره شد! ✅');
  };

  const resetSettings = () => {
    setSettings(state.settings);
    setHasChanges(false);
    toast.info('تغییرات لغو شد');
  };

  const exportData = () => {
    const data = {
      user: state.user,
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      plans: state.plans,
      focusSessions: state.focusSessions,
      achievements: state.achievements,
      settings: state.settings,
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepbreath-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('داده‌ها با موفقیت دانلود شد! 💾');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.user || !data.tasks || !data.habits) {
          throw new Error('فرمت فایل نامعتبر است');
        }
        dispatch({ type: 'LOAD_STATE', payload: data });
        toast.success('داده‌ها با موفقیت بازیابی شد! ✨');
      } catch (error) {
        toast.error('خطا در بازیابی داده‌ها. لطفاً فایل صحیح را انتخاب کنید');
      }
    };
    reader.readAsText(file);
  };

  const clearAllData = () => {
    localStorage.clear();
    window.location.reload();
  };

  const getStorageSize = () => {
    const data = JSON.stringify(state);
    const bytes = new Blob([data]).size;
    const kb = (bytes / 1024).toFixed(2);
    return kb;
  };

  // Cloud Sync Functions
  const handleCloudConnect = async () => {
    setIsSyncing(true);
    const success = await cloudSyncService.authenticate();
    if (success) {
      setIsCloudConnected(true);
      // Start auto sync after connection
      const syncData: SyncData = {
        tasks: state.tasks,
        habits: state.habits,
        goals: state.goals,
        plans: state.plans,
        rewards: state.rewards,
        achievements: state.achievements,
        focusSessions: state.focusSessions,
        user: state.user,
        settings: state.settings,
        lastModified: new Date().toISOString()
      };
      cloudSyncService.startAutoSync(() => syncData);
    }
    setIsSyncing(false);
  };

  const handleCloudDisconnect = () => {
    cloudSyncService.disconnect();
    setIsCloudConnected(false);
    setLastSyncTime(null);
  };

  const handleManualSync = async () => {
    if (!isCloudConnected) {
      toast.error('ابتدا باید به Google Drive متصل شوید');
      return;
    }

    setIsSyncing(true);
    const syncData: SyncData = {
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      plans: state.plans,
      rewards: state.rewards,
      achievements: state.achievements,
      focusSessions: state.focusSessions,
      user: state.user,
      settings: state.settings,
      lastModified: new Date().toISOString()
    };

    const success = await cloudSyncService.manualSync(syncData);
    if (success) {
      const now = new Date().toISOString();
      setLastSyncTime(now);
    }
    setIsSyncing(false);
  };

  const handleCloudRestore = async () => {
    if (!isCloudConnected) {
      toast.error('ابتدا باید به Google Drive متصل شوید');
      return;
    }

    setIsSyncing(true);
    const data = await cloudSyncService.restore();
    if (data) {
      // Merge with current state to preserve fields not in SyncData
      const mergedState = {
        ...state,
        ...data,
        dailyStats: state.dailyStats, // Preserve current stats
        aiSuggestions: state.aiSuggestions // Preserve current AI suggestions
      };
      dispatch({ type: 'LOAD_STATE', payload: mergedState });
      toast.success('داده‌ها از فضای ابری بازیابی شدند! ✨');
    }
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 pb-24" dir="rtl">
      <div className="container mx-auto px-0 sm:px-2 py-2 sm:py-4 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-[70px]"
        >
          {/* Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-3"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                className="inline-block"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/60 blur-xl opacity-50 rounded-full" />
                  <Sparkles className="relative h-12 w-12 sm:h-16 sm:w-16 mx-auto text-primary" />
                </div>
              </motion.div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                تنظیمات و شخصی‌سازی
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                برنامه خود را دقیقاً همان‌طور که می‌خواهید تنظیم کنید
              </p>
            </motion.div>

            {/* Save/Cancel Buttons */}
            <AnimatePresence>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex gap-2 justify-center mt-6"
                >
                  <Button 
                    onClick={saveSettings}
                    className="gap-2 bg-gradient-to-l from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    <Save className="h-4 w-4" />
                    ذخیره تغییرات
                  </Button>
                  <Button variant="outline" onClick={resetSettings} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    لغو
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Tabs defaultValue="appearance" className="space-y-6">
            {/* Tabs List - Horizontal Scroll for Mobile */}
            <ScrollArea className="w-full" dir="rtl">
              <TabsList className="inline-flex w-full sm:w-auto min-w-full sm:min-w-0 h-auto p-1 bg-muted/50 backdrop-blur-sm">
                <TabsTrigger 
                  value="appearance" 
                  className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[48px]"
                >
                  <Palette className="h-4 w-4" />
                  <span className="hidden sm:inline">ظاهر</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications"
                  className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[48px]"
                >
                  <Bell className="h-4 w-4" />
                  <span className="hidden sm:inline">اعلان‌ها</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="categories"
                  className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[48px]"
                >
                  <Tags className="h-4 w-4" />
                  <span className="hidden sm:inline">دسته‌ها</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="privacy"
                  className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[48px]"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden sm:inline">امنیت</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data"
                  className="flex-1 sm:flex-none gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground min-h-[48px]"
                >
                  <Database className="h-4 w-4" />
                  <span className="hidden sm:inline">داده‌ها</span>
                </TabsTrigger>
              </TabsList>
            </ScrollArea>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 space-y-1 bg-gradient-to-br from-primary/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <Palette className="h-5 w-5 text-primary" />
                      </motion.div>
                      تم و ظاهر
                    </CardTitle>
                    <CardDescription>برنامه را با سلیقه خود طراحی کنید</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 sm:p-6">
                    <div className="space-y-3">
                      <Label className="text-base font-semibold">انتخاب تم رنگی</Label>
                      <div className="grid grid-cols-3 gap-3">
                        <Button
                          variant={settings.theme === 'light' ? 'default' : 'outline'}
                          className="flex flex-col items-center gap-2 h-auto py-4 px-2"
                          onClick={() => handleSettingChange('theme', 'light')}
                        >
                          <Sun className="h-6 w-6" />
                          <span className="text-xs">روشن</span>
                        </Button>
                        <Button
                          variant={settings.theme === 'dark' ? 'default' : 'outline'}
                          className="flex flex-col items-center gap-2 h-auto py-4 px-2"
                          onClick={() => handleSettingChange('theme', 'dark')}
                        >
                          <Moon className="h-6 w-6" />
                          <span className="text-xs">تیره</span>
                        </Button>
                        <Button
                          variant={settings.theme === 'auto' ? 'default' : 'outline'}
                          className="flex flex-col items-center gap-2 h-auto py-4 px-2"
                          onClick={() => handleSettingChange('theme', 'auto')}
                        >
                          <Monitor className="h-6 w-6" />
                          <span className="text-xs">خودکار</span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground text-center p-2 bg-muted/30 rounded-lg">
                        💡 در حالت خودکار، تم بر اساس تنظیمات سیستم شما تغییر می‌کند
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-blue-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Globe className="h-5 w-5 text-blue-500" />
                      زبان و منطقه
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="space-y-2">
                      <Label>زبان برنامه</Label>
                      <Select value={settings.language} onValueChange={(value) => handleSettingChange('language', value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fa">🇮🇷 فارسی</SelectItem>
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                          <SelectItem value="ar">🇸🇦 العربية</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>نوع تقویم</Label>
                      <Select value={settings.calendar} onValueChange={(value) => handleSettingChange('calendar', value)}>
                        <SelectTrigger className="h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="jalali">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              تقویم شمسی (جلالی)
                            </div>
                          </SelectItem>
                          <SelectItem value="gregorian">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              تقویم میلادی (گریگوریان)
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-amber-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <motion.div
                        animate={{ rotate: [0, -15, 15, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <Bell className="h-5 w-5 text-amber-500" />
                      </motion.div>
                      اعلان‌ها و یادآورها
                    </CardTitle>
                    <CardDescription>مدیریت اعلان‌ها و یادآورهای برنامه</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <Label className="text-base font-semibold">فعال‌سازی اعلان‌ها</Label>
                        <p className="text-sm text-muted-foreground">
                          دریافت اعلان برای وظایف، عادات و یادآورها
                        </p>
                      </div>
                      <Switch
                        checked={settings.notifications}
                        onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <Label className="text-base font-semibold">یادآور عادات</Label>
                        <p className="text-sm text-muted-foreground">
                          یادآوری روزانه برای انجام عادات
                        </p>
                      </div>
                      <Switch
                        checked={settings.habitReminders}
                        onCheckedChange={(checked) => handleSettingChange('habitReminders', checked)}
                        disabled={!settings.notifications}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-base font-semibold">زمان یادآور روزانه</Label>
                      <Input
                        type="time"
                        value={settings.dailyReminderTime}
                        onChange={(e) => handleSettingChange('dailyReminderTime', e.target.value)}
                        disabled={!settings.notifications}
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground p-2 bg-muted/30 rounded-lg">
                        ⏰ زمان دریافت یادآور روزانه برای مرور وظایف و عادات
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Volume2 className="h-5 w-5 text-purple-500" />
                      صدا و لرزش
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <Label className="text-base font-semibold">صداهای برنامه</Label>
                        <p className="text-sm text-muted-foreground">
                          پخش صدا برای رویدادهای مختلف
                        </p>
                      </div>
                      <Switch
                        checked={settings.sounds}
                        onCheckedChange={(checked) => handleSettingChange('sounds', checked)}
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold">میزان صدا</Label>
                        <span className="text-sm font-medium text-primary">{settings.volume}%</span>
                      </div>
                      <Slider
                        value={[settings.volume]}
                        onValueChange={([value]) => handleSettingChange('volume', value)}
                        max={100}
                        step={5}
                        disabled={!settings.sounds}
                        className="py-2"
                      />
                    </div>

                    <div className="flex items-start justify-between gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <div className="space-y-1 flex-1">
                        <Label className="text-base font-semibold">بازخورد لمسی (Haptics)</Label>
                        <p className="text-sm text-muted-foreground">
                          لرزش هنگام تعامل با برنامه
                        </p>
                      </div>
                      <Switch
                        checked={settings.haptics}
                        onCheckedChange={(checked) => handleSettingChange('haptics', checked)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Categories Tab */}
            <TabsContent value="categories" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-green-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Tags className="h-5 w-5 text-green-500" />
                      دسته‌بندی‌های سفارشی
                    </CardTitle>
                    <CardDescription>
                      دسته‌بندی‌های دلخواه خود را برای سازماندهی بهتر ایجاد کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 sm:p-6">
                    {/* Task Categories */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-blue-500/5 to-transparent border border-blue-500/10">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                        دسته‌بندی‌های وظایف
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={newTaskCategory}
                          onChange={(e) => setNewTaskCategory(e.target.value)}
                          placeholder="نام دسته‌بندی جدید..."
                          className="h-12 text-base"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newTaskCategory.trim()) {
                              const updated = [...settings.customTaskCategories, newTaskCategory.trim()];
                              handleSettingChange('customTaskCategories', updated);
                              setNewTaskCategory('');
                              toast.success('دسته‌بندی اضافه شد!');
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newTaskCategory.trim()) {
                              const updated = [...settings.customTaskCategories, newTaskCategory.trim()];
                              handleSettingChange('customTaskCategories', updated);
                              setNewTaskCategory('');
                              toast.success('دسته‌بندی اضافه شد!');
                            }
                          }}
                          size="icon"
                          className="h-12 w-12 shrink-0"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.customTaskCategories.map((category, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm"
                          >
                            <span>{category}</span>
                            <button
                              onClick={() => {
                                const updated = settings.customTaskCategories.filter((_, i) => i !== index);
                                handleSettingChange('customTaskCategories', updated);
                                toast.success('دسته‌بندی حذف شد');
                              }}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Habit Categories */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-transparent border border-green-500/10">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        دسته‌بندی‌های عادات
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={newHabitCategory}
                          onChange={(e) => setNewHabitCategory(e.target.value)}
                          placeholder="نام دسته‌بندی جدید..."
                          className="h-12 text-base"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newHabitCategory.trim()) {
                              const updated = [...settings.customHabitCategories, newHabitCategory.trim()];
                              handleSettingChange('customHabitCategories', updated);
                              setNewHabitCategory('');
                              toast.success('دسته‌بندی اضافه شد!');
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newHabitCategory.trim()) {
                              const updated = [...settings.customHabitCategories, newHabitCategory.trim()];
                              handleSettingChange('customHabitCategories', updated);
                              setNewHabitCategory('');
                              toast.success('دسته‌بندی اضافه شد!');
                            }
                          }}
                          size="icon"
                          className="h-12 w-12 shrink-0"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.customHabitCategories.map((category, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-2 bg-green-500/10 border border-green-500/20 rounded-full text-sm"
                          >
                            <span>{category}</span>
                            <button
                              onClick={() => {
                                const updated = settings.customHabitCategories.filter((_, i) => i !== index);
                                handleSettingChange('customHabitCategories', updated);
                                toast.success('دسته‌بندی حذف شد');
                              }}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Goal Categories */}
                    <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-amber-500/5 to-transparent border border-amber-500/10">
                      <Label className="text-base font-semibold flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        دسته‌بندی‌های اهداف
                      </Label>
                      <div className="flex gap-2">
                        <Input
                          value={newGoalCategory}
                          onChange={(e) => setNewGoalCategory(e.target.value)}
                          placeholder="نام دسته‌بندی جدید..."
                          className="h-12 text-base"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && newGoalCategory.trim()) {
                              const updated = [...settings.customGoalCategories, newGoalCategory.trim()];
                              handleSettingChange('customGoalCategories', updated);
                              setNewGoalCategory('');
                              toast.success('دسته‌بندی اضافه شد!');
                            }
                          }}
                        />
                        <Button
                          onClick={() => {
                            if (newGoalCategory.trim()) {
                              const updated = [...settings.customGoalCategories, newGoalCategory.trim()];
                              handleSettingChange('customGoalCategories', updated);
                              setNewGoalCategory('');
                              toast.success('دسته‌بندی اضافه شد!');
                            }
                          }}
                          size="icon"
                          className="h-12 w-12 shrink-0"
                        >
                          <Plus className="h-5 w-5" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {settings.customGoalCategories.map((category, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-sm"
                          >
                            <span>{category}</span>
                            <button
                              onClick={() => {
                                const updated = settings.customGoalCategories.filter((_, i) => i !== index);
                                handleSettingChange('customGoalCategories', updated);
                                toast.success('دسته‌بندی حذف شد');
                              }}
                              className="hover:text-destructive transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-br from-primary/5 to-transparent rounded-xl border border-primary/10">
                      <p className="text-sm text-muted-foreground text-center">
                        💡 دسته‌بندی‌های سفارشی به شما کمک می‌کنند تا وظایف، عادات و اهداف خود را بهتر سازماندهی کنید
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-emerald-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Shield className="h-5 w-5 text-emerald-500" />
                      حریم خصوصی و امنیت
                    </CardTitle>
                    <CardDescription>تنظیمات مربوط به حفظ حریم خصوصی شما</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-500/5 to-transparent rounded-xl border border-blue-500/10 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-base">
                        <Database className="h-5 w-5 text-blue-500" />
                        ذخیره‌سازی محلی
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        تمامی داده‌های شما به صورت محلی در مرورگر شما ذخیره می‌شود. 
                        هیچ داده‌ای به سرور ارسال نمی‌شود.
                      </p>
                    </div>

                    <div className="p-4 sm:p-6 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-xl border border-emerald-500/10 space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-base">
                        <Shield className="h-5 w-5 text-emerald-500" />
                        امنیت داده‌ها
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        داده‌های شما فقط در دستگاه شما ذخیره می‌شود و کسی غیر از شما 
                        به آن‌ها دسترسی ندارد. همیشه از داده‌های خود نسخه پشتیبان تهیه کنید.
                      </p>
                    </div>

                    <div className="p-4 sm:p-6 bg-gradient-to-br from-amber-500/5 to-transparent rounded-xl border border-amber-500/10 space-y-3">
                      <h4 className="font-semibold text-amber-600 flex items-center gap-2 text-base">
                        <Sparkles className="h-5 w-5" />
                        توصیه امنیتی
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 shrink-0">•</span>
                          <span>به طور منظم از داده‌های خود نسخه پشتیبان تهیه کنید</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 shrink-0">•</span>
                          <span>از پاک کردن حافظه کش مرورگر خودداری کنید</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-amber-500 shrink-0">•</span>
                          <span>برای امنیت بیشتر، داده‌ها را در فضای ابری ذخیره کنید</span>
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Data Management Tab */}
            <TabsContent value="data" className="space-y-4 mt-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3 bg-gradient-to-br from-purple-500/5 to-transparent">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Database className="h-5 w-5 text-purple-500" />
                      مدیریت داده‌ها
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2">
                      <span>اندازه فعلی داده‌ها:</span>
                      <span className="font-semibold text-primary">{getStorageSize()} KB</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    <Button 
                      onClick={exportData} 
                      variant="outline" 
                      className="w-full justify-start gap-3 h-auto py-4 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      <Download className="h-5 w-5 text-primary shrink-0" />
                      <div className="text-start flex-1">
                        <div className="font-semibold">دانلود نسخه پشتیبان</div>
                        <div className="text-xs text-muted-foreground">تمام داده‌های خود را به صورت فایل JSON دانلود کنید</div>
                      </div>
                    </Button>

                    <div className="space-y-2">
                      <Label htmlFor="import-file">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start gap-3 h-auto py-4 hover:bg-primary/5 hover:border-primary/30 transition-all" 
                          onClick={() => document.getElementById('import-file')?.click()}
                        >
                          <Upload className="h-5 w-5 text-primary shrink-0" />
                          <div className="text-start flex-1">
                            <div className="font-semibold">بازیابی از نسخه پشتیبان</div>
                            <div className="text-xs text-muted-foreground">داده‌های خود را از یک فایل پشتیبان بازیابی کنید</div>
                          </div>
                        </Button>
                      </Label>
                      <input 
                        id="import-file" 
                        type="file" 
                        accept=".json" 
                        onChange={importData} 
                        className="hidden" 
                      />
                    </div>

                    <div className="p-4 sm:p-6 bg-gradient-to-br from-muted/50 to-transparent rounded-xl border border-border/40 space-y-4">
                      <h4 className="font-semibold text-base">آمار داده‌ها</h4>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50">
                          <span className="text-muted-foreground text-xs">وظایف</span>
                          <span className="font-bold text-lg text-primary">{state.tasks.length}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50">
                          <span className="text-muted-foreground text-xs">عادات</span>
                          <span className="font-bold text-lg text-primary">{state.habits.length}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50">
                          <span className="text-muted-foreground text-xs">اهداف</span>
                          <span className="font-bold text-lg text-primary">{state.goals.length}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50">
                          <span className="text-muted-foreground text-xs">برنامه‌ها</span>
                          <span className="font-bold text-lg text-primary">{state.plans.length}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50">
                          <span className="text-muted-foreground text-xs">جلسات تمرکز</span>
                          <span className="font-bold text-lg text-primary">{state.focusSessions.length}</span>
                        </div>
                        <div className="flex flex-col gap-1 p-3 rounded-lg bg-background/50">
                          <span className="text-muted-foreground text-xs">دستاوردها</span>
                          <span className="font-bold text-lg text-primary">
                            {state.achievements.filter(a => a.unlocked).length}/{state.achievements.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Cloud Sync Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <Card className={`overflow-hidden backdrop-blur-sm shadow-lg transition-all ${
                  isCloudConnected 
                    ? 'border-green-500/40 bg-gradient-to-br from-green-500/10 to-blue-500/5' 
                    : 'border-border/40 bg-card/50'
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={isCloudConnected ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                          className={`p-2 rounded-lg ${
                            isCloudConnected ? 'bg-green-500/20' : 'bg-blue-500/10'
                          }`}
                        >
                          {isCloudConnected ? (
                            <Cloud className="h-5 w-5 text-green-600" />
                          ) : (
                            <CloudOff className="h-5 w-5 text-blue-500" />
                          )}
                        </motion.div>
                        <div>
                          <CardTitle className="text-lg">همگام‌سازی ابری</CardTitle>
                          <CardDescription>
                            {isCloudConnected 
                              ? 'متصل به Google Drive - همگام‌سازی خودکار فعال' 
                              : 'اتصال به Google Drive برای backup خودکار'}
                          </CardDescription>
                        </div>
                      </div>
                      {isCloudConnected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="px-3 py-1.5 bg-green-500/20 text-green-700 rounded-full text-xs font-semibold border border-green-500/30"
                        >
                          متصل ✓
                        </motion.div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 p-4 sm:p-6">
                    {!isCloudConnected ? (
                      <Button 
                        onClick={handleCloudConnect}
                        disabled={isSyncing}
                        className="w-full justify-start gap-3 h-auto py-4 bg-gradient-to-l from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
                      >
                        {isSyncing ? (
                          <>
                            <RefreshCw className="h-5 w-5 animate-spin shrink-0" />
                            <div className="text-start flex-1">
                              <div className="font-semibold">در حال اتصال...</div>
                              <div className="text-xs opacity-90">لطفاً صبر کنید</div>
                            </div>
                          </>
                        ) : (
                          <>
                            <Cloud className="h-5 w-5 shrink-0" />
                            <div className="text-start flex-1">
                              <div className="font-semibold">اتصال به Google Drive</div>
                              <div className="text-xs opacity-90">backup خودکار و دسترسی از همه‌جا</div>
                            </div>
                          </>
                        )}
                      </Button>
                    ) : (
                      <>
                        {/* Connected Status and Actions */}
                        <div className="space-y-3">
                          {lastSyncTime && (
                            <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">آخرین همگام‌سازی:</span>
                                <span className="text-sm font-semibold">
                                  {format(new Date(lastSyncTime), 'yyyy/MM/dd - HH:mm')}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Button 
                              onClick={handleManualSync}
                              disabled={isSyncing}
                              variant="outline"
                              className="w-full justify-start gap-3 h-auto py-4 hover:bg-green-500/10 hover:border-green-500/30"
                            >
                              {isSyncing ? (
                                <>
                                  <RefreshCw className="h-5 w-5 animate-spin text-green-600 shrink-0" />
                                  <div className="text-start flex-1">
                                    <div className="font-semibold text-sm">در حال همگام‌سازی...</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="h-5 w-5 text-green-600 shrink-0" />
                                  <div className="text-start flex-1">
                                    <div className="font-semibold text-sm">همگام‌سازی دستی</div>
                                    <div className="text-xs text-muted-foreground">آپلود به فضای ابری</div>
                                  </div>
                                </>
                              )}
                            </Button>

                            <Button 
                              onClick={handleCloudRestore}
                              disabled={isSyncing}
                              variant="outline"
                              className="w-full justify-start gap-3 h-auto py-4 hover:bg-blue-500/10 hover:border-blue-500/30"
                            >
                              {isSyncing ? (
                                <>
                                  <RefreshCw className="h-5 w-5 animate-spin text-blue-600 shrink-0" />
                                  <div className="text-start flex-1">
                                    <div className="font-semibold text-sm">در حال بازیابی...</div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <CloudUpload className="h-5 w-5 text-blue-600 shrink-0" />
                                  <div className="text-start flex-1">
                                    <div className="font-semibold text-sm">بازیابی از ابر</div>
                                    <div className="text-xs text-muted-foreground">دانلود از فضای ابری</div>
                                  </div>
                                </>
                              )}
                            </Button>
                          </div>

                          <Button 
                            onClick={handleCloudDisconnect}
                            variant="outline"
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <CloudOff className="h-4 w-4 ms-2" />
                            قطع اتصال از Google Drive
                          </Button>
                        </div>

                        <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                          <p className="text-sm text-muted-foreground">
                            💡 <strong>همگام‌سازی خودکار:</strong> داده‌های شما به صورت خودکار هر 5 دقیقه یک‌بار 
                            با Google Drive همگام‌سازی می‌شوند. در صورت تضاد، آخرین تغییرات اعمال می‌شود.
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="overflow-hidden border-destructive/40 bg-destructive/5 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg text-destructive">
                      <Trash2 className="h-5 w-5" />
                      منطقه خطر
                    </CardTitle>
                    <CardDescription>عملیات‌های غیرقابل بازگشت</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full h-auto py-4 gap-2">
                          <Trash2 className="h-5 w-5" />
                          پاک کردن تمام داده‌ها
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="max-w-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="text-start">آیا کاملاً مطمئن هستید؟</AlertDialogTitle>
                          <AlertDialogDescription className="text-start">
                            این عمل غیرقابل بازگشت است. تمام داده‌های شما شامل وظایف، عادات، 
                            اهداف، برنامه‌ها، جلسات تمرکز و دستاوردها برای همیشه پاک خواهد شد.
                            <br /><br />
                            <strong className="text-destructive">قبل از ادامه، حتماً از داده‌های خود نسخه پشتیبان تهیه کنید!</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2 sm:gap-0">
                          <AlertDialogCancel>انصراف</AlertDialogCancel>
                          <AlertDialogAction onClick={clearAllData} className="bg-destructive hover:bg-destructive/90">
                            بله، همه چیز را پاک کن
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-sm text-muted-foreground mt-3 text-center p-3 bg-destructive/5 rounded-lg">
                      ⚠️ قبل از پاک کردن داده‌ها، حتماً نسخه پشتیبان تهیه کنید
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">درباره برنامه</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4 sm:p-6">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">نسخه برنامه</span>
                      <span className="font-semibold">1.0.0</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">تاریخ ساخت</span>
                      <span className="font-semibold">{format(new Date(), 'yyyy/MM/dd')}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="text-muted-foreground">تاریخ عضویت</span>
                      <span className="font-semibold">{format(new Date(state.user.createdAt), 'yyyy/MM/dd')}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;
