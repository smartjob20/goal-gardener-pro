import { Home, CheckSquare, Flame, Calendar, Target, Clock, BarChart3, Settings, User } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', label: 'داشبورد', icon: Home },
  { id: 'tasks', label: 'وظایف', icon: CheckSquare },
  { id: 'habits', label: 'عادت‌ها', icon: Flame },
  { id: 'planning', label: 'برنامه', icon: Calendar },
  { id: 'goals', label: 'اهداف', icon: Target },
  { id: 'focus', label: 'تمرکز', icon: Clock },
  { id: 'analytics', label: 'آمار', icon: BarChart3 },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
  { id: 'profile', label: 'پروفایل', icon: User },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-2">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-1 px-2 py-1 min-w-[60px] transition-all"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <Icon
                  className={`w-5 h-5 transition-all relative z-10 ${
                    isActive ? 'text-primary scale-110' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[10px] font-medium transition-all relative z-10 ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
