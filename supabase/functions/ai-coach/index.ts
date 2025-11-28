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
    const { userData, type, message, chatHistory } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = "";
    let prompt = "";
    let messages: any[] = [];

    if (type === "chat") {
      systemPrompt = `تو یک مربی شخصی هوشمند، دلسوز و حرفه‌ای هستی که کاربر رو کاملاً می‌شناسی. اطلاعات زیر در مورد کاربر رو داری و باید براساس این اطلاعات با او صحبت کنی:

وظایف: ${userData.tasks?.length || 0} وظیفه (${userData.completedTasks || 0} تکمیل شده)
عادت‌ها: ${userData.habits?.length || 0} عادت (رکورد فعلی: ${userData.currentStreak || 0} روز)
اهداف: ${userData.goals?.length || 0} هدف
زمان تمرکز: ${Math.round((userData.totalFocusTime || 0) / 60)} ساعت
سطح: ${userData.level || 1}, امتیاز: ${userData.xp || 0}

وظایف اخیر: ${userData.tasks?.slice(0, 3).map((t: any) => t.title).join('، ')}
عادت‌های فعال: ${userData.habits?.filter((h: any) => h.active).slice(0, 3).map((h: any) => h.title).join('، ')}
اهداف: ${userData.goals?.slice(0, 2).map((g: any) => g.title).join('، ')}

تو باید:
- با لحنی گرم، دوستانه و انگیزشی صحبت کنی (لحن خودمونی)
- براساس داده‌های کاربر، پیشنهادات عملی و شخصی‌سازی شده بدی
- کاربر رو بشناسی و رفتارش رو یادت باشه
- با ایموجی و زبانی ساده صحبت کنی
- همیشه مثبت و امیدوار باشی`;

      // Build messages array with chat history
      messages = [
        { role: "system", content: systemPrompt }
      ];
      
      if (chatHistory && chatHistory.length > 0) {
        messages.push(...chatHistory.map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })));
      }
      
      messages.push({ role: "user", content: message });

    } else if (type === "suggest") {
      systemPrompt = `تو یک مربی شخصی هوشمند هستی که داده‌های بهره‌وری کاربر رو تحلیل می‌کنی. بر اساس داده‌ها، ۳ تا ۵ پیشنهاد عملی برای وظایف بده که مشخص، قابل اندازه‌گیری و قابل دستیابی باشن. عادت‌ها، اهداف و حجم کاری فعلی کاربر رو در نظر بگیر. فقط با استفاده از تابع suggest_tasks جواب بده. پیشنهادات باید کاملاً به فارسی و با لحنی دوستانه و انگیزشی باشن.`;
      
      prompt = `این داده‌های کاربر رو تحلیل کن و وظایف مفید پیشنهاد بده:
      
وظایف: ${userData.tasks?.length || 0} وظیفه (${userData.completedTasks || 0} تکمیل شده)
عادت‌ها: ${userData.habits?.length || 0} عادت (رکورد فعلی: ${userData.currentStreak || 0} روز)
اهداف: ${userData.goals?.length || 0} هدف
زمان تمرکز: ${Math.round((userData.totalFocusTime || 0) / 60)} ساعت
سطح: ${userData.level || 1}, امتیاز: ${userData.xp || 0}

وظایف اخیر: ${userData.tasks?.slice(0, 5).map((t: any) => `${t.title} (${t.category}، اولویت ${t.priority})`).join('، ')}
عادت‌های فعال: ${userData.habits?.filter((h: any) => h.active).slice(0, 3).map((h: any) => h.title).join('، ')}
اهداف: ${userData.goals?.slice(0, 3).map((g: any) => `${g.title} (${g.progress}٪ تکمیل)`).join('، ')}

پیشنهادات رو به فارسی و با لحنی گرم، دوستانه و انگیزشی بده. مثل یک دوست خوب که می‌خواد به کاربر کمک کنه!`;
    } else if (type === "analyze") {
      systemPrompt = `تو یک مربی شخصی هوشمند و دوستانه هستی. داده‌های بهره‌وری کاربر رو تحلیل کن و بازخوردی با انگیزه، گرم و دلسوزانه به زبان فارسی بده. روی الگوها، دستاوردها و زمینه‌های بهبود تمرکز کن. مشخص و عملی باش. از ایموجی‌های مناسب استفاده کن و مثل یک دوست صمیمی حرف بزن که واقعاً به موفقیت کاربر اهمیت میده.`;
      
      prompt = `این داده‌های کاربر رو با دقت بررسی کن و یک تحلیل دوستانه و انگیزشی بده:

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
      messages: type === "chat" ? messages : [
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
