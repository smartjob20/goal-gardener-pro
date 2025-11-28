import { useState } from 'react';
import { Settings, User, Menu, LogOut, Crown, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';
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
import { useNavigate } from 'react-router-dom';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  route?: string;
}

const bottomNavItems: NavItem[] = [
  { id: 'tutorial', label: 'راهنمای آموزش', icon: BookOpen, route: '/tutorial' },
  { id: 'profile', label: 'پروفایل', icon: User },
  { id: 'settings', label: 'تنظیمات', icon: Settings },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [daysRemaining, setDaysRemaining] = useStateHook<number | null>(null);
  const { state } = useApp();
  const { user, signOut } = useAuth();
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

      if (profile.is_pro && profile.subscription_status === 'active') {
        setDaysRemaining(null);
        return;
      }

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
        <Badge className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white gap-1 border-0 shadow-sm">
          <Crown className="w-3 h-3" />
          Pro
        </Badge>
      );
    }
    if (daysRemaining !== null && daysRemaining > 0) {
      return (
        <Badge className="bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900 gap-1 border-0 shadow-sm">
          <Crown className="w-3 h-3" />
          Premium Trial
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-muted-foreground border-0">
        Basic
      </Badge>
    );
  };

  const handleNavClick = (tabId: string, route?: string) => {
    if (route) {
      navigate(route);
      setOpen(false);
    } else {
      onTabChange(tabId);
      setOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <>
      {/* === RADICAL MINIMALISM: ULTRA-MINIMAL TOP BAR === */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 inset-x-0 z-50 safe-area-top"
      >
        <div className="mx-auto max-w-7xl h-14 flex items-center justify-between px-6">
          {/* Subtle ambient gradient background */}
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[20px] -z-10" />
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent" />

          {/* Minimal Logo (Right in RTL) */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Logo size="sm" />
          </motion.div>

          {/* Menu Button (Left in RTL) - Elevated, calm */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10 min-h-[44px] min-w-[44px] rounded-2xl flex items-center justify-center
                           hover:bg-primary/10 transition-all duration-300"
                aria-label="منو"
              >
                <Menu className="w-6 h-6 text-foreground" strokeWidth={1.5} />
              </motion.button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              dir="rtl" 
              className="w-80 bg-background/95 backdrop-blur-[24px] border-s-0 shadow-2xl"
            >
              <SheetHeader className="mb-8 text-right">
                <SheetTitle className="text-right text-xl font-semibold text-foreground">منوی اصلی</SheetTitle>
              </SheetHeader>

              {/* === RADICAL MINIMALISM: USER PROFILE === */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 p-5 rounded-3xl bg-card shadow-[0_4px_24px_rgba(0,0,0,0.04)]"
              >
                <div className="flex items-center gap-4 flex-row-reverse">
                  <Avatar className="w-16 h-16 border-2 border-primary/20 shadow-sm">
                    <AvatarImage src={user?.user_metadata?.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-2xl font-light">
                      {state.user.avatar}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-right space-y-2">
                    <h3 className="font-semibold text-lg text-foreground leading-tight">
                      {state.user.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>سطح {state.user.level}</span>
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                      <span className="text-primary font-medium">{state.user.xp} XP</span>
                    </div>
                    <div className="flex justify-end">
                      {getStatusBadge()}
                    </div>
                  </div>
                </div>
              </motion.div>

              <Separator className="my-6 bg-border/30" />

              {/* === RADICAL MINIMALISM: BOTTOM NAV ITEMS === */}
              <nav className="space-y-2 mb-6">
                {bottomNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  
                  return (
                    <motion.button
                      key={item.id}
                      onClick={() => handleNavClick(item.id, item.route)}
                      className={`
                        w-full flex flex-row-reverse items-center justify-end gap-3 
                        px-4 py-3 rounded-2xl transition-all text-right min-h-[48px]
                        ${isActive 
                          ? 'bg-primary/8 text-primary font-medium' 
                          : 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                      <span className="text-sm">{item.label}</span>
                    </motion.button>
                  );
                })}
              </nav>

              {/* === SIGN OUT BUTTON === */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  className="w-full flex flex-row-reverse justify-end gap-3 
                             text-destructive hover:bg-destructive/8 hover:text-destructive
                             rounded-2xl min-h-[48px] border-0"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">خروج از حساب</span>
                </Button>
              </motion.div>
            </SheetContent>
          </Sheet>
        </div>
      </motion.header>
    </>
  );
}