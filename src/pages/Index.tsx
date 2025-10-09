import { useState } from 'react';
import { AppProvider } from '@/context/AppContext';
import Navigation from '@/components/Navigation';
import Dashboard from '@/components/Dashboard';
import TaskManager from '@/components/TaskManager';
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
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">🔥</div>
              <h2 className="text-2xl font-bold">ردیابی عادت‌ها</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
      case 'planning':
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">📅</div>
              <h2 className="text-2xl font-bold">برنامه‌ریزی</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
      case 'goals':
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎯</div>
              <h2 className="text-2xl font-bold">هدف‌گذاری</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
      case 'focus':
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">⏱️</div>
              <h2 className="text-2xl font-bold">حالت تمرکز</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">📊</div>
              <h2 className="text-2xl font-bold">آنالیتیکس</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">⚙️</div>
              <h2 className="text-2xl font-bold">تنظیمات</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="flex items-center justify-center min-h-screen pb-24">
            <div className="text-center space-y-4">
              <div className="text-6xl">👤</div>
              <h2 className="text-2xl font-bold">پروفایل</h2>
              <p className="text-muted-foreground">به زودی...</p>
            </div>
          </div>
        );
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
