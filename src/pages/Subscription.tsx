import { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, Crown, Loader2 } from 'lucide-react';
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

  const premiumFeatures = [
    {
      icon: CheckCircle2,
      text: 'دسترسی نامحدود به ساخت عادت‌ها',
    },
    {
      icon: CheckCircle2,
      text: 'مربی هوشمند با هوش مصنوعی اختصاصی',
    },
    {
      icon: CheckCircle2,
      text: 'تحلیل‌های دقیق و نمودارهای پیشرفته',
    },
    {
      icon: CheckCircle2,
      text: 'پشتیبان‌گیری ابری و امنیت کامل',
    },
  ];

  return (
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#1a1b26] to-black overflow-y-auto font-sans"
    >
      {/* Close Button - Top Left in RTL */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        whileHover={{ opacity: 1 }}
        onClick={handleClose}
        className="fixed top-8 left-8 z-50 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-all"
      >
        <X className="w-6 h-6 text-white" />
      </motion.button>

      <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-2xl space-y-8">
          
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
              className="drop-shadow-[0_0_50px_rgba(234,179,8,0.4)]"
            >
              <Logo size="xl" animated />
            </motion.div>
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center space-y-4"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 leading-relaxed">
              روی بهترین نسخه خودت سرمایه‌گذاری کن
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              ۳۰ روز تلاش کردی. نذار این زنجیره موفقیت قطع بشه.
            </p>
          </motion.div>

          {/* Premium Features - Glass Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-strong p-8 rounded-3xl border border-yellow-500/20 shadow-[0_0_40px_-10px_rgba(234,179,8,0.2)]"
          >
            <div className="space-y-5">
              {premiumFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-yellow-500" />
                  </div>
                  <span className="text-lg text-white/90 font-medium">
                    {feature.text}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Pricing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            {/* Toggle Switch */}
            <div className="flex items-center gap-4 p-4 rounded-2xl glass-strong border border-white/10">
              <span className={`text-lg font-semibold transition-all ${!isYearly ? 'text-white' : 'text-white/40'}`}>
                ماهانه
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={setIsYearly}
                className="data-[state=checked]:bg-yellow-500"
              />
              <span className={`text-lg font-semibold transition-all ${isYearly ? 'text-white' : 'text-white/40'}`}>
                سالانه
              </span>
              {isYearly && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="px-3 py-1 rounded-full bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/50"
                >
                  <span className="text-sm font-bold text-yellow-300">
                    ۲۰٪ تخفیف
                  </span>
                </motion.div>
              )}
            </div>

            {/* Pricing Card - Credit Card Style */}
            <motion.div
              animate={{
                scale: isYearly ? 1 : 0.95,
              }}
              transition={{ duration: 0.3 }}
              className={`w-full p-8 rounded-3xl transition-all ${
                isYearly
                  ? 'bg-gradient-to-br from-yellow-500/10 via-yellow-400/5 to-transparent border-2 border-yellow-500/50 shadow-[0_0_30px_-10px_rgba(234,179,8,0.3)]'
                  : 'bg-white/5 border border-white/10'
              }`}
            >
              {isYearly && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mb-6"
                >
                  <Crown className="w-4 h-4 text-black" />
                  <span className="text-sm font-bold text-black">پیشنهاد ویژه</span>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold text-white">
                    {isYearly ? '۴۹۰,۰۰۰' : '۴۹,۰۰۰'}
                  </span>
                  <span className="text-xl text-white/60">تومان</span>
                </div>
                <p className="text-center text-white/70 text-lg">
                  {isYearly ? 'اشتراک سالانه' : 'اشتراک ماهانه'}
                </p>
                {isYearly && (
                  <p className="text-center text-yellow-400 text-sm font-semibold">
                    معادل ۴۰,۸۳۳ تومان در ماه
                  </p>
                )}
              </div>
            </motion.div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={handlePurchase}
              disabled={isProcessing}
              className="relative w-full h-14 text-xl font-bold rounded-2xl bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-600 text-black hover:scale-105 transition-all shadow-[0_0_60px_rgba(234,179,8,0.5)] overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
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
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  در حال پردازش...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3 relative z-10">
                  <Crown className="w-6 h-6" />
                  شروع عضویت ویژه
                </span>
              )}
            </Button>

            {/* Trust Footer */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-white/40 text-sm mt-6"
            >
              🔒 تضمین بازگشت وجه • لغو آسان • هیچ تعهد طولانی مدت
            </motion.p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
