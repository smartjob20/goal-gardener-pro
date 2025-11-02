import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Gift, 
  Plus, 
  Sparkles, 
  Trophy,
  Lock,
  CheckCircle,
  Zap,
  Star,
  Trash2,
  Clock,
  TrendingUp,
  Award,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';
import { RewardCategory, RewardStatus } from '@/types';
import { ImageUpload } from '@/components/ImageUpload';

const categoryIcons: Record<RewardCategory, string> = {
  entertainment: '🎮',
  food: '🍕',
  shopping: '🛍️',
  travel: '✈️',
  'self-care': '💆',
  custom: '✨',
};

const categoryNames: Record<RewardCategory, string> = {
  entertainment: 'سرگرمی',
  food: 'غذا',
  shopping: 'خرید',
  travel: 'سفر',
  'self-care': 'مراقبت از خود',
  custom: 'سفارشی',
};

const Rewards = () => {
  const { state, dispatch } = useApp();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newReward, setNewReward] = useState({
    title: '',
    description: '',
    category: 'custom' as RewardCategory,
    xpRequired: 100,
    icon: '🎁',
    customValue: '',
    motivationalMessage: '',
    imageUrl: '',
  });

  const availableRewards = state.rewards.filter(r => r.status === 'available');
  const lockedRewards = state.rewards.filter(r => r.status === 'locked');
  const claimedRewards = state.rewards.filter(r => r.status === 'claimed');

  const canClaimReward = (xpRequired: number) => state.user.xp >= xpRequired;

  const handleAddReward = () => {
    if (!newReward.title.trim()) {
      toast.error('عنوان پاداش الزامی است');
      return;
    }

    if (newReward.xpRequired < 1) {
      toast.error('XP مورد نیاز باید بیشتر از 0 باشد');
      return;
    }

    const reward = {
      id: Date.now().toString(),
      ...newReward,
      status: (state.user.xp >= newReward.xpRequired ? 'available' : 'locked') as RewardStatus,
      createdAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_REWARD', payload: reward });
    toast.success('پاداش جدید اضافه شد! 🎁');
    
    setNewReward({
      title: '',
      description: '',
      category: 'custom',
      xpRequired: 100,
      icon: '🎁',
      customValue: '',
      motivationalMessage: '',
      imageUrl: '',
    });
    setIsAddDialogOpen(false);
  };

  const handleClaimReward = (rewardId: string) => {
    const reward = state.rewards.find(r => r.id === rewardId);
    if (!reward || reward.status !== 'available') return;

    if (!canClaimReward(reward.xpRequired)) {
      toast.error('XP کافی ندارید!');
      return;
    }

    dispatch({ 
      type: 'CLAIM_REWARD', 
      payload: { rewardId, xpSpent: reward.xpRequired } 
    });
    
    toast.success(`🎉 پاداش "${reward.title}" دریافت شد! ${reward.motivationalMessage || 'لذت ببرید!'}`);
  };

  const handleDeleteReward = (rewardId: string) => {
    dispatch({ type: 'DELETE_REWARD', payload: rewardId });
    toast.success('پاداش حذف شد');
  };

  const progressPercentage = state.user.xp % 100;

  return (
    <div className="container mx-auto p-4 pb-24 max-w-6xl" dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Header Card با نمایش XP */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 w-full space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Crown className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold">سیستم پاداش‌دهی</h1>
                    <p className="text-muted-foreground">با XP خود پاداش‌های واقعی دریافت کنید</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">XP فعلی شما</span>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-2xl font-bold text-primary">{state.user.xp}</span>
                    </div>
                  </div>
                  <Progress value={progressPercentage} className="h-3" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>سطح {state.user.level}</span>
                    <span>{state.user.xpToNextLevel} تا سطح بعدی</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-1 gap-4 w-full md:w-auto">
                <div className="text-center p-4 bg-background/50 rounded-lg border border-primary/20">
                  <div className="text-3xl font-bold text-primary">{availableRewards.length}</div>
                  <div className="text-xs text-muted-foreground">آماده دریافت</div>
                </div>
                <div className="text-center p-4 bg-background/50 rounded-lg border border-muted">
                  <div className="text-3xl font-bold text-muted-foreground">{lockedRewards.length}</div>
                  <div className="text-xs text-muted-foreground">قفل شده</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* آموزش سریع */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-secondary/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-accent flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-semibold">چگونه کار می‌کند؟</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  با انجام وظایف، عادت‌ها و اهداف، XP کسب کنید. سپس با XP خود، پاداش‌های دلخواهتان را برای خودتان تعریف کنید و هر وقت به XP مورد نیاز رسیدید، پاداش را دریافت کنید! این روش شما را همیشه برای پیشرفت بیشتر انگیزه می‌دهد. 🚀
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* دکمه افزودن پاداش جدید */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full md:w-auto" size="lg">
              <Plus className="ml-2 h-5 w-5" />
              افزودن پاداش جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle>پاداش جدید</DialogTitle>
              <DialogDescription>
                پاداشی که برای خودتان تعریف می‌کنید می‌تواند هر چیزی باشه: یک فیلم، یک غذای مورد علاقه، خرید، یا هر چیز دیگری!
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان پاداش *</Label>
                <Input
                  value={newReward.title}
                  onChange={(e) => setNewReward({ ...newReward, title: e.target.value })}
                  placeholder="مثال: تماشای یک فیلم"
                />
              </div>

              <div className="space-y-2">
                <Label>توضیحات</Label>
                <Textarea
                  value={newReward.description}
                  onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                  placeholder="جزئیات بیشتر درباره این پاداش..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>دسته‌بندی</Label>
                <Select 
                  value={newReward.category} 
                  onValueChange={(value) => setNewReward({ ...newReward, category: value as RewardCategory })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryNames).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {categoryIcons[key as RewardCategory]} {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>XP مورد نیاز *</Label>
                <Input
                  type="number"
                  value={newReward.xpRequired}
                  onChange={(e) => setNewReward({ ...newReward, xpRequired: parseInt(e.target.value) || 0 })}
                  min={1}
                />
                <p className="text-xs text-muted-foreground">
                  XP فعلی شما: {state.user.xp}
                </p>
              </div>

              <div className="space-y-2">
                <Label>ارزش واقعی (اختیاری)</Label>
                <Input
                  value={newReward.customValue}
                  onChange={(e) => setNewReward({ ...newReward, customValue: e.target.value })}
                  placeholder="مثال: 50,000 تومان"
                />
              </div>

              <div className="space-y-2">
                <Label>پیام انگیزشی (اختیاری)</Label>
                <Input
                  value={newReward.motivationalMessage}
                  onChange={(e) => setNewReward({ ...newReward, motivationalMessage: e.target.value })}
                  placeholder="مثال: عالی بود! لذت ببر!"
                />
              </div>

              <div className="space-y-2">
                <Label>ایموجی / آیکون</Label>
                <div className="grid grid-cols-8 gap-2">
                  {['🎁', '🎮', '🍕', '🍔', '🍰', '🛍️', '✈️', '🎬', '📚', '💆', '🏋️', '🎨', '🎵', '☕', '🍦', '🎯'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setNewReward({ ...newReward, icon: emoji })}
                      className={`text-2xl p-2 rounded-lg hover:bg-secondary transition-colors ${
                        newReward.icon === emoji ? 'bg-primary/20 ring-2 ring-primary' : ''
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* تصویر انگیزشی */}
              <ImageUpload
                imageUrl={newReward.imageUrl}
                onImageChange={(url) => setNewReward({ ...newReward, imageUrl: url })}
                label="تصویر پاداش"
              />

              <Button onClick={handleAddReward} className="w-full">
                <Gift className="ml-2 h-4 w-4" />
                ایجاد پاداش
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* پاداش‌های آماده دریافت */}
        {availableRewards.length > 0 && (
          <Card className="border-green-500/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle>آماده دریافت 🎉</CardTitle>
              </div>
              <CardDescription>
                این پاداش‌ها را می‌توانید همین الان دریافت کنید!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableRewards.map((reward) => (
                  <motion.div
                    key={reward.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="relative"
                  >
                    <Card className="h-full border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="text-4xl">{reward.icon}</div>
                          <Badge variant="default" className="bg-green-500">
                            <Zap className="ml-1 h-3 w-3" />
                            {reward.xpRequired} XP
                          </Badge>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
                          {reward.description && (
                            <p className="text-sm text-muted-foreground">{reward.description}</p>
                          )}
                          {reward.customValue && (
                            <p className="text-xs text-primary font-semibold mt-2">
                              ارزش: {reward.customValue}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            onClick={() => handleClaimReward(reward.id)}
                            className="flex-1"
                            size="sm"
                          >
                            <Gift className="ml-2 h-4 w-4" />
                            دریافت پاداش
                          </Button>
                          <Button 
                            onClick={() => handleDeleteReward(reward.id)}
                            variant="outline"
                            size="sm"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* پاداش‌های قفل شده */}
        {lockedRewards.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-muted-foreground" />
                <CardTitle>در انتظار باز شدن 🔒</CardTitle>
              </div>
              <CardDescription>
                برای دریافت این پاداش‌ها باید XP بیشتری کسب کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lockedRewards.map((reward) => {
                  const xpNeeded = reward.xpRequired - state.user.xp;
                  const progress = (state.user.xp / reward.xpRequired) * 100;

                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative"
                    >
                      <Card className="h-full border-muted/50 opacity-75">
                        <CardContent className="pt-6 space-y-4">
                          <div className="flex items-start justify-between">
                            <div className="text-4xl grayscale">{reward.icon}</div>
                            <Badge variant="secondary">
                              <Lock className="ml-1 h-3 w-3" />
                              {reward.xpRequired} XP
                            </Badge>
                          </div>

                          <div>
                            <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
                            {reward.description && (
                              <p className="text-sm text-muted-foreground">{reward.description}</p>
                            )}
                            {reward.customValue && (
                              <p className="text-xs text-muted-foreground mt-2">
                                ارزش: {reward.customValue}
                              </p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">پیشرفت</span>
                              <span className="font-bold text-primary">
                                <TrendingUp className="inline h-3 w-3 ml-1" />
                                {xpNeeded} XP مانده
                              </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>

                          <Button 
                            onClick={() => handleDeleteReward(reward.id)}
                            variant="ghost"
                            size="sm"
                            className="w-full"
                          >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* پاداش‌های دریافت شده */}
        {claimedRewards.length > 0 && (
          <Card className="border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                <CardTitle>دریافت شده ✨</CardTitle>
              </div>
              <CardDescription>
                پاداش‌هایی که قبلاً دریافت کرده‌اید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {claimedRewards.map((reward) => (
                  <Card key={reward.id} className="border-primary/10 bg-primary/5">
                    <CardContent className="pt-6 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="text-4xl">{reward.icon}</div>
                        <Badge variant="secondary">
                          <CheckCircle className="ml-1 h-3 w-3" />
                          دریافت شده
                        </Badge>
                      </div>

                      <div>
                        <h3 className="font-bold mb-1">{reward.title}</h3>
                        {reward.claimedAt && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(reward.claimedAt).toLocaleDateString('fa-IR')}
                          </p>
                        )}
                      </div>

                      <Button 
                        onClick={() => handleDeleteReward(reward.id)}
                        variant="ghost"
                        size="sm"
                        className="w-full"
                      >
                        <Trash2 className="ml-2 h-4 w-4" />
                        حذف
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* حالت خالی */}
        {state.rewards.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-xl font-bold">هنوز پاداشی ندارید</h3>
                <p className="text-muted-foreground">
                  با افزودن پاداش‌های شخصی، انگیزه‌ای قوی برای پیشرفت خود بسازید!
                </p>
                <Button onClick={() => setIsAddDialogOpen(true)} size="lg">
                  <Plus className="ml-2 h-5 w-5" />
                  اولین پاداش را اضافه کنید
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* نکات انگیزشی */}
        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-accent" />
                <h3 className="font-semibold">نکات برای استفاده بهتر</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>پاداش‌های کوچک (100-300 XP) برای انگیزه روزانه تعریف کنید</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>پاداش‌های بزرگ (500+ XP) برای اهداف بلند مدت در نظر بگیرید</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>پاداش‌هایی انتخاب کنید که واقعاً برایتان ارزشمند هستند</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-accent">•</span>
                  <span>تنوع در دسته‌بندی پاداش‌ها باعث انگیزه بیشتر می‌شود</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Rewards;