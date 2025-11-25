import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Crown } from 'lucide-react';
import { motion } from 'motion/react';

interface PremiumBannerProps {
  onUpgradeClick: () => void;
}

export const PremiumBanner = ({ onUpgradeClick }: PremiumBannerProps) => {
  const { user } = useAuth();
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  useEffect(() => {
    const fetchTrialStatus = async () => {
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('trial_start_date, is_pro, subscription_status')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      // If user has active paid subscription, don't show banner
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

  if (daysRemaining === null) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4 cursor-pointer"
      onClick={onUpgradeClick}
    >
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-l from-amber-400 via-yellow-300 to-amber-500 p-4 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
              <Crown className="h-5 w-5 text-amber-900" />
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {daysRemaining} روز دسترسی پریمیوم رایگان باقی مانده است
              </p>
              <p className="text-xs text-amber-800">
                برای ادامه استفاده از امکانات پیشرفته، اشتراک بگیرید
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/30 px-4 py-2 backdrop-blur-sm">
            <span className="text-sm font-bold text-amber-900">
              ارتقا به Pro
            </span>
          </div>
        </div>
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />
      </div>
    </motion.div>
  );
};
