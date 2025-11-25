import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Crown, Check, Sparkles, Star, Zap, TrendingUp, Loader2 } from 'lucide-react';
import { paymentService } from '@/services/payment/PaymentService';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast } from '@/hooks/use-toast';
import { triggerHaptic } from '@/utils/haptics';
import confetti from 'canvas-confetti';

interface PaywallProps {
  onStartTrial: () => void;
  onContinueLimited: () => void;
}

export default function Paywall({ onStartTrial, onContinueLimited }: PaywallProps) {
  const { refreshSubscription } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTier, setProcessingTier] = useState<'monthly' | 'yearly' | null>(null);

  const premiumFeatures = [
    { icon: Crown, text: 'دسترسی به مربی هوشمند AI' },
    { icon: Zap, text: 'همگام‌سازی ابری نامحدود' },
    { icon: TrendingUp, text: 'تحلیل‌های پیشرفته و گزارش‌های جامع' },
    { icon: Star, text: 'محافظت از نوار (Streak Protection)' },
    { icon: Sparkles, text: 'تم‌های اختصاصی و شخسی‌سازی کامل' },
  ];

  const handlePurchase = async (tier: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    setProcessingTier(tier);
    
    try {
      await triggerHaptic('medium');
      
      const success = await paymentService.purchase(tier);
      
      if (success) {
        // Trigger success haptic
        await triggerHaptic('success');
        
        // Show confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        
        // Refresh subscription status
        await refreshSubscription();
        
        // Show success toast
        toast({
          title: '🎉 خوش آمدید به Deep Breath Pro!',
          description: 'اکنون می‌توانید از تمام امکانات پریمیوم استفاده کنید',
        });
        
        // Call success callback
        onStartTrial();
      } else {
        await triggerHaptic('error');
        toast({
          title: 'خطا در پردازش',
          description: 'لطفاً دوباره تلاش کنید',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Purchase error:', error);
      await triggerHaptic('error');
      toast({
        title: 'خطا',
        description: 'مشکلی پیش آمده است. لطفاً دوباره تلاش کنید',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      setProcessingTier(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary-light/40 to-accent-light/40 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        {/* Premium Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-metallic-silver border border-border/50 shadow-lg">
            <Crown className="w-5 h-5 text-foreground" />
            <span className="text-sm font-semibold text-foreground">نسخه پریمیوم</span>
          </div>
        </motion.div>

        <Card className="glass-strong p-8 space-y-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-3"
          >
            <h1 className="text-4xl font-bold gradient-text">
              برنامه ۳۰ روزه شما آماده است
            </h1>
            <p className="text-xl text-muted-foreground">
              قفل پتانسیل کامل خود را باز کنید
            </p>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            {premiumFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-metallic-silver flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-foreground" />
                </div>
                <span className="text-lg font-medium">{feature.text}</span>
                <Check className="w-6 h-6 text-success mr-auto" />
              </motion.div>
            ))}
          </motion.div>

          {/* Pricing */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 via-accent/10 to-info/10 border-2 border-primary/20"
          >
            <div className="text-center space-y-2">
              <div className="inline-block px-4 py-1 rounded-full bg-success/20 text-success text-sm font-semibold mb-2">
                ۷ روز رایگان
              </div>
              <p className="text-3xl font-bold">
                <span className="line-through text-muted-foreground text-xl ml-2">۹۹,۰۰۰ تومان</span>
                <span className="gradient-text">۴۹,۰۰۰ تومان</span>
              </p>
              <p className="text-muted-foreground">اشتراک سالانه - ۵۰٪ تخفیف ویژه</p>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="space-y-4"
          >
            <Button
              onClick={() => handlePurchase('yearly')}
              disabled={isProcessing}
              className="w-full py-6 text-lg font-bold bg-gradient-metallic-silver text-foreground hover:scale-105 transition-transform shadow-2xl border border-border/30 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isProcessing && processingTier === 'yearly' ? (
                <>
                  <Loader2 className="w-5 h-5 ms-2 animate-spin" />
                  در حال پردازش...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ms-2" />
                  شروع دوره آزمایشی رایگان
                </>
              )}
            </Button>

            <button
              onClick={onContinueLimited}
              disabled={isProcessing}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline disabled:opacity-50"
            >
              ادامه با نسخه محدود
            </button>
          </motion.div>

          {/* Trust Badge */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center text-xs text-muted-foreground"
          >
            🔒 هر زمان که بخواهید می‌توانید لغو کنید • بدون تعهد
          </motion.p>
        </Card>
      </motion.div>
    </div>
  );
}
