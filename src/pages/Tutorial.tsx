import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Logo from '@/components/Logo';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  CheckSquare,
  TrendingUp,
  Brain,
  Calendar,
  Trophy,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Home,
  ListTodo,
  Play,
  BarChart3
} from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  tips: string[];
  action?: {
    label: string;
    route: string;
  };
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'خوش آمدید به Deep Breath',
    description: 'Deep Breath یک سیستم مدیریت زندگی هوشمند است که به شما کمک می‌کند کنترل کامل زندگی خود را در دست بگیرید.',
    icon: Sparkles,
    tips: [
      'تمام وظایف، اهداف، عادت‌ها و برنامه‌های خود را در یک مکان مدیریت کنید',
      'از هوش مصنوعی برای دریافت پیشنهادات شخصی‌سازی شده استفاده کنید',
      'پیشرفت خود را با گزارش‌های تفصیلی پیگیری کنید'
    ]
  },
  {
    id: 'dashboard',
    title: 'داشبورد: نمای کلی روز شما',
    description: 'داشبورد محل اصلی شماست. در اینجا می‌توانید تمام فعالیت‌های روزانه، هفتگی و ماهانه خود را مشاهده کنید.',
    icon: Home,
    tips: [
      'بررسی سریع وظایف امروز و عادت‌های فعال',
      'مشاهده آمار پیشرفت و سطح XP خود',
      'دسترسی به تقویم برای مدیریت زمان',
      'تغییر بین نماهای روزانه، هفتگی، ماهانه و سالانه'
    ],
    action: {
      label: 'رفتن به داشبورد',
      route: '/'
    }
  },
  {
    id: 'tasks',
    title: 'مدیریت وظایف',
    description: 'وظایف خود را ایجاد، سازماندهی و اولویت‌بندی کنید. از ویژگی کشیدن و رها کردن برای مرتب‌سازی استفاده کنید.',
    icon: CheckSquare,
    tips: [
      'وظایف را با اولویت (بالا، متوسط، پایین) ثبت کنید',
      'دسته‌بندی‌های سفارشی برای وظایف مختلف بسازید',
      'زیروظایف اضافه کنید تا پروژه‌های بزرگ را تقسیم کنید',
      'ضرب‌الاجل تعیین کنید و یادآوری دریافت کنید',
      'با تکمیل وظایف XP کسب کنید!'
    ],
    action: {
      label: 'مدیریت وظایف',
      route: '/?tab=tasks'
    }
  },
  {
    id: 'habits',
    title: 'ردیاب عادت‌ها',
    description: 'عادت‌های سالم بسازید و آن‌ها را روزانه پیگیری کنید. استریک‌های خود را حفظ کنید و جوایز کسب کنید.',
    icon: Target,
    tips: [
      'عادت‌های روزانه، هفتگی یا ماهانه تعریف کنید',
      'سطح دشواری و دسته‌بندی مشخص کنید',
      'استریک‌های خود را ببینید و رکورد شخصی بزنید',
      'یادآورهای زمانی برای عادت‌ها تنظیم کنید',
      'با تکمیل عادت‌ها XP بیشتری دریافت کنید'
    ],
    action: {
      label: 'شروع ردیابی عادت‌ها',
      route: '/?tab=habits'
    }
  },
  {
    id: 'goals',
    title: 'اهداف: دلیل زندگی شما',
    description: 'اهداف بلندمدت خود را تعریف کنید و پیشرفت به سمت رویاهایتان را پیگیری کنید.',
    icon: Trophy,
    tips: [
      'اهداف کوتاه‌مدت، میان‌مدت و بلندمدت تعیین کنید',
      'پیشرفت خود را با درصد تکمیل دنبال کنید',
      'نقاط عطف (Milestones) اضافه کنید',
      'تاریخ هدف مشخص کنید برای انگیزه بیشتر',
      'دسته‌بندی‌های مختلف برای اهداف زندگی، کار، سلامت و...'
    ],
    action: {
      label: 'تعریف اهداف',
      route: '/?tab=goals'
    }
  },
  {
    id: 'planning',
    title: 'برنامه‌ریزی هوشمند',
    description: 'برنامه‌های روزانه، هفتگی و ماهانه خود را ایجاد کنید و چک‌لیست‌های کامل داشته باشید.',
    icon: Calendar,
    tips: [
      'برنامه‌های دوره‌ای (روزانه، هفتگی، ماهانه) بسازید',
      'چک‌لیست‌های تفصیلی برای هر برنامه اضافه کنید',
      'تاریخ شروع و پایان تعیین کنید',
      'وضعیت برنامه (فعال، تکمیل شده، متوقف) را مدیریت کنید'
    ],
    action: {
      label: 'شروع برنامه‌ریزی',
      route: '/?tab=planning'
    }
  },
  {
    id: 'focus',
    title: 'حالت تمرکز',
    description: 'از تایمر پومودورو برای افزایش تمرکز و بهره‌وری استفاده کنید.',
    icon: Play,
    tips: [
      'جلسات تمرکز 25 دقیقه‌ای با استراحت 5 دقیقه‌ای',
      'آمار زمان تمرکز خود را ببینید',
      'وظیفه مشخص برای هر جلسه تمرکز انتخاب کنید',
      'با جلسات تمرکز طولانی‌تر XP بیشتری کسب کنید'
    ],
    action: {
      label: 'شروع تمرکز',
      route: '/?tab=focus'
    }
  },
  {
    id: 'ai-coach',
    title: 'مربی هوش مصنوعی',
    description: 'از توصیه‌های شخصی‌سازی شده هوش مصنوعی برای بهبود عملکرد خود بهره ببرید.',
    icon: Brain,
    tips: [
      'تحلیل رفتار و الگوهای شما',
      'پیشنهاد وظایف و عادت‌های جدید',
      'راهنمایی برای بهینه‌سازی زمان',
      'پیام‌های انگیزشی و تشویقی',
      '⭐ ویژگی نسخه پریمیوم'
    ],
    action: {
      label: 'گفتگو با مربی هوش مصنوعی',
      route: '/?tab=ai-coach'
    }
  },
  {
    id: 'analytics',
    title: 'آنالیتیکس و گزارش‌ها',
    description: 'پیشرفت خود را با نمودارها و گزارش‌های تفصیلی پیگیری کنید.',
    icon: BarChart3,
    tips: [
      'نمودار پیشرفت وظایف و عادت‌ها',
      'آمار زمان تمرکز و بهره‌وری',
      'تحلیل عملکرد هفتگی و ماهانه',
      'صدور گزارش PDF از عملکرد خود',
      '⭐ گزارش‌های پیشرفته در نسخه پریمیوم'
    ],
    action: {
      label: 'مشاهده آنالیتیکس',
      route: '/?tab=analytics'
    }
  },
  {
    id: 'gamification',
    title: 'سیستم جوایز و انگیزش',
    description: 'با تکمیل وظایف و عادت‌ها XP کسب کنید، سطح خود را ارتقا دهید و جوایز باز کنید.',
    icon: Sparkles,
    tips: [
      'هر وظیفه و عادت تکمیل شده XP می‌دهد',
      'با افزایش XP، سطح خود را ارتقا دهید',
      'جوایز شخصی تعریف کنید و با XP آن‌ها را باز کنید',
      'استریک‌ها را حفظ کنید تا جوایز بونوس دریافت کنید',
      'دستاوردها را باز کنید و نشان‌ها کسب کنید'
    ],
    action: {
      label: 'مشاهده جوایز',
      route: '/?tab=rewards'
    }
  }
];

