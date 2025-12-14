import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Heart, 
  Brain, 
  Target, 
  Compass,
  Sun,
  Moon,
  Send,
  ArrowLeft,
  Lightbulb,
  TrendingUp,
  Shield,
  Zap,
  MessageCircle,
  BookOpen,
  Star,
  ChevronLeft,
  Loader2,
  ClipboardList,
  Feather
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import PersonalityAssessments from './PersonalityAssessments';
import GuidedDiscovery from './GuidedDiscovery';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'question' | 'insight' | 'encouragement' | 'action' | 'reflection';
  created_at: string;
}

interface JourneyStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  completed: boolean;
}

const PersonalGrowth = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<'home' | 'session' | 'insights' | 'journey' | 'assessments' | 'discovery'>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [currentMood, setCurrentMood] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const moods = [
    { emoji: '😊', label: 'عالی', value: 'great', color: 'from-green-400/20 to-emerald-400/20' },
    { emoji: '🙂', label: 'خوب', value: 'good', color: 'from-blue-400/20 to-cyan-400/20' },
    { emoji: '😐', label: 'معمولی', value: 'normal', color: 'from-amber-400/20 to-yellow-400/20' },
    { emoji: '😔', label: 'ناراحت', value: 'sad', color: 'from-purple-400/20 to-violet-400/20' },
    { emoji: '😰', label: 'مضطرب', value: 'anxious', color: 'from-red-400/20 to-rose-400/20' },
  ];

  const journeySteps: JourneyStep[] = [
    { id: '1', title: 'شناخت خود', description: 'کشف ارزش‌ها و باورها', icon: Brain, color: 'from-purple-400 to-violet-500', completed: true },
    { id: '2', title: 'پذیرش', description: 'آغوش گرفتن واقعیت', icon: Heart, color: 'from-rose-400 to-pink-500', completed: true },
    { id: '3', title: 'تعیین مسیر', description: 'انتخاب اهداف معنادار', icon: Compass, color: 'from-blue-400 to-cyan-500', completed: false },
    { id: '4', title: 'اقدام', description: 'گام‌های عملی روزانه', icon: Zap, color: 'from-amber-400 to-orange-500', completed: false },
    { id: '5', title: 'رشد', description: 'تحول و شکوفایی', icon: TrendingUp, color: 'from-green-400 to-emerald-500', completed: false },
  ];

  const quickPrompts = [
    { icon: Heart, text: 'احساسم رو درک کن', prompt: 'میخوام درباره احساساتم صحبت کنم و کمکم کنی بهتر درکشون کنم.' },
    { icon: Target, text: 'هدفم رو پیدا کنم', prompt: 'میخوام کمکم کنی هدف واقعیم توی زندگی رو پیدا کنم.' },
    { icon: Shield, text: 'ترسم رو بشناسم', prompt: 'یه ترس یا نگرانی دارم که میخوام باهاش کنار بیام.' },
    { icon: Lightbulb, text: 'تصمیم مهم دارم', prompt: 'یه تصمیم مهم جلوم هست و نمیدونم چیکار کنم.' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startSession = async (mood: string) => {
    setCurrentMood(mood);
    setSessionStarted(true);
    setActiveView('session');
    
    const moodLabel = moods.find(m => m.value === mood)?.label || mood;
    
    // Initial AI message based on mood
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: getInitialMessage(mood),
      type: 'question',
      created_at: new Date().toISOString()
    };
    
    setMessages([initialMessage]);
  };

  const getInitialMessage = (mood: string): string => {
    const messages: Record<string, string> = {
      great: 'چه خوب که امروز حالت عالیه! 🌟\n\nبیا از این انرژی خوب استفاده کنیم. چی باعث شده امروز اینقدر خوب باشی؟ میخوام بیشتر بشناسمت...',
      good: 'خوشحالم که حالت خوبه! 😊\n\nامروز دوست داری درباره چی صحبت کنیم؟ هر چیزی که توی ذهنته، اینجا جای امنیه برای گفتنش.',
      normal: 'ممنون که صادقانه گفتی. 🤝\n\nروزهای معمولی هم بخشی از زندگین. چیزی هست که ذهنت رو مشغول کرده باشه؟',
      sad: 'اینجام و گوش میدم. 💙\n\nمیدونم که سخته، ولی خوشحالم که اومدی اینجا. میخوای بگی چی ناراحتت کرده؟ بدون هیچ قضاوتی، فقط گوش میدم.',
      anxious: 'نفس عمیق بکش، اینجا امنه. 🌿\n\nاضطراب سخته، ولی تنها نیستی. میخوای بگی چی نگرانت کرده؟ با هم پیداش میکنیم و راهش رو پیدا میکنیم.'
    };
    return messages[mood] || messages.normal;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('personal-growth-coach', {
        body: {
          message: content,
          mood: currentMood,
          chatHistory: messages.slice(-10),
          userId: user?.id
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || 'متوجه نشدم، میتونی بیشتر توضیح بدی؟',
        type: data.type || 'reflection',
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "خطا",
        description: "مشکلی پیش اومد، دوباره تلاش کن",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // Home View
  const renderHome = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Hero Section */}
      <div className="relative px-4 pt-8 pb-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center"
        >
          <Sparkles className="w-10 h-10 text-primary" />
        </motion.div>
        
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-foreground mb-2"
        >
          شناخت و توسعه فردی
        </motion.h1>
        
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto"
        >
          اینجا، تو مهم‌ترینی. با هم سفر میکنیم به عمق وجودت، تا بهترین نسخه خودت رو کشف کنی.
        </motion.p>
      </div>

      {/* Mood Check */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="px-4 mb-6"
      >
        <Card className="p-5 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/20 border-0 shadow-lg">
          <p className="text-center text-sm font-medium text-foreground mb-4">
            امروز چطوری؟
          </p>
          <div className="flex justify-center gap-2">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.value}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => startSession(mood.value)}
                className={`flex flex-col items-center p-3 rounded-2xl bg-gradient-to-br ${mood.color} hover:shadow-md transition-all`}
              >
                <span className="text-2xl mb-1">{mood.emoji}</span>
                <span className="text-xs text-muted-foreground">{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="px-4 mb-6"
      >
        <h3 className="text-sm font-medium text-muted-foreground mb-3 text-right">
          یا مستقیم شروع کن...
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {quickPrompts.map((item, index) => (
            <motion.button
              key={index}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setCurrentMood('normal');
                setSessionStarted(true);
                setActiveView('session');
                setMessages([{
                  id: Date.now().toString(),
                  role: 'assistant',
                  content: 'سلام! خوشحالم که اینجایی. 💙\n\nمن اینجام که بدون هیچ قضاوتی گوش بدم و کمکت کنم. هر چی توی دلته بگو...',
                  type: 'question',
                  created_at: new Date().toISOString()
                }]);
                setTimeout(() => sendMessage(item.prompt), 1000);
              }}
              className="flex items-center gap-3 p-4 rounded-2xl bg-background border border-border/50 hover:border-primary/30 hover:bg-muted/30 transition-all text-right"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Guided Discovery Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.85 }}
        className="px-4 mb-4"
      >
        <Card 
          className="p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-cyan-500/10 border-0 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setActiveView('discovery')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white shadow-lg">
              <Feather className="w-7 h-7" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-semibold text-foreground mb-1">کاوش درونی</h3>
              <p className="text-sm text-muted-foreground">وقتی یه حسی داری ولی نمیدونی چیه...</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Personality Assessment Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="px-4 mb-6"
      >
        <Card 
          className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-0 cursor-pointer hover:shadow-lg transition-all"
          onClick={() => setActiveView('assessments')}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400 to-violet-500 flex items-center justify-center text-white shadow-lg">
              <ClipboardList className="w-7 h-7" />
            </div>
            <div className="flex-1 text-right">
              <h3 className="font-semibold text-foreground mb-1">تست‌های شخصیت‌شناسی</h3>
              <p className="text-sm text-muted-foreground">خودت رو بهتر بشناس با ارزیابی‌های علمی</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Journey Progress */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="px-4 flex-1"
      >
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveView('journey')}
            className="text-xs text-primary"
          >
            مشاهده کامل
          </Button>
          <h3 className="text-sm font-medium text-muted-foreground">مسیر رشد من</h3>
        </div>
        
        <Card className="p-4 rounded-2xl bg-gradient-to-br from-background to-muted/20 border-0 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            {journeySteps.map((step, index) => (
              <div key={step.id} className="flex-1 flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  step.completed 
                    ? 'bg-gradient-to-br ' + step.color + ' text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step.completed ? (
                    <Star className="w-3 h-3" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                {index < journeySteps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${
                    step.completed ? 'bg-primary/50' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center">
            در مرحله <span className="text-primary font-medium">تعیین مسیر</span> هستی
          </p>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Session View
  const renderSession = () => (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          {currentMood && (
            <span className="text-lg">
              {moods.find(m => m.value === currentMood)?.emoji}
            </span>
          )}
        </div>
        <h2 className="text-sm font-medium text-foreground">گفتگو</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setActiveView('home');
            setSessionStarted(false);
            setMessages([]);
          }}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-bl-md'
                    : 'bg-muted/70 text-foreground rounded-2xl rounded-br-md'
                } px-4 py-3`}>
                  {message.type && message.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      {message.type === 'question' && <MessageCircle className="w-3 h-3 text-primary" />}
                      {message.type === 'insight' && <Lightbulb className="w-3 h-3 text-amber-500" />}
                      {message.type === 'encouragement' && <Heart className="w-3 h-3 text-rose-500" />}
                      {message.type === 'action' && <Target className="w-3 h-3 text-green-500" />}
                      {message.type === 'reflection' && <Brain className="w-3 h-3 text-purple-500" />}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap text-right">
                    {message.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-end"
            >
              <div className="bg-muted/70 rounded-2xl rounded-br-md px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">در حال فکر کردن</span>
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-end gap-2">
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || loading}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="هر چی توی دلته بگو..."
            className="min-h-[48px] max-h-[120px] resize-none rounded-2xl border-0 bg-muted/50 text-right"
            dir="rtl"
          />
        </div>
      </div>
    </motion.div>
  );

  // Journey View
  const renderJourney = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div />
        <h2 className="text-sm font-medium text-foreground">مسیر رشد من</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setActiveView('home')}
          className="h-8 w-8"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-6">
        <div className="space-y-4">
          {journeySteps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`p-4 rounded-2xl border-0 ${
                step.completed 
                  ? 'bg-gradient-to-br ' + step.color.replace('to-', 'to-').replace('from-', 'from-') + '/10'
                  : 'bg-muted/30'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    step.completed
                      ? 'bg-gradient-to-br ' + step.color + ' text-white shadow-lg'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      {step.completed && (
                        <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600">
                          تکمیل شده
                        </Badge>
                      )}
                      <h3 className="font-semibold text-foreground">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </motion.div>
  );

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col bg-background">
      <AnimatePresence mode="wait">
        {activeView === 'home' && renderHome()}
        {activeView === 'session' && renderSession()}
        {activeView === 'journey' && renderJourney()}
        {activeView === 'assessments' && (
          <PersonalityAssessments onBack={() => setActiveView('home')} />
        )}
        {activeView === 'discovery' && (
          <GuidedDiscovery onBack={() => setActiveView('home')} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonalGrowth;
