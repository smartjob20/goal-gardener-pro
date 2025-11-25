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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { User, Edit, Award, TrendingUp, Target, Clock, Zap, Trophy, Star, Calendar, CheckCircle, Flame, Save, X, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { format, differenceInDays } from 'date-fns';
const Profile = () => {
  const {
    state,
    dispatch
  } = useApp();
  const {
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(state.user);
  const avatarOptions = ['👤', '😊', '🎯', '🚀', '💪', '🧠', '⭐', '🔥', '💎', '🏆', '🎨', '🌟', '✨', '🌈', '🦄', '🐉'];
  const handleSave = () => {
    // Validate inputs
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
    dispatch({
      type: 'UPDATE_USER',
      payload: editedUser
    });
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
  const progressToNextLevel = state.user.xp % 100;
  const currentStreak = Math.max(...state.habits.map(h => h.currentStreak), 0);
  const longestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);

  // Recent activities
  const recentTasks = state.tasks.filter(t => t.completedAt).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()).slice(0, 5);
  const recentAchievements = state.achievements.filter(a => a.unlocked && a.unlockedAt).sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime()).slice(0, 5);
  return <div dir="rtl" className="container mx-auto p-4 pb-24 max-w-6xl mt-[70px]">
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }}>
        {/* Header Card */}
        <Card className="mb-6">
          <CardContent className="pt-6 mt-0">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-6xl border-4 border-primary/20">
                    {state.user.avatar}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                    {state.user.level}
                  </div>
                </div>
                <div className="flex flex-col gap-2 w-full">
                  {!isEditing && <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                      <Edit className="ml-2 h-4 w-4" />
                      ویرایش پروفایل
                    </Button>}
                  <Button onClick={handleLogout} variant="outline" size="sm" className="text-destructive hover:text-destructive">
                    <LogOut className="ml-2 h-4 w-4" />
                    خروج از حساب
                  </Button>
                </div>
              </div>

              {/* Info Section */}
              <div className="flex-1 space-y-4">
                {isEditing ? <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>نام</Label>
                      <Input value={editedUser.name} onChange={e => setEditedUser({
                    ...editedUser,
                    name: e.target.value
                  })} placeholder="نام خود را وارد کنید" maxLength={50} />
                    </div>

                    <div className="space-y-2">
                      <Label>بیوگرافی</Label>
                      <Textarea value={editedUser.bio || ''} onChange={e => setEditedUser({
                    ...editedUser,
                    bio: e.target.value
                  })} placeholder="درباره خود بنویسید..." maxLength={200} rows={3} />
                      <p className="text-xs text-muted-foreground">
                        {(editedUser.bio || '').length}/200 کاراکتر
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>آواتار</Label>
                      <div className="grid grid-cols-8 gap-2">
                        {avatarOptions.map(emoji => <button key={emoji} onClick={() => setEditedUser({
                      ...editedUser,
                      avatar: emoji
                    })} className={`text-3xl p-2 rounded-lg hover:bg-secondary transition-colors ${editedUser.avatar === emoji ? 'bg-primary/20 ring-2 ring-primary' : ''}`}>
                            {emoji}
                          </button>)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSave}>
                        <Save className="ml-2 h-4 w-4" />
                        ذخیره
                      </Button>
                      <Button onClick={handleCancel} variant="outline">
                        <X className="ml-2 h-4 w-4" />
                        انصراف
                      </Button>
                    </div>
                  </div> : <>
                    <div>
                      <h1 className="text-3xl font-bold mb-2">{state.user.name}</h1>
                      {state.user.bio && <p className="text-muted-foreground">{state.user.bio}</p>}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{state.user.level}</div>
                        <div className="text-xs text-muted-foreground">سطح</div>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{state.user.xp}</div>
                        <div className="text-xs text-muted-foreground">XP کل</div>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{unlockedAchievements}</div>
                        <div className="text-xs text-muted-foreground">دستاوردها</div>
                      </div>
                      <div className="text-center p-3 bg-secondary/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{memberSince}</div>
                        <div className="text-xs text-muted-foreground">روز عضویت</div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>پیشرفت تا سطح بعدی</span>
                        <span className="font-bold">{state.user.xpToNextLevel} XP باقی مانده</span>
                      </div>
                      <Progress value={progressToNextLevel} />
                    </div>
                  </>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="stats" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stats">آمار</TabsTrigger>
            <TabsTrigger value="achievements">دستاوردها</TabsTrigger>
            <TabsTrigger value="activity">فعالیت‌ها</TabsTrigger>
          </TabsList>

          {/* Stats Tab - Mobile Friendly */}
          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle>وظایف</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تکمیل شده</span>
                    <span className="text-2xl font-bold">{completedTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">در حال انجام</span>
                    <span className="text-2xl font-bold">{activeTasks}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">نرخ تکمیل</span>
                    <span className="text-2xl font-bold">
                      {state.tasks.length > 0 ? Math.round(completedTasks / state.tasks.length * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-primary" />
                    <CardTitle>عادات</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل عادات</span>
                    <span className="text-2xl font-bold">{totalHabits}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">استریک فعلی</span>
                    <span className="text-2xl font-bold">{currentStreak} روز</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">بهترین استریک</span>
                    <span className="text-2xl font-bold">{longestStreak} روز</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <CardTitle>اهداف</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">فعال</span>
                    <span className="text-2xl font-bold">{activeGoals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">تکمیل شده</span>
                    <span className="text-2xl font-bold">{completedGoals}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">نرخ موفقیت</span>
                    <span className="text-2xl font-bold">
                      {state.goals.length > 0 ? Math.round(completedGoals / state.goals.length * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>تمرکز</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">کل زمان تمرکز</span>
                    <span className="text-2xl font-bold">{totalFocusTime} دقیقه</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">جلسات</span>
                    <span className="text-2xl font-bold">{state.focusSessions.filter(s => s.completed).length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">میانگین جلسه</span>
                    <span className="text-2xl font-bold">
                      {state.focusSessions.length > 0 ? Math.round(totalFocusTime / state.focusSessions.filter(s => s.completed).length) : 0} دقیقه
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>پیشرفت کلی</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">سطح {state.user.level}</span>
                      <span className="text-sm font-bold">{state.user.xp} / {state.user.level * 100} XP</span>
                    </div>
                    <Progress value={state.user.xp % 100} />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-3xl mb-1">🎯</div>
                      <div className="text-2xl font-bold">{completedTasks}</div>
                      <div className="text-xs text-muted-foreground">وظایف</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">🔥</div>
                      <div className="text-2xl font-bold">{currentStreak}</div>
                      <div className="text-xs text-muted-foreground">استریک</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">⏱️</div>
                      <div className="text-2xl font-bold">{Math.floor(totalFocusTime / 60)}h</div>
                      <div className="text-xs text-muted-foreground">تمرکز</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl mb-1">🏆</div>
                      <div className="text-2xl font-bold">{unlockedAchievements}</div>
                      <div className="text-xs text-muted-foreground">دستاورد</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>دستاوردها</CardTitle>
                <CardDescription>
                  {unlockedAchievements} از {state.achievements.length} دستاورد را باز کرده‌اید
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {state.achievements.map(achievement => <motion.div key={achievement.id} initial={{
                  scale: 0.9,
                  opacity: 0
                }} animate={{
                  scale: 1,
                  opacity: 1
                }} transition={{
                  duration: 0.3
                }}>
                      <Card className={achievement.unlocked ? 'bg-primary/5 border-primary/20' : 'opacity-50'}>
                        <CardContent className="p-4 text-center space-y-2">
                          <div className="text-5xl">{achievement.icon}</div>
                          <h4 className="font-bold">{achievement.title}</h4>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                          <Badge variant={achievement.unlocked ? 'default' : 'secondary'}>
                            {achievement.unlocked ? `+${achievement.xpReward} XP` : 'قفل شده'}
                          </Badge>
                          {achievement.unlocked && achievement.unlockedAt && <p className="text-xs text-muted-foreground">
                              {format(new Date(achievement.unlockedAt), 'yyyy/MM/dd')}
                            </p>}
                        </CardContent>
                      </Card>
                    </motion.div>)}
                </div>
              </CardContent>
            </Card>

            {recentAchievements.length > 0 && <Card>
                <CardHeader>
                  <CardTitle>آخرین دستاوردها</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentAchievements.map(achievement => <div key={achievement.id} className="flex items-center gap-4 p-3 bg-secondary/50 rounded-lg">
                        <div className="text-3xl">{achievement.icon}</div>
                        <div className="flex-1">
                          <h4 className="font-medium">{achievement.title}</h4>
                          <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        </div>
                        <div className="text-left">
                          <Badge>+{achievement.xpReward} XP</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {achievement.unlockedAt && format(new Date(achievement.unlockedAt), 'yyyy/MM/dd')}
                          </p>
                        </div>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-4">
            {recentTasks.length > 0 && <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle>وظایف اخیر</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentTasks.map(task => <div key={task.id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {task.completedAt && format(new Date(task.completedAt), 'yyyy/MM/dd HH:mm')}
                          </p>
                        </div>
                        <Badge variant="outline">+{task.xpReward} XP</Badge>
                      </div>)}
                  </div>
                </CardContent>
              </Card>}

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <CardTitle>خلاصه فعالیت</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-2xl font-bold mb-1">{state.tasks.length}</div>
                      <div className="text-sm text-muted-foreground">کل وظایف ایجاد شده</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-2xl font-bold mb-1">{state.habits.length}</div>
                      <div className="text-sm text-muted-foreground">کل عادات ایجاد شده</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-2xl font-bold mb-1">{state.goals.length}</div>
                      <div className="text-sm text-muted-foreground">کل اهداف ایجاد شده</div>
                    </div>
                    <div className="p-4 bg-secondary/50 rounded-lg">
                      <div className="text-2xl font-bold mb-1">{state.plans.length}</div>
                      <div className="text-sm text-muted-foreground">کل برنامه‌های ایجاد شده</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-3">عضویت</h4>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">تاریخ عضویت:</span>
                      <span className="font-medium">{format(new Date(state.user.createdAt), 'yyyy/MM/dd')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-muted-foreground">مدت عضویت:</span>
                      <span className="font-medium">{memberSince} روز</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>;
};
export default Profile;