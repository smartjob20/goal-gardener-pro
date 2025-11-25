import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Zap, TrendingUp, Lock, Crown, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { paymentService } from '@/services/payment/PaymentService';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast } from '@/hooks/use-toast';
import { triggerHaptic } from '@/utils/haptics';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

type PlanType = 'free' | 'monthly' | 'yearly';

export default function Subscription() {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleClose = () => {
    navigate('/');
  };

  const handlePurchase = async (planType: PlanType) => {
    if (planType === 'free') return;
    
    setIsProcessing(true);
    
    try {
      await triggerHaptic('medium');
      
      const success = await paymentService.purchase(planType);
      
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

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'رایگان',
      subtitle: 'برای شروع',
      price: '۰',
      period: 'رایگان',
      description: 'شروع سفر خود با امکانات پایه',
      features: [
        { text: '۳ عادت فعال', included: true },
        { text: 'آمار پایه', included: true },
        { text: 'مربی هوش مصنوعی', included: false },
        { text: 'تحلیل‌های پیشرفته', included: false },
        { text: 'پشتیبان‌گیری ابری', included: false },
        { text: 'عادت‌های نامحدود', included: false },
      ],
      cta: 'پلن فعلی شما',
      popular: false,
      icon: Lock,
    },
    {
      id: 'yearly' as PlanType,
      name: 'سالانه',
      subtitle: 'پیشنهاد ویژه',
      price: '۴۹۰,۰۰۰',
      originalPrice: '۸۸۰,۰۰۰',
      period: 'سالانه',
      monthlyEquivalent: '۴۰,۸۳۳ تومان در ماه',
      description: 'تبدیل شوید به بهترین نسخه خودتان',
      discount: '۴۴٪ تخفیف',
      features: [
        { text: 'عادت‌های نامحدود', included: true, highlight: true },
        { text: 'مربی هوش مصنوعی اختصاصی', included: true, highlight: true },
        { text: 'تحلیل‌های پیشرفته و نمودارها', included: true },
        { text: 'پشتیبان‌گیری ابری خودکار', included: true },
        { text: 'گزارش PDF دقیق', included: true },
        { text: 'اولویت در پشتیبانی', included: true },
      ],
      cta: 'شروع تحول',
      popular: true,
      icon: Crown,
    },
  ];

  const comparisonCategories = [
    {
      category: "مدیریت عادت‌ها",
      features: [
        { name: "تعداد عادت‌های فعال", free: "۳ عادت", premium: "نامحدود", highlight: true },
        { name: "ردیابی روزانه عادت‌ها", free: true, premium: true },
        { name: "یادآوری هوشمند", free: true, premium: true },
        { name: "تنظیم دسته‌بندی سفارشی", free: false, premium: true },
        { name: "آمار پیشرفت تفصیلی", free: false, premium: true },
      ]
    },
    {
      category: "تحلیل و گزارش",
      features: [
        { name: "نمودار پیشرفت پایه", free: true, premium: true },
        { name: "تحلیل‌های پیشرفته", free: false, premium: true, highlight: true },
        { name: "گزارش PDF دقیق", free: false, premium: true },
        { name: "مقایسه دوره‌های زمانی", free: false, premium: true },
        { name: "نمودارهای تعاملی", free: false, premium: true },
      ]
    },
    {
      category: "مربی هوش مصنوعی",
      features: [
        { name: "مشاوره شخصی‌سازی شده", free: false, premium: true, highlight: true },
        { name: "پیشنهادات هوشمند روزانه", free: false, premium: true },
        { name: "تحلیل رفتاری", free: false, premium: true },
        { name: "راهنمایی گام‌به‌گام", free: false, premium: true },
      ]
    },
    {
      category: "امکانات پیشرفته",
      features: [
        { name: "پشتیبان‌گیری ابری خودکار", free: false, premium: true, highlight: true },
        { name: "همگام‌سازی بین دستگاه‌ها", free: false, premium: true },
        { name: "حالت آفلاین کامل", free: true, premium: true },
        { name: "اولویت در پشتیبانی", free: false, premium: true },
        { name: "به‌روزرسانی‌های اختصاصی", free: false, premium: true },
      ]
    },
  ];

  const faqs = [
    {
      question: "آیا می‌توانم اشتراک خود را لغو کنم؟",
      answer: "بله، شما می‌توانید در هر زمان اشتراک خود را لغو کنید. پس از لغو، تا پایان دوره پرداخت شده به تمام امکانات دسترسی خواهید داشت و دیگر مبلغی از شما کسر نخواهد شد."
    },
    {
      question: "آیا تضمین بازگشت وجه دارید؟",
      answer: "بله، ما تضمین ۱۴ روزه بازگشت وجه ارائه می‌دهیم. اگر از خدمات راضی نبودید، می‌توانید درخواست بازگشت کامل وجه خود را بدهید."
    },
    {
      question: "تفاوت پلن رایگان و پریمیوم چیست؟",
      answer: "پلن رایگان به شما اجازه می‌دهد تا ۳ عادت فعال داشته باشید و به آمار پایه دسترسی داشته باشید. پلن پریمیوم امکان ساخت عادت‌های نامحدود، مربی هوش مصنوعی اختصاصی، تحلیل‌های پیشرفته، و پشتیبان‌گیری ابری را به شما می‌دهد."
    },
    {
      question: "آیا می‌توانم بین پلن ماهانه و سالانه تغییر دهم؟",
      answer: "بله، شما می‌توانید در هر زمان پلن خود را ارتقا یا تغییر دهید. در صورت تغییر به پلن سالانه، تخفیف ۴۴٪ برای شما اعمال خواهد شد."
    },
    {
      question: "مربی هوش مصنوعی چگونه کار می‌کند؟",
      answer: "مربی هوش مصنوعی Deep Breath رفتار و پیشرفت شما را تحلیل می‌کند و توصیه‌های شخصی‌سازی شده برای بهبود عادت‌ها و دستیابی به اهدافتان ارائه می‌دهد. این مربی به زبان فارسی با شما صحبت می‌کند و انگیزه و پشتیبانی لازم را فراهم می‌آورد."
    },
    {
      question: "آیا اطلاعات من امن است؟",
      answer: "بله، ما امنیت اطلاعات شما را بسیار جدی می‌گیریم. تمام داده‌ها با رمزنگاری پیشرفته محافظت می‌شوند و در سرورهای ابری امن ذخیره می‌شوند. ما هیچ‌گاه اطلاعات شخصی شما را با اشخاص ثالث به اشتراک نمی‌گذاریم."
    },
  ];

  return (
    <div 
      dir="rtl" 
      className="fixed inset-0 z-50 bg-background overflow-y-auto font-sans"
    >
      {/* Ambient Background Effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-background pointer-events-none" />
      <div className="fixed inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Close Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={handleClose}
        className="fixed top-6 left-6 z-50 w-10 h-10 flex items-center justify-center rounded-full glass hover:bg-accent transition-all group"
      >
        <X className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
      </motion.button>

      <div className="relative min-h-screen w-full flex flex-col items-center justify-start px-4 py-12 md:py-20">
        <div className="w-full max-w-6xl space-y-12">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            {/* Logo with Breathing Animation */}
            <motion.div
              animate={{
                scale: [1, 1.03, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative"
            >
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
              <Logo size="lg" animated />
            </motion.div>

            {/* Headline */}
            <div className="space-y-3 max-w-2xl">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl md:text-5xl font-bold text-foreground leading-tight"
              >
                سرمایه‌گذاری روی خودت
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground"
              >
                ۳۰ روز با ما بودی. حالا وقتشه این مسیر رو برای همیشه ادامه بدی
              </motion.p>
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3 glass px-6 py-3 rounded-full"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 border-2 border-background flex items-center justify-center text-xs font-bold text-primary-foreground"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                +۱۰,۰۰۰ کاربر فعال
              </span>
            </motion.div>
          </motion.div>

          {/* Plans Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {plans.map((plan, index) => {
              const isSelected = selectedPlan === plan.id;
              const Icon = plan.icon;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="relative"
                >
                  {/* Popular Badge */}
                  {plan.popular && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7, type: "spring" }}
                      className="absolute -top-4 right-1/2 translate-x-1/2 z-10"
                    >
                      <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary to-primary/80 shadow-lg flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                        <span className="text-xs font-bold text-primary-foreground">
                          محبوب‌ترین انتخاب
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Plan Card */}
                  <motion.div
                    whileHover={{ scale: plan.id === 'free' ? 1 : 1.02 }}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={cn(
                      "relative h-full p-6 md:p-8 rounded-3xl cursor-pointer transition-all duration-300",
                      plan.popular
                        ? "glass-strong border-2 border-primary/50 shadow-[0_0_40px_-10px_hsl(var(--primary)/0.3)]"
                        : "glass border border-border/50",
                      isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                    )}
                  >
                    {/* Discount Badge */}
                    {plan.discount && (
                      <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-destructive/10 border border-destructive/20">
                        <span className="text-xs font-bold text-destructive">{plan.discount}</span>
                      </div>
                    )}

                    {/* Plan Header */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                            <Icon className={cn(
                              "w-6 h-6",
                              plan.popular ? "text-primary" : "text-muted-foreground"
                            )} />
                            {plan.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="space-y-1">
                        <div className="flex items-baseline gap-2">
                          {plan.originalPrice && (
                            <span className="text-lg text-muted-foreground line-through">
                              {plan.originalPrice}
                            </span>
                          )}
                          <span className="text-4xl md:text-5xl font-bold text-foreground">
                            {plan.price}
                          </span>
                          <span className="text-lg text-muted-foreground">تومان</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {plan.monthlyEquivalent || plan.period}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.6 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className={cn(
                            "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
                            feature.included
                              ? "bg-primary/20"
                              : "bg-muted"
                          )}>
                            <Check className={cn(
                              "w-3 h-3",
                              feature.included
                                ? "text-primary"
                                : "text-muted-foreground opacity-30"
                            )} />
                          </div>
                          <span className={cn(
                            "text-sm leading-relaxed",
                            feature.included
                              ? feature.highlight
                                ? "text-foreground font-semibold"
                                : "text-foreground"
                              : "text-muted-foreground line-through opacity-50"
                          )}>
                            {feature.text}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                      onClick={() => handlePurchase(plan.id)}
                      disabled={isProcessing || plan.id === 'free'}
                      size="lg"
                      className={cn(
                        "w-full h-12 text-base font-bold rounded-xl transition-all duration-300",
                        plan.popular
                          ? "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      )}
                    >
                      {isProcessing && selectedPlan === plan.id ? (
                        <span className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                          />
                          در حال پردازش...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          {plan.popular && <Zap className="w-5 h-5" />}
                          {plan.cta}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="w-full max-w-4xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                مقایسه دقیق امکانات
              </h2>
              <p className="text-muted-foreground">
                ببینید چه امکاناتی با اشتراک پریمیوم در اختیارتان قرار می‌گیرد
              </p>
            </div>

            <div className="glass-strong rounded-3xl overflow-hidden border border-border/50">
              {/* Table Header */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-muted/30 border-b border-border/50">
                <div className="text-sm font-semibold text-muted-foreground">
                  دسته‌بندی
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-bold text-foreground">رایگان</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 border border-primary/30">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-sm font-bold text-primary">پریمیوم</span>
                  </div>
                </div>
              </div>

              {/* Expandable Categories */}
              <Accordion type="single" collapsible className="divide-y divide-border/30">
                {comparisonCategories.map((category, catIndex) => (
                  <AccordionItem
                    key={catIndex}
                    value={`category-${catIndex}`}
                    className="border-0"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/20 transition-colors group">
                      <div className="flex items-center gap-3 text-start">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <span className="text-sm font-bold text-primary">{catIndex + 1}</span>
                        </div>
                        <span className="text-base font-semibold text-foreground">
                          {category.category}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4">
                      <div className="space-y-3 pt-2">
                        {category.features.map((feature, featureIndex) => (
                          <motion.div
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className={cn(
                              "grid grid-cols-3 gap-4 items-center p-3 rounded-xl transition-colors",
                              feature.highlight ? "bg-primary/5" : "hover:bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-sm",
                                feature.highlight ? "font-semibold text-foreground" : "text-muted-foreground"
                              )}>
                                {feature.name}
                              </span>
                            </div>
                            
                            {/* Free Column */}
                            <div className="text-center">
                              {typeof feature.free === 'boolean' ? (
                                <div className={cn(
                                  "inline-flex items-center justify-center w-6 h-6 rounded-full",
                                  feature.free ? "bg-success/20" : "bg-muted"
                                )}>
                                  {feature.free ? (
                                    <Check className="w-4 h-4 text-success" />
                                  ) : (
                                    <X className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {feature.free}
                                </span>
                              )}
                            </div>

                            {/* Premium Column */}
                            <div className="text-center">
                              {typeof feature.premium === 'boolean' ? (
                                <div className={cn(
                                  "inline-flex items-center justify-center w-6 h-6 rounded-full",
                                  feature.premium ? "bg-primary/20" : "bg-muted"
                                )}>
                                  {feature.premium ? (
                                    <Check className="w-4 h-4 text-primary" />
                                  ) : (
                                    <X className="w-4 h-4 text-muted-foreground" />
                                  )}
                                </div>
                              ) : (
                                <span className="text-sm font-semibold text-primary">
                                  {feature.premium}
                                </span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            className="w-full max-w-3xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                سوالات متداول
              </h2>
              <p className="text-muted-foreground">
                پاسخ سوالات رایج درباره اشتراک و امکانات
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.05 }}
                >
                  <AccordionItem
                    value={`item-${index}`}
                    className="glass rounded-2xl px-6 border-border/50 overflow-hidden"
                  >
                    <AccordionTrigger className="text-start hover:no-underline py-5 text-base md:text-lg font-semibold text-foreground hover:text-primary transition-colors">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5 text-sm md:text-base">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              ))}
            </Accordion>
          </motion.div>

          {/* Trust Signals */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              تضمین بازگشت وجه
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              لغو آسان
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary" />
              پرداخت امن
            </span>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