export default function Tutorial() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAction = (route: string) => {
    navigate(route);
  };

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;
  const step = tutorialSteps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary/20 to-accent/20 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 opacity-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
      >
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent/30 rounded-full blur-3xl" />
      </motion.div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <Logo size="md" />
          <h1 className="text-2xl font-bold gradient-text mt-4">
            راهنمای کامل Deep Breath
          </h1>
          <p className="text-muted-foreground mt-2">
            آموزش گام‌به‌گام برای استفاده بهینه از برنامه
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              گام {currentStep + 1} از {tutorialSteps.length}
            </span>
            <span className="text-sm font-medium text-primary">
              {Math.round(progress)}% تکمیل
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </motion.div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6 sm:p-8 glass-strong">
              {/* Step Icon & Title */}
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 rounded-2xl gradient-bg-primary">
                  <StepIcon className="w-8 h-8 text-primary-foreground" />
                </div>
                <div className="flex-1 text-right">
                  <h2 className="text-2xl font-bold text-foreground">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Tips List */}
              <div className="space-y-3 mb-6">
                {step.tips.map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50"
                  >
                    <div className="p-1.5 rounded-lg bg-primary/10 mt-0.5">
                      <TrendingUp className="w-4 h-4 text-primary" />
                    </div>
                    <p className="flex-1 text-sm text-foreground leading-relaxed text-right">
                      {tip}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Action Button */}
              {step.action && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <Button
                    onClick={() => handleAction(step.action!.route)}
                    className="w-full h-12 gradient-bg-primary text-base"
                  >
                    <Sparkles className="w-5 h-5 ms-2" />
                    {step.action.label}
                  </Button>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  variant="outline"
                  className="flex-1 h-11"
                >
                  <ArrowLeft className="w-4 h-4 ms-2" />
                  قبلی
                </Button>

                {currentStep === tutorialSteps.length - 1 ? (
                  <Button
                    onClick={() => navigate('/')}
                    className="flex-1 h-11 gradient-bg-primary"
                  >
                    <Home className="w-4 h-4 ms-2" />
                    رفتن به داشبورد
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    className="flex-1 h-11 gradient-bg-primary"
                  >
                    بعدی
                    <ArrowRight className="w-4 h-4 me-2" />
                  </Button>
                )}
              </div>

              {/* Skip Tutorial */}
              <div className="text-center mt-4">
                <button
                  onClick={() => navigate('/')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  رد شدن از آموزش
                </button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Step Indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-2 mt-6"
        >
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentStep
                  ? 'w-8 bg-primary'
                  : index < currentStep
                  ? 'w-2 bg-primary/50'
                  : 'w-2 bg-muted'
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
