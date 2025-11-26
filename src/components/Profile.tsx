import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, Edit, Award, TrendingUp, Target, Clock, Zap, Trophy, Star, 
  Calendar, CheckCircle, Flame, Save, X, LogOut, Crown, Sparkles,
  Activity, TrendingDown, BarChart3, Users
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { format, differenceInDays } from 'date-fns';

const Profile = () => {
  const { state, dispatch } = useApp();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(state.user);

  const avatarOptions = [
    '👤', '😊', '🎯', '🚀', '💪', '🧠', '⭐', '🔥', 
    '💎', '🏆', '🎨', '🌟', '✨', '🌈', '🦄', '🐉'
  ];

  const handleSave = () => {
    if (!editedUser.name.trim()) {
      toast.error('نام نمی‌تواند خالی باشد');
      return;
    }
    if (editedUser.name.length > 50) {
      toast.error('نام باید کمتر از 50 کاراکتر باشد');
      return;
    }
    if (editedUser.bio && editedUser.bio.length > 200) {
      toast.error('بیوگرافی باید کمتر از 200 کاراکتر باشد');
      return;
    }

    dispatch({ type: 'UPDATE_USER', payload: editedUser });
    setIsEditing(false);
    toast.success('پروفایل با موفقیت بروزرسانی شد! ✨');
  };

  const handleCancel = () => {
    setEditedUser(state.user);
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Calculate statistics
  const memberSince = differenceInDays(new Date(), new Date(state.user.createdAt));
  const completedTasks = state.tasks.filter(t => t.completed).length;
  const activeTasks = state.tasks.filter(t => !t.completed).length;
  const totalHabits = state.habits.length;
  const activeGoals = state.goals.filter(g => g.status === 'active').length;
  const completedGoals = state.goals.filter(g => g.status === 'completed').length;
  const totalFocusTime = state.focusSessions.reduce((acc, s) => acc + s.duration, 0);
  const unlockedAchievements = state.achievements.filter(a => a.unlocked).length;
  const progressToNextLevel = (state.user.xp % 100);
  const currentStreak = Math.max(...state.habits.map(h => h.currentStreak), 0);
  const longestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);
  const taskCompletionRate = state.tasks.length > 0 ? Math.round((completedTasks / state.tasks.length) * 100) : 0;
  const goalCompletionRate = state.goals.length > 0 ? Math.round((completedGoals / state.goals.length) * 100) : 0;

  // Recent activities
  const recentTasks = state.tasks
    .filter(t => t.completedAt)
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 5);

  const recentAchievements = state.achievements
    .filter(a => a.unlocked && a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 5);

  return (
    <div dir="rtl" className="min-h-screen pb-24 mt-[70px]">
      <div className="container mx-auto p-4 sm:p-6 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Hero Header with Gradient */}
          <Card className="relative overflow-hidden border-border/40 bg-gradient-to-br from-primary/5 via-background to-purple-500/5">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-purple-500/10 opacity-50" />
            
            <CardContent className="relative p-6 sm:p-8">
              <div className="flex flex-col items-center gap-6">
                {/* Avatar Section with Glow */}
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-6xl sm:text-7xl border-4 border-primary/30 shadow-2xl backdrop-blur-sm">
                    {state.user.avatar}
                  </div>
                  
                  {/* Level Badge */}
                  <motion.div 
                    className="absolute -bottom-3 -left-3 bg-gradient-to-br from-primary to-purple-600 text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center font-bold text-lg shadow-xl border-4 border-background"
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Crown className="w-4 h-4 mb-0.5" />
                      <span className="text-xs">{state.user.level}</span>
                    </div>
                  </motion.div>
                </motion.div>

                {/* User Info */}
                <div className="text-center space-y-3 w-full">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-l from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                    {state.user.name}
                  </h1>
                  
                  {state.user.bio && (
                    <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
                      {state.user.bio}
                    </p>
                  )}

                  {/* Quick Stats Pills */}
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3 pt-2">
                    <Badge className="px-4 py-2 text-sm bg-primary/10 text-primary border-primary/20">
                      <Sparkles className="w-4 h-4 ms-1" />
                      {state.user.xp} امتیاز
                    </Badge>
                    <Badge className="px-4 py-2 text-sm bg-orange-500/10 text-orange-600 border-orange-500/20">
                      <Flame className="w-4 h-4 ms-1" />
                      {currentStreak} روز استریک
                    </Badge>
                    <Badge className="px-4 py-2 text-sm bg-purple-500/10 text-purple-600 border-purple-500/20">
                      <Trophy className="w-4 h-4 ms-1" />
                      {unlockedAchievements} دستاورد
                    </Badge>
                    <Badge className="px-4 py-2 text-sm bg-blue-500/10 text-blue-600 border-blue-500/20">
                      <Calendar className="w-4 h-4 ms-1" />
                      {memberSince} روز عضویت
                    </Badge>
                  </div>

                  {/* Level Progress */}
                  <div className="space-y-2 pt-4 max-w-md mx-auto">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">پیشرفت تا سطح {state.user.level + 1}</span>
                      <span className="font-bold text-primary">
                        {state.user.xpToNextLevel} XP باقی‌مانده
                      </span>
                    </div>
                    <div className="relative">
                      <Progress value={progressToNextLevel} className="h-3" />
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-l from-primary/50 to-transparent rounded-full blur-sm"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                    {!isEditing && (
                      <Button 
                        onClick={() => setIsEditing(true)} 
                        variant="default"
                        size="lg"
                        className="min-h-[48px] text-base"
                      >
                        <Edit className="ms-2 h-5 w-5" />
                        ویرایش پروفایل
                      </Button>
                    )}
                    <Button 
                      onClick={handleLogout} 
                      variant="outline" 
                      size="lg"
                      className="min-h-[48px] text-base text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="ms-2 h-5 w-5" />
                      خروج از حساب
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Edit Mode */}
          <AnimatePresence>
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="w-6 h-6 text-primary" />
                      ویرایش اطلاعات پروفایل
                    </CardTitle>
                    <CardDescription>
                      اطلاعات خود را به‌روزرسانی کنید و شخصیت‌سازی کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 p-4 sm:p-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                      <Label className="text-base font-medium">نام</Label>
                      <Input
                        value={editedUser.name}
                        onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                        placeholder="نام خود را وارد کنید"
                        maxLength={50}
                        className="h-12 text-base"
                      />
                      <p className="text-xs text-muted-foreground text-end">
                        {editedUser.name.length}/50 کاراکتر
                      </p>
                    </div>

                    {/* Bio Input */}
                    <div className="space-y-2">
                      <Label className="text-base font-medium">بیوگرافی</Label>
                      <Textarea
                        value={editedUser.bio || ''}
                        onChange={(e) => setEditedUser({ ...editedUser, bio: e.target.value })}
                        placeholder="درباره خود، اهدافتان و رویاهایتان بنویسید..."
                        maxLength={200}
                        rows={4}
                        className="text-base resize-none"
                      />
                      <p className="text-xs text-muted-foreground text-end">
                        {(editedUser.bio || '').length}/200 کاراکتر
                      </p>
                    </div>

                    {/* Avatar Selection */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">انتخاب آواتار</Label>
                      <ScrollArea className="w-full">
                        <div className="grid grid-cols-8 sm:grid-cols-10 gap-2 pb-2">
                          {avatarOptions.map((emoji) => (
                            <motion.button
                              key={emoji}
                              onClick={() => setEditedUser({ ...editedUser, avatar: emoji })}
                              className={`text-3xl sm:text-4xl p-3 rounded-xl hover:bg-secondary transition-all min-h-[56px] ${
                                editedUser.avatar === emoji
                                  ? 'bg-primary/20 ring-2 ring-primary shadow-lg scale-110'
                                  : 'bg-secondary/30'
                              }`}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {emoji}
                            </motion.button>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                      <Button 
                        onClick={handleSave} 
                        size="lg" 
                        className="min-h-[48px] text-base flex-1"
                      >
                        <Save className="ms-2 h-5 w-5" />
                        ذخیره تغییرات
                      </Button>
                      <Button 
                        onClick={handleCancel} 
                        variant="outline" 
                        size="lg"
                        className="min-h-[48px] text-base flex-1"
                      >
                        <X className="ms-2 h-5 w-5" />
                        انصراف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tabs for Stats, Achievements, Activity */}
          <Tabs defaultValue="stats" className="space-y-6">
            <div className="w-full">
              <TabsList className="grid h-auto w-full grid-cols-3 gap-2 bg-transparent p-0">
                <TabsTrigger 
                  value="stats" 
                  className="flex-col gap-2 h-auto py-4 px-3 rounded-xl border-2 border-border/40 bg-card/50 backdrop-blur-sm data-[state=active]:border-primary data-[state=active]:bg-gradient-to-br data-[state=active]:from-primary/10 data-[state=active]:to-primary/5 data-[state=active]:shadow-lg transition-all hover:border-primary/50"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold">آمار</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="achievements" 
                  className="flex-col gap-2 h-auto py-4 px-3 rounded-xl border-2 border-border/40 bg-card/50 backdrop-blur-sm data-[state=active]:border-yellow-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-yellow-500/10 data-[state=active]:to-orange-500/5 data-[state=active]:shadow-lg transition-all hover:border-yellow-500/50"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-600" />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold">دستاوردها</span>
                </TabsTrigger>
                
                <TabsTrigger 
                  value="activity" 
                  className="flex-col gap-2 h-auto py-4 px-3 rounded-xl border-2 border-border/40 bg-card/50 backdrop-blur-sm data-[state=active]:border-green-500 data-[state=active]:bg-gradient-to-br data-[state=active]:from-green-500/10 data-[state=active]:to-emerald-500/5 data-[state=active]:shadow-lg transition-all hover:border-green-500/50"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Activity className="w-6 h-6 sm:w-7 sm:h-7 text-green-600" />
                  </motion.div>
                  <span className="text-xs sm:text-sm font-semibold">فعالیت‌ها</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6 mt-6">
              {/* Performance Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-border/40 bg-gradient-to-br from-blue-500/10 to-blue-600/5 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-700">
                          {taskCompletionRate}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">وظایف تکمیل‌شده</p>
                        <p className="text-3xl font-bold text-blue-600">{completedTasks}</p>
                        <p className="text-xs text-muted-foreground">از {state.tasks.length} وظیفه</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-border/40 bg-gradient-to-br from-orange-500/10 to-orange-600/5 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-500/20 rounded-xl">
                          <Flame className="h-6 w-6 text-orange-600" />
                        </div>
                        <Badge variant="secondary" className="bg-orange-500/10 text-orange-700">
                          فعال
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">استریک فعلی</p>
                        <p className="text-3xl font-bold text-orange-600">{currentStreak}</p>
                        <p className="text-xs text-muted-foreground">بهترین: {longestStreak} روز</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-border/40 bg-gradient-to-br from-purple-500/10 to-purple-600/5 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-purple-500/20 rounded-xl">
                          <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                        <Badge variant="secondary" className="bg-purple-500/10 text-purple-700">
                          {goalCompletionRate}%
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">اهداف فعال</p>
                        <p className="text-3xl font-bold text-purple-600">{activeGoals}</p>
                        <p className="text-xs text-muted-foreground">تکمیل‌شده: {completedGoals}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card className="border-border/40 bg-gradient-to-br from-green-500/10 to-green-600/5 hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-green-500/20 rounded-xl">
                          <Clock className="h-6 w-6 text-green-600" />
                        </div>
                        <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                          {state.focusSessions.filter(s => s.completed).length} جلسه
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">زمان تمرکز</p>
                        <p className="text-3xl font-bold text-green-600">{Math.floor(totalFocusTime / 60)}h</p>
                        <p className="text-xs text-muted-foreground">{totalFocusTime % 60}m دقیقه</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>

              {/* Detailed Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Tasks Detailed Card */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          className="p-2 bg-blue-500/10 rounded-lg"
                        >
                          <Target className="h-6 w-6 text-blue-600" />
                        </motion.div>
                        <div>
                          <CardTitle>تحلیل وظایف</CardTitle>
                          <CardDescription>عملکرد شما در مدیریت وظایف</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground font-medium">تکمیل شده</span>
                      <span className="text-2xl font-bold text-blue-600">{completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground font-medium">در حال انجام</span>
                      <span className="text-2xl font-bold text-orange-600">{activeTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-l from-primary/10 to-transparent rounded-lg border border-primary/20">
                      <span className="text-muted-foreground font-medium">نرخ موفقیت</span>
                      <span className="text-2xl font-bold text-primary">{taskCompletionRate}%</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Habits Detailed Card */}
                <Card className="border-border/40 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="p-2 bg-orange-500/10 rounded-lg"
                        >
                          <Flame className="h-6 w-6 text-orange-600" />
                        </motion.div>
                        <div>
                          <CardTitle>تحلیل عادات</CardTitle>
                          <CardDescription>پیشرفت شما در ساخت عادات</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground font-medium">کل عادات</span>
                      <span className="text-2xl font-bold text-orange-600">{totalHabits}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                      <span className="text-muted-foreground font-medium">استریک فعلی</span>
                      <span className="text-2xl font-bold text-orange-600">{currentStreak} روز</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-l from-orange-500/10 to-transparent rounded-lg border border-orange-500/20">
                      <span className="text-muted-foreground font-medium">بهترین استریک</span>
                      <span className="text-2xl font-bold text-orange-600">{longestStreak} روز</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6 mt-6">
              <Card className="border-border/40 bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        className="p-3 bg-yellow-500/20 rounded-xl"
                      >
                        <Trophy className="h-6 w-6 text-yellow-600" />
                      </motion.div>
                      <div>
                        <CardTitle className="text-xl">دستاوردهای شما</CardTitle>
                        <CardDescription>
                          {unlockedAchievements} از {state.achievements.length} دستاورد را باز کرده‌اید
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className="bg-gradient-to-l from-yellow-500 to-orange-500 text-white border-0 px-4 py-2 text-base">
                      {Math.round((unlockedAchievements / state.achievements.length) * 100)}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {state.achievements.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                      >
                        <Card
                          className={`transition-all hover:scale-105 ${
                            achievement.unlocked
                              ? 'bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/30 shadow-lg'
                              : 'opacity-40 grayscale hover:grayscale-0 hover:opacity-70'
                          }`}
                        >
                          <CardContent className="p-6 text-center space-y-3">
                            <motion.div
                              animate={achievement.unlocked ? { scale: [1, 1.1, 1] } : {}}
                              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                              className="text-5xl"
                            >
                              {achievement.icon}
                            </motion.div>
                            <h3 className="font-bold text-lg">{achievement.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {achievement.description}
                            </p>
                            {achievement.unlocked && achievement.unlockedAt && (
                              <Badge variant="secondary" className="w-full justify-center">
                                <Calendar className="w-3 h-3 ms-1" />
                                {format(new Date(achievement.unlockedAt), 'dd/MM/yyyy')}
                              </Badge>
                            )}
                            {!achievement.unlocked && (
                              <Badge variant="outline" className="w-full justify-center opacity-60">
                                🔒 قفل شده
                              </Badge>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              {recentAchievements.length > 0 && (
                <Card className="border-border/40">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-yellow-500" />
                      آخرین دستاوردها
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentAchievements.map((achievement) => (
                        <motion.div
                          key={achievement.id}
                          initial={{ x: 20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          className="flex items-center gap-4 p-4 bg-gradient-to-l from-primary/5 to-transparent rounded-lg border border-primary/10"
                        >
                          <div className="text-4xl">{achievement.icon}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{achievement.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {achievement.description}
                            </p>
                          </div>
                          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">
                            {achievement.xpReward} XP
                          </Badge>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6 mt-6">
              {/* Recent Tasks */}
              {recentTasks.length > 0 && (
                <Card className="border-border/40">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="p-2 bg-blue-500/10 rounded-lg"
                      >
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      </motion.div>
                      <div>
                        <CardTitle>وظایف اخیر تکمیل‌شده</CardTitle>
                        <CardDescription>آخرین فعالیت‌های شما</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentTasks.map((task, index) => (
                        <motion.div
                          key={task.id}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-start gap-4 p-4 bg-secondary/30 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{task.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {task.description && task.description.length > 50
                                ? `${task.description.substring(0, 50)}...`
                                : task.description}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {task.category}
                              </Badge>
                              {task.completedAt && (
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(task.completedAt), 'dd/MM/yyyy - HH:mm')}
                                </span>
                              )}
                            </div>
                          </div>
                          {task.xpReward && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              +{task.xpReward} XP
                            </Badge>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Activity Summary */}
              <Card className="border-border/40 bg-gradient-to-br from-primary/5 to-purple-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    خلاصه فعالیت کلی
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40 text-center">
                      <div className="text-3xl mb-2">📝</div>
                      <div className="text-2xl font-bold text-primary">{state.tasks.length}</div>
                      <div className="text-sm text-muted-foreground">کل وظایف ایجاد شده</div>
                    </div>
                    <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40 text-center">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-2xl font-bold text-orange-600">{state.habits.length}</div>
                      <div className="text-sm text-muted-foreground">کل عادات ایجاد شده</div>
                    </div>
                    <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40 text-center">
                      <div className="text-3xl mb-2">🏆</div>
                      <div className="text-2xl font-bold text-purple-600">{state.goals.length}</div>
                      <div className="text-sm text-muted-foreground">کل اهداف ایجاد شده</div>
                    </div>
                    <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40 text-center">
                      <div className="text-3xl mb-2">⏱️</div>
                      <div className="text-2xl font-bold text-green-600">{state.focusSessions.length}</div>
                      <div className="text-sm text-muted-foreground">جلسات تمرکز</div>
                    </div>
                    <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40 text-center">
                      <div className="text-3xl mb-2">💎</div>
                      <div className="text-2xl font-bold text-primary">{state.user.xp}</div>
                      <div className="text-sm text-muted-foreground">کل امتیاز کسب شده</div>
                    </div>
                    <div className="p-4 bg-background/50 backdrop-blur-sm rounded-xl border border-border/40 text-center">
                      <div className="text-3xl mb-2">📅</div>
                      <div className="text-2xl font-bold text-blue-600">{memberSince}</div>
                      <div className="text-sm text-muted-foreground">روز عضویت</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
