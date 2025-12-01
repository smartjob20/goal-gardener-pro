import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, Trash2, Edit, GripVertical, LayoutGrid, Rows3 } from 'lucide-react';
import { Task, TaskCategory, Priority, SubTask } from '@/types';
import { formatDate, daysUntil } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
const categoryConfig = {
  work: {
    label: 'کار',
    icon: '💼',
    color: 'text-info bg-info/10 border-info/20'
  },
  study: {
    label: 'مطالعه',
    icon: '📚',
    color: 'text-primary bg-primary/10 border-primary/20'
  },
  health: {
    label: 'سلامت',
    icon: '💪',
    color: 'text-success bg-success/10 border-success/20'
  },
  personal: {
    label: 'شخصی',
    icon: '👤',
    color: 'text-accent bg-accent/10 border-accent/20'
  },
  project: {
    label: 'پروژه',
    icon: '🚀',
    color: 'text-warning bg-warning/10 border-warning/20'
  }
};
const priorityConfig = {
  high: {
    label: 'بالا',
    icon: '🔴',
    color: 'text-destructive bg-destructive/10 border-destructive/20',
    xp: 30
  },
  medium: {
    label: 'متوسط',
    icon: '🟡',
    color: 'text-warning bg-warning/10 border-warning/20',
    xp: 20
  },
  low: {
    label: 'پایین',
    icon: '🟢',
    color: 'text-success bg-success/10 border-success/20',
    xp: 10
  }
};

