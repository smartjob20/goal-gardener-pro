import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plan, Priority, PlanType, PlanStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Play, 
  Pause, 
  CheckCircle2, 
  Target, 
  Zap, 
  Clock,
  Sparkles,
  TrendingUp,
  Star,
  Layers,
  Calendar,
  ListChecks,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, addDays } from 'date-fns';
import { ImageUpload } from '@/components/ImageUpload';
import { useSubscription } from '@/context/SubscriptionContext';
import { triggerHaptic } from '@/utils/haptics';

// برچسب‌های نوع برنامه
const planTypeLabels: Record<PlanType, { label: string; icon: string; color: string }> = {
  habit: { label: 'عادت جدید', icon: '🎯', color: 'hsl(142, 76%, 36%)' },
  goal: { label: 'هدف بلندمدت', icon: '🏆', color: 'hsl(262, 83%, 58%)' },
  routine: { label: 'روتین روزانه', icon: '⚡', color: 'hsl(217, 91%, 60%)' }
};

// دسته‌بندی‌ها
const categoryOptions = {
  habit: ['سلامت', 'تناسب اندام', 'تغذیه', 'بهره‌وری', 'یادگیری', 'آرامش ذهن'],
  goal: ['سلامت', 'آموزش', 'شغل', 'مالی', 'شخصی', 'خانواده'],
  routine: ['صبحگاهی', 'شبانه', 'کاری', 'ورزشی', 'مطالعه', 'خانوادگی']
};

// گزینه‌های مدت زمان
const durationOptions = [
  { value: 21, label: '21 روز - شروع عادت', description: 'برای ایجاد عادت‌های جدید' },
  { value: 30, label: '30 روز - یک ماه تمرکز', description: 'چالش یک ماهه' },
  { value: 60, label: '60 روز - عادت پیچیده', description: 'برای تغییرات عمیق‌تر' },
  { value: 90, label: '90 روز - تحول بزرگ', description: 'برای دگرگونی اساسی' },
  { value: 180, label: '6 ماه - پروژه بزرگ', description: 'برای پروژه‌های بلندمدت' },
  { value: 365, label: '1 سال - هدف استراتژیک', description: 'برای تحول کامل زندگی' },
  { value: 0, label: 'سفارشی', description: 'مدت زمان دلخواه' }
];

// رنگ‌های اولویت
const priorityInfo = {
  low: { label: 'پایین', icon: '🟢', color: 'hsl(142, 76%, 36%)' },
  medium: { label: 'متوسط', icon: '🟡', color: 'hsl(48, 96%, 53%)' },
  high: { label: 'بالا', icon: '🔴', color: 'hsl(0, 84%, 60%)' }
};

// رنگ‌های وضعیت
const statusInfo: Record<PlanStatus, { label: string; icon: any; color: string }> = {
  planning: { label: 'در حال برنامه‌ریزی', icon: Layers, color: 'hsl(217, 91%, 60%)' },
  active: { label: 'فعال', icon: Play, color: 'hsl(142, 76%, 36%)' },
  completed: { label: 'تکمیل شده', icon: CheckCircle2, color: 'hsl(262, 83%, 58%)' },
  paused: { label: 'متوقف شده', icon: Pause, color: 'hsl(215, 16%, 47%)' }
};

