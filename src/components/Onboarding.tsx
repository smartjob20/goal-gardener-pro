import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import Logo from '@/components/Logo';
import {
  User,
  Target,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles
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
    id: 'theme',
    title: 'ظاهر دلخواه',
    description: 'تم مورد علاقه خود را انتخاب کنید',
    icon: Palette
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

  const handleComplete = () => {
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

    // Save user info to localStorage
    localStorage.setItem('deepbreath_user_name', userName);
    localStorage.setItem('deepbreath_user_goal', userGoal);
    localStorage.setItem('deepbreath_theme', selectedTheme);
    localStorage.setItem('deepbreath_onboarding_completed', 'true');

    onComplete();
  };

  const canProceed = () => {
    if (currentStep === 0) return userName.trim().length > 0;
    if (currentStep === 1) return userGoal.length > 0;
    return true;
  };

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
                    <RadioGroup value={userGoal} onValueChange={setUserGoal} className="space-y-3">
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

                {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <Label className="text-lg">تم ظاهری:</Label>
                    <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme} className="space-y-3">
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
                  className="flex-1"
                >
                  <ArrowRight className="w-4 h-4 ml-2" />
                  قبلی
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex-1 gradient-bg-primary"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      شروع کنیم!
                    </>
                  ) : (
                    <>
                      بعدی
                      <ArrowLeft className="w-4 h-4 mr-2" />
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
