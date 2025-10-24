import { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import TaskManager from '@/components/TaskManager';
import HabitTracker from '@/components/HabitTracker';
import Planning from '@/components/Planning';
import Goals from '@/components/Goals';
import Focus from '@/components/Focus';
import Analytics from '@/components/Analytics';
import Settings from '@/components/Settings';
import Profile from '@/components/Profile';
import { motion, AnimatePresence } from 'motion/react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
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
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-background" dir="rtl">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </AppProvider>
  );
};

export default Index;
