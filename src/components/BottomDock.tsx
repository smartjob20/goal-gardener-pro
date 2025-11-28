import { motion } from 'motion/react';
import { Home, CheckSquare, Flame, Target, Sparkles, Gift, MoreHorizontal } from 'lucide-react';

interface BottomDockProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onMoreClick: () => void;
}

const dockItems = [
  { id: 'dashboard', icon: Home, label: 'داشبورد' },
  { id: 'tasks', icon: CheckSquare, label: 'وظایف' },
  { id: 'habits', icon: Flame, label: 'عادت‌ها' },
  { id: 'goals', icon: Target, label: 'اهداف' },
  { id: 'aicoach', icon: Sparkles, label: 'مربی' },
  { id: 'rewards', icon: Gift, label: 'پاداش' },
];

export default function BottomDock({ activeTab, onTabChange, onMoreClick }: BottomDockProps) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 start-1/2 -translate-x-1/2 z-50"
      style={{ direction: 'ltr' }}
    >
      <div className="flex items-center gap-1 px-3 py-2 bg-card/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-border/50">
        {/* Main Navigation Items */}
        {dockItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-3 rounded-2xl transition-all min-w-[48px] min-h-[48px] flex items-center justify-center ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Icon className="w-6 h-6" />
              
              {/* Active Indicator Dot */}
              {isActive && (
                <motion.div
                  layoutId="activeDot"
                  className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          );
        })}

        {/* Divider */}
        <div className="w-px h-8 bg-border mx-1" />

        {/* More Button */}
        <motion.button
          onClick={onMoreClick}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all min-w-[48px] min-h-[48px] flex items-center justify-center"
        >
          <MoreHorizontal className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Safe Area Bottom Spacer */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </motion.div>
  );
}
