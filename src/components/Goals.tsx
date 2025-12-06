import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Goal, GoalCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { PersianCalendar } from '@/components/ui/persian-calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useApp as useAppContext } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Trash2, 
  Edit2, 
  Target, 
  Trophy, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  TrendingUp,
  Zap,
  Star,
  Rocket,
  Heart,
  Flag
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';
import { ImageUpload } from '@/components/ImageUpload';
import { triggerHaptic } from '@/utils/haptics';

// دسته‌بندی‌های اهداف
const categoryOptions: { value: GoalCategory; label: string; icon: string; color: string }[] = [
  { value: 'health', label: 'سلامت و تندرستی', icon: '🏃', color: 'hsl(142, 76%, 36%)' },
  { value: 'learning', label: 'آموزش و مطالعه', icon: '📚', color: 'hsl(217, 91%, 60%)' },
  { value: 'career', label: 'شغل و کسب‌وکار', icon: '💼', color: 'hsl(262, 83%, 58%)' },
  { value: 'finance', label: 'مالی و سرمایه‌گذاری', icon: '💰', color: 'hsl(48, 96%, 53%)' },
  { value: 'personal', label: 'شخصی و روحی', icon: '🧘', color: 'hsl(189, 94%, 43%)' },
  { value: 'family', label: 'خانواده و روابط', icon: '👨‍👩‍👧', color: 'hsl(338, 78%, 59%)' },
  { value: 'hobby', label: 'سرگرمی و هنر', icon: '🎨', color: 'hsl(24, 95%, 53%)' },
  { value: 'travel', label: 'سفر و ماجراجویی', icon: '✈️', color: 'hsl(204, 94%, 44%)' }
];

// کامپوننت کارت هدف
function GoalCard({ 
  goal, 
  onEdit, 
  onDelete, 
  onToggleMilestone,
  onChangeStatus 
}: { 
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  onToggleMilestone: (goalId: string, milestoneId: string) => void;
  onChangeStatus: (goalId: string, status: 'active' | 'completed' | 'paused') => void;
}) {
  const categoryInfo = categoryOptions.find(c => c.value === goal.category) || categoryOptions[0];
  const daysRemaining = differenceInDays(new Date(goal.targetDate), new Date());
  const isOverdue = daysRemaining < 0 && goal.status !== 'completed';
  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden transition-all hover:shadow-xl ${goal.status === 'completed' ? 'opacity-90' : ''}`}>
        {/* خط رنگی بالای کارت */}
        <div className="h-1 w-full" style={{ backgroundColor: categoryInfo.color }} />
        
        <CardHeader className="p-4 sm:p-6 pb-3 space-y-3">
          {/* هدر با آیکون و بج */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1 text-xs px-2 py-1">
                  <span>{categoryInfo.icon}</span>
                  <span>{categoryInfo.label}</span>
                </Badge>
                {goal.status === 'completed' && (
                  <Badge className="gap-1 bg-primary text-primary-foreground">
                    <Trophy className="w-3 h-3" />
                    <span>تکمیل شده</span>
                  </Badge>
                )}
                {goal.status === 'paused' && (
                  <Badge variant="outline" className="gap-1">
                    متوقف شده
                  </Badge>
                )}
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight text-right">
                {goal.title}
              </h3>
              
              {goal.description && (
                <p className="text-sm text-muted-foreground leading-relaxed text-right">
                  {goal.description}
                </p>
              )}
            </div>

            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(goal)}
                className="min-h-[40px] min-w-[40px]"
                aria-label="ویرایش"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(goal.id)}
                className="text-destructive hover:bg-destructive/10 min-h-[40px] min-w-[40px]"
                aria-label="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* تصویر انگیزشی */}
          {goal.imageUrl && (
            <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden">
              <img
                src={goal.imageUrl}
                alt={goal.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="p-4 sm:p-6 pt-0 space-y-4">
          {/* پیشرفت کلی */}
          <div className="space-y-2 p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">پیشرفت کلی</span>
              <span className="font-bold text-primary">{goal.progress}%</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-l from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{completedMilestones} از {totalMilestones} مرحله</span>
              {goal.status !== 'completed' && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                    {isOverdue ? 'سررسید گذشته' : `${daysRemaining} روز مانده`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* لیست مایلستون‌ها */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Flag className="w-4 h-4" />
              <span>مراحل هدف:</span>
            </div>
            <div className="space-y-2">
              {goal.milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    milestone.completed 
                      ? 'bg-primary/10 border border-primary/20' 
                      : 'bg-accent/50 hover:bg-accent'
                  }`}
                >
                  <Checkbox
                    id={milestone.id}
                    checked={milestone.completed}
                    onCheckedChange={() => onToggleMilestone(goal.id, milestone.id)}
                    className="mt-0.5 shrink-0"
                  />
                  <label
                    htmlFor={milestone.id}
                    className={`flex-1 text-sm leading-relaxed cursor-pointer text-right ${
                      milestone.completed 
                        ? 'line-through text-muted-foreground' 
                        : 'text-foreground'
                    }`}
                  >
                    {milestone.title}
                  </label>
                  {milestone.completed && (
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* دکمه‌های وضعیت */}
          {goal.status !== 'completed' && (
            <div className="flex gap-2 pt-2 border-t">
              {goal.status === 'active' ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeStatus(goal.id, 'paused')}
                  className="flex-1 min-h-[44px]"
                >
                  متوقف کردن
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeStatus(goal.id, 'active')}
                  className="flex-1 min-h-[44px]"
                >
                  ادامه دادن
                </Button>
              )}
              {goal.progress === 100 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onChangeStatus(goal.id, 'completed')}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <Trophy className="w-4 h-4" />
                  <span>تکمیل هدف</span>
                </Button>
              )}
            </div>
          )}

          {/* پاداش XP */}
          <div className="flex items-center justify-center gap-2 p-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">پاداش: {goal.xpReward} XP</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

