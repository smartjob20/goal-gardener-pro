import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Heart, 
  Zap, 
  Users, 
  Eye,
  Shield,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Star
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Assessment {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  duration: string;
  questions: Question[];
}

interface Question {
  id: string;
  text: string;
  options: { value: number; label: string }[];
}

interface AssessmentResult {
  assessmentId: string;
  scores: Record<string, number>;
  completedAt: string;
}

interface PersonalityAssessmentsProps {
  onBack: () => void;
}

// Professional psychological assessments
const assessments: Assessment[] = [
  {
    id: 'emotional-intelligence',
    title: 'هوش هیجانی',
    description: 'توانایی درک و مدیریت احساسات',
    icon: Heart,
    color: 'from-rose-400 to-pink-500',
    duration: '۵ دقیقه',
    questions: [
      {
        id: 'eq1',
        text: 'وقتی کسی ناراحته، چقدر راحت متوجه میشی؟',
        options: [
          { value: 1, label: 'به ندرت متوجه میشم' },
          { value: 2, label: 'گاهی متوجه میشم' },
          { value: 3, label: 'اغلب متوجه میشم' },
          { value: 4, label: 'همیشه متوجه میشم' }
        ]
      },
      {
        id: 'eq2',
        text: 'وقتی عصبانی میشی، چطور واکنش نشون میدی؟',
        options: [
          { value: 1, label: 'فوراً واکنش نشون میدم' },
          { value: 2, label: 'سعی میکنم کنترل کنم ولی سخته' },
          { value: 3, label: 'معمولاً آروم میمونم' },
          { value: 4, label: 'همیشه آرامشم رو حفظ میکنم' }
        ]
      },
      {
        id: 'eq3',
        text: 'چقدر احساساتت رو به دیگران ابراز میکنی؟',
        options: [
          { value: 1, label: 'خیلی کم' },
          { value: 2, label: 'فقط با نزدیکان' },
          { value: 3, label: 'نسبتاً راحت' },
          { value: 4, label: 'خیلی راحت' }
        ]
      },
      {
        id: 'eq4',
        text: 'وقتی استرس داری، چطور مدیریتش میکنی؟',
        options: [
          { value: 1, label: 'نمیتونم کنترلش کنم' },
          { value: 2, label: 'به سختی کنترل میکنم' },
          { value: 3, label: 'روش‌هایی دارم' },
          { value: 4, label: 'کاملاً مدیریت میکنم' }
        ]
      },
      {
        id: 'eq5',
        text: 'چقدر به نیازهای عاطفی دیگران توجه میکنی؟',
        options: [
          { value: 1, label: 'کمتر توجه میکنم' },
          { value: 2, label: 'گاهی' },
          { value: 3, label: 'اغلب' },
          { value: 4, label: 'همیشه' }
        ]
      }
    ]
  },
  {
    id: 'stress-resilience',
    title: 'تاب‌آوری در برابر استرس',
    description: 'توانایی مقابله با فشارها',
    icon: Shield,
    color: 'from-blue-400 to-cyan-500',
    duration: '۴ دقیقه',
    questions: [
      {
        id: 'sr1',
        text: 'وقتی با مشکلی مواجه میشی، اولین واکنشت چیه؟',
        options: [
          { value: 1, label: 'احساس ناامیدی میکنم' },
          { value: 2, label: 'نگران میشم' },
          { value: 3, label: 'دنبال راه‌حل میگردم' },
          { value: 4, label: 'به عنوان چالش میبینمش' }
        ]
      },
      {
        id: 'sr2',
        text: 'بعد از یک شکست، چقدر طول میکشه تا برگردی؟',
        options: [
          { value: 1, label: 'خیلی طول میکشه' },
          { value: 2, label: 'چند روز' },
          { value: 3, label: 'یک روز' },
          { value: 4, label: 'سریع برمیگردم' }
        ]
      },
      {
        id: 'sr3',
        text: 'چطور با تغییرات ناگهانی کنار میای؟',
        options: [
          { value: 1, label: 'خیلی سخته' },
          { value: 2, label: 'نیاز به زمان دارم' },
          { value: 3, label: 'نسبتاً خوب' },
          { value: 4, label: 'راحت سازگار میشم' }
        ]
      },
      {
        id: 'sr4',
        text: 'وقتی تحت فشار هستی، کیفیت کارت چطوره؟',
        options: [
          { value: 1, label: 'خیلی افت میکنه' },
          { value: 2, label: 'کمی افت میکنه' },
          { value: 3, label: 'ثابت میمونه' },
          { value: 4, label: 'بهتر میشه' }
        ]
      }
    ]
  },
  {
    id: 'social-style',
    title: 'سبک ارتباطی',
    description: 'نحوه تعامل با دیگران',
    icon: Users,
    color: 'from-purple-400 to-violet-500',
    duration: '۴ دقیقه',
    questions: [
      {
        id: 'ss1',
        text: 'در جمع‌های اجتماعی چه حسی داری؟',
        options: [
          { value: 1, label: 'معذب میشم' },
          { value: 2, label: 'ترجیح میدم تنها باشم' },
          { value: 3, label: 'راحتم' },
          { value: 4, label: 'انرژی میگیرم' }
        ]
      },
      {
        id: 'ss2',
        text: 'وقتی با کسی مخالفی، چطور بیان میکنی؟',
        options: [
          { value: 1, label: 'نمیگم' },
          { value: 2, label: 'غیرمستقیم' },
          { value: 3, label: 'مستقیم ولی مودبانه' },
          { value: 4, label: 'کاملاً صریح' }
        ]
      },
      {
        id: 'ss3',
        text: 'چقدر راحت با غریبه‌ها صحبت میکنی؟',
        options: [
          { value: 1, label: 'خیلی سخته' },
          { value: 2, label: 'کمی معذبم' },
          { value: 3, label: 'نسبتاً راحت' },
          { value: 4, label: 'خیلی راحت' }
        ]
      },
      {
        id: 'ss4',
        text: 'ترجیح میدی رهبری کنی یا پیروی؟',
        options: [
          { value: 1, label: 'ترجیحاً پیروی' },
          { value: 2, label: 'بستگی داره' },
          { value: 3, label: 'اغلب رهبری' },
          { value: 4, label: 'همیشه رهبری' }
        ]
      }
    ]
  },
  {
    id: 'self-awareness',
    title: 'خودآگاهی',
    description: 'شناخت از خود و ارزش‌ها',
    icon: Eye,
    color: 'from-amber-400 to-orange-500',
    duration: '۵ دقیقه',
    questions: [
      {
        id: 'sa1',
        text: 'چقدر نقاط قوت و ضعفت رو میشناسی؟',
        options: [
          { value: 1, label: 'خیلی کم' },
          { value: 2, label: 'تا حدی' },
          { value: 3, label: 'خوب' },
          { value: 4, label: 'کاملاً' }
        ]
      },
      {
        id: 'sa2',
        text: 'وقتی اشتباه میکنی، چطور برخورد میکنی؟',
        options: [
          { value: 1, label: 'انکار میکنم' },
          { value: 2, label: 'توجیه میکنم' },
          { value: 3, label: 'قبول میکنم' },
          { value: 4, label: 'ازش یاد میگیرم' }
        ]
      },
      {
        id: 'sa3',
        text: 'چقدر ارزش‌های زندگیت رو میشناسی؟',
        options: [
          { value: 1, label: 'مطمئن نیستم' },
          { value: 2, label: 'تا حدی' },
          { value: 3, label: 'خوب میشناسم' },
          { value: 4, label: 'کاملاً واضحن' }
        ]
      },
      {
        id: 'sa4',
        text: 'چقدر به حرف دیگران درباره خودت گوش میدی؟',
        options: [
          { value: 1, label: 'اهمیت نمیدم' },
          { value: 2, label: 'گاهی' },
          { value: 3, label: 'اغلب' },
          { value: 4, label: 'همیشه فکر میکنم' }
        ]
      },
      {
        id: 'sa5',
        text: 'چقدر تأثیر رفتارت روی دیگران رو درک میکنی؟',
        options: [
          { value: 1, label: 'کمتر فکر میکنم' },
          { value: 2, label: 'گاهی' },
          { value: 3, label: 'اغلب' },
          { value: 4, label: 'همیشه' }
        ]
      }
    ]
  },
  {
    id: 'motivation-drive',
    title: 'انگیزه و پیشران',
    description: 'عوامل محرک درونی',
    icon: Zap,
    color: 'from-green-400 to-emerald-500',
    duration: '۴ دقیقه',
    questions: [
      {
        id: 'md1',
        text: 'چی بیشتر انگیزه‌ات میشه؟',
        options: [
          { value: 1, label: 'اجبار و الزام' },
          { value: 2, label: 'پاداش بیرونی' },
          { value: 3, label: 'رضایت درونی' },
          { value: 4, label: 'رشد و پیشرفت' }
        ]
      },
      {
        id: 'md2',
        text: 'وقتی به هدفی نمیرسی، چه میکنی؟',
        options: [
          { value: 1, label: 'دست میکشم' },
          { value: 2, label: 'ناامید میشم' },
          { value: 3, label: 'دوباره تلاش میکنم' },
          { value: 4, label: 'روش جدید پیدا میکنم' }
        ]
      },
      {
        id: 'md3',
        text: 'صبح‌ها با چه حسی بیدار میشی؟',
        options: [
          { value: 1, label: 'بی‌انگیزه' },
          { value: 2, label: 'معمولی' },
          { value: 3, label: 'با انرژی' },
          { value: 4, label: 'مشتاق روز جدید' }
        ]
      },
      {
        id: 'md4',
        text: 'چقدر برای اهدافت برنامه‌ریزی میکنی؟',
        options: [
          { value: 1, label: 'اصلاً' },
          { value: 2, label: 'کمی' },
          { value: 3, label: 'معمولاً' },
          { value: 4, label: 'همیشه دقیق' }
        ]
      }
    ]
  }
];

