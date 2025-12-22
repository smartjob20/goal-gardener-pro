import { motion } from 'motion/react';
import { Home, CheckSquare, Flame, Target, Gift, Heart, MoreHorizontal, Brain, BarChart3, Settings, User, Sparkles } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  { id: 'growth', icon: Heart, label: 'توسعه' },
  { id: 'rewards', icon: Gift, label: 'پاداش' },
];

const desktopNavItems = [
  { id: 'dashboard', icon: Home, label: 'داشبورد' },
  { id: 'tasks', icon: CheckSquare, label: 'وظایف' },
  { id: 'habits', icon: Flame, label: 'عادت‌ها' },
  { id: 'goals', icon: Target, label: 'اهداف' },
  { id: 'focus', icon: Brain, label: 'تمرکز' },
  { id: 'growth', icon: Heart, label: 'توسعه فردی' },
  { id: 'analytics', icon: BarChart3, label: 'تحلیل‌ها' },
  { id: 'rewards', icon: Gift, label: 'جوایز' },
];

const secondaryNavItems = [
  { id: 'profile', icon: User, label: 'پروفایل' },
  { id: 'settings', icon: Settings, label: 'تنظیمات' },
];

export default function BottomDock({
  activeTab,
  onTabChange,
  onMoreClick
}: BottomDockProps) {
  const isMobile = useIsMobile();

  // Desktop Header Navigation
  if (!isMobile) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
        <div className="web-container">
          <div className="flex flex-ltr items-center justify-between h-16">
            {/* Logo */}
            <div className="flex flex-ltr items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold gradient-text">باغ اهداف</h1>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-ltr items-center gap-1">
              {desktopNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-ltr items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Secondary Navigation */}
            <div className="flex flex-ltr items-center gap-2">
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={`flex flex-ltr items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden lg:inline text-sm">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Mobile Bottom Dock
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-6 inset-x-0 z-50 flex flex-ltr justify-center px-4 safe-area-bottom"
    >
      <div className="inline-flex items-center gap-1 px-2.5 py-2 bg-card/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-border/50 pl-[3px] pr-[3px]">
        {/* Main Navigation Items - Reversed order for RTL */}
        {[...dockItems].reverse().map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              whileHover={{ scale: 1.1, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={`relative p-2.5 rounded-xl transition-all min-w-[44px] min-h-[44px] flex flex-ltr items-center justify-center ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              
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
        <div className="w-px h-6 bg-border mx-0.5" />

        {/* More Button */}
        <motion.button
          onClick={onMoreClick}
          whileHover={{ scale: 1.1, y: -4 }}
          whileTap={{ scale: 0.95 }}
          className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all min-w-[44px] min-h-[44px] flex flex-ltr items-center justify-center pl-0 pr-0"
        >
          <MoreHorizontal className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
