import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { 
  CheckSquare, 
  Target, 
  Flame, 
  Clock, 
  BarChart3, 
  Gift,
  Sparkles,
  Wind,
  Heart,
  Zap
} from 'lucide-react';

interface WelcomeProps {
  onStart: () => void;
}

const features = [
  {
    icon: CheckSquare,
    title: 'مدیریت وظایف',
    description: 'کارهای روزانه را با آرامش سازماندهی کنید',
    color: 'from-primary to-info'
  },
  {
    icon: Target,
    title: 'تعیین اهداف',
    description: 'اهداف بلندمدت خود را با تمرکز دنبال کنید',
    color: 'from-success to-primary'
  },
  {
    icon: Flame,
    title: 'عادت‌سازی',
    description: 'عادت‌های مثبت بسازید و آن‌ها را حفظ کنید',
    color: 'from-warning to-accent'
  },
  {
    icon: Clock,
    title: 'تمرکز عمیق',
    description: 'با تایمر پومودورو در تمرکز کامل کار کنید',
    color: 'from-accent to-primary'
  },
  {
    icon: BarChart3,
    title: 'آمار پیشرفت',
    description: 'رشد و پیشرفت خود را مشاهده کنید',
    color: 'from-info to-success'
  },
  {
    icon: Gift,
    title: 'پاداش و انگیزه',
    description: 'با سیستم امتیازدهی انگیزه بگیرید',
    color: 'from-primary to-accent'
  }
];

const principles = [
  { icon: Wind, text: 'نفس عمیق بکش' },
  { icon: Heart, text: 'با آرامش زندگی کن' },
  { icon: Zap, text: 'با قدرت پیشرفت کن' }
];

export default function Welcome({ onStart }: WelcomeProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary-light/20 to-accent-light/20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: Math.random() * 200 + 50,
              height: Math.random() * 200 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * 100 - 50],
              x: [0, Math.random() * 100 - 50],
              scale: [1, Math.random() + 0.5, 1],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col items-center justify-center">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl w-full text-center space-y-8"
            >
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="flex justify-center"
              >
                <Logo size="xl" animated={true} />
              </motion.div>

              {/* Hero Text */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
                  زندگی خود را با
                  <span className="gradient-text block mt-2">آرامش و قدرت</span>
                  مدیریت کنید
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                  Deep Breath تجربه‌ای متفاوت از مدیریت زمان است. جایی که آرامش ذهن با کنترل زندگی ترکیب می‌شود.
                </p>
              </motion.div>

              {/* Principles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap justify-center gap-4 py-6"
              >
                {principles.map((principle, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="flex items-center gap-2 px-6 py-3 rounded-full glass-strong hover-lift"
                  >
                    <principle.icon className="w-5 h-5 text-primary" />
                    <span className="font-medium text-foreground">{principle.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
              >
                <Button
                  size="lg"
                  onClick={() => setStep(1)}
                  className="text-lg px-12 py-6 rounded-2xl gradient-bg-primary hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  شروع تجربه
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-muted-foreground"
              >
                نفس عمیق بکش، آماده‌ای؟
              </motion.p>
            </motion.div>
          ) : (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-6xl w-full space-y-8"
            >
              {/* Header */}
              <div className="text-center space-y-4 mb-12">
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-4xl font-bold gradient-text"
                >
                  امکانات Deep Breath
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-lg text-muted-foreground"
                >
                  ابزارهایی که برای موفقیت شما طراحی شده‌اند
                </motion.p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Card className="p-6 h-full glass hover-lift group cursor-pointer border-2 border-transparent hover:border-primary/20 transition-all">
                      <div className="space-y-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-2.5 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <feature.icon className="w-full h-full text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Start Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex justify-center"
              >
                <Button
                  size="lg"
                  onClick={onStart}
                  className="text-lg px-12 py-6 rounded-2xl gradient-bg-primary hover:shadow-2xl hover:scale-105 transition-all duration-300"
                >
                  شروع کنیم
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
