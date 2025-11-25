import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Palette, Globe, Bell, Volume2, Clock, Shield, Database, Download, Upload, Trash2, Calendar, Smartphone, Moon, Sun, Monitor, Save, RotateCcw, Tags, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format } from 'date-fns';
const Settings = () => {
  const {
    state,
    dispatch
  } = useApp();
  const [settings, setSettings] = useState({
    ...state.settings,
    customTaskCategories: state.settings.customTaskCategories || [],
    customHabitCategories: state.settings.customHabitCategories || [],
    customGoalCategories: state.settings.customGoalCategories || []
  });
  const [hasChanges, setHasChanges] = useState(false);

  // Custom categories state
  const [newTaskCategory, setNewTaskCategory] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('');
  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };
  const saveSettings = () => {
    dispatch({
      type: 'UPDATE_SETTINGS',
      payload: settings
    });

    // Apply theme to document
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // Auto mode
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
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
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timemanager-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('داده‌ها با موفقیت دانلود شد! 💾');
  };
  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate data structure
        if (!data.user || !data.tasks || !data.habits) {
          throw new Error('فرمت فایل نامعتبر است');
        }
        dispatch({
          type: 'LOAD_STATE',
          payload: data
        });
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
  return <div className="container mx-auto p-4 pb-24 max-w-4xl" dir="rtl">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="mt-[70px]">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">تنظیمات</h1>
            <p className="text-muted-foreground">شخصی‌سازی تجربه خود</p>
          </div>
          {hasChanges && <div className="flex gap-2">
              <Button onClick={saveSettings}>
                <Save className="ml-2 h-4 w-4" />
                ذخیره تغییرات
              </Button>
              <Button variant="outline" onClick={resetSettings}>
                <RotateCcw className="ml-2 h-4 w-4" />
                لغو
              </Button>
            </div>}
        </div>

        <Tabs defaultValue="appearance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="appearance">ظاهر</TabsTrigger>
            <TabsTrigger value="notifications">اعلان‌ها</TabsTrigger>
            <TabsTrigger value="categories">دسته‌بندی‌ها</TabsTrigger>
            <TabsTrigger value="privacy">حریم خصوصی</TabsTrigger>
            <TabsTrigger value="data">داده‌ها</TabsTrigger>
          </TabsList>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  <CardTitle>تم و ظاهر</CardTitle>
                </div>
                <CardDescription>تنظیم ظاهر برنامه بر اساس سلیقه شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>تم رنگی</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <Button variant={settings.theme === 'light' ? 'default' : 'outline'} className="flex items-center justify-center gap-2" onClick={() => handleSettingChange('theme', 'light')}>
                      <Sun className="h-4 w-4" />
                      روشن
                    </Button>
                    <Button variant={settings.theme === 'dark' ? 'default' : 'outline'} className="flex items-center justify-center gap-2" onClick={() => handleSettingChange('theme', 'dark')}>
                      <Moon className="h-4 w-4" />
                      تیره
                    </Button>
                    <Button variant={settings.theme === 'auto' ? 'default' : 'outline'} className="flex items-center justify-center gap-2" onClick={() => handleSettingChange('theme', 'auto')}>
                      <Monitor className="h-4 w-4" />
                      خودکار
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    در حالت خودکار، تم بر اساس تنظیمات سیستم شما تغییر می‌کند
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <CardTitle>زبان و منطقه</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>زبان برنامه</Label>
                  <Select value={settings.language} onValueChange={value => handleSettingChange('language', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fa">فارسی</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع تقویم</Label>
                  <Select value={settings.calendar} onValueChange={value => handleSettingChange('calendar', value)}>
                    <SelectTrigger>
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
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <CardTitle>اعلان‌ها و یادآورها</CardTitle>
                </div>
                <CardDescription>مدیریت اعلان‌ها و یادآورهای برنامه</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>فعال‌سازی اعلان‌ها</Label>
                    <p className="text-sm text-muted-foreground">
                      دریافت اعلان برای وظایف، عادات و یادآورها
                    </p>
                  </div>
                  <Switch checked={settings.notifications} onCheckedChange={checked => handleSettingChange('notifications', checked)} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>یادآور عادات</Label>
                    <p className="text-sm text-muted-foreground">
                      یادآوری روزانه برای انجام عادات
                    </p>
                  </div>
                  <Switch checked={settings.habitReminders} onCheckedChange={checked => handleSettingChange('habitReminders', checked)} disabled={!settings.notifications} />
                </div>

                <div className="space-y-2">
                  <Label>زمان یادآور روزانه</Label>
                  <Input type="time" value={settings.dailyReminderTime} onChange={e => handleSettingChange('dailyReminderTime', e.target.value)} disabled={!settings.notifications} />
                  <p className="text-xs text-muted-foreground">
                    زمان دریافت یادآور روزانه برای مرور وظایف و عادات
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-primary" />
                  <CardTitle>صدا و لرزش</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>صداهای برنامه</Label>
                    <p className="text-sm text-muted-foreground">
                      پخش صدا برای رویدادهای مختلف
                    </p>
                  </div>
                  <Switch checked={settings.sounds} onCheckedChange={checked => handleSettingChange('sounds', checked)} />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>میزان صدا</Label>
                    <span className="text-sm text-muted-foreground">{settings.volume}%</span>
                  </div>
                  <Slider value={[settings.volume]} onValueChange={([value]) => handleSettingChange('volume', value)} max={100} step={5} disabled={!settings.sounds} />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>بازخورد لمسی (Haptics)</Label>
                    <p className="text-sm text-muted-foreground">
                      لرزش هنگام تعامل با برنامه
                    </p>
                  </div>
                  <Switch checked={settings.haptics} onCheckedChange={checked => handleSettingChange('haptics', checked)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Tags className="h-5 w-5 text-primary" />
                  <CardTitle>دسته‌بندی‌های سفارشی</CardTitle>
                </div>
                <CardDescription>دسته‌بندی‌های دلخواه خود را برای وظایف، عادات و اهداف اضافه کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Task Categories */}
                <div className="space-y-3">
                  <Label className="text-base">دسته‌بندی‌های وظایف</Label>
                  <div className="flex gap-2">
                    <Input value={newTaskCategory} onChange={e => setNewTaskCategory(e.target.value)} placeholder="نام دسته‌بندی جدید..." onKeyPress={e => {
                    if (e.key === 'Enter' && newTaskCategory.trim()) {
                      const updated = [...settings.customTaskCategories, newTaskCategory.trim()];
                      handleSettingChange('customTaskCategories', updated);
                      setNewTaskCategory('');
                      toast.success('دسته‌بندی اضافه شد!');
                    }
                  }} />
                    <Button onClick={() => {
                    if (newTaskCategory.trim()) {
                      const updated = [...settings.customTaskCategories, newTaskCategory.trim()];
                      handleSettingChange('customTaskCategories', updated);
                      setNewTaskCategory('');
                      toast.success('دسته‌بندی اضافه شد!');
                    }
                  }} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.customTaskCategories.map((category, index) => <div key={index} className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                        <span>{category}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => {
                      const updated = settings.customTaskCategories.filter((_, i) => i !== index);
                      handleSettingChange('customTaskCategories', updated);
                      toast.success('دسته‌بندی حذف شد');
                    }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>)}
                  </div>
                </div>

                {/* Habit Categories */}
                <div className="space-y-3">
                  <Label className="text-base">دسته‌بندی‌های عادات</Label>
                  <div className="flex gap-2">
                    <Input value={newHabitCategory} onChange={e => setNewHabitCategory(e.target.value)} placeholder="نام دسته‌بندی جدید..." onKeyPress={e => {
                    if (e.key === 'Enter' && newHabitCategory.trim()) {
                      const updated = [...settings.customHabitCategories, newHabitCategory.trim()];
                      handleSettingChange('customHabitCategories', updated);
                      setNewHabitCategory('');
                      toast.success('دسته‌بندی اضافه شد!');
                    }
                  }} />
                    <Button onClick={() => {
                    if (newHabitCategory.trim()) {
                      const updated = [...settings.customHabitCategories, newHabitCategory.trim()];
                      handleSettingChange('customHabitCategories', updated);
                      setNewHabitCategory('');
                      toast.success('دسته‌بندی اضافه شد!');
                    }
                  }} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.customHabitCategories.map((category, index) => <div key={index} className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                        <span>{category}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => {
                      const updated = settings.customHabitCategories.filter((_, i) => i !== index);
                      handleSettingChange('customHabitCategories', updated);
                      toast.success('دسته‌بندی حذف شد');
                    }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>)}
                  </div>
                </div>

                {/* Goal Categories */}
                <div className="space-y-3">
                  <Label className="text-base">دسته‌بندی‌های اهداف</Label>
                  <div className="flex gap-2">
                    <Input value={newGoalCategory} onChange={e => setNewGoalCategory(e.target.value)} placeholder="نام دسته‌بندی جدید..." onKeyPress={e => {
                    if (e.key === 'Enter' && newGoalCategory.trim()) {
                      const updated = [...settings.customGoalCategories, newGoalCategory.trim()];
                      handleSettingChange('customGoalCategories', updated);
                      setNewGoalCategory('');
                      toast.success('دسته‌بندی اضافه شد!');
                    }
                  }} />
                    <Button onClick={() => {
                    if (newGoalCategory.trim()) {
                      const updated = [...settings.customGoalCategories, newGoalCategory.trim()];
                      handleSettingChange('customGoalCategories', updated);
                      setNewGoalCategory('');
                      toast.success('دسته‌بندی اضافه شد!');
                    }
                  }} size="icon">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {settings.customGoalCategories.map((category, index) => <div key={index} className="flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                        <span>{category}</span>
                        <Button variant="ghost" size="sm" className="h-auto p-0 ml-1" onClick={() => {
                      const updated = settings.customGoalCategories.filter((_, i) => i !== index);
                      handleSettingChange('customGoalCategories', updated);
                      toast.success('دسته‌بندی حذف شد');
                    }}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>)}
                  </div>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 دسته‌بندی‌های سفارشی به شما کمک می‌کنند تا وظایف، عادات و اهداف خود را بهتر سازماندهی کنید.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>حریم خصوصی و امنیت</CardTitle>
                </div>
                <CardDescription>تنظیمات مربوط به حفظ حریم خصوصی شما</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    ذخیره‌سازی محلی
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    تمامی داده‌های شما به صورت محلی در مرورگر شما ذخیره می‌شود. 
                    هیچ داده‌ای به سرور ارسال نمی‌شود.
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    امنیت داده‌ها
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    داده‌های شما فقط در دستگاه شما ذخیره می‌شود و کسی غیر از شما 
                    به آن‌ها دسترسی ندارد. همیشه از داده‌های خود نسخه پشتیبان تهیه کنید.
                  </p>
                </div>

                <div className="p-4 border border-primary/20 rounded-lg space-y-2">
                  <h4 className="font-medium text-primary">توصیه امنیتی</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>به طور منظم از داده‌های خود نسخه پشتیبان تهیه کنید</li>
                    <li>از پاک کردن حافظه کش مرورگر خودداری کنید</li>
                    <li>برای امنیت بیشتر، داده‌ها را در فضای ابری ذخیره کنید</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management Tab */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-primary" />
                  <CardTitle>مدیریت داده‌ها</CardTitle>
                </div>
                <CardDescription>
                  اندازه فعلی داده‌ها: {getStorageSize()} KB
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  <Button onClick={exportData} variant="outline" className="justify-start">
                    <Download className="ml-2 h-4 w-4" />
                    دانلود نسخه پشتیبان
                  </Button>
                  <p className="text-sm text-muted-foreground px-2">
                    تمام داده‌های خود را به صورت فایل JSON دانلود کنید
                  </p>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="import-file">
                    <Button variant="outline" className="justify-start w-full" onClick={() => document.getElementById('import-file')?.click()}>
                      <Upload className="ml-2 h-4 w-4" />
                      بازیابی از نسخه پشتیبان
                    </Button>
                  </Label>
                  <input id="import-file" type="file" accept=".json" onChange={importData} className="hidden" />
                  <p className="text-sm text-muted-foreground px-2">
                    داده‌های خود را از یک فایل پشتیبان بازیابی کنید
                  </p>
                </div>

                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <h4 className="font-medium">آمار داده‌ها</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">وظایف:</span>
                      <span className="font-medium">{state.tasks.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">عادات:</span>
                      <span className="font-medium">{state.habits.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">اهداف:</span>
                      <span className="font-medium">{state.goals.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">برنامه‌ها:</span>
                      <span className="font-medium">{state.plans.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">جلسات تمرکز:</span>
                      <span className="font-medium">{state.focusSessions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">دستاوردها:</span>
                      <span className="font-medium">{state.achievements.filter(a => a.unlocked).length}/{state.achievements.length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-destructive" />
                  <CardTitle className="text-destructive">منطقه خطر</CardTitle>
                </div>
                <CardDescription>
                  عملیات‌های غیرقابل بازگشت
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="ml-2 h-4 w-4" />
                      پاک کردن تمام داده‌ها
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>آیا کاملاً مطمئن هستید؟</AlertDialogTitle>
                      <AlertDialogDescription>
                        این عمل غیرقابل بازگشت است. تمام داده‌های شما شامل وظایف، عادات، 
                        اهداف، برنامه‌ها، جلسات تمرکز و دستاوردها برای همیشه پاک خواهد شد.
                        <br /><br />
                        <strong>قبل از ادامه، حتماً از داده‌های خود نسخه پشتیبان تهیه کنید!</strong>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>انصراف</AlertDialogCancel>
                      <AlertDialogAction onClick={clearAllData} className="bg-destructive">
                        بله، همه چیز را پاک کن
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                <p className="text-sm text-muted-foreground mt-3">
                  ⚠️ قبل از پاک کردن داده‌ها، حتماً نسخه پشتیبان تهیه کنید
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>درباره برنامه</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نسخه برنامه:</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاریخ ساخت:</span>
                  <span className="font-medium">{format(new Date(), 'yyyy/MM/dd')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تاریخ عضویت:</span>
                  <span className="font-medium">{format(new Date(state.user.createdAt), 'yyyy/MM/dd')}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>;
};
export default Settings;