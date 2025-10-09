import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Habit, HabitCategory, HabitFrequency, HabitType, HabitDifficulty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Flame, Trophy, Calendar, TrendingUp, Edit2, Trash2, Power, Lightbulb, CheckCircle2, Circle, Zap } from 'lucide-react';
import { getTodayString, calculateStreak, getWeekDays } from '@/utils/dateUtils';
import { toast } from 'sonner';

// قالب‌های آماده
const habitTemplates = [
  { title: 'ورزش روزانه', category: 'fitness', target: 30, targetUnit: 'دقیقه', difficulty: 'medium', color: '#ef4444' },
  { title: 'مطالعه کتاب', category: 'learning', target: 30, targetUnit: 'دقیقه', difficulty: 'easy', color: '#3b82f6' },
  { title: 'مدیتیشن', category: 'mindfulness', target: 10, targetUnit: 'دقیقه', difficulty: 'easy', color: '#8b5cf6' },
  { title: 'نوشیدن آب', category: 'nutrition', target: 8, targetUnit: 'لیوان', difficulty: 'easy', color: '#06b6d4' },
  { title: 'خواب منظم', category: 'health', target: 8, targetUnit: 'ساعت', difficulty: 'medium', color: '#6366f1' },
  { title: 'یادگیری زبان', category: 'learning', target: 20, targetUnit: 'دقیقه', difficulty: 'medium', color: '#10b981' },
  { title: 'نوشتن خاطرات', category: 'creativity', target: 15, targetUnit: 'دقیقه', difficulty: 'easy', color: '#f59e0b' },
  { title: 'یوگا صبحگاهی', category: 'fitness', target: 20, targetUnit: 'دقیقه', difficulty: 'medium', color: '#ec4899' },
  { title: 'تمیز کردن خانه', category: 'productivity', target: 30, targetUnit: 'دقیقه', difficulty: 'medium', color: '#14b8a6' },
  { title: 'برنامه‌نویسی', category: 'learning', target: 60, targetUnit: 'دقیقه', difficulty: 'hard', color: '#f97316' },
  { title: 'گفتگو با خانواده', category: 'relationship', target: 30, targetUnit: 'دقیقه', difficulty: 'easy', color: '#d946ef' },
  { title: 'مدیریت مالی', category: 'finance', target: 1, targetUnit: 'بار', difficulty: 'medium', color: '#84cc16' },
];

const categories: { value: HabitCategory; label: string; icon: string }[] = [
  { value: 'health', label: 'سلامت عمومی', icon: '❤️' },
  { value: 'fitness', label: 'تناسب اندام', icon: '💪' },
  { value: 'nutrition', label: 'تغذیه', icon: '🥗' },
  { value: 'productivity', label: 'بهره‌وری', icon: '⚡' },
  { value: 'learning', label: 'یادگیری', icon: '📚' },
  { value: 'mindfulness', label: 'آرامش ذهن', icon: '🧘' },
  { value: 'social', label: 'روابط اجتماعی', icon: '👥' },
  { value: 'creativity', label: 'خلاقیت', icon: '🎨' },
  { value: 'finance', label: 'مالی', icon: '💰' },
  { value: 'relationship', label: 'روابط عاطفی', icon: '💕' },
];

const difficulties: { value: HabitDifficulty; label: string; xp: number }[] = [
  { value: 'easy', label: 'آسان', xp: 10 },
  { value: 'medium', label: 'متوسط', xp: 20 },
  { value: 'hard', label: 'سخت', xp: 30 },
];