// کامپوننت کارت برنامه
function PlanCard({ 
  plan, 
  onEdit, 
  onDelete, 
  onToggleChecklist,
  onChangeStatus 
}: { 
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onDelete: (id: string) => void;
  onToggleChecklist: (planId: string, itemId: string) => void;
  onChangeStatus: (planId: string, status: PlanStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const planTypeInfo = planTypeLabels[plan.type];
  const priorityData = priorityInfo[plan.priority];
  const statusData = statusInfo[plan.status];
  const daysRemaining = differenceInDays(new Date(plan.endDate), new Date());
  const isOverdue = daysRemaining < 0 && plan.status !== 'completed';
  const completedItems = plan.checklist.filter(item => item.completed).length;
  const totalItems = plan.checklist.length;
  const StatusIcon = statusData.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`overflow-hidden transition-all hover:shadow-xl ${plan.status === 'completed' ? 'opacity-90' : ''}`}>
        {/* خط رنگی بالای کارت */}
        <div className="h-1 w-full" style={{ backgroundColor: planTypeInfo.color }} />
        
        <CardHeader className="p-4 sm:p-6 pb-3 space-y-3">
          {/* هدر با آیکون و بج‌ها */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="gap-1 text-xs px-2 py-1">
                  <span>{planTypeInfo.icon}</span>
                  <span>{planTypeInfo.label}</span>
                </Badge>
                <Badge 
                  variant="outline" 
                  className="gap-1 text-xs px-2 py-1"
                  style={{ borderColor: priorityData.color, color: priorityData.color }}
                >
                  <span>{priorityData.icon}</span>
                  <span>{priorityData.label}</span>
                </Badge>
                <Badge 
                  variant="outline"
                  className="gap-1 text-xs px-2 py-1"
                  style={{ borderColor: statusData.color, color: statusData.color }}
                >
                  <StatusIcon className="w-3 h-3" />
                  <span>{statusData.label}</span>
                </Badge>
              </div>
              
              <h3 className="text-xl sm:text-2xl font-bold text-foreground leading-tight text-right">
                {plan.title}
              </h3>
              
              {plan.description && (
                <p className="text-sm text-muted-foreground leading-relaxed text-right">
                  {plan.description}
                </p>
              )}

              {/* دسته‌بندی */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Layers className="w-3 h-3" />
                <span>{plan.category}</span>
              </div>
            </div>

            <div className="flex gap-1 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(plan)}
                className="min-h-[40px] min-w-[40px]"
                aria-label="ویرایش"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(plan.id)}
                className="text-destructive hover:bg-destructive/10 min-h-[40px] min-w-[40px]"
                aria-label="حذف"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* تصویر انگیزشی */}
          {plan.imageUrl && (
            <div className="w-full h-40 sm:h-48 rounded-lg overflow-hidden">
              <img
                src={plan.imageUrl}
                alt={plan.title}
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
              <span className="font-medium text-foreground">پیشرفت</span>
              <span className="font-bold text-primary">{plan.progress}%</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-l from-primary to-primary/80 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${plan.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ListChecks className="w-3 h-3" />
                <span>{completedItems} از {totalItems} مرحله</span>
              </div>
              {plan.status !== 'completed' && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                    {isOverdue ? 'سررسید گذشته' : `${daysRemaining} روز مانده`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* تاریخ‌های برنامه */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span>شروع</span>
              </div>
              <div className="font-medium text-foreground">
                {format(new Date(plan.startDate), 'yyyy/MM/dd')}
              </div>
            </div>
            <div className="p-3 bg-accent/50 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Calendar className="w-4 h-4" />
                <span>پایان</span>
              </div>
              <div className="font-medium text-foreground">
                {format(new Date(plan.endDate), 'yyyy/MM/dd')}
              </div>
            </div>
          </div>

          {/* چک‌لیست */}
          <div className="space-y-2">
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center justify-between w-full text-sm font-medium text-foreground hover:text-primary transition-colors"
            >
              <div className="flex items-center gap-2">
                <ListChecks className="w-4 h-4" />
                <span>مراحل برنامه ({completedItems}/{totalItems})</span>
              </div>
              <motion.div
                animate={{ rotate: expanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4" />
              </motion.div>
            </button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2 overflow-hidden"
                >
                  {plan.checklist.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                        item.completed 
                          ? 'bg-primary/10 border border-primary/20' 
                          : 'bg-accent/50 hover:bg-accent'
                      }`}
                    >
                      <Checkbox
                        id={item.id}
                        checked={item.completed}
                        onCheckedChange={() => onToggleChecklist(plan.id, item.id)}
                        className="mt-0.5 shrink-0"
                      />
                      <label
                        htmlFor={item.id}
                        className={`flex-1 text-sm leading-relaxed cursor-pointer text-right ${
                          item.completed 
                            ? 'line-through text-muted-foreground' 
                            : 'text-foreground'
                        }`}
                      >
                        {item.title}
                      </label>
                      {item.completed && (
                        <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* دکمه‌های تغییر وضعیت */}
          {plan.status !== 'completed' && (
            <div className="flex gap-2 pt-2 border-t">
              {plan.status === 'planning' && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onChangeStatus(plan.id, 'active')}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <Play className="w-4 h-4" />
                  <span>شروع برنامه</span>
                </Button>
              )}
              {plan.status === 'active' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeStatus(plan.id, 'paused')}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <Pause className="w-4 h-4" />
                  <span>متوقف کردن</span>
                </Button>
              )}
              {plan.status === 'paused' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onChangeStatus(plan.id, 'active')}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <Play className="w-4 h-4" />
                  <span>ادامه دادن</span>
                </Button>
              )}
              {plan.progress === 100 && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onChangeStatus(plan.id, 'completed')}
                  className="flex-1 gap-2 min-h-[44px]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تکمیل برنامه</span>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

const Planning = () => {
  const { state, addPlan, updatePlan, deletePlan } = useApp();
  const appContext = useAppContext();
  const useJalali = appContext.state.settings.calendar === 'jalali';
  const { isPro } = useSubscription();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [planType, setPlanType] = useState<PlanType>('habit');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [duration, setDuration] = useState(30);
  const [customDuration, setCustomDuration] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [checklistItems, setChecklistItems] = useState<string[]>(['']);
  const [imageUrl, setImageUrl] = useState('');

  // Edit states
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleAddPlan = () => {
    if (!title.trim()) {
      toast.error('لطفاً عنوان برنامه را وارد کنید');
      return;
    }

    // Check habit limit for free users
    if (planType === 'habit' && !isPro) {
      const habitCount = state.plans.filter(p => p.type === 'habit').length;
      if (habitCount >= 3) {
        toast.error('🔒 کاربران رایگان فقط می‌توانند ۳ عادت ایجاد کنند. برای برنامه‌های بیشتر، به نسخه Pro ارتقا دهید!', {
          duration: 5000,
        });
        return;
      }
    }

    if (!category) {
      toast.error('لطفاً دسته‌بندی را انتخاب کنید');
      return;
    }

    const finalDuration = duration === 0 ? parseInt(customDuration) : duration;
    if (!finalDuration || finalDuration < 1) {
      toast.error('لطفاً مدت زمان معتبری وارد کنید');
      return;
    }

    const validChecklistItems = checklistItems.filter(item => item.trim());
    if (validChecklistItems.length === 0) {
      toast.error('لطفاً حداقل یک مرحله در چک‌لیست اضافه کنید');
      return;
    }

    const endDate = addDays(startDate, finalDuration);
    const checklist = validChecklistItems.map((item, index) => ({
      id: `checklist-${Date.now()}-${index}`,
      title: item,
      completed: false
    }));

    const newPlan: Plan = {
      id: `plan-${Date.now()}`,
      title,
      description,
      type: planType,
      category,
      priority,
      status: 'planning',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      duration: finalDuration,
      checklist,
      progress: 0,
      createdAt: new Date().toISOString(),
      imageUrl: imageUrl || undefined
    };

    addPlan(newPlan);
    toast.success('✨ برنامه با موفقیت ایجاد شد');
    triggerHaptic('success');
    resetForm();
    setIsAddDialogOpen(false);
  };

  const handleEditPlan = () => {
    if (!editingPlan) return;

    if (!title.trim()) {
      toast.error('لطفاً عنوان برنامه را وارد کنید');
      return;
    }

    const validChecklistItems = checklistItems.filter(item => item.trim());
    const checklist = validChecklistItems.map((item, index) => {
      const existingItem = editingPlan.checklist.find(c => c.title === item);
      return existingItem || {
        id: `checklist-${Date.now()}-${index}`,
        title: item,
        completed: false
      };
    });

    const completedItems = checklist.filter(item => item.completed).length;
    const progress = checklist.length > 0 ? Math.round((completedItems / checklist.length) * 100) : 0;

    const updatedPlan: Plan = {
      ...editingPlan,
      title,
      description,
      category,
      priority,
      checklist,
      progress,
      imageUrl: imageUrl || undefined
    };

    updatePlan(updatedPlan.id, updatedPlan);
    toast.success('✅ برنامه با موفقیت ویرایش شد');
    triggerHaptic('success');
    setIsEditDialogOpen(false);
    setEditingPlan(null);
    resetForm();
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('آیا از حذف این برنامه مطمئن هستید؟')) {
      deletePlan(id);
      toast.success('برنامه حذف شد');
      triggerHaptic('warning');
    }
  };

  const handleToggleChecklistItem = (planId: string, itemId: string) => {
    const plan = state.plans.find(p => p.id === planId);
    if (!plan) return;

    const updatedChecklist = plan.checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );

    const completedItems = updatedChecklist.filter(item => item.completed).length;
    const progress = Math.round((completedItems / updatedChecklist.length) * 100);

    updatePlan(planId, {
      ...plan,
      checklist: updatedChecklist,
      progress,
      status: progress === 100 ? 'completed' : plan.status
    });

    triggerHaptic('light');

    if (progress === 100) {
      toast.success('🎉 برنامه تکمیل شد!');
      triggerHaptic('success');
    }
  };

  const handleChangeStatus = (planId: string, newStatus: PlanStatus) => {
    const plan = state.plans.find(p => p.id === planId);
    if (!plan) return;

    updatePlan(planId, { ...plan, status: newStatus });
    
    if (newStatus === 'completed') {
      toast.success('🏆 برنامه با موفقیت تکمیل شد!');
      triggerHaptic('success');
    } else {
      toast.success(`وضعیت به "${statusInfo[newStatus].label}" تغییر کرد`);
      triggerHaptic('light');
    }
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlan(plan);
    setTitle(plan.title);
    setDescription(plan.description || '');
    setPlanType(plan.type);
    setCategory(plan.category);
    setPriority(plan.priority);
    setChecklistItems(plan.checklist.map(item => item.title));
    setImageUrl(plan.imageUrl || '');
    setIsEditDialogOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPlanType('habit');
    setCategory('');
    setPriority('medium');
    setDuration(30);
    setCustomDuration('');
    setStartDate(new Date());
    setChecklistItems(['']);
    setImageUrl('');
  };

  const addChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const removeChecklistItem = (index: number) => {
    if (checklistItems.length > 1) {
      setChecklistItems(checklistItems.filter((_, i) => i !== index));
    }
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const activePlans = state.plans.filter(p => p.status === 'active' || p.status === 'planning');
  const completedPlans = state.plans.filter(p => p.status === 'completed');
  const pausedPlans = state.plans.filter(p => p.status === 'paused');

  const totalProgress = state.plans.length > 0 
    ? Math.round(state.plans.reduce((sum, p) => sum + p.progress, 0) / state.plans.length)
    : 0;

  return (
    <div className="min-h-screen pb-24 p-4 sm:p-6 space-y-6" dir="rtl">
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
            <Calendar className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">نقشه راه موفقیت شما</span>
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            برنامه‌ریزی هوشمند 📅
          </h1>
          
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            برنامه‌های خود را به طور منظم دنبال کنید و به اهدافتان برسید
          </p>
        </div>

        {/* کارت آمار */}
        <Card className="overflow-hidden">
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* برنامه‌های فعال */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center gap-1">
                  <Play className="w-6 h-6" />
                  <span>{activePlans.length}</span>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  فعال
                </div>
              </div>

              {/* تکمیل شده */}
              <div className="text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-6 h-6" />
                  <span>{completedPlans.length}</span>
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
            {state.plans.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">پیشرفت کلی برنامه‌ها</span>
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

        {/* دکمه افزودن برنامه */}
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
              <span>ایجاد برنامه جدید</span>
              <Sparkles className="w-5 h-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl text-right flex items-center gap-2">
                <Calendar className="w-6 h-6 text-primary" />
                <span>{editingPlan ? 'ویرایش برنامه' : 'ایجاد برنامه جدید'}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* پیام انگیزشی */}
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                <div className="flex items-start gap-3">
                  <Star className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground leading-relaxed text-right">
                    برنامه‌ریزی دقیق، نصف موفقیت است. هر برنامه را با مراحل مشخص و زمان‌بندی دقیق تعریف کنید.
                  </p>
                </div>
              </div>

              {/* نوع برنامه */}
              <div className="space-y-3">
                <Label className="text-right block text-base">نوع برنامه *</Label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(Object.keys(planTypeLabels) as PlanType[]).map((type) => {
                    const typeInfo = planTypeLabels[type];
                    return (
                      <Button
                        key={type}
                        variant={planType === type ? 'default' : 'outline'}
                        onClick={() => {
                          setPlanType(type);
                          setCategory('');
                        }}
                        className="w-full gap-2 min-h-[48px] justify-start"
                        style={planType === type ? { backgroundColor: typeInfo.color } : {}}
                      >
                        <span>{typeInfo.icon}</span>
                        <span>{typeInfo.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* عنوان */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-right block text-base">
                  عنوان برنامه *
                </Label>
                <Input
                  id="title"
                  placeholder="مثال: برنامه ورزش صبحگاهی 30 روزه"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-right min-h-[48px] text-base"
                  dir="rtl"
                />
              </div>

              {/* توضیحات */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-right block text-base">
                  توضیحات و اهداف برنامه
                </Label>
                <Textarea
                  id="description"
                  placeholder="چه چیزی را می‌خواهید با این برنامه به دست آورید؟"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-right min-h-[120px] text-base resize-none"
                  dir="rtl"
                />
              </div>

              {/* دسته‌بندی و اولویت */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-right block text-base">
                    دسته‌بندی *
                  </Label>
                  <Select value={category} onValueChange={setCategory} dir="rtl">
                    <SelectTrigger id="category" className="min-h-[48px]">
                      <SelectValue placeholder="انتخاب دسته" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions[planType].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority" className="text-right block text-base">
                    اولویت
                  </Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)} dir="rtl">
                    <SelectTrigger id="priority" className="min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{info.icon}</span>
                            <span>{info.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* مدت زمان و تاریخ شروع */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-right block text-base">
                    مدت زمان برنامه
                  </Label>
                  <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))} dir="rtl">
                    <SelectTrigger id="duration" className="min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value.toString()}>
                          <div className="text-right">
                            <div className="font-medium">{opt.label}</div>
                            <div className="text-xs text-muted-foreground">{opt.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {duration === 0 && (
                    <Input
                      type="number"
                      placeholder="تعداد روز (حداقل 1)"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      min="1"
                      className="min-h-[48px] text-base text-right"
                      dir="rtl"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-right block text-base">
                    تاریخ شروع
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="w-full justify-start min-h-[48px] text-base"
                      >
                        <CalendarIcon className="ms-2 h-5 w-5" />
                        <span>{format(startDate, 'yyyy/MM/dd')}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      {useJalali ? (
                        <PersianCalendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                        />
                      ) : (
                        <div className="p-3">
                          <Input
                            type="date"
                            value={format(startDate, 'yyyy-MM-dd')}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            className="min-h-[48px]"
                          />
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* تصویر انگیزشی */}
              <div className="space-y-2">
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر انگیزشی برنامه"
                />
                <p className="text-xs text-muted-foreground text-right">
                  یک تصویر که به شما انگیزه می‌دهد تا برنامه را تا پایان ادامه دهید
                </p>
              </div>

              {/* چک‌لیست مراحل */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-right text-base flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    <span>مراحل اجرای برنامه *</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addChecklistItem}
                    className="gap-1 min-h-[40px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن مرحله</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center justify-center w-8 h-12 text-sm font-medium text-muted-foreground shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`مرحله ${index + 1}`}
                        value={item}
                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                        className="min-h-[48px] text-base text-right"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChecklistItem(index)}
                        className="min-h-[48px] min-w-[48px] shrink-0"
                        disabled={checklistItems.length === 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <p className="text-xs text-muted-foreground text-right">
                  برنامه خود را به مراحل کوچک و قابل اجرا تقسیم کنید تا پیشرفت را بهتر پیگیری کنید
                </p>
              </div>

              {/* دکمه‌های عملیات */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={editingPlan ? handleEditPlan : handleAddPlan}
                  className="flex-1 gap-2 min-h-[52px] text-base font-medium"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{editingPlan ? 'ذخیره تغییرات' : 'ایجاد برنامه'}</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setIsEditDialogOpen(false);
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

        {/* دیالوگ ویرایش */}
        <Dialog 
          open={isEditDialogOpen} 
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setEditingPlan(null);
              resetForm();
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-xl text-right flex items-center gap-2">
                <Edit2 className="w-6 h-6 text-primary" />
                <span>ویرایش برنامه</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4">
              {/* عنوان */}
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-right block text-base">
                  عنوان برنامه *
                </Label>
                <Input
                  id="edit-title"
                  placeholder="مثال: برنامه ورزش صبحگاهی"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-right min-h-[48px] text-base"
                  dir="rtl"
                />
              </div>

              {/* توضیحات */}
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-right block text-base">
                  توضیحات و اهداف برنامه
                </Label>
                <Textarea
                  id="edit-description"
                  placeholder="چه چیزی را می‌خواهید با این برنامه به دست آورید؟"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-right min-h-[120px] text-base resize-none"
                  dir="rtl"
                />
              </div>

              {/* دسته‌بندی و اولویت */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-right block text-base">
                    دسته‌بندی *
                  </Label>
                  <Select value={category} onValueChange={setCategory} dir="rtl">
                    <SelectTrigger id="edit-category" className="min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions[planType].map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-priority" className="text-right block text-base">
                    اولویت
                  </Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as Priority)} dir="rtl">
                    <SelectTrigger id="edit-priority" className="min-h-[48px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(priorityInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{info.icon}</span>
                            <span>{info.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* تصویر */}
              <div className="space-y-2">
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر انگیزشی برنامه"
                />
              </div>

              {/* چک‌لیست */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-right text-base flex items-center gap-2">
                    <ListChecks className="w-4 h-4" />
                    <span>مراحل اجرای برنامه *</span>
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addChecklistItem}
                    className="gap-1 min-h-[40px]"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن مرحله</span>
                  </Button>
                </div>

                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex items-center justify-center w-8 h-12 text-sm font-medium text-muted-foreground shrink-0">
                        {index + 1}
                      </div>
                      <Input
                        placeholder={`مرحله ${index + 1}`}
                        value={item}
                        onChange={(e) => updateChecklistItem(index, e.target.value)}
                        className="min-h-[48px] text-base text-right"
                        dir="rtl"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChecklistItem(index)}
                        className="min-h-[48px] min-w-[48px] shrink-0"
                        disabled={checklistItems.length === 1}
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
                  onClick={handleEditPlan}
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
                    setEditingPlan(null);
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

      {/* تب‌های برنامه‌ها */}
      <Tabs value={activeTab} onValueChange={setActiveTab} dir="rtl" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-12">
          <TabsTrigger value="active" className="gap-2 text-base">
            <Play className="w-4 h-4" />
            <span>فعال</span>
            <Badge variant="secondary" className="text-xs">
              {activePlans.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="gap-2 text-base">
            <CheckCircle2 className="w-4 h-4" />
            <span>تکمیل شده</span>
            <Badge variant="secondary" className="text-xs">
              {completedPlans.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="paused" className="gap-2 text-base">
            <Pause className="w-4 h-4" />
            <span>متوقف</span>
            <Badge variant="secondary" className="text-xs">
              {pausedPlans.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* برنامه‌های فعال */}
        <TabsContent value="active" className="mt-6 space-y-4">
          {activePlans.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Calendar className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    هنوز برنامه‌ای ایجاد نکرده‌اید
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    اولین برنامه خود را ایجاد کنید و قدم اول را به سوی اهدافتان بردارید
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {activePlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={openEditDialog}
                  onDelete={handleDeletePlan}
                  onToggleChecklist={handleToggleChecklistItem}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* برنامه‌های تکمیل شده */}
        <TabsContent value="completed" className="mt-6 space-y-4">
          {completedPlans.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    هنوز برنامه‌ای تکمیل نشده
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    با پیگیری برنامه‌های فعال، به زودی موفقیت‌های خود را جشن خواهید گرفت
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {completedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={openEditDialog}
                  onDelete={handleDeletePlan}
                  onToggleChecklist={handleToggleChecklistItem}
                  onChangeStatus={handleChangeStatus}
                />
              ))}
            </AnimatePresence>
          )}
        </TabsContent>

        {/* برنامه‌های متوقف شده */}
        <TabsContent value="paused" className="mt-6 space-y-4">
          {pausedPlans.length === 0 ? (
            <Card className="p-12">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Pause className="w-10 h-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    هیچ برنامه متوقفی وجود ندارد
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                    همه برنامه‌های شما در حال اجرا هستند
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <AnimatePresence mode="popLayout">
              {pausedPlans.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  onEdit={openEditDialog}
                  onDelete={handleDeletePlan}
                  onToggleChecklist={handleToggleChecklistItem}
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

// Missing import
import { ChevronDown } from 'lucide-react';

export default Planning;
