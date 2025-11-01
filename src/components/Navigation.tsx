import { Home, CheckSquare, Flame, Calendar, Target, Clock, BarChart3, Settings, User, Gift } from 'lucide-react';
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
  { id: 'rewards', label: 'پاداش', icon: Gift },
  { id: 'analytics', label: 'آمار', icon: BarChart3 },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
  { id: 'profile', label: 'پروفایل', icon: User },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/60 backdrop-blur-2xl shadow-2xl">
      <div className="max-w-7xl mx-auto px-1 md:px-3">
        <div className="flex flex-row-reverse justify-around items-center py-1.5 md:py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <motion.button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center gap-0.5 md:gap-1 px-1.5 md:px-3 py-1.5 md:py-2 min-w-[50px] md:min-w-[70px] transition-all"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-br from-primary/15 to-accent/10 rounded-2xl shadow-lg"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <Icon
                    className={`w-5 h-5 md:w-6 md:h-6 transition-all ${
                      isActive 
                        ? 'text-primary drop-shadow-lg' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      className="absolute -inset-1 bg-primary/20 rounded-full blur-md"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>
                <span
                  className={`text-[9px] md:text-[11px] font-semibold transition-all relative z-10 ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
