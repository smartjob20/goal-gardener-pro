import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import BottomDock from '@/components/BottomDock';
import MoreMenu from '@/components/MoreMenu';
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
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { notificationService } from '@/services/NotificationService';
const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const {
    user,
    loading
  } = useAuth();
  const {
    state
  } = useApp();
  const navigate = useNavigate();

  // Start notification service
  useEffect(() => {
    if (user && state) {
      notificationService.start(state.tasks, state.habits);
      
      return () => {
        notificationService.stop();
      };
    }
  }, [user, state?.tasks, state?.habits]);

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
        return <HabitTracker />;
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
    }} /> : showOnboarding ? <Onboarding onComplete={() => setShowOnboarding(false)} /> : <div className="min-h-screen bg-background pb-32" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} transition={{
          duration: 0.15,
          ease: 'easeInOut'
        }} className="min-h-screen px-2 sm:px-3 pt-4 pb-4">
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          
          {/* Bottom Floating Dock */}
          <BottomDock 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
            onMoreClick={() => setMoreMenuOpen(true)}
          />

          {/* More Menu (Slide from left) */}
          <MoreMenu 
            open={moreMenuOpen}
            onClose={() => setMoreMenuOpen(false)}
            onNavigate={setActiveTab}
          />
        </div>}
    </>;
};

export default Index;