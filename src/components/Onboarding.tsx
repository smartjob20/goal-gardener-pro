import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Logo from '@/components/Logo';
import OnboardingTrial from '@/components/OnboardingTrial';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { triggerHaptic } from '@/utils/haptics';
import {
  User,
  Target,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Crown
} from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    id: 'welcome',
    title: 'خوش آمدید!',
    description: 'بیایید شما را بهتر بشناسیم',
    icon: User
  },
  {
    id: 'goals',
    title: 'هدف شما چیست؟',
    description: 'می‌خواهید روی چه چیزی تمرکز کنید؟',
    icon: Target
  },
  {
    id: 'breathe',
    title: 'نفس عمیق بکشید',
    description: 'یک لحظه استراحت',
    icon: Sparkles
  },
  {
    id: 'theme',
    title: 'ظاهر دلخواه',
    description: 'تم مورد علاقه خود را انتخاب کنید',
    icon: Palette
  },
  {
    id: 'trial',
    title: 'هدیه خوش‌آمدگویی',
    description: 'دریافت ۳۰ روز دسترسی رایگان',
    icon: Crown
  }
];

const goalOptions = [
  { value: 'productivity', label: 'افزایش بهره‌وری', emoji: '🚀' },
  { value: 'habits', label: 'ایجاد عادت‌های سالم', emoji: '🌱' },
  { value: 'balance', label: 'تعادل زندگی و کار', emoji: '⚖️' },
  { value: 'focus', label: 'بهبود تمرکز', emoji: '🎯' }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState('');
  const [userGoal, setUserGoal] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('system');
  const [breathingText, setBreathingText] = useState('ابتدا، یک نفس عمیق بکشیم...');

  // Load saved data on mount (migration-safe fallback to localStorage)
  useEffect(() => {
    const loadSavedData = async () => {
      const savedName = await storage.get(STORAGE_KEYS.USER_NAME) || localStorage.getItem(STORAGE_KEYS.USER_NAME);
      const savedGoal = await storage.get(STORAGE_KEYS.USER_GOAL) || localStorage.getItem(STORAGE_KEYS.USER_GOAL);
      const savedTheme = await storage.get(STORAGE_KEYS.THEME) || localStorage.getItem(STORAGE_KEYS.THEME);
      
      if (savedName) setUserName(savedName);
      if (savedGoal) setUserGoal(savedGoal);
      if (savedTheme) setSelectedTheme(savedTheme);
    };
    loadSavedData();
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    // Save user preferences
    const root = document.documentElement;
    if (selectedTheme === 'dark') {
      root.classList.add('dark');
    } else if (selectedTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }

    // Save to Capacitor Preferences (permanent storage)
    await storage.set(STORAGE_KEYS.USER_NAME, userName);
    await storage.set(STORAGE_KEYS.USER_GOAL, userGoal);
    await storage.set(STORAGE_KEYS.THEME, selectedTheme);
    await storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

    // Also save to localStorage for web compatibility
    localStorage.setItem(STORAGE_KEYS.USER_NAME, userName);
    localStorage.setItem(STORAGE_KEYS.USER_GOAL, userGoal);
    localStorage.setItem(STORAGE_KEYS.THEME, selectedTheme);
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

    // Success haptic
    await triggerHaptic('success');

    onComplete();
  };

  const handleGoalSelection = async (goal: string) => {
    setUserGoal(goal);
    await triggerHaptic('light');
  };

  const handleThemeSelection = async (theme: string) => {
    setSelectedTheme(theme);
    await triggerHaptic('light');
  };

  const canProceed = () => {
    if (currentStep === 0) return userName.trim().length > 0;
    if (currentStep === 1) return userGoal.length > 0;
    if (currentStep === 2) return false; // Breathing step (auto-advances)
    if (currentStep === 3) return selectedTheme.length > 0; // Theme step
    if (currentStep === 4) return false; // Trial step (has its own button)
    return true;
  };

  // Breathing animation step
  useEffect(() => {
    if (currentStep === 2) {
      // Change text after 5 seconds
      const textTimer = setTimeout(() => {
        setBreathingText('آرامش را احساس می‌کنید؟');
      }, 5000);

      // Auto-advance to paywall after 10 seconds
      const advanceTimer = setTimeout(() => {
        handleNext();
      }, 10000);

      return () => {
        clearTimeout(textTimer);
        clearTimeout(advanceTimer);
      };
    }
  }, [currentStep]);

  // Show breathing step as full screen
  if (currentStep === 2) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary-light/30 to-accent-light/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8"
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex justify-center"
          >
            <Logo size="xl" />
          </motion.div>
          <motion.p
            key={breathingText}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-medium text-foreground"
          >
            {breathingText}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Show trial claim page as full screen
  if (currentStep === 4) {
    return <OnboardingTrial onComplete={handleComplete} />;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary-light/30 to-accent-light/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-8"
        >
          <Logo size="lg" />
        </motion.div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: index <= currentStep ? 1 : 0.8,
                    opacity: index <= currentStep ? 1 : 0.5
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    index <= currentStep
                      ? 'gradient-bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: index < currentStep ? '100%' : '0%' }}
                      className="h-full gradient-bg-primary"
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              مرحله {currentStep + 1} از {steps.length}
            </p>
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-8 glass-strong space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold gradient-text">
                  {steps[currentStep].title}
                </h2>
                <p className="text-muted-foreground text-lg">
                  {steps[currentStep].description}
                </p>
              </div>

              <div className="py-6">
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Label htmlFor="name" className="text-lg">
                      نام شما چیست؟
                    </Label>
                    <Input
                      id="name"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="نام خود را وارد کنید..."
                      className="text-lg py-6 text-center border-2 focus:border-primary"
                      autoFocus
                      onFocus={(e) => {
                        // Scroll input into view on mobile to prevent keyboard covering
                        setTimeout(() => {
                          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 300);
                      }}
                    />
                    <p className="text-sm text-muted-foreground text-center">
                      این نام در پیام‌های شخصی‌سازی شده استفاده می‌شود
                    </p>
                  </motion.div>
                )}

                {currentStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Label className="text-lg">هدف اصلی خود را انتخاب کنید:</Label>
                    <RadioGroup value={userGoal} onValueChange={handleGoalSelection} className="space-y-3">
                      {goalOptions.map((option) => (
                        <motion.div
                          key={option.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor={option.value}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              userGoal === option.value
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={option.value} id={option.value} />
                            <span className="text-3xl">{option.emoji}</span>
                            <span className="text-lg font-medium flex-1">{option.label}</span>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Label className="text-lg">تم ظاهری:</Label>
                    <RadioGroup value={selectedTheme} onValueChange={handleThemeSelection} className="space-y-3">
                      {[
                        { value: 'light', label: 'روشن', emoji: '☀️' },
                        { value: 'dark', label: 'تاریک', emoji: '🌙' },
                        { value: 'system', label: 'خودکار (بر اساس سیستم)', emoji: '💻' }
                      ].map((theme) => (
                        <motion.div
                          key={theme.value}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Label
                            htmlFor={theme.value}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedTheme === theme.value
                                ? 'border-primary bg-primary/5 shadow-md'
                                : 'border-border hover:border-primary/50'
                            }`}
                          >
                            <RadioGroupItem value={theme.value} id={theme.value} />
                            <span className="text-2xl">{theme.emoji}</span>
                            <span className="text-lg font-medium flex-1">{theme.label}</span>
                          </Label>
                        </motion.div>
                      ))}
                    </RadioGroup>
                  </motion.div>
                )}
              </div>

              <div className="flex justify-between gap-4 pt-4">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="flex-1 min-h-[44px]"
                >
                  <ArrowLeft className="w-4 h-4 ms-2" />
                  قبلی
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 gradient-bg-primary min-h-[44px]"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Sparkles className="w-4 h-4 me-2" />
                      شروع کنیم!
                    </>
                  ) : (
                    <>
                      بعدی
                      <ArrowRight className="w-4 h-4 me-2" />
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
