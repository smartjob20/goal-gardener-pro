import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userData, type } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = "";
    let prompt = "";

    if (type === "suggest") {
      systemPrompt = `You are an AI personal coach analyzing user productivity data. Based on the data, provide 3-5 actionable task suggestions that are specific, measurable, and achievable. Consider user's habits, goals, and current workload. Respond ONLY with structured data using the suggest_tasks function.`;
      
      prompt = `Analyze this user data and suggest productive tasks:
      
Tasks: ${userData.tasks?.length || 0} tasks (${userData.completedTasks || 0} completed)
Habits: ${userData.habits?.length || 0} habits (Current streak: ${userData.currentStreak || 0} days)
Goals: ${userData.goals?.length || 0} goals
Focus Time: ${Math.round((userData.totalFocusTime || 0) / 60)} hours total
Level: ${userData.level || 1}, XP: ${userData.xp || 0}

Recent Tasks: ${userData.tasks?.slice(0, 5).map((t: any) => `${t.title} (${t.category}, ${t.priority} priority)`).join(', ')}
Active Habits: ${userData.habits?.filter((h: any) => h.active).slice(0, 3).map((h: any) => h.title).join(', ')}
Goals: ${userData.goals?.slice(0, 3).map((g: any) => `${g.title} (${g.progress}% complete)`).join(', ')}`;
    } else if (type === "analyze") {
      systemPrompt = `You are an AI personal coach. Analyze user productivity data and provide insightful, encouraging feedback in Persian (Farsi). Focus on patterns, achievements, and areas for improvement. Be specific and actionable. Use emojis appropriately.`;
      
      prompt = `تحلیل این داده‌های کاربر و بازخورد هوشمند ارائه کن:

وظایف: ${userData.tasks?.length || 0} وظیفه (${userData.completedTasks || 0} تکمیل شده)
عادت‌ها: ${userData.habits?.length || 0} عادت (رکورد فعلی: ${userData.currentStreak || 0} روز)
اهداف: ${userData.goals?.length || 0} هدف
زمان تمرکز: ${Math.round((userData.totalFocusTime || 0) / 60)} ساعت
سطح: ${userData.level || 1}, امتیاز: ${userData.xp || 0}

وظایف اخیر: ${userData.tasks?.slice(0, 5).map((t: any) => `${t.title} (${t.category})`).join('، ')}
عادت‌های فعال: ${userData.habits?.filter((h: any) => h.active).slice(0, 3).map((h: any) => h.title).join('، ')}

یک تحلیل کوتاه (2-3 پاراگراف) با تمرکز بر:
1. نقاط قوت و دستاوردها
2. الگوهای رفتاری
3. پیشنهادات عملی برای بهبود`;
    }

    const body: any = {
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
    };

    if (type === "suggest") {
      body.tools = [
        {
          type: "function",
          function: {
            name: "suggest_tasks",
            description: "Return 3-5 actionable task suggestions.",
            parameters: {
              type: "object",
              properties: {
                suggestions: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      priority: { type: "string", enum: ["low", "medium", "high"] },
                      category: { type: "string" }
                    },
                    required: ["title", "priority", "category"],
                    additionalProperties: false
                  }
                }
              },
              required: ["suggestions"],
              additionalProperties: false
            }
          }
        }
      ];
      body.tool_choice = { type: "function", function: { name: "suggest_tasks" } };
    }

    console.log("Calling Lovable AI Gateway...", { type, bodyKeys: Object.keys(body) });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'محدودیت تعداد درخواست‌ها. لطفاً کمی بعد دوباره امتحان کنید.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          error: 'اعتبار به پایان رسیده است. لطفاً اعتبار خود را شارژ کنید.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      throw new Error(`AI Gateway error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log("AI Gateway response received", { hasChoices: !!data.choices });

    let result;
    if (type === "suggest") {
      const toolCall = data.choices[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        const parsedArgs = JSON.parse(toolCall.function.arguments);
        result = parsedArgs.suggestions || [];
      } else {
        result = [];
      }
    } else {
      result = data.choices[0]?.message?.content || 'خطا در دریافت تحلیل';
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-coach function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'خطای نامشخص' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
