import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Check, Sparkles, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { paymentService } from '@/services/payment/PaymentService';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast } from '@/hooks/use-toast';
import { triggerHaptic } from '@/utils/haptics';
import confetti from 'canvas-confetti';

export default function Subscription() {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [isYearly, setIsYearly] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    navigate('/');
  };

  const handlePurchase = async () => {
    setIsProcessing(true);
    
    try {
      await triggerHaptic('medium');
      
      const success = await paymentService.purchase(isYearly ? 'yearly' : 'monthly');
      
      if (success) {
        await triggerHaptic('success');
        
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 }
        });
        
        await refreshSubscription();
        
        toast({
          title: '🎉 خوش آمدید به Deep Breath Pro!',
          description: 'اکنون می‌توانید از تمام امکانات پریمیوم استفاده کنید',
        });
        
        setTimeout(() => navigate('/'), 2000);
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
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#1a1c2e] via-[#161825] to-black overflow-y-auto">
      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
        onClick={handleClose}
        className="fixed top-8 left-8 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        <X className="w-5 h-5 text-white" />
      </motion.button>

      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-4xl space-y-12">
          {/* Logo with Breathing Animation */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="drop-shadow-[0_0_40px_rgba(234,179,8,0.4)]"
            >
              <Logo size="xl" animated />
            </motion.div>
          </motion.div>

          {/* Hero Copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white tracking-tight">
              Invest in Your Peace of Mind
            </h1>
            <p className="text-xl md:text-2xl text-white/70 font-light">
              You are 30 days into your journey. Secure your habits forever.
            </p>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 border-2 border-[#1a1c2e] flex items-center justify-center text-white font-bold"
                >
                  {i}
                </div>
              ))}
            </div>
            <p className="text-white/60 text-sm">Join 10,000+ mindful achievers</p>
          </motion.div>

          {/* Comparison Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          >
            {/* Free Tier - Muted */}
            <div className="relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 opacity-60">
              <div className="absolute inset-0 backdrop-blur-sm rounded-2xl" />
              <div className="relative space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white/70">Free</h3>
                  <p className="text-white/50">Limited Access</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="w-5 h-5 rounded-full border border-white/30" />
                    <span>3 Habits Only</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="w-5 h-5 rounded-full border border-white/30" />
                    <span>No AI Coach</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/50">
                    <div className="w-5 h-5 rounded-full border border-white/30" />
                    <span>Basic Analytics</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pro Tier - Shining */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-yellow-400/20 via-orange-400/20 to-yellow-500/20 backdrop-blur-sm border-2 border-yellow-400/50 shadow-[0_0_60px_rgba(234,179,8,0.3)]">
              <div className="absolute top-4 right-4">
                <div className="px-3 py-1 rounded-full bg-yellow-400 text-black text-xs font-bold">
                  RECOMMENDED
                </div>
              </div>
              <div className="relative space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-white">Pro</h3>
                  <p className="text-white/80">Unlimited Power</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-white">
                    <Check className="w-5 h-5 text-yellow-400" />
                    <span>Infinite Habits</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Check className="w-5 h-5 text-yellow-400" />
                    <span>Personal AI Coach</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Check className="w-5 h-5 text-yellow-400" />
                    <span>Cloud Sync</span>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <Check className="w-5 h-5 text-yellow-400" />
                    <span>Advanced Analytics</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Pricing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="max-w-md mx-auto"
          >
            <div className="flex items-center justify-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <span className={`text-lg font-medium transition-colors ${!isYearly ? 'text-white' : 'text-white/50'}`}>
                Monthly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-yellow-400"
              />
              <span className={`text-lg font-medium transition-colors ${isYearly ? 'text-white' : 'text-white/50'}`}>
                Yearly
              </span>
              {isYearly && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-bold border border-green-400/30"
                >
                  -40%
                </motion.span>
              )}
            </div>

            {/* Price Display */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-6 space-y-2"
            >
              <p className="text-4xl font-bold text-white">
                {isYearly ? '$99' : '$15'}{' '}
                <span className="text-xl text-white/50 font-normal">
                  / {isYearly ? 'year' : 'month'}
                </span>
              </p>
              {isYearly && (
                <p className="text-white/60 text-sm">
                  That's just $8.25/month
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* CTA Button - Fixed on Mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="max-w-2xl mx-auto"
          >
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="relative w-full py-8 text-xl font-bold rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-300 to-yellow-500 text-black hover:scale-105 transition-all shadow-[0_0_60px_rgba(234,179,8,0.5)] overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 3,
                  ease: 'linear',
                }}
              />
              
              {isProcessing ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <Sparkles className="w-6 h-6" />
                  Start My Transformation
                </span>
              )}
            </Button>

            <p className="text-center text-white/50 text-sm mt-6">
              🔒 Cancel anytime • No commitment • 30-day money-back guarantee
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
