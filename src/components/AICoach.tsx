import React, { useState } from 'react';
import { Sparkles, Brain, TrendingUp, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useApp } from '@/context/AppContext';
import { useAICoach } from '@/hooks/useAICoach';
import { motion, AnimatePresence } from 'motion/react';
const AICoach: React.FC = () => {
  const {
    state,
    addTask
  } = useApp();
  const {
    getSuggestions,
    getAnalysis,
    loading
  } = useAICoach();
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
  return <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20 mt-[70px]">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20">
            <Sparkles className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">مربی هوشمند شخصی</h2>
            <p className="text-sm text-muted-foreground">تحلیل رفتار و پیشنهادات هوشمند</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <Button variant={activeTab === 'suggestions' ? 'default' : 'outline'} onClick={() => setActiveTab('suggestions')} className="flex-1">
            <Target className="h-4 w-4 ml-2" />
            پیشنهادات
          </Button>
          <Button variant={activeTab === 'analysis' ? 'default' : 'outline'} onClick={() => setActiveTab('analysis')} className="flex-1">
            <Brain className="h-4 w-4 ml-2" />
            تحلیل رفتار
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'suggestions' && <motion.div key="suggestions" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className="space-y-4">
              <Button onClick={handleGetSuggestions} disabled={loading} className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                {loading ? <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    در حال تحلیل...
                  </span> : <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    دریافت پیشنهادات هوشمند
                  </span>}
              </Button>

              {suggestions.length > 0 && <div className="space-y-3">
                  {suggestions.map((suggestion, index) => <motion.div key={index} initial={{
              opacity: 0,
              x: -20
            }} animate={{
              opacity: 1,
              x: 0
            }} transition={{
              delay: index * 0.1
            }}>
                      <Card className="p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{suggestion.title}</h4>
                            <div className="flex gap-2 text-xs">
                              <span className={`px-2 py-1 rounded ${suggestion.priority === 'high' ? 'bg-red-500/20 text-red-400' : suggestion.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                                {suggestion.priority === 'high' ? 'بالا' : suggestion.priority === 'medium' ? 'متوسط' : 'پایین'}
                              </span>
                              <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-400">
                                {suggestion.category}
                              </span>
                            </div>
                          </div>
                          <Button size="sm" onClick={() => handleAddSuggestion(suggestion)} className="shrink-0">
                            افزودن
                          </Button>
                        </div>
                      </Card>
                    </motion.div>)}
                </div>}
            </motion.div>}

          {activeTab === 'analysis' && <motion.div key="analysis" initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -20
        }} className="space-y-4">
              <Button onClick={handleGetAnalysis} disabled={loading} className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600">
                {loading ? <span className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    در حال تحلیل...
                  </span> : <span className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    تحلیل عملکرد من
                  </span>}
              </Button>

              {analysis && <motion.div initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            delay: 0.2
          }}>
                  <Card className="p-6 bg-gradient-to-br from-blue-500/5 to-cyan-500/5">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                        {analysis}
                      </div>
                    </div>
                  </Card>
                </motion.div>}
            </motion.div>}
        </AnimatePresence>
      </Card>
    </div>;
};
export default AICoach;