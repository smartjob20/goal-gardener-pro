import { motion } from 'motion/react';
import { Home, CheckSquare, Flame, Target, Calendar, Clock, Sparkles, Gift, BarChart3 } from 'lucide-react';

interface FloatingDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface DockItem {
  id: string;
  icon: React.ElementType;
  label: string;
}

const dockItems: DockItem[] = [
  { id: 'dashboard', icon: Home, label: 'خانه' },
  { id: 'tasks', icon: CheckSquare, label: 'وظایف' },
  { id: 'habits', icon: Flame, label: 'عادت‌ها' },
  { id: 'goals', icon: Target, label: 'اهداف' },
  { id: 'planning', icon: Calendar, label: 'برنامه' },
  { id: 'focus', icon: Clock, label: 'تمرکز' },
  { id: 'aicoach', icon: Sparkles, label: 'مربی' },
  { id: 'rewards', icon: Gift, label: 'پاداش' },
  { id: 'analytics', icon: BarChart3, label: 'آمار' },
];

export default function FloatingDock({ activeTab, onTabChange }: FloatingDockProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', bounce: 0.2, duration: 0.8 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 safe-area-bottom"
      dir="rtl"
    >
      {/* Floating Dock Container */}
      <div className="glass-dock rounded-[2rem] px-3 py-2.5 shadow-[0_16px_60px_rgba(0,0,0,0.12)]">
        <div className="flex items-center gap-1">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[52px] min-h-[52px] rounded-2xl
                  transition-all duration-300 ease-out
                  ${isActive 
                    ? 'bg-primary/15 text-primary' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent/30'
                  }
                `}
                whileHover={{ scale: 1.15, y: -4 }}
                whileTap={{ scale: 0.95 }}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
              >
                {/* Active Indicator Dot */}
                {isActive && (
                  <motion.div
                    layoutId="dock-active-indicator"
                    className="absolute -top-1 w-1.5 h-1.5 rounded-full bg-primary"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                  />
                )}

                {/* Icon */}
                <Icon 
                  className={`w-6 h-6 transition-transform ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                {/* Label - only show on active */}
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="text-[10px] font-semibold mt-0.5"
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Hover Glow Effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl"
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Dock Shadow Enhancer */}
      <div className="absolute inset-0 bg-primary/5 rounded-[2rem] blur-2xl -z-10" />
    </motion.div>
  );
}