const getResultInterpretation = (assessmentId: string, score: number, maxScore: number) => {
  const percentage = (score / maxScore) * 100;
  
  const interpretations: Record<string, { low: string; medium: string; high: string; veryHigh: string }> = {
    'emotional-intelligence': {
      low: 'هوش هیجانی تو در حال رشده. با تمرین و توجه بیشتر به احساسات، میتونی قوی‌ترش کنی.',
      medium: 'درک خوبی از احساسات داری. با کمی تمرین بیشتر، میتونی استاد مدیریت هیجانات بشی.',
      high: 'هوش هیجانی بالایی داری! احساسات رو خوب میفهمی و مدیریت میکنی.',
      veryHigh: 'تو یه نابغه هیجانی هستی! درک عمیقی از احساسات خودت و دیگران داری.'
    },
    'stress-resilience': {
      low: 'تاب‌آوری تو جا داره که رشد کنه. نگران نباش، این یه مهارته که میشه یادش گرفت.',
      medium: 'تاب‌آوری متوسطی داری. با تمرین، میتونی قوی‌تر بشی.',
      high: 'تاب‌آوری خوبی داری! با فشارها خوب کنار میای.',
      veryHigh: 'مثل یه سنگ صبوری! هیچ چیز نمیتونه تو رو از پا دربیاره.'
    },
    'social-style': {
      low: 'ترجیح میدی تنها باشی و این کاملاً طبیعیه. هر سبکی ارزشمنده.',
      medium: 'تعادل خوبی بین تنهایی و اجتماعی بودن داری.',
      high: 'ارتباطات اجتماعی قوی داری و از معاشرت لذت میبری.',
      veryHigh: 'تو یه پروانه اجتماعی هستی! انرژیت از بودن با دیگران میاد.'
    },
    'self-awareness': {
      low: 'سفر خودشناسی تازه شروع شده. قدم به قدم خودت رو بیشتر کشف میکنی.',
      medium: 'درک خوبی از خودت داری. ادامه بده!',
      high: 'خودآگاهی بالایی داری و خوب خودت رو میشناسی.',
      veryHigh: 'خودشناسی عمیقی داری! این یه قدرت بزرگه.'
    },
    'motivation-drive': {
      low: 'انگیزه‌ات نیاز به تقویت داره. بیا با هم پیداش کنیم!',
      medium: 'انگیزه متوسطی داری. با کشف اهداف واقعیت، قوی‌تر میشه.',
      high: 'انگیزه خوبی داری و میدونی چی میخوای.',
      veryHigh: 'آتشفشان انگیزه! هیچ چیز جلودارت نیست.'
    }
  };

  const interp = interpretations[assessmentId] || interpretations['emotional-intelligence'];
  
  if (percentage < 40) return interp.low;
  if (percentage < 60) return interp.medium;
  if (percentage < 80) return interp.high;
  return interp.veryHigh;
};

