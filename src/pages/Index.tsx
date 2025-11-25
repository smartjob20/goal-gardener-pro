import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import Welcome from '@/components/Welcome';
import Onboarding from '@/components/Onboarding';
import UnifiedDashboard from '@/components/UnifiedDashboard';
import Dashboard from '@/components/Dashboard';
import TaskManager from '@/components/TaskManager';
import HabitTracker from '@/components/HabitTracker';
import Planning from '@/components/Planning';
import Goals from '@/components/Goals';
import Focus from '@/components/Focus';
import Analytics from '@/components/Analytics';
import Settings from '@/components/Settings';
import Profile from '@/components/Profile';
import Rewards from '@/components/Rewards';
import AICoach from '@/components/AICoach';
import ProGate from '@/components/ProGate';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, CheckSquare, Calendar } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/utils/storage';
const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickAddType, setQuickAddType] = useState<'task' | 'plan'>('task');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const {
    user,
    loading
  } = useAuth();
  const {
    addTask
  } = useApp();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if user has completed onboarding (with Capacitor Preferences)
  useEffect(() => {
    const checkOnboarding = async () => {
      if (user) {
        const onboardingCompleted = (await storage.get(STORAGE_KEYS.ONBOARDING_COMPLETED)) || localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
        if (!onboardingCompleted) {
          setShowWelcome(true);
        }
      }
    };
    checkOnboarding();
  }, [user]);

  // Apply theme on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appState');
    if (savedSettings) {
      try {
        const {
          settings
        } = JSON.parse(savedSettings);
        const root = document.documentElement;
        if (settings.theme === 'dark') {
          root.classList.add('dark');
        } else if (settings.theme === 'light') {
          root.classList.remove('dark');
        } else {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    }
  }, []);
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <UnifiedDashboard />;
      case 'tasks':
        return <TaskManager />;
      case 'habits':
        return <HabitTracker className="mt-[70px]" />;
      case 'planning':
        return <Planning />;
      case 'goals':
        return <Goals />;
      case 'focus':
        return <Focus />;
      case 'aicoach':
        return <ProGate fallback={<p className="text-sm text-center">مربی هوشمند AI فقط برای کاربران Pro در دسترس است</p>}>
            <AICoach />
          </ProGate>;
      case 'rewards':
        return <Rewards />;
      case 'analytics':
        return <ProGate fallback={<p className="text-sm text-center">تحلیل‌های پیشرفته فقط برای کاربران Pro در دسترس است</p>}>
            <Analytics />
          </ProGate>;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <UnifiedDashboard />;
    }
  };
  const handleQuickAdd = () => {
    if (!quickTitle.trim()) return;
    if (quickAddType === 'task') {
      addTask({
        title: quickTitle,
        priority: quickPriority,
        category: 'personal',
        xpReward: quickPriority === 'high' ? 30 : quickPriority === 'medium' ? 20 : 10
      });
    } else {
      // For plans, switch to planning tab
      setActiveTab('planning');
    }
    setQuickTitle('');
    setQuickPriority('medium');
    setQuickAddOpen(false);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>;
  }
  if (!user) {
    return null;
  }
  return <>
      {showWelcome ? <Welcome onStart={() => {
      setShowWelcome(false);
      setShowOnboarding(true);
    }} /> : showOnboarding ? <Onboarding onComplete={() => setShowOnboarding(false)} /> : <div className="min-h-screen bg-background pb-24" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
          opacity: 0,
          x: 20
        }} animate={{
          opacity: 1,
          x: 0
        }} exit={{
          opacity: 0,
          x: -20
        }} transition={{
          duration: 0.2
        }} className="min-h-screen mt-[70px]">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} onAddClick={() => setQuickAddOpen(true)} />

          {/* Quick Add Dialog */}
          <Dialog open={quickAddOpen} onOpenChange={setQuickAddOpen}>
            <DialogContent className="max-w-md" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-start">افزودن سریع</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-2">
                  <Button type="button" variant={quickAddType === 'task' ? 'default' : 'outline'} onClick={() => setQuickAddType('task')} className="gap-2">
                    <CheckSquare className="w-4 h-4" />
                    وظیفه
                  </Button>
                  <Button type="button" variant={quickAddType === 'plan' ? 'default' : 'outline'} onClick={() => setQuickAddType('plan')} className="gap-2">
                    <Calendar className="w-4 h-4" />
                    برنامه
                  </Button>
                </div>

                {/* Title Input */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {quickAddType === 'task' ? 'عنوان وظیفه' : 'عنوان برنامه'}
                  </label>
                  <Input value={quickTitle} onChange={e => setQuickTitle(e.target.value)} placeholder={quickAddType === 'task' ? 'مثال: خرید مواد غذایی' : 'مثال: برنامه هفتگی'} onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
                </div>

                {/* Priority (only for tasks) */}
                {quickAddType === 'task' && <div>
                    <label className="text-sm font-medium mb-2 block">اولویت</label>
                    <Select value={quickPriority} onValueChange={(v: any) => setQuickPriority(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">🔴 بالا</SelectItem>
                        <SelectItem value="medium">🟡 متوسط</SelectItem>
                        <SelectItem value="low">🟢 پایین</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>}

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setQuickAddOpen(false)}>
                    انصراف
                  </Button>
                  <Button onClick={handleQuickAdd} disabled={!quickTitle.trim()} className="bg-gradient-metallic-silver" style={{
                background: 'linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 50%, #BDBDBD 100%)'
              }}>
                    افزودن
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>}
    </>;
};
export default Index;