// کارت وظیفه با طراحی شیک و حرفه‌ای
function SortableTaskCard({
  task,
  categoryInfo,
  priorityInfo,
  subtaskProgress,
  daysLeft,
  onComplete,
  onEdit,
  onDelete,
  onToggleSubtask,
  viewMode = 'expanded'
}: {
  task: Task;
  categoryInfo: any;
  priorityInfo: any;
  subtaskProgress: number;
  daysLeft: number | null;
  onComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  viewMode?: 'compact' | 'expanded';
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: task.id
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };
  const isCompact = viewMode === 'compact';
  return <motion.div ref={setNodeRef} style={style} initial={{
    opacity: 0,
    y: 10
  }} animate={{
    opacity: 1,
    y: 0
  }} exit={{
    opacity: 0,
    scale: 0.98
  }} className="w-full">
      <Card className={`group relative overflow-hidden bg-card/50 backdrop-blur-sm border transition-all duration-200 ${isDragging ? 'shadow-xl scale-[1.02] border-primary/50' : 'hover:shadow-lg hover:border-primary/30'}`}>
        {/* تصویر انگیزشی - فقط در نمای گسترده */}
        {!isCompact && task.imageUrl && <div className="relative w-full h-32 overflow-hidden">
            <img src={task.imageUrl} alt={task.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>}

        {/* محتوای اصلی */}
        <div className={`${isCompact ? 'p-2 space-y-1.5' : 'p-3 space-y-2.5'}`}>
          {/* هدر: Drag + Title + Actions */}
          <div className="flex items-start gap-2">
            {/* دستگیره جابجایی */}
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted/50 rounded-md transition-colors touch-none shrink-0" aria-label="جابجایی وظیفه">
              <GripVertical className={`${isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} text-muted-foreground`} />
            </button>

            {/* عنوان و توضیحات */}
            <div className="flex-1 min-w-0 text-right space-y-1">
              <div className="flex items-start gap-2">
                <h3 className={`${isCompact ? 'text-sm' : 'text-base'} font-semibold leading-snug flex-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.title}
                </h3>
                {/* چک‌باکس */}
                <motion.button whileHover={{
                scale: 1.1
              }} whileTap={{
                scale: 0.95
              }} onClick={() => onComplete(task.id)} className="shrink-0 p-1 rounded-md hover:bg-success/10 transition-colors" aria-label={task.completed ? "لغو تکمیل" : "تکمیل وظیفه"}>
                  {task.completed ? <CheckCircle2 className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} text-success`} /> : <Circle className={`${isCompact ? 'w-4 h-4' : 'w-5 h-5'} text-muted-foreground`} />}
                </motion.button>
              </div>
              {!isCompact && task.description && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                  {task.description}
                </p>}
            </div>
          </div>

          {/* متا اطلاعات: دسته‌بندی، اولویت، XP */}
          <div className="gap-1.5 flex-wrap text-xs flex items-center justify-end">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${categoryInfo.color}`}>
              <span className="text-sm">{categoryInfo.icon}</span>
              <span className="font-medium">{categoryInfo.label}</span>
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md ${priorityInfo.color}`}>
              <span className="text-sm">{priorityInfo.icon}</span>
              <span className="font-medium">{priorityInfo.label}</span>
            </span>
            {task.dollarReward && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/30">
                <span>💰</span>
                <span>{task.dollarReward}</span>
              </span>}
          </div>

          {/* ضرب‌الاجل */}
          {task.deadline && <div className={`flex items-center justify-end gap-2 text-xs font-medium px-2 py-1.5 rounded-md ${daysLeft !== null && daysLeft < 0 ? 'bg-destructive/10 text-destructive' : daysLeft !== null && daysLeft <= 3 ? 'bg-warning/10 text-warning' : 'bg-muted/50 text-muted-foreground'}`}>
              <span>
                {daysLeft !== null && daysLeft < 0 ? `${Math.abs(daysLeft)} روز تاخیر` : daysLeft !== null && daysLeft === 0 ? 'موعد امروز' : daysLeft !== null ? `${daysLeft} روز مانده` : formatDate(task.deadline)}
              </span>
              <Clock className="w-3.5 h-3.5" />
            </div>}

          {/* زیروظایف */}
          {task.subtasks && task.subtasks.length > 0 && <div className={`${isCompact ? 'space-y-1 pt-1' : 'space-y-2 pt-2'} border-t border-border/40`}>
              {/* نوار پیشرفت */}
              <div className="flex items-center gap-2">
                <Progress value={subtaskProgress} className="h-1.5 flex-1" />
                <span className="text-xs font-semibold text-muted-foreground shrink-0">
                  {task.subtasks.filter(st => st.completed).length}/{task.subtasks.length}
                </span>
              </div>
              
              {/* لیست زیروظایف - فقط در نمای گسترده */}
              {!isCompact && <div className="space-y-1">
                {task.subtasks.map(st => <div key={st.id} className="flex items-center gap-2 p-1.5 hover:bg-muted/30 rounded-md transition-colors">
                    <Checkbox checked={st.completed} onCheckedChange={() => onToggleSubtask(task.id, st.id)} className="shrink-0 h-3.5 w-3.5" aria-label={`زیروظیفه: ${st.title}`} />
                    <span className={`flex-1 text-xs text-right leading-snug ${st.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {st.title}
                    </span>
                  </div>)}
              </div>}
            </div>}

          {/* دکمه‌های عملیات */}
          <div className="flex gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="flex-1 h-8 gap-1.5 text-xs hover:bg-primary/10 hover:text-primary">
              <Edit className="w-3.5 h-3.5" />
              <span>ویرایش</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(task.id)} className="flex-1 h-8 gap-1.5 text-xs text-destructive hover:bg-destructive/10">
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>;
}
export default function TaskManager() {
  const {
    state,
    addTask,
    completeTask,
    dispatch,
    reorderTasks
  } = useApp();
  const {
    tasks
  } = state;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<TaskCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [viewMode, setViewMode] = useState<'compact' | 'expanded'>('expanded');

  // Drag and Drop Sensors
  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: {
      distance: 8
    }
  }), useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates
  }));

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('personal');
  const [priority, setPriority] = useState<Priority>('medium');
  const [deadline, setDeadline] = useState('');
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('personal');
    setPriority('medium');
    setDeadline('');
    setSubtasks([]);
    setNewSubtask('');
    setImageUrl('');
    setEditingTask(null);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('عنوان وظیفه الزامی است');
      return;
    }
    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      priority,
      deadline: deadline || undefined,
      subtasks: subtasks.length > 0 ? subtasks : undefined,
      dollarReward: priorityConfig[priority].xp,
      timeSpent: 0,
      imageUrl: imageUrl || undefined
    };
    if (editingTask) {
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...editingTask,
          ...taskData
        }
      });
      toast.success('وظیفه ویرایش شد ✏️');
    } else {
      addTask(taskData);
    }
    resetForm();
    setIsDialogOpen(false);
  };
  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, {
        id: Date.now().toString(),
        title: newSubtask.trim(),
        completed: false
      }]);
      setNewSubtask('');
    }
  };
  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task && task.subtasks) {
      const updatedSubtasks = task.subtasks.map(st => st.id === subtaskId ? {
        ...st,
        completed: !st.completed
      } : st);
      dispatch({
        type: 'UPDATE_TASK',
        payload: {
          ...task,
          subtasks: updatedSubtasks
        }
      });
    }
  };
  const handleDeleteTask = (id: string) => {
    dispatch({
      type: 'DELETE_TASK',
      payload: id
    });
    toast.success('وظیفه حذف شد');
  };
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setCategory(task.category as TaskCategory);
    setPriority(task.priority);
    setDeadline(task.deadline || '');
    setSubtasks(task.subtasks || []);
    setImageUrl(task.imageUrl || '');
    setIsDialogOpen(true);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const {
      active,
      over
    } = event;
    if (over && active.id !== over.id) {
      // جابجایی در لیست فیلتر شده
      const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
      const newIndex = filteredTasks.findIndex(task => task.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        // مرتب‌سازی مجدد لیست فیلتر شده
        const reorderedFiltered = arrayMove(filteredTasks, oldIndex, newIndex);

        // به‌روزرسانی order در لیست کامل tasks
        const updatedTasks = tasks.map(task => {
          const indexInFiltered = reorderedFiltered.findIndex(t => t.id === task.id);
          if (indexInFiltered !== -1) {
            return {
              ...task,
              order: indexInFiltered
            };
          }
          return task;
        });

        // ذخیره ترتیب جدید
        reorderTasks(updatedTasks);
        toast.success('ترتیب وظایف به‌روز شد ✨', {
          description: 'جابجایی با موفقیت ذخیره شد',
          duration: 2000
        });
      }
    }
  };

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'pending' ? !task.completed : task.completed;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesTab && matchesSearch && matchesCategory && matchesPriority;
  }).sort((a, b) => {
    // Sort by order field first, then by priority
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    const priorityOrder = {
      high: 0,
      medium: 1,
      low: 2
    };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  return <div className="min-h-screen pb-24 custom-scrollbar overflow-y-auto relative" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-5 px-4 mt-0 pr-px pl-px">
        {/* Header بهینه شده برای موبایل */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              مدیریت وظایف
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Circle className="w-4 h-4 text-warning" />
                <span className="font-medium">{pendingCount}</span>
                <span>در انتظار</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span className="font-medium">{completedCount}</span>
                <span>انجام شده</span>
              </span>
            </div>
          </div>

          {/* دکمه افزودن وظیفه - عرض کامل برای موبایل */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="w-full gap-2 shadow-elegant hover-scale min-h-[52px] text-base font-semibold" onClick={resetForm}>
                <Plus className="w-5 h-5" />
                افزودن وظیفه جدید
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-3 sm:p-5" dir="rtl">
              <DialogHeader className="text-right space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground">
                  {editingTask ? '✏️ ویرایش وظیفه' : '✨ افزودن وظیفه جدید'}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">
                  {editingTask ? 'اطلاعات وظیفه را ویرایش کنید' : 'وظیفه جدید خود را با جزئیات کامل تعریف کنید'}
                </p>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
                {/* عنوان */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <span>عنوان وظیفه</span>
                    <span className="text-destructive text-xs">*</span>
                  </label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثلاً: تکمیل گزارش پروژه" required className="text-base h-12 focus:ring-2 focus:ring-primary/20" />
                </div>

                {/* توضیحات */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground block">
                    توضیحات
                  </label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="جزئیات و توضیحات بیشتر درباره این وظیفه..." rows={3} className="text-base resize-none focus:ring-2 focus:ring-primary/20" />
                  <p className="text-xs text-muted-foreground">توضیحات کامل به شما کمک می‌کند تمرکز بهتری داشته باشید</p>
                </div>

                {/* دسته‌بندی و اولویت */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground block">دسته‌بندی</label>
                    <Select value={category} onValueChange={v => setCategory(v as TaskCategory)}>
                      <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => <SelectItem key={key} value={key} className="text-base">
                            <span className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
                          </SelectItem>)}
                        {state.settings.customTaskCategories.map(cat => <SelectItem key={cat} value={cat} className="text-base">
                            <span className="flex items-center gap-2">
                              <span>📌</span>
                              <span>{cat}</span>
                            </span>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground block">اولویت</label>
                    <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                      <SelectTrigger className="h-12 text-base focus:ring-2 focus:ring-primary/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, config]) => <SelectItem key={key} value={key} className="text-base">
                            <span className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* موعد */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground block">موعد انجام</label>
                  <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="text-base h-12 focus:ring-2 focus:ring-primary/20" />
                  <p className="text-xs text-muted-foreground">تعیین موعد به شما کمک می‌کند تا به موقع وظیفه را انجام دهید</p>
                </div>

                {/* آپلود تصویر */}
                <div className="space-y-1.5">
                  <ImageUpload imageUrl={imageUrl} onImageChange={setImageUrl} label="تصویر وظیفه (اختیاری)" />
                </div>

                {/* زیروظایف */}
                <div className="space-y-2.5 pt-2 border-t border-border/50">
                  <label className="text-sm font-semibold text-foreground block">زیروظایف</label>
                  <div className="flex gap-2">
                    <Input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="افزودن زیروظیفه..." onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())} className="flex-1 text-base h-11 focus:ring-2 focus:ring-primary/20" />
                    <Button type="button" onClick={handleAddSubtask} variant="outline" className="h-11 w-11 p-0 shrink-0">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  {subtasks.length > 0 && <div className="space-y-1.5">
                      {subtasks.map(st => <div key={st.id} className="flex items-center gap-2.5 p-2.5 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                          <Checkbox checked={st.completed} onCheckedChange={() => {
                      setSubtasks(subtasks.map(s => s.id === st.id ? {
                        ...s,
                        completed: !s.completed
                      } : s));
                    }} className="shrink-0" />
                          <span className={`flex-1 text-sm text-right ${st.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {st.title}
                          </span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} className="h-9 w-9 p-0 text-destructive hover:bg-destructive/10 shrink-0">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>)}
                    </div>}
                  <p className="text-xs text-muted-foreground">تقسیم وظیفه به بخش‌های کوچکتر باعث پیشرفت بهتر می‌شود</p>
                </div>

                {/* دکمه‌های عملیات */}
                <div className="flex gap-2 sm:gap-2.5 pt-3 sm:pt-4 border-t border-border/50">
                  <Button type="submit" className="flex-1 h-12 text-base font-semibold gap-2 shadow-sm">
                    {editingTask ? <>
                        <CheckCircle2 className="w-5 h-5" />
                        <span>ذخیره تغییرات</span>
                      </> : <>
                        <Plus className="w-5 h-5" />
                        <span>افزودن وظیفه</span>
                      </>}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 px-8 text-base">
                    انصراف
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* جستجو، فیلتر و تغییر نما - بهینه شده برای موبایل */}
        <Card className="p-4 glass-mobile border-border/50">
          <div className="space-y-3">
            {/* جستجو و Toggle نما */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* جستجو */}
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="جستجو در وظایف..." className="ps-10 min-h-[48px] text-base border-border/50 focus:border-primary" />
              </div>
              
              {/* Toggle نمای فشرده/گسترده */}
              <div className="flex gap-1 p-1 bg-muted/50 rounded-lg shrink-0">
                <Button variant={viewMode === 'expanded' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('expanded')} className="gap-1.5 min-h-[42px]" aria-label="نمای گسترده">
                  <LayoutGrid className="w-4 h-4" />
                  <span className="hidden sm:inline">گسترده</span>
                </Button>
                <Button variant={viewMode === 'compact' ? 'default' : 'ghost'} size="sm" onClick={() => setViewMode('compact')} className="gap-1.5 min-h-[42px]" aria-label="نمای فشرده">
                  <Rows3 className="w-4 h-4" />
                  <span className="hidden sm:inline">فشرده</span>
                </Button>
              </div>
            </div>

            {/* فیلترها */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Select value={filterCategory} onValueChange={v => setFilterCategory(v as TaskCategory | 'all')}>
                  <SelectTrigger className="min-h-[48px] text-base border-border/50">
                    <SelectValue placeholder="همه دسته‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-base">
                      <span className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        همه دسته‌ها
                      </span>
                    </SelectItem>
                    {Object.entries(categoryConfig).map(([key, config]) => <SelectItem key={key} value={key} className="text-base">
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterPriority} onValueChange={v => setFilterPriority(v as Priority | 'all')}>
                  <SelectTrigger className="min-h-[48px] text-base border-border/50">
                    <SelectValue placeholder="همه اولویت‌ها" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all" className="text-base">
                      <span className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        همه اولویت‌ها
                      </span>
                    </SelectItem>
                    {Object.entries(priorityConfig).map(([key, config]) => <SelectItem key={key} value={key} className="text-base">
                        <span className="flex items-center gap-2">
                          <span>{config.icon}</span>
                          {config.label}
                        </span>
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* تب‌های وظایف - طراحی بهینه شده */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'pending' | 'completed')} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass-mobile h-auto p-1">
            <TabsTrigger value="pending" className="gap-2 min-h-[48px] text-base font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
              <Circle className="w-4 h-4" />
              <span>در انتظار</span>
              <Badge variant="secondary" className="ms-1 text-xs">
                {pendingCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2 min-h-[48px] text-base font-semibold data-[state=active]:bg-success/10 data-[state=active]:text-success">
              <CheckCircle2 className="w-4 h-4" />
              <span>انجام شده</span>
              <Badge variant="secondary" className="ms-1 text-xs">
                {completedCount}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-5">
            {filteredTasks.length === 0 ? <motion.div initial={{
            opacity: 0,
            scale: 0.95
          }} animate={{
            opacity: 1,
            scale: 1
          }} className="text-center py-12 px-4">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  {activeTab === 'pending' ? <Circle className="w-10 h-10 text-primary" /> : <CheckCircle2 className="w-10 h-10 text-success" />}
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground">
                  {activeTab === 'pending' ? '🎯 هیچ وظیفه‌ای در انتظار نیست' : '🎉 هنوز وظیفه‌ای تکمیل نشده'}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                  {activeTab === 'pending' ? 'با کلیک روی دکمه "افزودن وظیفه جدید" شروع کنید و هدف‌های خود را مدیریت کنید.' : 'با تکمیل وظایف خود، آن‌ها در این بخش نمایش داده می‌شوند.'}
                </p>
              </motion.div> : <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={filteredTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                  <AnimatePresence mode="popLayout">
                    <div className="space-y-4">
                  {filteredTasks.map(task => {
                    const categoryInfo = categoryConfig[task.category as keyof typeof categoryConfig] || categoryConfig.personal;
                    const priorityInfo = priorityConfig[task.priority];
                    const subtaskProgress = task.subtasks ? task.subtasks.filter(st => st.completed).length / task.subtasks.length * 100 : 0;
                    const daysLeft = task.deadline ? daysUntil(task.deadline) : null;
                    return <SortableTaskCard key={task.id} task={task} categoryInfo={categoryInfo} priorityInfo={priorityInfo} subtaskProgress={subtaskProgress} daysLeft={daysLeft} onComplete={completeTask} onEdit={handleEditTask} onDelete={handleDeleteTask} onToggleSubtask={handleToggleSubtask} viewMode={viewMode} />;
                  })}
                    </div>
                  </AnimatePresence>
                </SortableContext>
              </DndContext>}
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}