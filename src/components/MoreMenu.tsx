import { motion, AnimatePresence } from 'motion/react';
import { Clock, Calendar, BarChart3, User, Settings, BookOpen, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

const moreItems = [
  { id: 'focus', icon: Clock, label: 'تمرکز', color: 'from-blue-pastel/20 to-blue-sky/20' },
  { id: 'planning', icon: Calendar, label: 'برنامه‌ریزی', color: 'from-purple-pastel/20 to-purple-light/20' },
  { id: 'analytics', icon: BarChart3, label: 'آمار', color: 'from-coral-light/20 to-salmon-soft/20' },
  { id: 'profile', icon: User, label: 'پروفایل', color: 'from-amber-soft/20 to-gold-light/20' },
  { id: 'settings', icon: Settings, label: 'تنظیمات', color: 'from-mint-green/20 to-green-soft/20' },
  { id: 'tutorial', icon: BookOpen, label: 'راهنما', color: 'from-pink-soft/20 to-rose-light/20' },
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
            className="fixed start-0 top-0 bottom-0 w-80 bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-xl border-e border-border/40 shadow-2xl z-50 overflow-hidden"
            dir="rtl"
          >
            {/* Header */}
            <div className="p-6 border-b border-border/30 flex items-center justify-between">
              <h2 className="text-xl font-bold text-foreground">بیشتر</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-8 w-8 hover:bg-muted/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Menu Items */}
            <div className="p-4 space-y-3">
              {moreItems.map((item, index) => {
                const Icon = item.icon;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNavigate(item.id)}
                    className="w-full group relative overflow-hidden rounded-[24px]"
                  >
                    {/* Soft Background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-100 group-hover:opacity-80 transition-all duration-300`} />
                    
                    {/* Content */}
                    <div className="relative flex items-center gap-4 p-4 backdrop-blur-sm">
                      <div className="p-2.5 rounded-[16px] bg-background/60 group-hover:bg-background/80 transition-all duration-300 soft-shadow">
                        <Icon className="w-5 h-5 text-foreground transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="text-base font-medium text-foreground">
                        {item.label}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Info */}
            <div className="absolute bottom-0 inset-x-0 p-6 border-t border-border/20 bg-gradient-to-t from-background/95 to-transparent backdrop-blur-sm">
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
