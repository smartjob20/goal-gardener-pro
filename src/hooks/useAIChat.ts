import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadChatHistory();
    }
  }, [user]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages((data || []).map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant' | 'system'
      })));
    } catch (error) {
      console.error('Error loading chat history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const sendMessage = async (content: string, userData: any): Promise<void> => {
    if (!user) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا وارد شوید",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      // Add user message to local state
      const userMessage: ChatMessage = {
        id: Math.random().toString(),
        role: 'user',
        content,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Save user message to database
      await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: user.id,
          role: 'user',
          content
        });

      // Call AI edge function
      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: { 
          userData, 
          type: 'chat',
          message: content,
          chatHistory: messages.slice(-10) // Send last 10 messages for context
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast({
          title: "خطا",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      // Add AI response to local state
      const assistantMessage: ChatMessage = {
        id: Math.random().toString(),
        role: 'assistant',
        content: data.result,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Save AI response to database
      await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: user.id,
          role: 'assistant',
          content: data.result
        });

      // Update user personality data
      await supabase
        .from('user_personality')
        .upsert({
          user_id: user.id,
          interaction_count: (await supabase
            .from('user_personality')
            .select('interaction_count')
            .eq('user_id', user.id)
            .single()).data?.interaction_count + 1 || 1,
          last_interaction: new Date().toISOString(),
          personality_data: userData
        }, {
          onConflict: 'user_id'
        });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "خطا در ارسال پیام",
        description: "لطفاً دوباره تلاش کنید",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('user_id', user.id);
      
      setMessages([]);
      toast({
        title: "تاریخچه پاک شد",
        description: "تاریخچه چت با موفقیت حذف شد",
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: "خطا",
        description: "خطا در پاک کردن تاریخچه",
        variant: "destructive",
      });
    }
  };

  return { 
    messages, 
    sendMessage, 
    loading, 
    loadingHistory,
    clearChat 
  };
};
