import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Check if user has completed onboarding
  useEffect(() => {
    if (user) {
      const onboardingCompleted = localStorage.getItem('deepbreath_onboarding_completed');
      if (!onboardingCompleted) {
        setShowWelcome(true);
      }
    }
  }, [user]);

  // Apply theme on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('appState');
    if (savedSettings) {
      try {
        const { settings } = JSON.parse(savedSettings);
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
      case 'rewards':
        return <Rewards />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <UnifiedDashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {showWelcome ? (
        <Welcome onStart={() => {
          setShowWelcome(false);
          setShowOnboarding(true);
        }} />
      ) : showOnboarding ? (
        <Onboarding onComplete={() => setShowOnboarding(false)} />
      ) : (
        <div className="min-h-screen bg-background" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="min-h-screen"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}
    </>
  );
};

export default Index;
