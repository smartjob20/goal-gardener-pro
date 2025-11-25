import { useState } from 'react';
import { Home, CheckSquare, Flame, Calendar, Target, Clock, BarChart3, Settings, User, Gift, Sparkles, Menu, Plus, LogOut, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Logo from './Logo';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState as useStateHook } from 'react';
interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick?: () => void;
}
const mainNavItems = [{
  id: 'dashboard',
  label: 'داشبورد',
  icon: Home
}, {
  id: 'tasks',
  label: 'وظایف',
  icon: CheckSquare
}, {
  id: 'habits',
  label: 'عادت‌ها',
  icon: Flame
}, {
  id: 'focus',
  label: 'تمرکز',
  icon: Clock
}, {
  id: 'goals',
  label: 'اهداف',
  icon: Target
}, {
  id: 'planning',
  label: 'برنامه‌ریزی',
  icon: Calendar
}, {
  id: 'aicoach',
  label: 'مربی هوشمند',
  icon: Sparkles
}, {
  id: 'rewards',
  label: 'پاداش‌ها',
  icon: Gift
}, {
  id: 'analytics',
  label: 'آمار و گزارش',
  icon: BarChart3
}];
const bottomNavItems = [{
  id: 'profile',
  label: 'پروفایل',
  icon: User
}, {
  id: 'settings',
  label: 'تنظیمات',
  icon: Settings
}];
export default function Navigation({
  activeTab,
  onTabChange,
  onAddClick
}: NavigationProps) {
  const [open, setOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useStateHook<number | null>(null);
  const {
    state
  } = useApp();
  const {
    user,
    signOut
  } = useAuth();
  const { isPro, subscriptionInfo } = useSubscription();

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_start_date, is_pro, subscription_status')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // If user has active paid subscription
      if (profile.is_pro && profile.subscription_status === 'active') {
        setDaysRemaining(null);
        return;
      }

      // Calculate days remaining in trial
      const trialStartDate = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
      if (!trialStartDate) {
        setDaysRemaining(null);
        return;
      }

      const now = new Date();
      const daysSinceStart = Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const remaining = 30 - daysSinceStart;

      setDaysRemaining(remaining > 0 ? remaining : null);
    };

    fetchTrialStatus();
  }, [user]);

  const getStatusBadge = () => {
    if (subscriptionInfo?.isPro && subscriptionInfo.status === 'active') {
      return (
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white gap-1">
          <Crown className="w-3 h-3" />
          Pro
        </Badge>
      );
    }
    if (daysRemaining !== null && daysRemaining > 0) {
      return (
        <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 gap-1">
          <Crown className="w-3 h-3" />
          Premium Trial
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-muted-foreground">
        Basic
      </Badge>
    );
  };
  const handleNavClick = (tabId: string) => {
    onTabChange(tabId);
    setOpen(false);
  };
  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };
  return <>
      {/* Top Header with Safe Area Support */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b-2 border-primary/20 shadow-2xl safe-area-top">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between relative px-4 sm:px-6">
          {/* Decorative gradient line at bottom of header */}
          <div className="absolute bottom-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Logo (End side - right in RTL) */}
          <div className="relative z-10">
            <Logo size="sm" />
          </div>

          {/* Hamburger Menu (Start side - left in RTL) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="relative z-10 hover:bg-primary/20 hover:scale-110 transition-all rounded-xl border border-transparent hover:border-primary/30 min-h-[44px] min-w-[44px]">
                <Menu className="w-6 h-6 text-primary" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 bg-gradient-to-b from-background via-background/95 to-primary/5 border-s border-border/60">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-start">منو</SheetTitle>
              </SheetHeader>

              {/* User Profile Section */}
              <motion.div initial={{
              opacity: 0,
              y: -10
            }} animate={{
              opacity: 1,
              y: 0
            }} className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <Avatar className="w-14 h-14 border-2 border-primary/50">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {state.user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-foreground">{state.user.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">سطح {state.user.level}</span>
                      <Separator orientation="vertical" className="h-3" />
                      <span className="text-xs text-primary font-semibold">{state.user.xp} XP</span>
                    </div>
                    <div className="mt-2">
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Main Navigation Items */}
              <nav className="space-y-1 mb-6">
                {mainNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return <motion.button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-start relative min-h-[44px] ${isActive ? 'bg-primary/10 text-primary shadow-md' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`} whileTap={{
                  scale: 0.98
                }}>
                      {isActive && <motion.div layoutId="activeIndicator" className="absolute end-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-s-full" transition={{
                    type: 'spring',
                    bounce: 0.25,
                    duration: 0.6
                  }} />}
                      <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                      <span className="font-medium text-sm">{item.label}</span>
                      {isActive && <motion.div className="absolute inset-0 bg-primary/5 rounded-xl" animate={{
                    opacity: [0.5, 1, 0.5]
                  }} transition={{
                    duration: 2,
                    repeat: Infinity
                  }} />}
                    </motion.button>;
              })}
              </nav>

              <Separator className="my-6" />

              {/* Bottom Navigation Items */}
              <nav className="space-y-1 mb-6">
                {bottomNavItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return <button key={item.id} onClick={() => handleNavClick(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-start min-h-[44px] ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'}`}>
                      <Icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>;
              })}
              </nav>

              {/* Sign Out Button */}
              <Button onClick={handleSignOut} variant="outline" className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20 min-h-[44px]">
                <LogOut className="w-5 h-5" />
                <span>خروج از حساب</span>
              </Button>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Floating Action Button with Safe Area */}
      {onAddClick && <AnimatePresence>
          <motion.button onClick={onAddClick} initial={{
        scale: 0,
        opacity: 0
      }} animate={{
        scale: 1,
        opacity: 1
      }} exit={{
        scale: 0,
        opacity: 0
      }} whileHover={{
        scale: 1.1
      }} whileTap={{
        scale: 0.95
      }} className="fixed bottom-6 start-6 z-40 w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-gradient-metallic-silver shadow-2xl flex items-center justify-center hover:shadow-primary/50 transition-shadow safe-area-bottom" style={{
        background: 'linear-gradient(135deg, #E0E0E0 0%, #FFFFFF 50%, #BDBDBD 100%)'
      }}>
            <Plus className="w-7 h-7 text-foreground" />
            <motion.div className="absolute inset-0 rounded-full bg-primary/20" animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0, 0.5]
        }} transition={{
          duration: 2,
          repeat: Infinity
        }} />
          </motion.button>
        </AnimatePresence>}
    </>;
}