import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  Send, 
  Sparkles, 
  ChevronLeft,
  Loader2,
  Cloud,
  Feather,
  HelpCircle,
  Lightbulb,
  Eye,
  Wind
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type?: 'question' | 'exploration' | 'clarity' | 'example';
  created_at: string;
}

interface GuidedDiscoveryProps {
  onBack: () => void;
}

const GuidedDiscovery = ({ onBack }: GuidedDiscoveryProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const explorationPrompts = [
    { 
      icon: Cloud, 
      text: 'یه حسی دارم ولی نمیدونم چیه',
      prompt: 'یه حسی دارم ولی واقعاً نمیدونم چیه. نمیتونم اسمش رو بذارم. فقط یه چیزی هست که ذهنم رو مشغول کرده.'
    },
    { 
      icon: Compass, 
      text: 'سردرگمم و نمیدونم چیکار کنم',
      prompt: 'احساس سردرگمی میکنم. انگار توی مه گیر کردم و نمیدونم کجا دارم میرم یا چیکار باید بکنم.'
    },
    { 
      icon: Wind, 
      text: 'فکرم آروم نمیگیره',
      prompt: 'ذهنم خیلی شلوغه. فکرام آروم نمیگیرن و مدام از یه چیزی به یه چیز دیگه میپرم.'
    },
    { 
      icon: Eye, 
      text: 'میخوام خودم رو بهتر بشناسم',
      prompt: 'میخوام خودم رو بهتر بشناسم. احساس میکنم یه چیزایی هست که ازشون خبر ندارم.'
    },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startExploration = (prompt?: string) => {
    setStarted(true);
    
    const initialMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `سلام... 🌿

خوشحالم که اینجایی. اینجا یه فضای امنه برای کاوش توی ذهن و دل خودت.

میدونم که گاهی یه حسی داریم ولی نمیتونیم اسمش رو بذاریم. این خیلی طبیعیه. قرار نیست همه چیز رو از اول بدونی - با هم پیداش میکنیم.

هر چی که توی ذهنته، هر احساس مبهمی که داری، بگو. من اینجام که کمکت کنم کلماتش رو پیدا کنی...`,
      type: 'exploration',
      created_at: new Date().toISOString()
    };
    
    setMessages([initialMessage]);
    
    if (prompt) {
      setTimeout(() => sendMessage(prompt), 1500);
    }
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
      const systemPrompt = `تو یه راهنمای درونی هستی - نه مشاور، نه روانشناس، بلکه یه همراه مهربان که کمک میکنی آدما ذهنشون رو باز کنن و حس‌هاشون رو بشناسن.

شیوه کارت:
۱. هرگز قضاوت نکن - فقط گوش بده و سوال بپرس
۲. با سوال‌های ساده و کوتاه کمک کن به عمق برن
۳. از مثال‌های ملموس و تصویری استفاده کن
۴. وقتی چیزی گفتن، بپرس "وقتی این رو میگی، توی بدنت کجا حسش میکنی؟"
۵. کمک کن احساسات مبهم رو به کلمات تبدیل کنن
۶. آینه باش - تکرار کن چی شنیدی تا مطمئن شی درست فهمیدی
۷. صبور باش و عجله نکن به نتیجه برسی

سوالات کاوشگرانه:
- "این حس بیشتر شبیه چیه؟ سنگینی یا سبکی؟ تاریکی یا روشنی؟"
- "آخرین بار کی این حس رو نداشتی؟ اون موقع چی فرق داشت؟"
- "اگه این حس یه رنگ داشت، چه رنگی بود؟"
- "چه صدایی توی ذهنت تکرار میشه؟"
- "اگه قرار بود به یه نفر دیگه توضیح بدی، چی میگفتی؟"

وقتی به وضوح رسیدن:
- تأیید کن و بگو "آها، پس انگار..."
- کمک کن ببینن این شناخت چه فرصتی براشون ایجاد میکنه
- امید بده بدون دروغ گفتن

لحنت: مهربان، آروم، صمیمی، مثل یه دوست قدیمی که وقت داره و گوش میده.
پاسخ‌ها کوتاه باشن (۲-۴ جمله) مگر وقتی نیاز به توضیح بیشتر هست.
همیشه فارسی و با لحن خودمونی صحبت کن.`;

      const { data, error } = await supabase.functions.invoke('personal-growth-coach', {
        body: {
          message: content,
          mood: 'exploration',
          chatHistory: messages.slice(-10),
          userId: user?.id,
          systemPromptOverride: systemPrompt
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.result || 'بگو ببینم چی توی ذهنته...',
        type: data.type || 'exploration',
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

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <div />
          <h2 className="text-sm font-medium text-foreground">کاوش درونی</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="h-8 w-8"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          {/* Hero Section */}
          <div className="text-center mb-8 pt-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="w-24 h-24 mx-auto mb-5 rounded-full bg-gradient-to-br from-teal-400/20 via-cyan-400/20 to-blue-400/20 flex items-center justify-center relative"
            >
              <Feather className="w-12 h-12 text-teal-600" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-400/10 to-blue-400/10"
              />
            </motion.div>
            
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-foreground mb-3"
            >
              کاوش درونی
            </motion.h1>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto mb-2"
            >
              گاهی یه حسی داریم ولی نمیدونیم چیه...
            </motion.p>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-xs leading-relaxed max-w-xs mx-auto"
            >
              اینجا با هم پیداش میکنیم. بدون عجله، بدون قضاوت.
            </motion.p>
          </div>

          {/* Exploration Prompts */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-3 mb-8"
          >
            <h3 className="text-xs font-medium text-muted-foreground text-right mb-4">
              از کجا شروع کنیم؟
            </h3>
            {explorationPrompts.map((item, index) => (
              <motion.button
                key={index}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.02, x: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => startExploration(item.prompt)}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 hover:from-primary/10 hover:to-primary/5 transition-all text-right border border-border/30"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400/20 to-cyan-400/20 flex items-center justify-center shrink-0">
                  <item.icon className="w-6 h-6 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{item.text}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Start Custom */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center"
          >
            <Button
              variant="outline"
              onClick={() => startExploration()}
              className="rounded-full px-6 h-12 gap-2 border-primary/30 hover:bg-primary/5"
            >
              <Sparkles className="w-4 h-4" />
              <span>خودم شروع میکنم</span>
            </Button>
          </motion.div>
        </ScrollArea>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
        <div className="flex items-center gap-2">
          <Feather className="w-4 h-4 text-teal-600" />
        </div>
        <h2 className="text-sm font-medium text-foreground">کاوش درونی</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setStarted(false);
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
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-2xl rounded-bl-md'
                    : 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 text-foreground rounded-2xl rounded-br-md border border-teal-200/50 dark:border-teal-700/30'
                } px-4 py-3`}>
                  {message.type && message.role === 'assistant' && (
                    <div className="flex items-center gap-1.5 mb-2">
                      {message.type === 'question' && <HelpCircle className="w-3 h-3 text-teal-600" />}
                      {message.type === 'exploration' && <Compass className="w-3 h-3 text-cyan-600" />}
                      {message.type === 'clarity' && <Lightbulb className="w-3 h-3 text-amber-500" />}
                      {message.type === 'example' && <Eye className="w-3 h-3 text-purple-500" />}
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
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/30 dark:to-cyan-900/30 rounded-2xl rounded-br-md px-4 py-3 border border-teal-200/50 dark:border-teal-700/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">در حال گوش دادن</span>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-gradient-to-r from-teal-500/5 to-cyan-500/5">
        <div className="flex items-end gap-2">
          <Button
            onClick={() => sendMessage(inputMessage)}
            disabled={!inputMessage.trim() || loading}
            size="icon"
            className="h-12 w-12 rounded-full shrink-0 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
          >
            <Send className="w-5 h-5" />
          </Button>
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="هر چی توی ذهنته بگو... بدون سانسور"
            className="min-h-[48px] max-h-[120px] resize-none rounded-2xl border-0 bg-muted/50 text-right"
            dir="rtl"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default GuidedDiscovery;
