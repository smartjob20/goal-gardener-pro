import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, BarChart3, User, Settings, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const moreItems = [
  { id: 'focus', icon: Clock, label: 'تمرکز', gradient: 'from-slate-400 to-slate-600' },
  { id: 'planning', icon: Calendar, label: 'برنامه‌ریزی', gradient: 'from-zinc-400 to-zinc-600' },
  { id: 'analytics', icon: BarChart3, label: 'آمار', gradient: 'from-neutral-400 to-neutral-600' },
  { id: 'profile', icon: User, label: 'پروفایل', gradient: 'from-gray-400 to-gray-600' },
  { id: 'settings', icon: Settings, label: 'تنظیمات', gradient: 'from-stone-400 to-stone-600' },
  { id: 'tutorial', icon: BookOpen, label: 'راهنما', gradient: 'from-slate-300 to-slate-500' },
];

export default function MoreMenu({ open, onClose, onNavigate }: MoreMenuProps) {
  const handleNavigate = (id: string) => {
    if (id === 'tutorial') {
      // Tutorial is a route, not a tab
      window.location.href = '/tutorial';
    } else {
      onNavigate(id);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          />

          {/* Menu Panel */}
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed start-0 top-0 bottom-0 w-80 bg-card border-e border-border shadow-2xl z-50 overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">بیشتر</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full hover:bg-accent"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-2">
              {moreItems.map((item, index) => {
                const Icon = item.icon;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigate(item.id)}
                    className="w-full group relative overflow-hidden rounded-2xl"
                  >
                    {/* Gradient Background on Hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-4 p-4 bg-accent/30 group-hover:bg-transparent transition-colors duration-300">
                      <div className="p-2 rounded-xl bg-background/50 group-hover:bg-white/20 transition-colors duration-300">
                        <Icon className="w-6 h-6 text-foreground group-hover:text-white transition-colors duration-300" />
                      </div>
                      <span className="text-base font-medium text-foreground group-hover:text-white transition-colors duration-300">
                        {item.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-0 inset-x-0 p-6 border-t border-border bg-gradient-to-t from-card/80 to-transparent">
              <p className="text-xs text-muted-foreground text-center">
                Deep Breath - کنترل کامل زندگی در آرامش
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
