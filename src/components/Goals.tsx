import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Goal, GoalCategory, Priority } from '@/types';
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
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Calendar as CalendarIcon, Trash2, Edit2, Target, Trophy, Play, Pause, CheckCircle2, Clock, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, differenceInDays } from 'date-fns';

const Goals = () => {
  const { state, addGoal, dispatch } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<GoalCategory>('health');
  const [targetDate, setTargetDate] = useState<Date>(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));
  const [imageUrl, setImageUrl] = useState('');
  const [milestones, setMilestones] = useState<string[]>(['']);

  // Edit states
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const categoryOptions: { value: GoalCategory; label: string; icon: string }[] = [
    { value: 'health', label: 'سلامت و تندرستی', icon: '🏃' },
    { value: 'learning', label: 'آموزش و مطالعه', icon: '📚' },
    { value: 'career', label: 'شغل و کسب‌وکار', icon: '💼' },
    { value: 'finance', label: 'مالی و سرمایه‌گذاری', icon: '💰' },
    { value: 'personal', label: 'شخصی و روحی', icon: '🧘' },
    { value: 'family', label: 'خانواده و روابط', icon: '👨‍👩‍👧' },
    { value: 'hobby', label: 'سرگرمی و هنر', icon: '🎨' },
    { value: 'travel', label: 'سفر و ماجراجویی', icon: '✈️' }
  ];

  const statusColors = {
    active: 'bg-green-500/20 text-green-700 dark:text-green-300',
    completed: 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
    paused: 'bg-gray-500/20 text-gray-700 dark:text-gray-300'
  };

  const statusLabels = {
    active: 'فعال',
    completed: 'تکمیل شده',
    paused: 'متوقف'
  };

  const handleAddGoal = () => {
    if (!title.trim()) {
      toast.error('لطفاً عنوان هدف را وارد کنید');
      return;
    }

    const validMilestones = milestones.filter(m => m.trim());
    if (validMilestones.length === 0) {
      toast.error('لطفاً حداقل یک مایلستون اضافه کنید');
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
      category,
      targetDate: targetDate.toISOString(),
      milestones: milestoneObjects,
      xpReward: 100,
      imageUrl: imageUrl || undefined
    });

    toast.success('🎯 هدف جدید ایجاد شد!');
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
      category,
      targetDate: targetDate.toISOString(),
      milestones: milestoneObjects,
      progress,
      imageUrl: imageUrl || undefined,
      status: progress === 100 ? 'completed' : editingGoal.status
    };

    dispatch({ type: 'UPDATE_GOAL', payload: updatedGoal });
    toast.success('✏️ هدف با موفقیت ویرایش شد');
    setIsEditDialogOpen(false);
    setEditingGoal(null);
    resetForm();
  };

  const handleDeleteGoal = (id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id });
    toast.success('🗑️ هدف حذف شد');
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

    if (progress === 100) {
      dispatch({ type: 'ADD_XP', payload: goal.xpReward });
      toast.success('🎉 تبریک! هدف شما تکمیل شد!');
    }
  };

  const handleChangeStatus = (goalId: string, newStatus: 'active' | 'completed' | 'paused') => {
    const goal = state.goals.find(g => g.id === goalId);
    if (!goal) return;

    dispatch({ type: 'UPDATE_GOAL', payload: { ...goal, status: newStatus } });
    toast.success(`وضعیت به "${statusLabels[newStatus]}" تغییر کرد`);
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
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index] = value;
    setMilestones(newMilestones);
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const days = differenceInDays(new Date(targetDate), new Date());
    return days > 0 ? days : 0;
  };

  const activeGoals = state.goals.filter(g => g.status === 'active');
  const completedGoals = state.goals.filter(g => g.status === 'completed');
  const pausedGoals = state.goals.filter(g => g.status === 'paused');

  return (
    <div className="min-h-screen pb-24 px-4 pt-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              🎯 هدف‌گذاری
            </h1>
            <p className="text-muted-foreground mt-1">
              اهداف خود را تعیین و به موفقیت برسید
            </p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="shadow-lg hover:shadow-xl transition-all">
                <Plus className="ml-2 h-5 w-5" />
                هدف جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>🎯 ایجاد هدف جدید</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {/* عنوان */}
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان هدف *</Label>
                  <Input
                    id="title"
                    placeholder="مثلاً: کاهش 10 کیلو وزن"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* توضیحات */}
                <div className="space-y-2">
                  <Label htmlFor="description">توضیحات</Label>
                  <Textarea
                    id="description"
                    placeholder="جزئیات هدف خود را بنویسید..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* دسته‌بندی */}
                <div className="space-y-2">
                  <Label>دسته‌بندی *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.icon} {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* تاریخ هدف */}
                <div className="space-y-2">
                  <Label>تاریخ هدف</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {format(targetDate, 'yyyy/MM/dd')}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={targetDate}
                        onSelect={(date) => date && setTargetDate(date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* تصویر انگیزشی */}
                <div className="space-y-2">
                  <Label htmlFor="image">تصویر انگیزشی (URL)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    {imageUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setImageUrl('')}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {imageUrl && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={() => {
                          toast.error('خطا در بارگذاری تصویر');
                          setImageUrl('');
                        }}
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    می‌توانید لینک تصویر را از سایت‌های عکس مانند Unsplash کپی کنید
                  </p>
                </div>

                {/* مایلستون‌ها */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>مراحل (مایلستون‌ها) *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addMilestone}
                    >
                      <Plus className="ml-1 h-4 w-4" />
                      افزودن مرحله
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {milestones.map((milestone, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`مرحله ${index + 1}`}
                          value={milestone}
                          onChange={(e) => updateMilestone(index, e.target.value)}
                        />
                        {milestones.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeMilestone(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleAddGoal} className="w-full">
                  <Target className="ml-2 h-5 w-5" />
                  ایجاد هدف
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="p-4 glass-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeGoals.length}</p>
                <p className="text-sm text-muted-foreground">هدف فعال</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedGoals.length}</p>
                <p className="text-sm text-muted-foreground">تکمیل شده</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 glass-card hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {state.goals.reduce((sum, g) => sum + g.progress, 0) / (state.goals.length || 1)}%
                </p>
                <p className="text-sm text-muted-foreground">میانگین پیشرفت</p>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="active">
            فعال ({activeGoals.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            تکمیل شده ({completedGoals.length})
          </TabsTrigger>
          <TabsTrigger value="paused">
            متوقف ({pausedGoals.length})
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <TabsContent value="active" className="space-y-4">
            {activeGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">هیچ هدف فعالی وجود ندارد</h3>
                <p className="text-muted-foreground mb-6">
                  اولین هدف خود را تعیین کنید
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="ml-2 h-5 w-5" />
                  ایجاد هدف
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {activeGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden glass-card hover:shadow-xl transition-all">
                      {/* تصویر */}
                      {goal.imageUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={goal.imageUrl}
                            alt={goal.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge className={statusColors[goal.status]}>
                              {statusLabels[goal.status]}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <ImageIcon className="h-16 w-16 text-muted-foreground/30" />
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Badge className={statusColors[goal.status]}>
                              {statusLabels[goal.status]}
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="p-6 space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>
                                {categoryOptions.find(c => c.value === goal.category)?.icon}{' '}
                                {categoryOptions.find(c => c.value === goal.category)?.label}
                              </span>
                            </div>
                            {goal.description && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {goal.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>پیشرفت: {goal.progress}%</span>
                            <span>
                              {goal.milestones.filter(m => m.completed).length} از {goal.milestones.length} مرحله
                            </span>
                          </div>
                          <Progress value={goal.progress} className="h-3" />
                        </div>

                        {/* مایلستون‌ها */}
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm">مراحل:</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {goal.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                              >
                                <Checkbox
                                  checked={milestone.completed}
                                  onCheckedChange={() => handleToggleMilestone(goal.id, milestone.id)}
                                />
                                <span className={milestone.completed ? 'line-through text-muted-foreground text-sm' : 'text-sm'}>
                                  {milestone.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              {calculateDaysRemaining(goal.targetDate)} روز باقی‌مانده
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(goal)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleChangeStatus(goal.id, 'paused')}
                            >
                              <Pause className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteGoal(goal.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🏆</div>
                <h3 className="text-xl font-semibold mb-2">هنوز هدفی تکمیل نشده</h3>
                <p className="text-muted-foreground">
                  اهداف خود را دنبال کنید و به موفقیت برسید
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {completedGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden glass-card border-green-500/20">
                      {goal.imageUrl ? (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={goal.imageUrl}
                            alt={goal.title}
                            className="w-full h-full object-cover opacity-75"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-green-500/20 text-green-700">
                              تکمیل شده
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <div className="relative h-48 bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                          <Trophy className="h-16 w-16 text-green-600/50" />
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-green-500/20 text-green-700">
                              تکمیل شده
                            </Badge>
                          </div>
                        </div>
                      )}

                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                              <h3 className="text-xl font-bold">{goal.title}</h3>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {categoryOptions.find(c => c.value === goal.category)?.icon}{' '}
                              {categoryOptions.find(c => c.value === goal.category)?.label}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Progress value={100} className="h-3" />
                        <div className="text-sm text-muted-foreground">
                          🎉 تبریک! این هدف با موفقیت تکمیل شد
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="paused" className="space-y-4">
            {pausedGoals.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">⏸️</div>
                <h3 className="text-xl font-semibold mb-2">هیچ هدف متوقفی وجود ندارد</h3>
              </motion.div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pausedGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden glass-card opacity-75">
                      {goal.imageUrl && (
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={goal.imageUrl}
                            alt={goal.title}
                            className="w-full h-full object-cover grayscale"
                          />
                        </div>
                      )}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold mb-2">{goal.title}</h3>
                            <Badge className={statusColors.paused}>متوقف</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Progress value={goal.progress} className="h-3" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChangeStatus(goal.id, 'active')}
                          className="w-full"
                        >
                          <Play className="ml-2 h-4 w-4" />
                          ادامه هدف
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
            <DialogTitle>✏️ ویرایش هدف</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">عنوان هدف</Label>
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

            <div className="space-y-2">
              <Label>دسته‌بندی</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.icon} {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>تاریخ هدف</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {format(targetDate, 'yyyy/MM/dd')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={targetDate}
                    onSelect={(date) => date && setTargetDate(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image">تصویر انگیزشی (URL)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit-image"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
                {imageUrl && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setImageUrl('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {imageUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>مراحل (مایلستون‌ها)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addMilestone}
                >
                  <Plus className="ml-1 h-4 w-4" />
                  افزودن مرحله
                </Button>
              </div>
              <div className="space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestone(index, e.target.value)}
                    />
                    {milestones.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeMilestone(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button onClick={handleEditGoal} className="w-full">
              ذخیره تغییرات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Goals;