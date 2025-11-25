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
import { Plus, Search, Filter, CheckCircle2, Circle, Clock, Calendar, Trash2, Edit, PlayCircle, PauseCircle } from 'lucide-react';
import { Task, TaskCategory, Priority, SubTask } from '@/types';
import { formatDate, daysUntil } from '@/utils/dateUtils';
import { toast } from 'sonner';
import { ImageUpload } from './ImageUpload';
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
export default function TaskManager() {
  const {
    state,
    addTask,
    completeTask,
    dispatch
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
      xpReward: priorityConfig[priority].xp,
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
      toast.success('وظیفه ویرایش شد! ✏️');
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

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === 'pending' ? !task.completed : task.completed;
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    return matchesTab && matchesSearch && matchesCategory && matchesPriority;
  }).sort((a, b) => {
    // Sort by priority
    const priorityOrder = {
      high: 0,
      medium: 1,
      low: 2
    };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  return <div className="min-h-screen pb-24 p-4 custom-scrollbar overflow-y-auto relative" dir="rtl">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob" />
        <div className="absolute top-0 -right-4 w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000" />
      </div>
      
      <div className="max-w-7xl mx-auto space-y-6 mt-[70px]">
        {/* Header */}
        <motion.div initial={{
        opacity: 0,
        y: -20
      }} animate={{
        opacity: 1,
        y: 0
      }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 gradient-text">
              <CheckCircle2 className="w-8 h-8 text-primary" />
              مدیریت وظایف
            </h1>
            <p className="text-muted-foreground mt-1">
              {pendingCount} در انتظار • {completedCount} تکمیل شده
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-elegant hover-scale" onClick={resetForm}>
                <Plus className="w-5 h-5" />
                وظیفه جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'ویرایش وظیفه' : 'افزودن وظیفه جدید'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">عنوان وظیفه *</label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="مثال: تکمیل گزارش پروژه" required />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">توضیحات</label>
                  <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="جزئیات بیشتر..." rows={3} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">دسته‌بندی</label>
                    <Select value={category} onValueChange={v => setCategory(v as TaskCategory)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categoryConfig).map(([key, config]) => <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
                          </SelectItem>)}
                        {state.settings.customTaskCategories.map(cat => <SelectItem key={cat} value={cat}>
                            <span className="flex items-center gap-2">
                              <span>📌</span>
                              <span>{cat}</span>
                            </span>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">اولویت</label>
                    <Select value={priority} onValueChange={v => setPriority(v as Priority)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(priorityConfig).map(([key, config]) => <SelectItem key={key} value={key}>
                            <span className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </span>
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Deadline - Removed date picker, using simple date input for now */}
                <div>
                  <label className="text-sm font-medium mb-2 block">ددلاین</label>
                  <Input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} />
                </div>

                {/* Image Upload */}
                <ImageUpload imageUrl={imageUrl} onImageChange={setImageUrl} label="تصویر وظیفه (اختیاری)" />

                <div>
                  <label className="text-sm font-medium mb-2 block">زیروظایف</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newSubtask} onChange={e => setNewSubtask(e.target.value)} placeholder="افزودن زیروظیفه..." onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), handleAddSubtask())} />
                    <Button type="button" onClick={handleAddSubtask} variant="outline">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {subtasks.length > 0 && <div className="space-y-2 mt-2">
                      {subtasks.map(st => <div key={st.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                          <Checkbox checked={st.completed} onCheckedChange={() => {
                      setSubtasks(subtasks.map(s => s.id === st.id ? {
                        ...s,
                        completed: !s.completed
                      } : s));
                    }} />
                          <span className={st.completed ? 'line-through text-muted-foreground' : ''}>{st.title}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => setSubtasks(subtasks.filter(s => s.id !== st.id))} className="mr-auto">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>)}
                    </div>}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingTask ? 'ذخیره تغییرات' : 'افزودن وظیفه'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    انصراف
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Search and Filters - Mobile Friendly */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.1
      }}>
          <Card className="p-4 glass-strong hover-lift">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="جستجو..." className="pr-10" />
            </div>
            <Select value={filterCategory} onValueChange={v => setFilterCategory(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="همه دسته‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه دسته‌ها</SelectItem>
                {Object.entries(categoryConfig).map(([key, config]) => <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={v => setFilterPriority(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="همه اولویت‌ها" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه اولویت‌ها</SelectItem>
                {Object.entries(priorityConfig).map(([key, config]) => <SelectItem key={key} value={key}>
                    {config.icon} {config.label}
                  </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </Card>
        </motion.div>

        {/* Tasks Tabs */}
        <Tabs value={activeTab} onValueChange={v => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending" className="gap-2">
              <Circle className="w-4 h-4" />
              در انتظار ({pendingCount})
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              <CheckCircle2 className="w-4 h-4" />
              تکمیل شده ({completedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4 mt-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length === 0 ? <motion.div initial={{
              opacity: 0,
              y: 20
            }} animate={{
              opacity: 1,
              y: 0
            }} exit={{
              opacity: 0,
              y: -20
            }} className="text-center py-12 mt-0">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold mb-2">هیچ وظیفه‌ای وجود ندارد</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'pending' ? 'وظیفه جدید اضافه کنید!' : 'هنوز وظیفه‌ای تکمیل نشده'}
                  </p>
                </motion.div> : filteredTasks.map((task, index) => {
              const categoryInfo = categoryConfig[task.category];
              const priorityInfo = priorityConfig[task.priority];
              const subtaskProgress = task.subtasks ? task.subtasks.filter(st => st.completed).length / task.subtasks.length * 100 : 0;
              const daysLeft = task.deadline ? daysUntil(task.deadline) : null;
              return <motion.div key={task.id} initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} exit={{
                opacity: 0,
                scale: 0.9
              }} transition={{
                delay: index * 0.05
              }} layout>
                      <Card className="p-4 glass-strong hover-lift">
                        <div className="flex items-start gap-4">
                          <button onClick={() => completeTask(task.id)} className="mt-1 transition-transform hover:scale-110">
                            {task.completed ? <CheckCircle2 className="w-6 h-6 text-success" /> : <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />}
                          </button>

                          <div className="flex-1 space-y-3">
                            <div>
                              <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h3>
                              {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={categoryInfo.color}>
                                <span className="mr-1">{categoryInfo.icon}</span>
                                {categoryInfo.label}
                              </Badge>
                              <Badge variant="outline" className={priorityInfo.color}>
                                <span className="mr-1">{priorityInfo.icon}</span>
                                {priorityInfo.label}
                              </Badge>
                              {task.deadline && <Badge variant="outline" className={daysLeft !== null && daysLeft < 0 ? 'text-destructive bg-destructive/10' : ''}>
                                  <Calendar className="w-3 h-3 ml-1" />
                                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft} روز` : 'گذشته'}
                                </Badge>}
                              <Badge variant="outline" className="bg-primary/10 text-primary">
                                {task.xpReward} XP
                              </Badge>
                            </div>

                            {task.subtasks && task.subtasks.length > 0 && <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">
                                    {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} زیروظیفه
                                  </span>
                                  <span className="text-muted-foreground">{Math.round(subtaskProgress)}%</span>
                                </div>
                                <Progress value={subtaskProgress} className="h-2" />
                                <div className="space-y-1">
                                  {task.subtasks.map(st => <div key={st.id} className="flex items-center gap-2 text-sm">
                                      <Checkbox checked={st.completed} onCheckedChange={() => handleToggleSubtask(task.id, st.id)} disabled={task.completed} />
                                      <span className={st.completed ? 'line-through text-muted-foreground' : ''}>
                                        {st.title}
                                      </span>
                                    </div>)}
                                </div>
                              </div>}
                          </div>

                          <div className="flex gap-2">
                            {!task.completed && <Button variant="ghost" size="sm" onClick={() => handleEditTask(task)}>
                                <Edit className="w-4 h-4" />
                              </Button>}
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteTask(task.id)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>;
            })}
            </AnimatePresence>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}