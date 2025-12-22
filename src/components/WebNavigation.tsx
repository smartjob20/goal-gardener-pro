import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  CheckSquare, 
  Target, 
  Brain, 
  User, 
  Settings, 
  Menu, 
  X,
  Sparkles,
  BarChart3,
  Award,
  Calendar,
  Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface WebNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'داشبورد', icon: Home },
  { id: 'tasks', label: 'وظایف', icon: CheckSquare },
  { id: 'habits', label: 'عادت‌ها', icon: Target },
  { id: 'goals', label: 'اهداف', icon: Compass },
  { id: 'focus', label: 'تمرکز', icon: Brain },
  { id: 'growth', label: 'توسعه فردی', icon: Sparkles },
  { id: 'analytics', label: 'تحلیل‌ها', icon: BarChart3 },
  { id: 'rewards', label: 'جوایز', icon: Award },
];

const secondaryItems = [
  { id: 'profile', label: 'پروفایل', icon: User },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
];

export function WebNavigation({ activeTab, setActiveTab }: WebNavigationProps) {
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        {/* Mobile Header */}
        <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50 safe-area-top">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              className="text-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
            
            <h1 className="text-lg font-bold gradient-text">باغ اهداف</h1>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTab('profile')}
              className="text-foreground"
            >
              <User className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-50"
                onClick={() => setMobileMenuOpen(false)}
              />
              <motion.nav
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="fixed top-0 right-0 bottom-0 w-72 bg-card border-l border-border z-50 safe-area-top"
              >
                <div className="flex items-center justify-between p-4 border-b border-border">
                  <h2 className="font-bold text-lg">منو</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                
                <div className="p-4 space-y-2">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                  
                  <div className="border-t border-border my-4" />
                  
                  {secondaryItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === item.id
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted text-foreground'
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-border/50 safe-area-bottom">
          <div className="flex items-center justify-around py-2 px-2">
            {navItems.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px]">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </>
    );
  }

  // Desktop Navigation
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-border/50">
      <div className="web-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold gradient-text">باغ اهداف</h1>
          </div>

          {/* Main Navigation */}
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Secondary Navigation */}
          <div className="flex items-center gap-2">
            {secondaryItems.map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(item.id)}
                className="gap-2"
              >
                <item.icon className="h-4 w-4" />
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
