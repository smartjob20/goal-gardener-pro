import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import type { SubscriptionInfo } from '@/services/payment/PaymentService';

interface SubscriptionContextType {
  isPro: boolean;
  subscriptionInfo: SubscriptionInfo | null;
  isLoading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  subscriptionInfo: null,
  isLoading: true,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscriptionStatus = async () => {
    if (!user) {
      setSubscriptionInfo({
        isPro: false,
        tier: 'free',
        status: 'active',
        currentPeriodEnd: null,
      });
      setIsLoading(false);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('is_pro, subscription_tier, subscription_status, current_period_end, trial_start_date')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Calculate if user is within 30-day trial
      const trialStartDate = profile.trial_start_date ? new Date(profile.trial_start_date) : null;
      const now = new Date();
      const daysSinceTrialStart = trialStartDate 
        ? Math.floor((now.getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
        : 999; // If no trial_start_date, assume trial expired
      
      const isWithinTrial = daysSinceTrialStart < 30;
      const hasActiveSubscription = profile.is_pro && profile.subscription_status === 'active';

      const info: SubscriptionInfo = {
        isPro: hasActiveSubscription || isWithinTrial,
        tier: (profile.subscription_tier as any) || 'free',
        status: (profile.subscription_status as any) || 'active',
        currentPeriodEnd: profile.current_period_end ? new Date(profile.current_period_end) : null,
      };

      setSubscriptionInfo(info);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      setSubscriptionInfo({
        isPro: false,
        tier: 'free',
        status: 'active',
        currentPeriodEnd: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionStatus();
  }, [user]);

  // Set up realtime subscription to profiles table
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => {
          fetchSubscriptionStatus();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPro: subscriptionInfo?.isPro || false,
        subscriptionInfo,
        isLoading,
        refreshSubscription: fetchSubscriptionStatus,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
