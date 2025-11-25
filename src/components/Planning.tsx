import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Plan, Priority, PlanType, PlanStatus } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
import { Plus, Calendar as CalendarIcon, Trash2, Edit2, Play, Pause, CheckCircle2, Target, Zap, LayoutGrid, ChevronDown, ChevronUp, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays, addDays } from 'date-fns';
import { ImageUpload } from '@/components/ImageUpload';
import { useSubscription } from '@/context/SubscriptionContext';
import ProGate from '@/components/ProGate';

const Planning = () => {
  const { state, addPlan, updatePlan, deletePlan } = useApp();
  const appContext = useAppContext();
  const useJalali = appContext.state.settings.calendar === 'jalali';
  const { isPro } = useSubscription();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);

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

  const planTypeLabels: Record<PlanType, string> = {
    habit: 'عادت جدید',
    goal: 'هدف بلندمدت',
    routine: 'روتین روزانه'
  };

  const categoryOptions = {
    habit: ['سلامت', 'تناسب اندام', 'تغذیه', 'بهره‌وری', 'یادگیری', 'آرامش ذهن'],
    goal: ['سلامت', 'آموزش', 'شغل', 'مالی', 'شخصی', 'خانواده'],
    routine: ['صبحگاهی', 'شبانه', 'کاری', 'ورزشی', 'مطالعه', 'خانوادگی']
  };

  const durationOptions = [
    { value: 21, label: '21 روز - شروع عادت' },
    { value: 30, label: '30 روز - یک ماه تمرکز' },
    { value: 60, label: '60 روز - عادت پیچیده' },
    { value: 90, label: '90 روز - تغییر عمیق' },
    { value: 180, label: '6 ماه - پروژه بزرگ' },
    { value: 365, label: '1 سال - هدف بلندمدت' },
    { value: 0, label: 'سفارشی' }
  ];

  const priorityColors = {
    low: 'bg-green-500/20 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
    high: 'bg-red-500/20 text-red-700 dark:text-red-300'
  };

  const priorityLabels = {
    low: 'پایین',
    medium: 'متوسط',
    high: 'بالا'
  };

  const statusColors = {
    planning: 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
    active: 'bg-green-500/20 text-green-700 dark:text-green-300',
    completed: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    paused: 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
  };

  const statusLabels: Record<PlanStatus, string> = {
    planning: 'برنامه‌ریزی',
    active: 'فعال',
    completed: 'تکمیل شده',
    paused: 'متوقف'
  };

  const handleAddPlan = () => {
    if (!title.trim()) {
      toast.error('لطفاً عنوان برنامه را وارد کنید');
      return;
    }

    // Check habit limit for free users
    if (planType === 'habit' && !isPro) {
      const habitCount = state.plans.filter(p => p.type === 'habit').length;
      if (habitCount >= 3) {
        toast.error('🔒 کاربران رایگان فقط می‌توانند ۳ عادت ایجاد کنند. برای عادت‌های بیشتر، به نسخه Pro ارتقا دهید!', {
          duration: 5000,
          action: {
            label: 'ارتقا',
            onClick: () => {
              // Could trigger paywall here
              toast.info('به تب تنظیمات بروید تا به نسخه Pro ارتقا دهید');
            }
          }
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
    toast.success('✏️ برنامه با موفقیت ویرایش شد');
    setIsEditDialogOpen(false);
    setEditingPlan(null);
    resetForm();
  };

  const handleDeletePlan = (id: string) => {
    deletePlan(id);
    toast.success('🗑️ برنامه حذف شد');
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

    if (progress === 100) {
      toast.success('🎉 برنامه تکمیل شد!');
    }
  };

  const handleChangeStatus = (planId: string, newStatus: PlanStatus) => {
    const plan = state.plans.find(p => p.id === planId);
    if (!plan) return;

    updatePlan(planId, { ...plan, status: newStatus });
    toast.success(`وضعیت به "${statusLabels[newStatus]}" تغییر کرد`);
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
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const updateChecklistItem = (index: number, value: string) => {
    const newItems = [...checklistItems];
    newItems[index] = value;
    setChecklistItems(newItems);
  };

  const calculateDaysRemaining = (endDate: string) => {
    const days = differenceInDays(new Date(endDate), new Date());
    return days > 0 ? days : 0;
  };

  const activePlans = state.plans.filter(p => p.status === 'active' || p.status === 'planning');
  const completedPlans = state.plans.filter(p => p.status === 'completed');
  const pausedPlans = state.plans.filter(p => p.status === 'paused');

  return (
    <div className="min-h-screen pb-24 px-4 pt-6" dir="rtl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              📅 برنامه‌ریزی
            </h1>
            <p className="text-muted-foreground mt-1">
              برنامه‌های خود را مدیریت و دنبال کنید
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg hover:shadow-xl transition-all min-h-[44px]">
                <Plus className="ms-2 h-5 w-5" />
                برنامه جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto pb-safe" dir="rtl">
              <DialogHeader>
                <DialogTitle>✨ ایجاد برنامه جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4 pb-20">
                {/* نوع برنامه */}
                <div className="space-y-2">
                  <Label>نوع برنامه</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(Object.keys(planTypeLabels) as PlanType[]).map((type) => (
                      <Button
                        key={type}
                        variant={planType === type ? 'default' : 'outline'}
                        onClick={() => {
                          setPlanType(type);
                          setCategory('');
                        }}
                        className="w-full"
                      >
                        {planTypeLabels[type]}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* عنوان */}
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان برنامه *</Label>
                  <Input
                    id="title"
                    placeholder="مثلاً: برنامه ورزش صبحگاهی"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* توضیحات */}
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    placeholder="جزئیات برنامه خود را بنویسید..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* دسته‌بندی و اولویت */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>دسته‌بندی *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
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
                    <Label>اولویت</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">🟢 پایین</SelectItem>
                        <SelectItem value="medium">🟡 متوسط</SelectItem>
                        <SelectItem value="high">🔴 بالا</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* مدت زمان و تاریخ شروع */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>مدت زمان</Label>
                    <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value.toString()}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {duration === 0 && (
                      <Input
                        type="number"
                        placeholder="تعداد روز"
                        value={customDuration}
                        onChange={(e) => setCustomDuration(e.target.value)}
                        min="1"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>تاریخ شروع</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start min-h-[44px]">
                          <CalendarIcon className="ms-2 h-4 w-4" />
                          {format(startDate, 'yyyy/MM/dd')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 max-w-[min(calc(100vw-2rem),320px)]" align="start">
                      {useJalali ? (
                        <PersianCalendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => date && setStartDate(date)}
                          className="scale-90 sm:scale-100"
                        />
                      ) : (
                        <div className="p-3">
                          <Input
                            type="date"
                            value={format(startDate, 'yyyy-MM-dd')}
                            onChange={(e) => setStartDate(new Date(e.target.value))}
                            className="min-h-[44px]"
                          />
                        </div>
                      )}
                    </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* چک‌لیست مراحل */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>مراحل اجرایی *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addChecklistItem}
                    >
                      <Plus className="ml-1 h-4 w-4" />
                      افزودن مرحله
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {checklistItems.map((item, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`مرحله ${index + 1}`}
                          value={item}
                          onChange={(e) => updateChecklistItem(index, e.target.value)}
                        />
                        {checklistItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeChecklistItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* تصویر انگیزشی */}
                <ImageUpload
                  imageUrl={imageUrl}
                  onImageChange={setImageUrl}
                  label="تصویر انگیزشی"
                />

                <Button onClick={handleAddPlan} className="w-full">
                  <Target className="ml-2 h-5 w-5" />
                  ایجاد برنامه
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards - Mobile Friendly */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-4 glass-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Play className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activePlans.length}</p>
                <p className="text-sm text-muted-foreground">برنامه فعال</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedPlans.length}</p>
                <p className="text-sm text-muted-foreground">تکمیل شده</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <LayoutGrid className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{state.plans.length}</p>
                <p className="text-sm text-muted-foreground">کل برنامه‌ها</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">
            فعال ({activePlans.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            تکمیل شده ({completedPlans.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            متوقف ({pausedPlans.length})
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="active" className="space-y-4">
            {activePlans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-semibold mb-2">هیچ برنامه فعالی وجود ندارد</h3>
                <p className="text-muted-foreground mb-6">
                  اولین برنامه خود را ایجاد کنید
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="ml-2 h-5 w-5" />
                  ایجاد برنامه
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {activePlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 glass-card hover:shadow-xl transition-all">
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{plan.title}</h3>
                              <Badge className={priorityColors[plan.priority]}>
                                {priorityLabels[plan.priority]}
                              </Badge>
                              <Badge className={statusColors[plan.status]}>
                                {statusLabels[plan.status]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {planTypeLabels[plan.type]}
                              </span>
                              <span>•</span>
                              <span>{plan.category}</span>
                              <span>•</span>
                              <span>{calculateDaysRemaining(plan.endDate)} روز باقی‌مانده</span>
                            </div>
                            {plan.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {plan.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(plan)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlan(plan.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
                            >
                              {expandedPlan === plan.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>پیشرفت: {plan.progress}%</span>
                            <span>
                              {plan.checklist.filter(item => item.completed).length} از {plan.checklist.length} مرحله
                            </span>
                          </div>
                          <Progress value={plan.progress} className="h-3" />
                        </div>

                        {/* Checklist */}
                        <AnimatePresence>
                          {expandedPlan === plan.id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="space-y-2 pt-4 border-t"
                            >
                              <h4 className="font-semibold mb-3">مراحل اجرایی:</h4>
                              {plan.checklist.map((item) => (
                                <div
                                  key={item.id}
                                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                                >
                                  <Checkbox
                                    checked={item.completed}
                                    onCheckedChange={() => handleToggleChecklistItem(plan.id, item.id)}
                                  />
                                  <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                                    {item.title}
                                  </span>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          {plan.status === 'planning' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(plan.id, 'active')}
                            >
                              <Play className="ml-2 h-4 w-4" />
                              شروع برنامه
                            </Button>
                          )}
                          {plan.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleChangeStatus(plan.id, 'paused')}
                            >
                              <Pause className="ml-2 h-4 w-4" />
                              متوقف کردن
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedPlans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-2">هنوز برنامه‌ای تکمیل نشده</h3>
                <p className="text-muted-foreground">
                  برنامه‌های خود را دنبال کنید و به موفقیت برسید
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {completedPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 glass-card border-green-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <h3 className="text-xl font-bold">{plan.title}</h3>
                            <Badge className="bg-green-500/20 text-green-700">
                              تکمیل شده
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {planTypeLabels[plan.type]} • {plan.category}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeletePlan(plan.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Progress value={100} className="h-3 mt-4" />
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            {pausedPlans.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">⏸️</div>
                <h3 className="text-xl font-semibold mb-2">هیچ برنامه متوقفی وجود ندارد</h3>
              </motion.div>
            ) : (
              <div className="grid gap-4">
                {pausedPlans.map((plan, index) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="p-6 glass-card opacity-75">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold">{plan.title}</h3>
                              <Badge className={statusColors.paused}>
                                متوقف
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {planTypeLabels[plan.type]} • {plan.category}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Progress value={plan.progress} className="h-3" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeStatus(plan.id, 'active')}
                        >
                          <Play className="ml-2 h-4 w-4" />
                          ادامه برنامه
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>✏️ ویرایش برنامه</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">عنوان برنامه</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">توضیحات</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
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
                <Label>اولویت</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">🟢 پایین</SelectItem>
                    <SelectItem value="medium">🟡 متوسط</SelectItem>
                    <SelectItem value="high">🔴 بالا</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>مراحل اجرایی</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addChecklistItem}
                >
                  <Plus className="ml-1 h-4 w-4" />
                  افزودن مرحله
                </Button>
              </div>
              <div className="space-y-2">
                {checklistItems.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={item}
                      onChange={(e) => updateChecklistItem(index, e.target.value)}
                    />
                    {checklistItems.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeChecklistItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleEditPlan} className="w-full">
              ذخیره تغییرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planning;