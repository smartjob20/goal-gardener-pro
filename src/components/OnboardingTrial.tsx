import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { triggerHaptic } from '@/utils/haptics';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import {
  Crown,
  Sparkles,
  Target,
  Brain,
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface OnboardingTrialProps {
  onComplete: () => void;
}

const trialFeatures = [
  { icon: Target, label: 'عادت‌های نامحدود', description: 'بدون هیچ محدودیتی' },
  { icon: Brain, label: 'مربی هوش مصنوعی', description: 'تحلیل و پیشنهاد هوشمند' },
  { icon: TrendingUp, label: 'آنالیتیکس پیشرفته', description: 'گزارش‌های تفصیلی' },
  { icon: Sparkles, label: 'همگام‌سازی ابری', description: 'دسترسی از همه جا' }
];

export default function OnboardingTrial({ onComplete }: OnboardingTrialProps) {
  const [isActivating, setIsActivating] = useState(false);
  const { user } = useAuth();

  const handleActivateTrial = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast.error('لطفاً ابتدا وارد شوید');
      return;
    }

    setIsActivating(true);
    await triggerHaptic('medium');

    try {
      // Call edge function to activate trial
      const { data, error } = await supabase.functions.invoke('activate-trial', {
        body: {},
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to activate trial');
      }

      // CRITICAL: Save onboarding completion BEFORE calling onComplete
      localStorage.setItem('deepbreath_onboarding_completed', 'true');
      
      await triggerHaptic('success');
      toast.success('دوره آزمایشی ۳۰ روزه شما فعال شد! 🎉');

      // Ensure state is fully saved before navigation
      await new Promise(resolve => setTimeout(resolve, 200));
      
      onComplete();

    } catch (error) {
      console.error('Error activating trial:', error);
      toast.error('خطا در فعال‌سازی دوره آزمایشی');
      await triggerHaptic('error');
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted to-accent flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background Elements */}
      <motion.div
        className="absolute inset-0 opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
      >
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </motion.div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Logo size="lg" />
        </motion.div>

        <Card className="p-8 sm:p-12 glass-strong space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="text-center space-y-4"
          >
            {/* Crown Icon with Animation */}
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 0],
                scale: [1, 1.1, 1.1, 1.1, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="flex justify-center"
            >
              <div className="relative">
                <Crown className="w-20 h-20 text-primary" strokeWidth={1.5} />
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/20 rounded-full blur-xl"
                />
              </div>
            </motion.div>

            <h2 className="text-4xl font-bold gradient-text">
              هدیه خوش‌آمدگویی شما
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              برای شروع مسیرت، ما <span className="text-primary font-bold">۳۰ روز اشتراک نسخه PRO</span> را به صورت کاملاً رایگان برایت فعال کردیم
            </p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {trialFeatures.map((feature, index) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50 hover:border-primary/50 transition-colors"
              >
                <div className="p-2 rounded-lg bg-primary/10">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 text-right">
                  <h4 className="font-semibold text-foreground flex items-center gap-2 justify-end">
                    {feature.label}
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Highlight Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="p-6 rounded-2xl gradient-bg-primary text-center space-y-2"
          >
            <Sparkles className="w-8 h-8 mx-auto text-primary-foreground" />
            <p className="text-primary-foreground font-medium text-lg">
              هیچ کارت اعتباری لازم نیست
            </p>
            <p className="text-primary-foreground/80 text-sm">
              پس از ۳۰ روز، می‌توانید همچنان از نسخه رایگان استفاده کنید
            </p>
          </motion.div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              onClick={handleActivateTrial}
              disabled={isActivating}
              className="w-full h-14 text-lg gradient-bg-primary shadow-lg hover:shadow-xl transition-all"
            >
              {isActivating ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ms-2" />
                  شروع ۳۰ روز رایگان و ورود به برنامه
                  <Crown className="w-5 h-5 me-2" />
                </>
              )}
            </Button>
          </motion.div>

          {/* Small Print */}
          <p className="text-center text-xs text-muted-foreground">
            با کلیک بر روی دکمه، شما با{' '}
            <span className="text-primary">شرایط و ضوابط</span> ما موافقت می‌کنید
          </p>
        </Card>
      </div>
    </div>
  );
}
