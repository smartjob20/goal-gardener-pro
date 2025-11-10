import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TaskSuggestion {
  title: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export const useAICoach = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getSuggestions = async (userData: any): Promise<TaskSuggestion[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { userData, type: 'suggest' }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "خطا",
          description: data.error,
          variant: "destructive",
        });
        return [];
      }

      return data?.result || [];
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast({
        title: "خطا در دریافت پیشنهادات",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getAnalysis = async (userData: any): Promise<string> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { userData, type: 'analyze' }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "خطا",
          description: data.error,
          variant: "destructive",
        });
        return '';
      }

      return data?.result || '';
    } catch (error) {
      console.error('Error getting AI analysis:', error);
      toast({
        title: "خطا در دریافت تحلیل",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
      return '';
    } finally {
      setLoading(false);
    }
  };

  return { getSuggestions, getAnalysis, loading };
};