const HabitTracker = () => {
  const { state, dispatch, checkHabit, addHabit } = useApp();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  
  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [target, setTarget] = useState('1');
  const [targetUnit, setTargetUnit] = useState('بار');
  const [habitType, setHabitType] = useState<HabitType>('qualitative');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('easy');
  const [color, setColor] = useState('#6366f1');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('health');
    setTarget('1');
    setTargetUnit('بار');
    setHabitType('qualitative');
    setFrequency('daily');
    setDifficulty('easy');
    setColor('#6366f1');
    setReminderEnabled(false);
    setReminderTime('09:00');
    setEditingHabit(null);
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error('لطفاً عنوان عادت را وارد کنید');
      return;
    }

    const xpReward = difficulties.find(d => d.value === difficulty)?.xp || 10;

    if (editingHabit) {
      dispatch({
        type: 'UPDATE_HABIT',
        payload: {
          ...editingHabit,
          title: title.trim(),
          description: description.trim(),
          category,
          target: parseInt(target),
          targetUnit,
          habitType,
          frequency,
          difficulty,
          color,
          reminderEnabled,
          reminderTime: reminderEnabled ? reminderTime : undefined,
          xpReward,
        },
      });
      toast.success('عادت با موفقیت ویرایش شد! ✏️');
    } else {
      addHabit({
        title: title.trim(),
        description: description.trim(),
        category,
        target: parseInt(target),
        targetUnit,
        habitType,
        frequency,
        difficulty,
        color,
        reminderEnabled,
        reminderTime: reminderEnabled ? reminderTime : undefined,
        xpReward,
        isActive: true,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleTemplateSelect = (template: typeof habitTemplates[0]) => {
    setTitle(template.title);
    setCategory(template.category as HabitCategory);
    setTarget(template.target.toString());
    setTargetUnit(template.targetUnit);
    setDifficulty(template.difficulty as HabitDifficulty);
    setColor(template.color);
    setHabitType('quantitative');
    setShowTemplates(false);
  };

  const handleEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setTitle(habit.title);
    setDescription(habit.description || '');
    setCategory(habit.category);
    setTarget(habit.target.toString());
    setTargetUnit(habit.targetUnit);
    setHabitType(habit.habitType);
    setFrequency(habit.frequency);
    setDifficulty(habit.difficulty);
    setColor(habit.color);
    setReminderEnabled(habit.reminderEnabled);
    setReminderTime(habit.reminderTime || '09:00');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این عادت مطمئن هستید؟')) {
      dispatch({ type: 'DELETE_HABIT', payload: id });
      toast.success('عادت حذف شد');
    }
  };

  const handleToggleActive = (habit: Habit) => {
    dispatch({
      type: 'UPDATE_HABIT',
      payload: { ...habit, isActive: !habit.isActive },
    });
    toast.success(habit.isActive ? 'عادت غیرفعال شد' : 'عادت فعال شد');
  };

  const today = getTodayString();
  const activeHabits = state.habits.filter(h => h.isActive);
  const inactiveHabits = state.habits.filter(h => !h.isActive);

  // محاسبه آمار کلی
  const totalStreak = activeHabits.reduce((sum, h) => sum + h.currentStreak, 0);
  const todayCompleted = activeHabits.filter(h => h.completedDates.includes(today)).length;
  const completionRate = activeHabits.length > 0 ? Math.round((todayCompleted / activeHabits.length) * 100) : 0;

  const getStreakForHabit = (habit: Habit) => {
    return calculateStreak(habit.completedDates);
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header با آمار */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">عادت‌های من 🔥</h1>
            <p className="text-muted-foreground mt-1">ردیابی و تقویت عادت‌های مثبت</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-elegant hover-scale">
                <Plus className="w-4 h-4" />
                عادت جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingHabit ? 'ویرایش عادت' : 'افزودن عادت جدید'}</DialogTitle>
              </DialogHeader>
              
              {/* دکمه قالب‌های آماده */}
              {!editingHabit && (
                <Button
                  variant="outline"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="w-full gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showTemplates ? 'بستن قالب‌های آماده' : 'استفاده از قالب آماده'}
                </Button>
              )}

              {/* قالب‌های آماده */}
              {showTemplates && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="grid grid-cols-2 gap-2 p-4 bg-accent rounded-lg"
                >
                  {habitTemplates.map((template, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      onClick={() => handleTemplateSelect(template)}
                      className="justify-start text-right h-auto py-2"
                    >
                      <div className="flex flex-col items-start w-full">
                        <span className="font-medium">{template.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.target} {template.targetUnit}
                        </span>
                      </div>
                    </Button>
                  ))}
                </motion.div>
              )}

              <div className="space-y-4">
                {/* عنوان */}
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان عادت *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: ورزش روزانه"
                  />
                </div>

                {/* توضیحات */}
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="یادداشت‌های شما درباره این عادت..."
                    rows={3}
                  />
                </div>

                {/* دسته‌بندی */}
                <div className="space-y-2">
                  <Label>دسته‌بندی</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as HabitCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* نوع عادت */}
                <div className="space-y-2">
                  <Label>نوع عادت</Label>
                  <Select value={habitType} onValueChange={(v) => setHabitType(v as HabitType)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="qualitative">کیفی (فقط انجام/عدم انجام)</SelectItem>
                      <SelectItem value="quantitative">کمی (با هدف عددی)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* هدف و واحد */}
                {habitType === 'quantitative' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target">هدف</Label>
                      <Input
                        id="target"
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="targetUnit">واحد</Label>
                      <Select value={targetUnit} onValueChange={setTargetUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="بار">بار</SelectItem>
                          <SelectItem value="دقیقه">دقیقه</SelectItem>
                          <SelectItem value="ساعت">ساعت</SelectItem>
                          <SelectItem value="صفحه">صفحه</SelectItem>
                          <SelectItem value="لیوان">لیوان</SelectItem>
                          <SelectItem value="قدم">قدم</SelectItem>
                          <SelectItem value="کیلومتر">کیلومتر</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* فرکانس و سختی */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>فرکانس</Label>
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as HabitFrequency)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">روزانه</SelectItem>
                        <SelectItem value="weekly">هفتگی</SelectItem>
                        <SelectItem value="custom">سفارشی</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>سختی</Label>
                    <Select value={difficulty} onValueChange={(v) => setDifficulty(v as HabitDifficulty)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(d => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label} ({d.xp} XP)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* رنگ */}
                <div className="space-y-2">
                  <Label htmlFor="color">رنگ شخصی</Label>
                  <div className="flex gap-2 items-center">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <div className="flex gap-2">
                      {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'].map(c => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className="w-8 h-8 rounded-full border-2 border-border hover:scale-110 transition-transform"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* یادآوری */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reminder">یادآوری روزانه</Label>
                    <Switch
                      id="reminder"
                      checked={reminderEnabled}
                      onCheckedChange={setReminderEnabled}
                    />
                  </div>
                  {reminderEnabled && (
                    <Input
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                    />
                  )}
                </div>

                {/* دکمه‌ها */}
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSubmit} className="flex-1">
                    {editingHabit ? 'ذخیره تغییرات' : 'افزودن عادت'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    انصراف
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* کارت‌های آماری */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 glass border-l-4" style={{ borderLeftColor: 'hsl(var(--primary))' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">عادت‌های فعال</p>
                <p className="text-2xl font-bold mt-1">{activeHabits.length}</p>
              </div>
              <Zap className="w-8 h-8 text-primary" />
            </div>
          </Card>
          
          <Card className="p-4 glass border-l-4 border-l-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">تکمیل امروز</p>
                <p className="text-2xl font-bold mt-1">{todayCompleted}/{activeHabits.length}</p>
                <Progress value={completionRate} className="mt-2 h-2" />
              </div>
              <CheckCircle2 className="w-8 h-8 text-orange-500" />
            </div>
          </Card>
          
          <Card className="p-4 glass border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مجموع Streak</p>
                <p className="text-2xl font-bold mt-1">{totalStreak} روز</p>
              </div>
              <Flame className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>
      </motion.div>

      {/* نکات عادت‌سازی */}
      <Card className="p-4 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
        <div className="flex gap-3">
          <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">💡 نکته روانشناسی:</h3>
            <p className="text-sm text-muted-foreground">
              برای موفقیت در عادت‌سازی، با عادت‌های کوچک و ساده شروع کنید. تحقیقات نشان می‌دهد که 21 روز تکرار مداوم می‌تواند یک عادت را در شما ریشه‌دار کند!
            </p>
          </div>
        </div>
      </Card>

      {/* تب‌های عادت‌ها */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active">
            فعال ({activeHabits.length})
          </TabsTrigger>
          <TabsTrigger value="inactive">
            غیرفعال ({inactiveHabits.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {activeHabits.length === 0 ? (
              <Card className="p-8 text-center">
                <Flame className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">هنوز عادتی ندارید!</h3>
                <p className="text-muted-foreground mb-4">
                  اولین عادت مثبت خود را اضافه کنید و سفر تغییر را شروع کنید 🚀
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 ml-2" />
                  افزودن اولین عادت
                </Button>
              </Card>
            ) : (
              activeHabits.map((habit) => {
                const streak = getStreakForHabit(habit);
                const isCompletedToday = habit.completedDates.includes(today);
                const last7Days = getLast7Days();
                const categoryInfo = categories.find(c => c.value === habit.category);

                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="p-5 glass hover:shadow-lg transition-all duration-300 border-r-4" style={{ borderRightColor: habit.color }}>
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-bold">{habit.title}</h3>
                              <Badge variant="secondary" className="text-xs">
                                {categoryInfo?.icon} {categoryInfo?.label}
                              </Badge>
                            </div>
                            {habit.description && (
                              <p className="text-sm text-muted-foreground">{habit.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant="outline" className="gap-1">
                                <Flame className="w-3 h-3" />
                                {streak} روز
                              </Badge>
                              <Badge variant="outline" className="gap-1">
                                <Trophy className="w-3 h-3" />
                                طولانی‌ترین: {habit.longestStreak}
                              </Badge>
                              <Badge variant="outline">
                                {habit.xpReward} XP
                              </Badge>
                            </div>
                          </div>

                          {/* دکمه چک */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => checkHabit(habit.id, today)}
                            className="flex-shrink-0"
                          >
                            {isCompletedToday ? (
                              <CheckCircle2 className="w-10 h-10 text-green-500" />
                            ) : (
                              <Circle className="w-10 h-10 text-muted-foreground hover:text-primary transition-colors" />
                            )}
                          </motion.button>
                        </div>

                        {/* هدف */}
                        {habit.habitType === 'quantitative' && (
                          <div className="text-sm text-muted-foreground">
                            هدف: {habit.target} {habit.targetUnit} {habit.frequency === 'daily' ? 'روزانه' : 'هفتگی'}
                          </div>
                        )}

                        {/* تقویم 7 روز اخیر */}
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div className="flex gap-1.5 flex-1">
                            {last7Days.map((date, idx) => {
                              const isCompleted = habit.completedDates.includes(date);
                              const dayName = getWeekDays()[new Date(date).getDay()];
                              return (
                                <div key={date} className="flex flex-col items-center gap-1 flex-1">
                                  <div
                                    className={`w-full aspect-square rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                                      isCompleted
                                        ? 'bg-green-500 text-white scale-110'
                                        : date === today
                                        ? 'bg-primary/20 text-primary border-2 border-primary'
                                        : 'bg-muted text-muted-foreground'
                                    }`}
                                    style={isCompleted ? { backgroundColor: habit.color } : {}}
                                  >
                                    {isCompleted ? '✓' : new Date(date).getDate()}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">
                                    {dayName?.slice(0, 2)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Progress این هفته */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">پیشرفت این هفته</span>
                            <span className="font-medium">
                              {last7Days.filter(d => habit.completedDates.includes(d)).length}/7 روز
                            </span>
                          </div>
                          <Progress 
                            value={(last7Days.filter(d => habit.completedDates.includes(d)).length / 7) * 100} 
                            className="h-2"
                          />
                        </div>

                        {/* دکمه‌های عملیات */}
                        <div className="flex gap-2 pt-2 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(habit)}
                            className="flex-1 gap-2"
                          >
                            <Edit2 className="w-4 h-4" />
                            ویرایش
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(habit)}
                            className="flex-1 gap-2"
                          >
                            <Power className="w-4 h-4" />
                            غیرفعال
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(habit.id)}
                            className="flex-1 gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="inactive" className="space-y-4">
          <AnimatePresence mode="popLayout">
            {inactiveHabits.length === 0 ? (
              <Card className="p-8 text-center">
                <Power className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">عادت غیرفعالی وجود ندارد</p>
              </Card>
            ) : (
              inactiveHabits.map((habit) => {
                const categoryInfo = categories.find(c => c.value === habit.category);
                return (
                  <motion.div
                    key={habit.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <Card className="p-5 glass opacity-60 hover:opacity-100 transition-opacity">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{habit.title}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {categoryInfo?.icon} {categoryInfo?.label}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Streak قبلی: {habit.longestStreak} روز
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleToggleActive(habit)}
                          >
                            فعال‌سازی
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(habit.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HabitTracker;
