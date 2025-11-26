import React, { useState } from 'react';
import { Sparkles, Brain, TrendingUp, Target, Wand2, MessageSquare, Lightbulb, Zap, Star, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { useAICoach } from '@/hooks/useAICoach';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '@/components/ui/badge';

const AICoach: React.FC = () => {
  const { state, addTask } = useApp();
  const { getSuggestions, getAnalysis, loading } = useAICoach();
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'suggestions' | 'analysis'>('suggestions');

  const handleGetSuggestions = async () => {
    const longestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);
    const userData = {
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      completedTasks: state.user.totalTasksCompleted,
      currentStreak: longestStreak,
      totalFocusTime: state.user.totalFocusTime,
      level: state.user.level,
      xp: state.user.xp
    };
    const result = await getSuggestions(userData);
    setSuggestions(result);
  };

  const handleGetAnalysis = async () => {
    const longestStreak = Math.max(...state.habits.map(h => h.longestStreak), 0);
    const userData = {
      tasks: state.tasks,
      habits: state.habits,
      goals: state.goals,
      completedTasks: state.user.totalTasksCompleted,
      currentStreak: longestStreak,
      totalFocusTime: state.user.totalFocusTime,
      level: state.user.level,
      xp: state.user.xp
    };
    const result = await getAnalysis(userData);
    setAnalysis(result);
  };

  const handleAddSuggestion = (suggestion: any) => {
    addTask({
      title: suggestion.title,
      description: 'پیشنهاد هوش مصنوعی',
      category: suggestion.category as any,
      priority: suggestion.priority as any,
      deadline: null,
      subtasks: [],
      xpReward: suggestion.priority === 'high' ? 30 : suggestion.priority === 'medium' ? 20 : 10
    });
  };

  const priorityConfig = {
    high: { label: 'بالا', bg: 'bg-destructive/20', text: 'text-destructive', border: 'border-destructive/30' },
    medium: { label: 'متوسط', bg: 'bg-warning/20', text: 'text-warning', border: 'border-warning/30' },
    low: { label: 'پایین', bg: 'bg-success/20', text: 'text-success', border: 'border-success/30' }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-primary/5 to-accent/5 pb-24 pt-20">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="glass-strong border-2 border-primary/20 overflow-hidden">
            <div className="relative p-6 sm:p-8">
              {/* Animated Background Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-transparent opacity-50" />
              
              <div className="relative flex items-start gap-4">
                <motion.div
                  animate={{ 
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                  className="flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg"
                >
                  <Sparkles className="h-8 w-8 text-primary-foreground" />
                </motion.div>
                
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold gradient-text mb-2">
                    🤖 مربی هوشمند شخصی
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                    با قدرت هوش مصنوعی، بهترین مسیر برای رسیدن به اهدافت رو کشف کن
                  </p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Badge variant="secondary" className="gap-1">
                      <Brain className="h-3 w-3" />
                      تحلیل هوشمند
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Lightbulb className="h-3 w-3" />
                      پیشنهادات شخصی
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Zap className="h-3 w-3" />
                      پاسخ فوری
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tab Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <motion.button
            onClick={() => setActiveTab('suggestions')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Card className={`p-4 sm:p-6 transition-all duration-300 ${
              activeTab === 'suggestions' 
                ? 'glass-strong border-2 border-primary shadow-lg shadow-primary/20' 
                : 'glass border border-border/50 hover:border-primary/30'
            }`}>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`p-3 rounded-xl transition-all ${
                  activeTab === 'suggestions' 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${
                    activeTab === 'suggestions' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    پیشنهادات هوشمند
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    وظایف پیشنهادی AI
                  </p>
                </div>
              </div>
            </Card>
          </motion.button>

          <motion.button
            onClick={() => setActiveTab('analysis')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <Card className={`p-4 sm:p-6 transition-all duration-300 ${
              activeTab === 'analysis' 
                ? 'glass-strong border-2 border-accent shadow-lg shadow-accent/20' 
                : 'glass border border-border/50 hover:border-accent/30'
            }`}>
              <div className="flex flex-col items-center gap-3 text-center">
                <div className={`p-3 rounded-xl transition-all ${
                  activeTab === 'analysis' 
                    ? 'bg-accent/20 text-accent' 
                    : 'bg-muted/50 text-muted-foreground'
                }`}>
                  <Brain className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`font-bold text-base sm:text-lg ${
                    activeTab === 'analysis' ? 'text-foreground' : 'text-muted-foreground'
                  }`}>
                    تحلیل عملکرد
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    بررسی رفتار شما
                  </p>
                </div>
              </div>
            </Card>
          </motion.button>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="glass-strong p-6">
                <Button
                  onClick={handleGetSuggestions}
                  disabled={loading}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-primary via-primary to-accent hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      در حال تحلیل داده‌های شما...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Wand2 className="h-5 w-5" />
                      دریافت پیشنهادات هوشمند
                      <Sparkles className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-6 space-y-3"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Star className="h-5 w-5 text-warning" />
                      <h3 className="font-bold text-lg">
                        {suggestions.length} پیشنهاد ویژه برای شما
                      </h3>
                    </div>

                    {suggestions.map((suggestion, index) => {
                      const priority = priorityConfig[suggestion.priority as keyof typeof priorityConfig];
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <Card className="p-4 hover:shadow-md transition-all border-r-4 border-r-primary/50">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0 space-y-2">
                                <h4 className="font-bold text-base leading-tight">
                                  {suggestion.title}
                                </h4>
                                
                                <div className="flex flex-wrap gap-2">
                                  <Badge 
                                    variant="secondary"
                                    className={`${priority.bg} ${priority.text} border ${priority.border}`}
                                  >
                                    اولویت: {priority.label}
                                  </Badge>
                                  <Badge variant="outline" className="gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    {suggestion.category}
                                  </Badge>
                                </div>
                              </div>
                              
                              <Button
                                size="sm"
                                onClick={() => handleAddSuggestion(suggestion)}
                                className="flex-shrink-0 gap-2 h-10"
                              >
                                <Plus className="h-4 w-4" />
                                افزودن
                              </Button>
                            </div>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}

          {activeTab === 'analysis' && (
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <Card className="glass-strong p-6">
                <Button
                  onClick={handleGetAnalysis}
                  disabled={loading}
                  size="lg"
                  className="w-full h-14 text-base font-bold bg-gradient-to-r from-accent via-accent to-info hover:shadow-lg hover:shadow-accent/30 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      در حال تحلیل رفتار شما...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <TrendingUp className="h-5 w-5" />
                      تحلیل هوشمند عملکرد من
                      <Brain className="h-4 w-4" />
                    </span>
                  )}
                </Button>

                {analysis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6"
                  >
                    <Card className="glass border-2 border-accent/30 p-6 bg-gradient-to-br from-accent/5 to-info/5">
                      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-border/50">
                        <div className="p-2 rounded-lg bg-accent/20">
                          <MessageSquare className="h-5 w-5 text-accent" />
                        </div>
                        <h3 className="font-bold text-lg">
                          تحلیل مربی هوشمند
                        </h3>
                      </div>
                      
                      <div className="prose prose-sm max-w-none">
                        <div className="whitespace-pre-wrap text-foreground leading-relaxed text-base">
                          {analysis}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AICoach;
