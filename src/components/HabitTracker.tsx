import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { Habit, HabitCategory, HabitFrequency, HabitType, HabitDifficulty } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Flame, TrendingUp, Edit2, Trash2, Power, Lightbulb, CheckCircle2, Circle, Zap, Lock, GripVertical, Sparkles } from 'lucide-react';
import { getTodayString, calculateStreak } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';
import { triggerHaptic } from '@/utils/haptics';
import Paywall from './Paywall';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// قالب‌های آماده عادت‌ها
const habitTemplates = [
  { title: 'ورزش روزانه', category: 'fitness', target: 30, targetUnit: 'دقیقه', difficulty: 'medium', color: 'hsl(0, 84%, 60%)' },
  { title: 'مطالعه کتاب', category: 'learning', target: 30, targetUnit: 'دقیقه', difficulty: 'easy', color: 'hsl(217, 91%, 60%)' },
  { title: 'مدیتیشن', category: 'mindfulness', target: 10, targetUnit: 'دقیقه', difficulty: 'easy', color: 'hsl(262, 83%, 58%)' },
  { title: 'نوشیدن آب', category: 'nutrition', target: 8, targetUnit: 'لیوان', difficulty: 'easy', color: 'hsl(189, 94%, 43%)' },
  { title: 'خواب منظم', category: 'health', target: 8, targetUnit: 'ساعت', difficulty: 'medium', color: 'hsl(239, 84%, 67%)' },
  { title: 'یادگیری زبان', category: 'learning', target: 20, targetUnit: 'دقیقه', difficulty: 'medium', color: 'hsl(162, 73%, 46%)' },
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

const difficulties: { value: HabitDifficulty; label: string; xp: number; color: string }[] = [
  { value: 'easy', label: 'آسان', xp: 10, color: 'hsl(142, 76%, 36%)' },
  { value: 'medium', label: 'متوسط', xp: 20, color: 'hsl(48, 96%, 53%)' },
  { value: 'hard', label: 'سخت', xp: 30, color: 'hsl(0, 84%, 60%)' },
];

// کامپوننت کارت عادت با قابلیت Drag & Drop
function SortableHabitCard({
  habit,
  today,
  streak,
  last7Days,
  categoryInfo,
  difficultyInfo,
  onCheck,
  onEdit,
  onDelete,
  onToggle,
  isLocked,
}: {
  habit: Habit;
  today: string;
  streak: number;
  last7Days: string[];
  categoryInfo: { label: string; icon: string };
  difficultyInfo: { label: string; xp: number; color: string };
  onCheck: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggle: (habit: Habit) => void;
  isLocked?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: habit.id,
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden transition-all hover:shadow-lg ${isDragging ? 'shadow-2xl scale-105 z-50' : ''} ${isLocked ? 'relative' : ''}`}>
        {/* خط رنگی بالای کارت */}
        <div className="h-1 w-full" style={{ backgroundColor: habit.color }} />
        
        {/* محتوای کارت */}
        <CardContent className="p-4 space-y-4">
          {/* هدر با Drag Handle */}
          <div className="flex items-start gap-3">
            {!isLocked && (
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-2 hover:bg-accent rounded-lg transition-colors touch-none min-h-[48px] min-w-[48px] flex items-center justify-center shrink-0"
                aria-label="بکشید برای مرتب‌سازی"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground" />
              </button>
            )}

            <div className="flex-1 min-w-0 space-y-3">
              {/* عنوان و توضیحات */}
              <div className="text-right">
                <h3 className="font-bold text-lg leading-tight text-foreground">
                  {habit.title}
                </h3>
                {habit.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {habit.description}
                  </p>
                )}
              </div>

              {/* بج‌های دسته‌بندی و سختی */}
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <Badge variant="secondary" className="gap-1 text-xs px-2 py-1">
                  <span>{categoryInfo.icon}</span>
                  <span>{categoryInfo.label}</span>
                </Badge>
                <Badge 
                  variant="outline" 
                  className="gap-1 text-xs px-2 py-1"
                  style={{ borderColor: difficultyInfo.color, color: difficultyInfo.color }}
                >
                  <span>{difficultyInfo.label}</span>
                  <Zap className="w-3 h-3" />
                  <span>{difficultyInfo.xp} XP</span>
                </Badge>
              </div>

              {/* تصویر عادت */}
              {habit.imageUrl && (
                <div className="w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={habit.imageUrl}
                    alt={habit.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* آمار استریک و پیشرفت */}
              <div className="flex items-center justify-between gap-4 p-3 bg-accent/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <span className="text-foreground">{streak}</span>
                  <span className="text-muted-foreground">روز پیاپی</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>هدف: {habit.target} {habit.targetUnit}</span>
                </div>
              </div>

              {/* نمای هفته گذشته */}
              <div className="flex gap-1 justify-end">
                {last7Days.map((date, index) => {
                  const isCompleted = habit.completedDates.includes(date);
                  const isToday = date === today;
                  return (
                    <div
                      key={date}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                        isCompleted
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'bg-muted text-muted-foreground'
                      } ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                      title={`${index === 6 ? 'امروز' : `${6 - index} روز پیش`}`}
                    >
                      {isCompleted ? '✓' : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex items-center gap-2 pt-3 border-t">
            <Button
              onClick={() => onCheck(habit.id)}
              variant={isCompletedToday ? 'default' : 'outline'}
              size="sm"
              className="flex-1 gap-2 min-h-[48px] font-medium"
              disabled={isLocked}
            >
              {isCompletedToday ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>انجام شد</span>
                </>
              ) : (
                <>
                  <Circle className="w-4 h-4" />
                  <span>انجام دادم</span>
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(habit)}
              className="min-h-[48px] min-w-[48px]"
              aria-label="ویرایش"
              disabled={isLocked}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(habit)}
              className="min-h-[48px] min-w-[48px]"
              aria-label={habit.isActive ? 'غیرفعال کردن' : 'فعال کردن'}
              disabled={isLocked}
            >
              <Power className={`w-4 h-4 ${habit.isActive ? 'text-primary' : 'text-muted-foreground'}`} />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(habit.id)}
              className="text-destructive hover:bg-destructive/10 min-h-[48px] min-w-[48px]"
              aria-label="حذف"
              disabled={isLocked}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>

        {/* Overlay برای عادت‌های قفل‌شده */}
        {isLocked && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-lg">
            <div className="text-center space-y-2 p-4">
              <Lock className="w-8 h-8 text-muted-foreground mx-auto" />
              <p className="text-sm font-medium text-muted-foreground">عادت قفل شده</p>
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

const HabitTracker = () => {
  const { state, dispatch, checkHabit, addHabit, reorderHabits } = useApp();
  const { isPro } = useSubscription();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);

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

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<HabitCategory | string>('health');
  const [target, setTarget] = useState('1');
  const [targetUnit, setTargetUnit] = useState('بار');
  const [habitType, setHabitType] = useState<HabitType>('qualitative');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [difficulty, setDifficulty] = useState<HabitDifficulty>('easy');
  const [color, setColor] = useState('hsl(239, 84%, 67%)');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [imageUrl, setImageUrl] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('health');
    setTarget('1');
    setTargetUnit('بار');
    setHabitType('qualitative');
    setFrequency('daily');
    setDifficulty('easy');
    setColor('hsl(239, 84%, 67%)');
    setReminderEnabled(false);
    setReminderTime('09:00');
    setImageUrl('');
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
          imageUrl: imageUrl || undefined,
        },
      });
      toast.success('✅ عادت با موفقیت ویرایش شد');
      triggerHaptic('success');
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
        imageUrl: imageUrl || undefined,
      });
      toast.success('🎉 عادت جدید با موفقیت اضافه شد');
      triggerHaptic('success');
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
    toast.success('قالب انتخاب شد');
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
    setImageUrl(habit.imageUrl || '');
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('آیا از حذف این عادت مطمئن هستید؟')) {
      dispatch({ type: 'DELETE_HABIT', payload: id });
      toast.success('عادت حذف شد');
      triggerHaptic('warning');
    }
  };

  const handleToggleActive = (habit: Habit) => {
    dispatch({
      type: 'UPDATE_HABIT',
      payload: { ...habit, isActive: !habit.isActive },
    });
    toast.success(habit.isActive ? 'عادت غیرفعال شد' : 'عادت فعال شد');
    triggerHaptic('light');
  };

  const handleCheckHabit = (id: string) => {
    checkHabit(id, today);
    triggerHaptic('success');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeHabits.findIndex((habit) => habit.id === active.id);
      const newIndex = activeHabits.findIndex((habit) => habit.id === over.id);

      const reorderedHabits = arrayMove(activeHabits, oldIndex, newIndex);
      reorderHabits(reorderedHabits);
      toast.success('✨ ترتیب عادات ذخیره شد');
      triggerHaptic('light');
    }
  };

  const today = getTodayString();
  const activeHabits = state.habits
    .filter(h => h.isActive)
    .sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return 0;
    });
  const inactiveHabits = state.habits.filter(h => !h.isActive);

  // محاسبه آمار
  const totalStreak = activeHabits.reduce((sum, h) => sum + h.currentStreak, 0);
  const todayCompleted = activeHabits.filter(h => h.completedDates.includes(today)).length;
  const completionRate = activeHabits.length > 0 ? Math.round((todayCompleted / activeHabits.length) * 100) : 0;

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const last7Days = getLast7Days();

  // محدودیت عادت‌ها برای کاربران غیر پرو
  const freeHabitLimit = 3;
  const canAccessAllHabits = isPro || activeHabits.length <= freeHabitLimit;

  return (
    <div className="min-h-screen pb-24 space-y-4 sm:space-y-6" dir="rtl">
      {/* هدر با آمار */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* عنوان صفحه */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            عادت‌های من 🔥
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            ردیابی و تقویت عادت‌های روزانه
          </p>
        </div>

        {/* کارت آمار */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              {/* عادت‌های فعال */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {activeHabits.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  عادت فعال
                </div>
              </div>

              {/* تکمیل امروز */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {todayCompleted}/{activeHabits.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  تکمیل امروز
                </div>
              </div>

              {/* مجموع استریک */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-orange-500 flex items-center justify-center gap-1">
                  <Flame className="w-6 h-6" />
                  <span>{totalStreak}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  مجموع استریک
                </div>
              </div>
            </div>

            {/* نوار پیشرفت */}
            {activeHabits.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">پیشرفت امروز</span>
                  <span className="font-medium text-foreground">{completionRate}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-l from-primary to-primary/80 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${completionRate}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* دکمه افزودن عادت */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="w-full gap-2 min-h-[56px] text-base font-medium shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="w-5 h-5" />
              <span>افزودن عادت جدید</span>
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl text-right">
                {editingHabit ? 'ویرایش عادت' : 'افزودن عادت جدید'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* قالب‌های آماده */}
              {!editingHabit && (
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowTemplates(!showTemplates)}
                    className="w-full gap-2 min-h-[48px]"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>{showTemplates ? 'بستن قالب‌ها' : 'انتخاب از قالب‌های آماده'}</span>
                  </Button>

                  {showTemplates && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-2"
                    >
                      {habitTemplates.map((template, index) => (
                        <Button
                          key={index}
                          type="button"
                          variant="ghost"
                          onClick={() => handleTemplateSelect(template)}
                          className="justify-start text-right h-auto py-3 px-4 min-h-[48px]"
                        >
                          <div className="text-right">
                            <div className="font-medium">{template.title}</div>
                            <div className="text-xs text-muted-foreground">
                              {template.target} {template.targetUnit} • {difficulties.find(d => d.value === template.difficulty)?.label}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* عنوان */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-right block">
                  عنوان عادت *
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="مثال: ورزش روزانه"
                  className="text-right min-h-[48px] text-base"
                  dir="rtl"
                />
              </div>

              {/* توضیحات */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-right block">
                  توضیحات
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="توضیحات بیشتر درباره این عادت..."
                  className="text-right min-h-[100px] text-base resize-none"
                  dir="rtl"
                />
              </div>

              {/* دسته‌بندی و سختی */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-right block">
                    دسته‌بندی
                  </Label>
                  <Select value={category} onValueChange={setCategory} dir="rtl">
                    <SelectTrigger id="category" className="min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty" className="text-right block">
                    سطح سختی
                  </Label>
                  <Select value={difficulty} onValueChange={(v) => setDifficulty(v as HabitDifficulty)} dir="rtl">
                    <SelectTrigger id="difficulty" className="min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff.value} value={diff.value}>
                          <div className="flex items-center gap-2">
                            <span>{diff.label}</span>
                            <Badge variant="secondary" className="text-xs">
                              {diff.xp} XP
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* هدف و واحد */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="target" className="text-sm font-semibold text-foreground">
                    هدف روزانه
                  </Label>
                  <Input
                    id="target"
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="1"
                    className="text-base h-12 focus:ring-2 focus:ring-primary/20"
                    dir="rtl"
                    min="1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetUnit" className="text-sm font-semibold text-foreground">
                    واحد اندازه‌گیری
                  </Label>
                  <Input
                    id="targetUnit"
                    value={targetUnit}
                    onChange={(e) => setTargetUnit(e.target.value)}
                    placeholder="بار، دقیقه، لیتر..."
                    className="text-base h-12 focus:ring-2 focus:ring-primary/20"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* یادآوری */}
              <div className="space-y-3 pt-2 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reminder" className="text-sm font-semibold text-foreground">
                    یادآوری روزانه
                  </Label>
                  <Switch
                    id="reminder"
                    checked={reminderEnabled}
                    onCheckedChange={setReminderEnabled}
                  />
                </div>

                {reminderEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="reminderTime" className="text-sm text-muted-foreground">
                      زمان یادآوری
                    </Label>
                    <Input
                      id="reminderTime"
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      className="text-base h-12 focus:ring-2 focus:ring-primary/20"
                      dir="rtl"
                    />
                  </motion.div>
                )}
              </div>

              {/* تصویر عادت */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر انگیزشی عادت (اختیاری)"
                />
                <p className="text-xs text-muted-foreground">تصویری که شما را برای انجام این عادت انگیزه می‌دهد</p>
              </div>

              {/* دکمه ثبت */}
              <div className="pt-3 border-t border-border/50">
                <Button 
                  onClick={handleSubmit} 
                  className="w-full gap-2 h-12 text-base font-semibold shadow-sm"
                >
                  {editingHabit ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>ذخیره تغییرات</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>افزودن عادت</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* تب‌های فعال و غیرفعال */}
      <Tabs defaultValue="active" dir="rtl" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="active" className="gap-2 text-base">
            <span>فعال</span>
            <Badge variant="secondary" className="text-xs">
              {activeHabits.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="inactive" className="gap-2 text-base">
            <span>غیرفعال</span>
            <Badge variant="secondary" className="text-xs">
              {inactiveHabits.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* عادت‌های فعال */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {activeHabits.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center mx-auto">
                  <Flame className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    هنوز عادتی اضافه نکرده‌اید
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    با افزودن اولین عادت خود، سفر به سوی زندگی بهتر را آغاز کنید
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={activeHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence mode="popLayout">
                  {activeHabits.map((habit, index) => {
                    const isLocked = !isPro && index >= freeHabitLimit;
                    const categoryInfo = categories.find(c => c.value === habit.category) || categories[0];
                    const difficultyInfo = difficulties.find(d => d.value === habit.difficulty) || difficulties[0];
                    const streak = calculateStreak(habit.completedDates);

                    return (
                      <SortableHabitCard
                        key={habit.id}
                        habit={habit}
                        today={today}
                        streak={streak}
                        last7Days={last7Days}
                        categoryInfo={categoryInfo}
                        difficultyInfo={difficultyInfo}
                        onCheck={handleCheckHabit}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggleActive}
                        isLocked={isLocked}
                      />
                    );
                  })}
                </AnimatePresence>
              </SortableContext>
            </DndContext>
          )}

          {/* پیام محدودیت برای کاربران غیر پرو */}
          {!isPro && activeHabits.length > freeHabitLimit && (
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Lock className="w-6 h-6 text-primary" />
                  <h3 className="text-lg font-bold text-foreground">
                    ارتقا به نسخه Premium
                  </h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  شما فقط به {freeHabitLimit} عادت اول دسترسی دارید. برای دسترسی نامحدود به همه عادت‌ها، به نسخه Premium ارتقا دهید.
                </p>
                <Button
                  onClick={() => setShowPaywall(true)}
                  className="gap-2 min-h-[48px]"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>ارتقا به Premium</span>
                </Button>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* عادت‌های غیرفعال */}
        <TabsContent value="inactive" className="mt-6 space-y-4">
          {inactiveHabits.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-accent/50 flex items-center justify-center mx-auto">
                  <Power className="w-10 h-10 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    عادت غیرفعالی وجود ندارد
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    همه عادت‌های شما فعال هستند
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {inactiveHabits.map((habit) => {
                const categoryInfo = categories.find(c => c.value === habit.category) || categories[0];
                const difficultyInfo = difficulties.find(d => d.value === habit.difficulty) || difficulties[0];
                const streak = calculateStreak(habit.completedDates);

                return (
                  <SortableHabitCard
                    key={habit.id}
                    habit={habit}
                    today={today}
                    streak={streak}
                    last7Days={last7Days}
                    categoryInfo={categoryInfo}
                    difficultyInfo={difficultyInfo}
                    onCheck={handleCheckHabit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggle={handleToggleActive}
                  />
                );
              })}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>

      {/* Paywall Modal */}
      {showPaywall && (
        <div className="fixed inset-0 z-50">
          <Paywall 
            onStartTrial={() => setShowPaywall(false)} 
            onContinueLimited={() => setShowPaywall(false)} 
          />
        </div>
      )}
    </div>
  );
};

export default HabitTracker;