const PersonalityAssessments = ({ onBack }: PersonalityAssessmentsProps) => {
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [completedAssessments, setCompletedAssessments] = useState<AssessmentResult[]>([]);

  const handleStartAssessment = (assessment: Assessment) => {
    setActiveAssessment(assessment);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setShowResult(false);
  };

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (activeAssessment && currentQuestionIndex < activeAssessment.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Finish assessment
      setShowResult(true);
      if (activeAssessment) {
        const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
        setCompletedAssessments(prev => [...prev, {
          assessmentId: activeAssessment.id,
          scores: { total: totalScore },
          completedAt: new Date().toISOString()
        }]);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleRetake = () => {
    if (activeAssessment) {
      setCurrentQuestionIndex(0);
      setAnswers({});
      setShowResult(false);
    }
  };

  const handleBackToList = () => {
    setActiveAssessment(null);
    setShowResult(false);
    setAnswers({});
    setCurrentQuestionIndex(0);
  };

  const calculateScore = () => {
    return Object.values(answers).reduce((sum, val) => sum + val, 0);
  };

  const getMaxScore = () => {
    return activeAssessment ? activeAssessment.questions.length * 4 : 0;
  };

  const getScorePercentage = () => {
    const max = getMaxScore();
    return max > 0 ? (calculateScore() / max) * 100 : 0;
  };

  const isAssessmentCompleted = (assessmentId: string) => {
    return completedAssessments.some(a => a.assessmentId === assessmentId);
  };

  // Assessment List View
  const renderAssessmentList = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div />
        <h2 className="text-sm font-medium text-foreground">ارزیابی شخصیت</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {/* Intro Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6"
        >
          <Card className="p-5 rounded-3xl bg-gradient-to-br from-primary/10 to-purple-500/10 border-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
              <div className="text-right flex-1">
                <h3 className="font-semibold text-foreground">خودت رو بشناس</h3>
                <p className="text-xs text-muted-foreground">تست‌های علمی برای کشف شخصیتت</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-right leading-relaxed">
              این ارزیابی‌ها کمکت میکنن خودت رو بهتر بشناسی. بدون قضاوت، فقط برای کشف و رشد.
            </p>
          </Card>
        </motion.div>

        {/* Assessment Cards */}
        <div className="space-y-3">
          {assessments.map((assessment, index) => {
            const Icon = assessment.icon;
            const completed = isAssessmentCompleted(assessment.id);
            
            return (
              <motion.div
                key={assessment.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`p-4 rounded-2xl border-0 cursor-pointer transition-all hover:shadow-lg ${
                    completed ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' : 'bg-muted/30 hover:bg-muted/50'
                  }`}
                  onClick={() => handleStartAssessment(assessment)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 bg-gradient-to-br ${assessment.color} text-white shadow-lg`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        {completed && (
                          <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-600">
                            <CheckCircle2 className="w-3 h-3 me-1" />
                            انجام شده
                          </Badge>
                        )}
                        <h3 className="font-semibold text-foreground">{assessment.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{assessment.description}</p>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs text-muted-foreground">{assessment.questions.length} سوال</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{assessment.duration}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Completed Stats */}
        {completedAssessments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Card className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-amber-600" />
                </div>
                <div className="text-right flex-1">
                  <p className="text-sm font-medium text-foreground">
                    {completedAssessments.length} از {assessments.length} ارزیابی تکمیل شده
                  </p>
                  <Progress 
                    value={(completedAssessments.length / assessments.length) * 100} 
                    className="h-2 mt-2"
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </ScrollArea>
    </motion.div>
  );

  // Question View
  const renderQuestion = () => {
    if (!activeAssessment) return null;
    
    const currentQuestion = activeAssessment.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / activeAssessment.questions.length) * 100;
    const isAnswered = answers[currentQuestion.id] !== undefined;
    const Icon = activeAssessment.icon;

    return (
      <motion.div
        key={currentQuestionIndex}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">
              {currentQuestionIndex + 1} از {activeAssessment.questions.length}
            </span>
            <div className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">{activeAssessment.title}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToList}
              className="h-8 w-8"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Question */}
        <div className="flex-1 flex flex-col justify-center px-4 py-6">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${activeAssessment.color} flex items-center justify-center text-white shadow-lg`}>
              <span className="text-2xl font-bold">{currentQuestionIndex + 1}</span>
            </div>
            <h2 className="text-lg font-semibold text-foreground leading-relaxed">
              {currentQuestion.text}
            </h2>
          </motion.div>

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <motion.button
                key={option.value}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
                className={`w-full p-4 rounded-2xl text-right transition-all ${
                  answers[currentQuestion.id] === option.value
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'bg-muted/50 hover:bg-muted text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    answers[currentQuestion.id] === option.value
                      ? 'bg-white/20'
                      : 'bg-muted'
                  }`}>
                    <span className="text-sm font-medium">{option.value}</span>
                  </div>
                  <span className="text-sm font-medium">{option.label}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="px-4 py-4 border-t border-border/50">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 h-12 rounded-xl"
            >
              <ChevronRight className="w-4 h-4 me-1" />
              قبلی
            </Button>
            <Button
              onClick={handleNext}
              disabled={!isAnswered}
              className="flex-1 h-12 rounded-xl"
            >
              {currentQuestionIndex === activeAssessment.questions.length - 1 ? 'نتیجه' : 'بعدی'}
              <ChevronLeft className="w-4 h-4 ms-1" />
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  // Result View
  const renderResult = () => {
    if (!activeAssessment) return null;
    
    const score = calculateScore();
    const maxScore = getMaxScore();
    const percentage = getScorePercentage();
    const Icon = activeAssessment.icon;
    const interpretation = getResultInterpretation(activeAssessment.id, score, maxScore);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div />
          <h2 className="text-sm font-medium text-foreground">نتیجه ارزیابی</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToList}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          {/* Score Display */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-6"
          >
            <div className={`w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br ${activeAssessment.color} flex items-center justify-center text-white shadow-xl`}>
              <Icon className="w-12 h-12" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">{activeAssessment.title}</h2>
            <div className="flex items-center justify-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-6 h-6 ${i < Math.round(percentage / 20) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} 
                />
              ))}
            </div>
          </motion.div>

          {/* Score Card */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-5 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border-0 mb-4">
              <div className="text-center mb-4">
                <span className="text-4xl font-bold text-primary">{Math.round(percentage)}%</span>
                <p className="text-sm text-muted-foreground mt-1">{score} از {maxScore} امتیاز</p>
              </div>
              <Progress value={percentage} className="h-3 mb-4" />
              <p className="text-sm text-foreground text-right leading-relaxed">
                {interpretation}
              </p>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <Button
              variant="outline"
              onClick={handleRetake}
              className="w-full h-12 rounded-xl"
            >
              <RotateCcw className="w-4 h-4 me-2" />
              تکرار ارزیابی
            </Button>
            <Button
              onClick={handleBackToList}
              className="w-full h-12 rounded-xl"
            >
              <Sparkles className="w-4 h-4 me-2" />
              ارزیابی‌های دیگر
            </Button>
          </motion.div>
        </ScrollArea>
      </motion.div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <AnimatePresence mode="wait">
        {!activeAssessment && renderAssessmentList()}
        {activeAssessment && !showResult && renderQuestion()}
        {activeAssessment && showResult && renderResult()}
      </AnimatePresence>
    </div>
  );
};

export default PersonalityAssessments;