const Goals = () => {
  const { state, addGoal, dispatch } = useApp();
  const appContext = useAppContext();
  const useJalali = appContext.state.settings.calendar === 'jalali';
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory | string>('health');
  const [targetDate, setTargetDate] = useState<Date>(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [imageUrl, setImageUrl] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);

  // Edit states
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddGoal = () => {
    if (!title.trim()) {
      toast.error('لطفاً عنوان هدف را وارد کنید');
      return;
    }

    const validMilestones = milestones.filter(m => m.trim());
    if (validMilestones.length === 0) {
      toast.error('لطفاً حداقل یک مرحله اضافه کنید');
      return;
    }

    const milestoneObjects = validMilestones.map((m, index) => ({
      id: `milestone-${Date.now()}-${index}`,
      title: m,
      completed: false
    }));

    addGoal({
      title,
      description,
      category: category as GoalCategory,
      targetDate: targetDate.toISOString(),
      milestones: milestoneObjects,
      xpReward: 100,
      imageUrl: imageUrl || undefined
    });

    toast.success('🎯 هدف جدید با موفقیت ایجاد شد!');
    triggerHaptic('success');
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditGoal = () => {
    if (!editingGoal) return;

    if (!title.trim()) {
      toast.error('لطفاً عنوان هدف را وارد کنید');
      return;
    }

    const validMilestones = milestones.filter(m => m.trim());
    const milestoneObjects = validMilestones.map((m, index) => {
      const existingMilestone = editingGoal.milestones.find(ms => ms.title === m);
      return existingMilestone || {
        id: `milestone-${Date.now()}-${index}`,
        title: m,
        completed: false
      };
    });

    const completedCount = milestoneObjects.filter(m => m.completed).length;
    const progress = Math.round((completedCount / milestoneObjects.length) * 100);

    const updatedGoal: Goal = {
      ...editingGoal,
      title,
      description,
      category: category as GoalCategory,
      targetDate: targetDate.toISOString(),
      milestones: milestoneObjects,
      progress,
      imageUrl: imageUrl || undefined,
      status: progress === 100 ? 'completed' : editingGoal.status
    };

    dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    toast.success('✅ هدف با موفقیت ویرایش شد');
    triggerHaptic('success');
    setIsEditDialogOpen(false);
    setEditingGoal(null);
    resetForm();
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('آیا از حذف این هدف مطمئن هستید؟')) {
      dispatch({ type: 'DELETE_GOAL', payload: id });
      toast.success('هدف حذف شد');
      triggerHaptic('warning');
    }
  };

  const handleToggleMilestone = (goalId: string, milestoneId: string) => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    const updatedMilestones = goal.milestones.map(m =>
      m.id === milestoneId
        ? { ...m, completed: !m.completed, completedAt: !m.completed ? new Date().toISOString() : undefined }
        : m
    );

    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const progress = Math.round((completedCount / updatedMilestones.length) * 100);

    const updatedGoal: Goal = {
      ...goal,
      milestones: updatedMilestones,
      progress,
      status: progress === 100 ? 'completed' : goal.status
    };

    dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    triggerHaptic('light');

    if (progress === 100) {
      dispatch({ type: 'ADD_XP', payload: goal.xpReward });
      toast.success('🎉 تبریک! هدف شما تکمیل شد!');
      triggerHaptic('success');
    }
  };

  const handleChangeStatus = (goalId: string, newStatus: 'active' | 'completed' | 'paused') => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, status: newStatus } });
    
    if (newStatus === 'completed') {
      toast.success('🏆 هدف با موفقیت تکمیل شد!');
      triggerHaptic('success');
    } else {
      toast.success(`وضعیت تغییر کرد`);
      triggerHaptic('light');
    }
  };

  const openEditDialog = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setCategory(goal.category);
    setTargetDate(new Date(goal.targetDate));
    setImageUrl(goal.imageUrl || '');
    setMilestones(goal.milestones.map(m => m.title));
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('health');
    setTargetDate(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
    setImageUrl('');
    setMilestones(['']);
  };

  const addMilestone = () => {
    setMilestones([...milestones, '']);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, i) => i !== index));
    }
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = value;
    setMilestones(newMilestones);
  };

  const activeGoals = state.goals.filter(g => g.status === 'active');
  const completedGoals = state.goals.filter(g => g.status === 'completed');
  const pausedGoals = state.goals.filter(g => g.status === 'paused');

  const totalProgress = state.goals.length > 0 
    ? Math.round(state.goals.reduce((sum, g) => sum + g.progress, 0) / state.goals.length)
    : 0;

  return (
    <div className="min-h-screen pb-24 space-y-4 sm:space-y-6" dir="rtl">
      {/* هدر الهام‌بخش */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        {/* عنوان اصلی */}
        <div className="text-center space-y-3 mb-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full"
          >
            <Rocket className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">رویاهای شما، واقعیت ما</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            اهداف زندگی من 🎯
          </h1>
          
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            رویاهای بزرگ خود را به اهداف قابل دستیابی تبدیل کنید
          </p>
        </div>

        {/* کارت آمار */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* اهداف فعال */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center gap-1">
                  <Target className="w-6 h-6" />
                  <span>{activeGoals.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  فعال
                </div>
              </div>

              {/* تکمیل شده */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center gap-1">
                  <Trophy className="w-6 h-6" />
                  <span>{completedGoals.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  تکمیل شده
                </div>
              </div>

              {/* پیشرفت کلی */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center gap-1">
                  <TrendingUp className="w-6 h-6" />
                  <span>{totalProgress}%</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  پیشرفت
                </div>
              </div>
            </div>

            {/* نوار پیشرفت کلی */}
            {state.goals.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">پیشرفت کلی اهداف</span>
                  <span className="font-medium text-foreground">{totalProgress}%</span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-l from-primary via-primary/90 to-primary/80 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProgress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* دکمه افزودن هدف */}
        <Dialog 
          open={isAddDialogOpen} 
          onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full gap-2 min-h-[56px] text-base font-medium shadow-lg hover:shadow-xl transition-shadow">
              <Plus className="w-5 h-5" />
              <span>ایجاد هدف جدید</span>
              <Sparkles className="w-5 h-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="w-[calc(100vw-2rem)] max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-2xl p-0" dir="rtl">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-background via-background to-transparent pb-4 px-5 pt-5">
              <DialogHeader className="text-right space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <Rocket className="w-6 h-6 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <DialogTitle className="text-xl font-bold text-foreground">
                      {editingGoal ? 'ویرایش هدف' : 'هدف جدید'}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      رویای بزرگ خود را تعریف کنید
                    </p>
                  </div>
                </div>
              </DialogHeader>
            </div>

            <div className="px-5 pb-5 space-y-5">
              {/* Motivational Banner */}
              <div className="p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl border border-primary/10">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-primary shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    هر هدف بزرگی با یک قدم کوچک شروع می‌شود ✨
                  </p>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Input
                  placeholder="عنوان هدف..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-14 text-lg font-medium border-0 bg-muted/50 rounded-2xl px-4 focus:ring-2 focus:ring-primary/30 focus:bg-background placeholder:text-muted-foreground/60 transition-all"
                  dir="rtl"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Textarea
                  placeholder="چرا این هدف برای شما مهم است؟"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="text-base border-0 bg-muted/30 rounded-xl px-4 py-3 resize-none focus:ring-2 focus:ring-primary/20 focus:bg-muted/50 placeholder:text-muted-foreground/50 transition-all"
                  dir="rtl"
                />
              </div>

              {/* Category Pills */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 block">دسته‌بندی</label>
                <div className="flex flex-wrap gap-2">
                  {categoryOptions.slice(0, 6).map((cat) => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setCategory(cat.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                        category === cat.value
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                          : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Target Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>تاریخ هدف</span>
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 justify-start bg-muted/40 rounded-xl hover:bg-muted/60 border-0"
                    >
                      <CalendarIcon className="ms-2 h-5 w-5 text-muted-foreground" />
                      <span>{format(targetDate, 'yyyy/MM/dd')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    {useJalali ? (
                      <PersianCalendar
                        mode="single"
                        selected={targetDate}
                        onSelect={(date) => date && setTargetDate(date)}
                      />
                    ) : (
                      <div className="p-3">
                        <Input
                          type="date"
                          value={format(targetDate, 'yyyy-MM-dd')}
                          onChange={(e) => setTargetDate(new Date(e.target.value))}
                          className="h-11"
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* Image Upload */}
              <div className="p-4 bg-muted/20 rounded-2xl border-2 border-dashed border-muted-foreground/20">
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر الهام‌بخش (اختیاری)"
                />
              </div>

              {/* Milestones */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground/80 flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <span>مراحل هدف</span>
                  </label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMilestone}
                    className="gap-1 h-8 text-primary"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-xs">افزودن</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex gap-2 items-center"
                    >
                      <div className="w-7 h-7 rounded-full bg-muted/50 flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`مرحله ${index + 1}`}
                        value={milestone}
                        onChange={(e) => updateMilestone(index, e.target.value)}
                        className="h-11 border-0 bg-muted/40 rounded-xl px-4 text-right focus:ring-2 focus:ring-primary/20"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                        className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        disabled={milestones.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-border/30">
                <Button
                  type="button"
                  onClick={editingGoal ? handleEditGoal : handleAddGoal}
                  className="flex-1 h-13 text-base font-semibold rounded-2xl gap-2 shadow-lg shadow-primary/20"
                >
                  {editingGoal ? (
                    <><CheckCircle2 className="w-5 h-5" /><span>ذخیره</span></>
                  ) : (
                    <><Sparkles className="w-5 h-5" /><span>ایجاد هدف</span></>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                  className="h-13 px-6 rounded-2xl text-muted-foreground hover:bg-muted/50"
                >
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* دیالوگ ویرایش */}
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setEditingGoal(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl text-right flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-primary" />
                <span>ویرایش هدف</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* عنوان */}
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-right block text-base">
                  عنوان هدف *
                </Label>
                <Input
                  id="edit-title"
                  placeholder="مثال: رسیدن به وزن ایده‌آل"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-right min-h-[48px] text-base"
                  dir="rtl"
                />
              </div>

              {/* توضیحات */}
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-right block text-base">
                  توضیحات و دلایل انگیزشی
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder="چرا این هدف برای شما مهم است؟"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-right min-h-[120px] text-base resize-none"
                  dir="rtl"
                />
              </div>

              {/* دسته‌بندی */}
              <div className="space-y-2">
                <Label htmlFor="edit-category" className="text-right block text-base">
                  دسته‌بندی هدف *
                </Label>
                <Select value={category} onValueChange={(v) => setCategory(v)} dir="rtl">
                  <SelectTrigger id="edit-category" className="min-h-[48px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
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

              {/* تاریخ هدف */}
              <div className="space-y-2">
                <Label className="text-right block text-base">
                  تاریخ هدف
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start min-h-[48px] text-base"
                    >
                      <CalendarIcon className="ms-2 h-5 w-5" />
                      <span>{format(targetDate, 'yyyy/MM/dd')}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    {useJalali ? (
                      <PersianCalendar
                        mode="single"
                        selected={targetDate}
                        onSelect={(date) => date && setTargetDate(date)}
                      />
                    ) : (
                      <div className="p-3">
                        <Input
                          type="date"
                          value={format(targetDate, 'yyyy-MM-dd')}
                          onChange={(e) => setTargetDate(new Date(e.target.value))}
                          className="min-h-[48px]"
                        />
                      </div>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* تصویر انگیزشی */}
              <div className="space-y-2">
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر الهام‌بخش هدف"
                />
              </div>

              {/* مراحل */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-right text-base flex items-center gap-2">
                    <Flag className="w-4 h-4" />
                    <span>مراحل رسیدن به هدف *</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addMilestone}
                    className="gap-1 min-h-[40px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن مرحله</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center justify-center w-8 h-12 text-sm font-medium text-muted-foreground shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`مرحله ${index + 1}`}
                        value={milestone}
                        onChange={(e) => updateMilestone(index, e.target.value)}
                        className="min-h-[48px] text-base text-right"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                        className="min-h-[48px] min-w-[48px] shrink-0"
                        disabled={milestones.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* دکمه‌های عملیات */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleEditGoal}
                  className="flex-1 gap-2 min-h-[52px] text-base font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>ذخیره تغییرات</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="min-h-[52px] px-6"
                >
                  انصراف
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* تب‌های اهداف */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="active" className="gap-2 text-base">
            <Target className="w-4 h-4" />
            <span>فعال</span>
            <Badge variant="secondary" className="text-xs">
              {activeGoals.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 text-base">
            <Trophy className="w-4 h-4" />
            <span>تکمیل شده</span>
            <Badge variant="secondary" className="text-xs">
              {completedGoals.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paused" className="gap-2 text-base">
            <Clock className="w-4 h-4" />
            <span>متوقف</span>
            <Badge variant="secondary" className="text-xs">
              {pausedGoals.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* اهداف فعال */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {activeGoals.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Rocket className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    سفر شما از اینجا شروع می‌شود
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    اولین هدف خود را تعریف کنید و اولین قدم را به سوی زندگی رویایی خود بردارید
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteGoal}
                  onToggleMilestone={handleToggleMilestone}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* اهداف تکمیل شده */}
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedGoals.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    هنوز هدفی تکمیل نشده
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    با تکمیل مراحل اهداف خود، موفقیت‌هایتان را جشن بگیرید
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {completedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteGoal}
                  onToggleMilestone={handleToggleMilestone}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* اهداف متوقف شده */}
        <TabsContent value="paused" className="mt-6 space-y-4">
          {pausedGoals.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Clock className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    هیچ هدف متوقفی وجود ندارد
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    همه اهداف شما در حال پیشرفت هستند
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {pausedGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteGoal}
                  onToggleMilestone={handleToggleMilestone}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Goals;
