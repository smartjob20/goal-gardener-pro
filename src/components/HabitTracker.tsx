import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useSubscription } from '@/context/SubscriptionContext';
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
import { Plus, Flame, Trophy, Calendar, TrendingUp, Edit2, Trash2, Power, Lightbulb, CheckCircle2, Circle, Zap, Lock, GripVertical } from 'lucide-react';
import { getTodayString, calculateStreak, getWeekDays } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ImageUpload } from '@/components/ImageUpload';
import { triggerHaptic } from '@/utils/haptics';
import Paywall from './Paywall';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable Habit Card Component for drag & drop
function SortableHabitCard({
  habit,
  today,
  streak,
  last7Days,
  categoryLabel,
  onCheck,
  onEdit,
  onDelete,
  onToggle,
}: {
  habit: Habit;
  today: string;
  streak: number;
  last7Days: string[];
  categoryLabel: string;
  onCheck: (id: string) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (id: string) => void;
  onToggle: (habit: Habit) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isCompletedToday = habit.completedDates.includes(today);

  return (
    <div ref={setNodeRef} style={style}>
      <Card
        className={`p-4 glass-strong hover-lift transition-all ${isDragging ? 'shadow-2xl scale-105' : ''}`}
        style={{ borderLeft: `4px solid ${habit.color}` }}
      >
        <div className="space-y-4">
          {/* Header با Drag Handle */}
          <div className="flex items-start gap-3">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-primary/10 rounded transition-colors touch-none min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 text-right">
                  <h3 className="font-bold text-lg">{habit.title}</h3>
                  {habit.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {habit.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 items-center shrink-0">
                  <Badge variant="outline" className="text-xs">
                    {categoryLabel}
                  </Badge>
                  <Badge
                    variant={habit.difficulty === 'hard' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {habit.difficulty === 'hard' ? '🔴 سخت' : habit.difficulty === 'medium' ? '🟡 متوسط' : '🟢 آسان'}
                  </Badge>
                </div>
              </div>

              {habit.imageUrl && (
                <div className="mt-3 w-full h-32 rounded-lg overflow-hidden">
                  <img
                    src={habit.imageUrl}
                    alt={habit.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* آمار */}
              <div className="flex items-center gap-4 mt-3 flex-wrap justify-end">
                <div className="flex items-center gap-1 text-sm">
                  <span className="font-semibold">{streak}</span>
                  <Flame className="h-4 w-4 text-orange-500" />
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>امتیاز: {habit.xpReward} XP</span>
                  <Zap className="h-4 w-4" />
                </div>
              </div>

              {/* هفته گذشته */}
              <div className="flex gap-1 mt-3 justify-end">
                {last7Days.map((date) => (
                  <div
                    key={date}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                      habit.completedDates.includes(date)
                        ? 'bg-success text-success-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {date === today ? '🔥' : habit.completedDates.includes(date) ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* دکمه‌های عملیات */}
          <div className="flex gap-2 justify-end pt-2 border-t">
            <Button
              onClick={() => onCheck(habit.id)}
              variant={isCompletedToday ? 'default' : 'outline'}
              size="sm"
              className="gap-2 min-h-[44px]"
            >
              {isCompletedToday ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              {isCompletedToday ? 'انجام شد' : 'انجام دادم'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(habit)}
              className="min-h-[44px]"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggle(habit)}
              className="min-h-[44px]"
            >
              <Power className={`w-4 h-4 ${habit.isActive ? 'text-success' : 'text-muted-foreground'}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(habit.id)}
              className="text-destructive hover:bg-destructive/10 min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
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
  const [color, setColor] = useState('#6366f1');
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
    setColor('#6366f1');
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
        imageUrl: imageUrl || undefined,
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
    setImageUrl(habit.imageUrl || '');
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeHabits.findIndex((habit) => habit.id === active.id);
      const newIndex = activeHabits.findIndex((habit) => habit.id === over.id);

      const reorderedHabits = arrayMove(activeHabits, oldIndex, newIndex);
      reorderHabits(reorderedHabits);
      toast.success('ترتیب عادات ذخیره شد ✨');
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
    <div className="min-h-screen space-y-6 pb-24 p-4 relative" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>

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
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
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
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-4 bg-accent rounded-lg"
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

              <div className="space-y-3 sm:space-y-4">
                {/* عنوان */}
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="title">عنوان عادت *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: ورزش روزانه"
                  />
                </div>

                {/* توضیحات */}
                <div className="space-y-1.5 sm:space-y-2">
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
                <div className="space-y-1.5 sm:space-y-2">
                  <Label>دسته‌بندی</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                      {state.settings.customHabitCategories && state.settings.customHabitCategories.length > 0 && (
                        <>
                          <SelectItem value="_separator_" disabled>───────────</SelectItem>
                          {state.settings.customHabitCategories.map(cat => (
                            <SelectItem key={cat} value={cat}>
                              ⭐ {cat}
                            </SelectItem>
                          ))}
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* نوع عادت */}
                <div className="space-y-1.5 sm:space-y-2">
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <Label htmlFor="target">هدف</Label>
                      <Input
                        id="target"
                        type="number"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1.5 sm:space-y-2">
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
                  <div className="space-y-1.5 sm:space-y-2">
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
                <div className="space-y-1.5 sm:space-y-2">
                  <Label htmlFor="color">رنگ شخصی</Label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 sm:items-center">
                    <Input
                      id="color"
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-20 h-10"
                    />
                    <div className="flex flex-wrap gap-2">
                      {['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'].map(c => (
                        <button
                          key={c}
                          onClick={() => setColor(c)}
                          className="w-9 h-9 sm:w-8 sm:h-8 rounded-full border-2 border-border hover:scale-110 transition-transform active:scale-95"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* یادآوری */}
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>یادآوری</Label>
                    <Switch
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

                {/* تصویر انگیزشی */}
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر انگیزشی"
                />

                {/* دکمه‌ها */}
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2 pt-3 sm:pt-4">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                    انصراف
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1 w-full">
                    {editingHabit ? 'ذخیره تغییرات' : 'افزودن عادت'}
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
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={activeHabits.map((habit) => habit.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {activeHabits.map((habit, index) => {
                    const streak = getStreakForHabit(habit);
                    const last7Days = getLast7Days();
                    const categoryInfo = categories.find(c => c.value === habit.category);
                    const categoryLabel = categoryInfo?.label || habit.category;
                    const isLocked = !isPro && index >= 3;

                    if (isLocked) {
                      return (
                        <motion.div
                          key={habit.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          <Card className="p-5 glass relative overflow-hidden border-r-4" style={{ borderRightColor: habit.color }}>
                            <div 
                              className="absolute inset-0 bg-background/60 backdrop-blur-md z-10 flex items-center justify-center cursor-pointer"
                              onClick={() => setShowPaywall(true)}
                            >
                              <div className="text-center space-y-3">
                                <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                                  <Lock className="w-8 h-8 text-primary" />
                                </div>
                                <div>
                                  <p className="font-bold text-lg">دوره آزمایشی 30 روزه شما به پایان رسیده</p>
                                  <p className="text-sm text-muted-foreground mt-1">برای مدیریت بیش از 3 عادت، ارتقا دهید</p>
                                </div>
                                <Button className="mt-3">
                                  ارتقا به Pro
                                </Button>
                              </div>
                            </div>
                            <div className="blur-sm">
                              <h3 className="text-lg font-bold">{habit.title}</h3>
                              <p className="text-sm text-muted-foreground mt-2">این عادت قفل است</p>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    }

                    return (
                      <SortableHabitCard
                        key={habit.id}
                        habit={habit}
                        today={today}
                        streak={streak}
                        last7Days={last7Days}
                        categoryLabel={categoryLabel}
                        onCheck={(id) => checkHabit(id, today)}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onToggle={handleToggleActive}
                      />
                    );
                  })}
                </div>
              </SortableContext>
            </DndContext>
          )}
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

      {/* Paywall Modal */}
      <AnimatePresence>
        {showPaywall && (
          <Paywall
            onStartTrial={() => setShowPaywall(false)}
            onContinueLimited={() => setShowPaywall(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default HabitTracker;
