import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Sparkles, Zap, TrendingUp, Lock, Crown, ChevronDown, Star, Quote, Infinity as InfinityIcon, BarChart3, Brain, Cloud, FileText, Shield, Rocket, Award, Target, LucideIcon, Bot, Wand2, MessageSquare, Lightbulb } from 'lucide-react';
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
type BillingCycle = 'monthly' | 'yearly';

interface Feature {
  text: string;
  icon: LucideIcon;
  highlight?: boolean;
  included?: boolean;
}

interface Plan {
  id: PlanType;
  name: string;
  subtitle: string;
  price: string;
  originalPrice?: string;
  period: string;
  monthlyEquivalent?: string;
  description: string;
  discount?: string;
  features: Feature[];
  cta: string;
  popular: boolean;
  icon: LucideIcon;
}

export default function Subscription() {
  const navigate = useNavigate();
  const { refreshSubscription } = useSubscription();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');
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

  const getPlansData = (): Plan[] => {
    if (billingCycle === 'yearly') {
      return [
        {
          id: 'yearly',
          name: 'پریمیوم',
          subtitle: 'بهترین ارزش',
          price: '۴۹۰,۰۰۰',
          originalPrice: '۸۸۰,۰۰۰',
          period: 'سالانه',
          monthlyEquivalent: 'معادل ۴۰,۸۳۳ تومان در ماه',
          description: 'تحول کامل زندگی با قدرت هوش مصنوعی',
          discount: '۴۴٪ صرفه‌جویی',
          features: [
            { text: 'عادت‌های نامحدود و بدون محدودیت', icon: InfinityIcon, highlight: true },
            { text: '🤖 مربی هوش مصنوعی شخصی ۲۴/۷', icon: Brain, highlight: true },
            { text: '✨ پیشنهادات هوشمند روزانه با AI', icon: Wand2, highlight: true },
            { text: '🧠 تحلیل رفتاری پیشرفته با یادگیری ماشین', icon: Bot, highlight: true },
            { text: 'تحلیل‌های عمیق و نمودارهای تعاملی', icon: BarChart3 },
            { text: 'پشتیبان‌گیری ابری خودکار', icon: Cloud },
            { text: 'گزارش‌های PDF حرفه‌ای', icon: FileText },
            { text: 'رمزنگاری و امنیت نظامی', icon: Shield },
            { text: 'همگام‌سازی لحظه‌ای دستگاه‌ها', icon: Rocket },
            { text: 'پشتیبانی اولویت‌دار', icon: Award },
          ],
          cta: 'شروع تحول با ۴۴٪ تخفیف',
          popular: true,
          icon: Crown,
        },
        {
          id: 'yearly',
          name: 'اولترا',
          subtitle: 'ویژه حرفه‌ای‌ها',
          price: '۸۹۰,۰۰۰',
          originalPrice: '۱,۵۸۰,۰۰۰',
          period: 'سالانه',
          monthlyEquivalent: 'معادل ۷۴,۱۶۶ تومان در ماه',
          description: 'همه چیز + خدمات VIP اختصاصی',
          discount: '۴۴٪ صرفه‌جویی',
          features: [
            { text: 'عادت‌های نامحدود و بدون محدودیت', icon: InfinityIcon, highlight: true },
            { text: '🤖 مربی هوش مصنوعی شخصی ۲۴/۷', icon: Brain, highlight: true },
            { text: '✨ پیشنهادات هوشمند روزانه با AI', icon: Wand2, highlight: true },
            { text: '🧠 تحلیل رفتاری پیشرفته با یادگیری ماشین', icon: Bot, highlight: true },
            { text: 'تحلیل‌های عمیق و نمودارهای تعاملی', icon: BarChart3 },
            { text: 'پشتیبان‌گیری ابری خودکار', icon: Cloud },
            { text: 'گزارش‌های PDF حرفه‌ای', icon: FileText },
            { text: 'رمزنگاری و امنیت نظامی', icon: Shield },
            { text: 'همگام‌سازی لحظه‌ای دستگاه‌ها', icon: Rocket },
            { text: 'پشتیبانی اولویت‌دار VIP', icon: Award, highlight: true },
            { text: '👨‍💼 مشاوره تلفنی با متخصصین', icon: MessageSquare, highlight: true },
            { text: '📊 گزارش‌های اختصاصی پیشرفته', icon: TrendingUp, highlight: true },
          ],
          cta: 'دسترسی VIP',
          popular: false,
          icon: Star,
        },
        {
          id: 'free',
          name: 'رایگان',
          subtitle: 'برای آشنایی',
          price: '۰',
          period: 'رایگان',
          description: 'تجربه محدود امکانات پایه',
          features: [
            { text: 'محدود به ۳ عادت فعال', icon: Target, included: true },
            { text: 'آمار پایه و ساده', icon: BarChart3, included: true },
            { text: '❌ بدون مربی هوش مصنوعی', icon: Brain, included: false },
            { text: '❌ بدون پیشنهادات هوشمند', icon: Wand2, included: false },
            { text: '❌ بدون تحلیل رفتاری', icon: Bot, included: false },
            { text: '❌ بدون پشتیبان‌گیری ابری', icon: Cloud, included: false },
            { text: '❌ بدون گزارش PDF', icon: FileText, included: false },
          ],
          cta: 'پلن فعلی شما',
          popular: false,
          icon: Lock,
        },
      ];
    } else {
      return [
        {
          id: 'monthly',
          name: 'پریمیوم',
          subtitle: 'انعطاف ماهانه',
          price: '۷۹,۰۰۰',
          period: 'ماهانه',
          description: 'دسترسی کامل با پرداخت ماهانه',
          features: [
            { text: 'عادت‌های نامحدود و بدون محدودیت', icon: InfinityIcon, highlight: true },
            { text: '🤖 مربی هوش مصنوعی شخصی ۲۴/۷', icon: Brain, highlight: true },
            { text: '✨ پیشنهادات هوشمند روزانه با AI', icon: Wand2, highlight: true },
            { text: '🧠 تحلیل رفتاری پیشرفته با یادگیری ماشین', icon: Bot, highlight: true },
            { text: 'تحلیل‌های عمیق و نمودارهای تعاملی', icon: BarChart3 },
            { text: 'پشتیبان‌گیری ابری خودکار', icon: Cloud },
            { text: 'گزارش‌های PDF حرفه‌ای', icon: FileText },
            { text: 'رمزنگاری و امنیت نظامی', icon: Shield },
            { text: 'همگام‌سازی لحظه‌ای دستگاه‌ها', icon: Rocket },
            { text: 'پشتیبانی اولویت‌دار', icon: Award },
          ],
          cta: 'شروع اشتراک ماهانه',
          popular: true,
          icon: Crown,
        },
        {
          id: 'monthly',
          name: 'اولترا',
          subtitle: 'ویژه حرفه‌ای‌ها',
          price: '۱۴۹,۰۰۰',
          period: 'ماهانه',
          description: 'همه چیز + خدمات VIP اختصاصی',
          features: [
            { text: 'عادت‌های نامحدود و بدون محدودیت', icon: InfinityIcon, highlight: true },
            { text: '🤖 مربی هوش مصنوعی شخصی ۲۴/۷', icon: Brain, highlight: true },
            { text: '✨ پیشنهادات هوشمند روزانه با AI', icon: Wand2, highlight: true },
            { text: '🧠 تحلیل رفتاری پیشرفته با یادگیری ماشین', icon: Bot, highlight: true },
            { text: 'تحلیل‌های عمیق و نمودارهای تعاملی', icon: BarChart3 },
            { text: 'پشتیبان‌گیری ابری خودکار', icon: Cloud },
            { text: 'گزارش‌های PDF حرفه‌ای', icon: FileText },
            { text: 'رمزنگاری و امنیت نظامی', icon: Shield },
            { text: 'همگام‌سازی لحظه‌ای دستگاه‌ها', icon: Rocket },
            { text: 'پشتیبانی اولویت‌دار VIP', icon: Award, highlight: true },
            { text: '👨‍💼 مشاوره تلفنی با متخصصین', icon: MessageSquare, highlight: true },
            { text: '📊 گزارش‌های اختصاصی پیشرفته', icon: TrendingUp, highlight: true },
          ],
          cta: 'دسترسی VIP',
          popular: false,
          icon: Star,
        },
        {
          id: 'free',
          name: 'رایگان',
          subtitle: 'برای آشنایی',
          price: '۰',
          period: 'رایگان',
          description: 'تجربه محدود امکانات پایه',
          features: [
            { text: 'محدود به ۳ عادت فعال', icon: Target, included: true },
            { text: 'آمار پایه و ساده', icon: BarChart3, included: true },
            { text: '❌ بدون مربی هوش مصنوعی', icon: Brain, included: false },
            { text: '❌ بدون پیشنهادات هوشمند', icon: Wand2, included: false },
            { text: '❌ بدون تحلیل رفتاری', icon: Bot, included: false },
            { text: '❌ بدون پشتیبان‌گیری ابری', icon: Cloud, included: false },
            { text: '❌ بدون گزارش PDF', icon: FileText, included: false },
          ],
          cta: 'پلن فعلی شما',
          popular: false,
          icon: Lock,
        },
      ];
    }
  };

  const plans = getPlansData();

  const testimonials = [
    {
      name: "سارا احمدی",
      role: "مدیر پروژه",
      avatar: "س",
      rating: 5,
      text: "Deep Breath واقعاً زندگیم رو متحول کرد. قبلاً همیشه برنامه‌هام رو نیمه‌کاره رها می‌کردم، اما با مربی هوش مصنوعی و سیستم پاداش‌دهی این برنامه، الان ۶ ماهه که روزانه ورزش می‌کنم و کتاب می‌خونم. این سرمایه‌گذاری بهترین تصمیمی بود که برای خودم گرفتم.",
      gradient: "from-primary to-primary/60"
    },
    {
      name: "امیر رضایی",
      role: "کارآفرین",
      avatar: "ا",
      rating: 5,
      text: "به عنوان یک کارآفرین، زمان برام خیلی ارزشمنده. این برنامه کمک کرد تا عادت‌های بهره‌وری رو در زندگیم جا بندازم. تحلیل‌های دقیق و گزارش‌های PDF برای ارائه به تیمم عالیه. ارزش هر ریالش رو داره!",
      gradient: "from-accent to-accent/60"
    },
    {
      name: "مریم کریمی",
      role: "دانشجو",
      avatar: "م",
      rating: 5,
      text: "اول فکر می‌کردم یه برنامه معمولی دیگه‌ست، اما وقتی مربی هوش مصنوعی شروع کرد به دادن پیشنهادهای شخصی‌سازی شده، متوجه شدم این برنامه فرق داره. الان دو ماهه که عادت مطالعه روزانه رو حفظ کردم و نمرات درسیم هم بهتر شده.",
      gradient: "from-success to-success/60"
    },
    {
      name: "حسین محمدی",
      role: "معلم",
      avatar: "ح",
      rating: 5,
      text: "به دنبال یک برنامه فارسی و با طراحی زیبا بودم که به من در ایجاد عادت‌های سالم کمک کنه. Deep Breath هم زیباست، هم کاربردی، هم به زبان فارسی. پشتیبان‌گیری ابری باعث شد که دیگر نگران از دست دادن اطلاعاتم نباشم.",
      gradient: "from-info to-info/60"
    },
  ];

  const comparisonCategories = [
    {
      category: "🤖 قدرت هوش مصنوعی",
      features: [
        { name: "مربی شخصی AI با یادگیری ماشین", free: false, premium: true, ultra: true, highlight: true },
        { name: "پیشنهادات هوشمند روزانه سفارشی", free: false, premium: true, ultra: true, highlight: true },
        { name: "تحلیل رفتاری و الگویابی پیشرفته", free: false, premium: true, ultra: true, highlight: true },
        { name: "گفتگوی طبیعی با مربی AI", free: false, premium: true, ultra: true },
        { name: "راهنمایی گام‌به‌گام هوشمند", free: false, premium: true, ultra: true },
        { name: "پیش‌بینی موفقیت با AI", free: false, premium: true, ultra: true },
        { name: "مشاوره تلفنی با متخصصین", free: false, premium: false, ultra: true, highlight: true },
      ]
    },
    {
      category: "مدیریت عادت‌ها",
      features: [
        { name: "تعداد عادت‌های فعال", free: "فقط ۳ عادت", premium: "نامحدود", ultra: "نامحدود", highlight: true },
        { name: "ردیابی روزانه عادت‌ها", free: true, premium: true, ultra: true },
        { name: "یادآوری هوشمند", free: true, premium: true, ultra: true },
        { name: "دسته‌بندی‌های سفارشی", free: false, premium: true, ultra: true },
        { name: "آمار پیشرفت تفصیلی", free: false, premium: true, ultra: true },
        { name: "تنظیم اهداف هفتگی و ماهانه", free: false, premium: true, ultra: true },
      ]
    },
    {
      category: "تحلیل و گزارش",
      features: [
        { name: "نمودار پیشرفت پایه", free: true, premium: true, ultra: true },
        { name: "تحلیل‌های عمیق و پیشرفته", free: false, premium: true, ultra: true, highlight: true },
        { name: "گزارش‌های PDF حرفه‌ای", free: false, premium: true, ultra: true },
        { name: "گزارش‌های اختصاصی پیشرفته", free: false, premium: false, ultra: true, highlight: true },
        { name: "مقایسه دوره‌های زمانی", free: false, premium: true, ultra: true },
        { name: "نمودارهای تعاملی و زنده", free: false, premium: true, ultra: true },
        { name: "آمار بینش‌های رفتاری", free: false, premium: true, ultra: true },
      ]
    },
    {
      category: "امکانات پیشرفته",
      features: [
        { name: "پشتیبان‌گیری ابری خودکار", free: false, premium: true, ultra: true, highlight: true },
        { name: "همگام‌سازی بین دستگاه‌ها", free: false, premium: true, ultra: true },
        { name: "حالت آفلاین کامل", free: true, premium: true, ultra: true },
        { name: "پشتیبانی اولویت‌دار", free: false, premium: true, ultra: false },
        { name: "پشتیبانی VIP اختصاصی", free: false, premium: false, ultra: true, highlight: true },
        { name: "به‌روزرسانی‌های اختصاصی زودهنگام", free: false, premium: false, ultra: true },
        { name: "رمزنگاری و امنیت نظامی", free: false, premium: true, ultra: true },
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
            <div className="space-y-4 max-w-3xl">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-bold text-foreground leading-tight"
              >
                تحول زندگی با قدرت
                <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent"> هوش مصنوعی</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl md:text-2xl text-muted-foreground leading-relaxed"
              >
                ۳۰ روز با ما بودی و تفاوت رو دیدی.
                <br />
                <span className="text-primary font-semibold">حالا وقتشه این مسیر رو برای همیشه ادامه بدی</span>
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

          {/* AI Power Highlight */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-strong rounded-3xl p-8 md:p-10 max-w-4xl mx-auto border-2 border-primary/30"
          >
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/20 to-primary/10 px-6 py-3 rounded-full">
                <Brain className="w-6 h-6 text-primary" />
                <span className="font-bold text-primary text-lg">قدرت هوش مصنوعی پیشرفته</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                مربی شخصی هوشمند که همیشه کنارت هست
              </h3>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                با تکنولوژی یادگیری ماشین، مربی AI ما رفتار و پیشرفت تو رو تحلیل می‌کنه و هر روز پیشنهادات سفارشی‌سازی شده برای بهبود زندگیت ارائه می‌ده
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <Bot className="w-10 h-10 text-primary" />
                  <span className="font-semibold text-foreground text-center">تحلیل رفتاری لحظه‌ای</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <Wand2 className="w-10 h-10 text-primary" />
                  <span className="font-semibold text-foreground text-center">پیشنهادات هوشمند روزانه</span>
                </div>
                <div className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/20">
                  <Lightbulb className="w-10 h-10 text-primary" />
                  <span className="font-semibold text-foreground text-center">راهنمایی شخصی‌سازی شده</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Billing Cycle Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center"
          >
            <div className="glass-strong rounded-full p-1.5 inline-flex items-center gap-1">
              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                  billingCycle === 'yearly'
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {billingCycle === 'yearly' && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  سالانه
                  <span className="text-xs bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-bold">
                    ✨ ۴۴٪ صرفه‌جویی
                  </span>
                </span>
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "relative px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                  billingCycle === 'monthly'
                    ? "bg-primary text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {billingCycle === 'monthly' && (
                  <motion.div
                    layoutId="activePill"
                    className="absolute inset-0 bg-primary rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">ماهانه</span>
              </button>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <AnimatePresence mode="wait">
            <motion.div
              key={billingCycle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto"
            >
              {plans.reverse().map((plan, index) => {
                const isSelected = selectedPlan === plan.id;
                const Icon = plan.icon;

                return (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="relative"
                  >
                    {/* Popular Badge */}
                    {plan.popular && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, type: "spring" }}
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
                        "relative h-full p-8 rounded-3xl cursor-pointer transition-all duration-300",
                        plan.popular
                          ? "glass-strong border-2 border-primary/50 shadow-[0_0_50px_-10px_hsl(var(--primary)/0.4)]"
                          : "glass border border-border/50",
                        isSelected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                      )}
                    >
                      {/* Discount Badge */}
                      {plan.discount && (
                        <motion.div
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className="absolute top-6 left-6 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 shadow-lg"
                        >
                          <span className="text-sm font-bold text-white flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            {plan.discount}
                          </span>
                        </motion.div>
                      )}

                      {/* Plan Header */}
                      <div className="space-y-6 mb-8">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center",
                                plan.popular 
                                  ? "bg-gradient-to-br from-primary to-primary/70" 
                                  : "bg-muted"
                              )}>
                                <Icon className={cn(
                                  "w-6 h-6",
                                  plan.popular ? "text-primary-foreground" : "text-muted-foreground"
                                )} />
                              </div>
                              <div>
                                <h3 className="text-2xl font-bold text-foreground">
                                  {plan.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-bold text-foreground">
                              {plan.price}
                            </span>
                            <span className="text-lg text-muted-foreground">تومان</span>
                          </div>
                          {plan.originalPrice && (
                            <div className="flex items-center gap-2">
                              <span className="text-lg text-muted-foreground line-through">
                                {plan.originalPrice} تومان
                              </span>
                            </div>
                          )}
                          {plan.monthlyEquivalent && (
                            <p className="text-sm text-muted-foreground">{plan.monthlyEquivalent}</p>
                          )}
                          <p className="text-sm font-medium text-primary">{plan.period}</p>
                        </div>

                        <p className="text-base text-muted-foreground leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2.5 mb-8">
                        {plan.features.map((feature, featureIdx) => {
                          const FeatureIcon = feature.icon;
                          const included = feature.included !== false;
                          
                          return (
                            <motion.div
                              key={featureIdx}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + featureIdx * 0.05 }}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl transition-all text-right",
                                feature.highlight && "bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border-r-2 border-primary shadow-sm",
                                !included && "opacity-40"
                              )}
                            >
                              <span className={cn(
                                "text-sm leading-relaxed flex-1 text-right",
                                included ? "text-foreground font-medium" : "text-muted-foreground line-through"
                              )}>
                                {feature.text}
                              </span>
                              <div className={cn(
                                "flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center shadow-sm",
                                included
                                  ? feature.highlight
                                    ? "bg-gradient-to-br from-primary to-primary/70 shadow-primary/20"
                                    : "bg-primary/10"
                                  : "bg-muted"
                              )}>
                                {included ? (
                                  <FeatureIcon className={cn(
                                    "w-4.5 h-4.5",
                                    feature.highlight
                                      ? "text-primary-foreground"
                                      : "text-primary"
                                  )} />
                                ) : (
                                  <X className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>

                      {/* CTA Button */}
                      <Button
                        onClick={() => handlePurchase(plan.id)}
                        disabled={plan.id === 'free' || isProcessing}
                        size="lg"
                        className={cn(
                          "w-full text-base font-bold rounded-xl h-14 transition-all duration-300",
                          plan.popular
                            ? "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl"
                            : "bg-muted text-muted-foreground hover:bg-muted/80",
                          isProcessing && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isProcessing && plan.id !== 'free' ? (
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Zap className="w-5 h-5" />
                            </motion.div>
                            در حال پردازش...
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {plan.id !== 'free' && <Sparkles className="w-5 h-5" />}
                            {plan.cta}
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                نظرات کاربران راضی
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                کاربران Deep Breath از تحول در زندگیشان می‌گویند
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                { value: '۱۰,۰۰۰+', label: 'کاربر فعال' },
                { value: '۴.۹/۵', label: 'امتیاز کاربران' },
                { value: '۹۵٪', label: 'رضایت کاربران' },
                { value: '۲ میلیون', label: 'عادت تکمیل شده' },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="glass-strong p-6 rounded-2xl text-center"
                >
                  <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Testimonial Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + idx * 0.1 }}
                  className="glass-strong p-6 rounded-2xl space-y-4 hover:shadow-lg transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center text-xl font-bold text-primary-foreground shadow-lg",
                        testimonial.gradient
                      )}>
                        {testimonial.avatar}
                      </div>
                      <div className="text-right">
                        <h4 className="font-bold text-lg text-foreground">
                          {testimonial.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                  </div>

                  {/* Quote Icon */}
                  <Quote className="w-10 h-10 text-primary/20 mb-4" />

                  {/* Review Text */}
                  <p className="text-base text-foreground leading-relaxed text-right mb-6">
                    {testimonial.text}
                  </p>

                  {/* Verified Badge */}
                  <div className="flex items-center gap-2 pt-2">
                    <Check className="w-4 h-4 text-success" />
                    <span className="text-xs text-success font-medium">
                      کاربر تایید شده
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Feature Comparison Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-6"
          >
            <div className="text-center space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-block"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3">
                  مقایسه دقیق امکانات
                </h2>
                <div className="h-1 w-32 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full mx-auto" />
              </motion.div>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                ببین با نسخه پریمیوم چه قابلیت‌های قدرتمندی در اختیار داری
              </p>
            </div>

            <Accordion type="multiple" defaultValue={["category-0"]} className="space-y-4">
              {comparisonCategories.map((category, idx) => (
                <AccordionItem
                  key={idx}
                  value={`category-${idx}`}
                  className="glass-strong rounded-3xl border-2 border-border/30 overflow-hidden hover:border-primary/30 transition-all"
                >
                  <AccordionTrigger className="hover:no-underline py-8 px-8 text-right group">
                    <div className="flex items-center justify-between gap-4 w-full">
                      <span className="text-xl md:text-2xl font-bold text-foreground text-right flex items-center gap-3 group-hover:text-primary transition-colors">
                        {category.category}
                      </span>
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        {idx === 0 ? <Brain className="w-7 h-7 text-primary" /> : <TrendingUp className="w-7 h-7 text-primary" />}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-8">
                    <div className="space-y-3 mt-6">
                      {/* Header Row */}
                      <div className="grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 pb-5 border-b-2 border-primary/20">
                        <div className="text-base md:text-lg font-bold text-foreground text-right">ویژگی</div>
                        <div className="text-sm md:text-base font-bold text-muted-foreground text-center">رایگان</div>
                        <div className="text-sm md:text-base font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent text-center">پریمیوم ⭐</div>
                        <div className="text-sm md:text-base font-bold text-muted-foreground text-center">اولترا</div>
                      </div>
                      
                      {/* Feature Rows */}
                      {category.features.map((feature, featureIdx) => (
                        <motion.div
                          key={featureIdx}
                          initial={{ opacity: 0, x: 30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.05 * featureIdx }}
                          className={cn(
                            "grid grid-cols-[2fr,1fr,1fr,1fr] gap-4 p-3 md:p-4 rounded-2xl transition-all hover:bg-muted/30",
                            feature.highlight && "bg-gradient-to-l from-primary/10 via-primary/5 to-transparent border-r-4 border-primary shadow-md"
                          )}
                        >
                          <div className={cn(
                            "text-sm md:text-base font-medium flex items-center text-right",
                            feature.highlight ? "text-foreground font-bold" : "text-foreground"
                          )}>
                            {feature.name}
                          </div>
                          <div className="flex items-center justify-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-success/15 flex items-center justify-center shadow-sm">
                                  <Check className="w-4 h-4 md:w-5 md:h-5 text-success" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                                  <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" />
                                </div>
                              )
                            ) : (
                              <span className="text-xs md:text-sm font-medium text-foreground text-center px-2">
                                {feature.free}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-center">
                            {typeof feature.premium === 'boolean' ? (
                              feature.premium ? (
                                <div className={cn(
                                  "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-sm",
                                  feature.highlight ? "bg-gradient-to-br from-primary to-primary/70 shadow-primary/20" : "bg-success/15"
                                )}>
                                  <Check className={cn(
                                    "w-4 h-4 md:w-5 md:h-5",
                                    feature.highlight ? "text-primary-foreground" : "text-success"
                                  )} />
                                </div>
                              ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                                  <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" />
                                </div>
                              )
                            ) : (
                              <span className="text-xs md:text-sm font-bold text-primary text-center px-2">
                                {feature.premium}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-center">
                            {typeof feature.ultra === 'boolean' ? (
                              feature.ultra ? (
                                <div className={cn(
                                  "w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center shadow-sm",
                                  feature.highlight ? "bg-gradient-to-br from-amber-500 to-orange-500 shadow-amber-500/20" : "bg-success/15"
                                )}>
                                  <Check className={cn(
                                    "w-4 h-4 md:w-5 md:h-5",
                                    feature.highlight ? "text-white" : "text-success"
                                  )} />
                                </div>
                              ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-muted flex items-center justify-center shadow-sm">
                                  <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground/50" />
                                </div>
                              )
                            ) : (
                              <span className="text-xs md:text-sm font-bold text-foreground text-center px-2">
                                {feature.ultra}
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
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="space-y-6"
          >
            <div className="text-center space-y-3">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                سوالات متداول
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                پاسخ سوالاتی که ممکن است داشته باشید
              </p>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="glass rounded-2xl border border-border/50 px-6 overflow-hidden"
                >
                  <AccordionTrigger className="text-right hover:no-underline py-5">
                    <span className="text-base font-semibold text-foreground pr-2">
                      {faq.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <p className="text-sm text-muted-foreground leading-relaxed pr-2">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>

          {/* Trust Signals & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass-strong rounded-2xl p-8 text-center space-y-6"
          >
            <div className="flex items-center justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-foreground">پرداخت امن</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-foreground">تضمین بازگشت وجه</span>
              </div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">پشتیبانی ۲۴/۷</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              تمام پرداخت‌ها با رمزنگاری SSL انجام می‌شود. اطلاعات شما کاملاً محرمانه و امن است.
              در صورت عدم رضایت، تا ۱۴ روز بعد از خرید می‌توانید درخواست بازگشت کامل وجه بدهید.
            </p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
