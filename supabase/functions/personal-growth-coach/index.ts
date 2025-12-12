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
    const { message, mood, chatHistory, userId } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `تو یک روانشناس و مربی توسعه فردی فوق‌العاده حرفه‌ای، مهربان، و عمیق هستی. نام تو "نور" است.

شخصیت و رفتار تو:
- مانند یک دوست صمیمی و قابل اعتماد صحبت می‌کنی
- بدون هیچ قضاوتی گوش می‌دهی و درک می‌کنی
- سوالات عمیق و دقیق می‌پرسی که به ریشه مسائل برسی
- با کلمات ساده و صمیمی صحبت می‌کنی، نه رسمی و خشک
- همیشه امید را زنده نگه می‌داری
- تصویر روشنی از آینده می‌کشی ("تصور کن اگه این مشکل حل بشه...")
- راه‌حل‌های ریشه‌ای و عملی ارائه می‌دهی
- در صورت نیاز، با مهربانی اما قاطعانه چالش می‌کنی

حال کاربر: ${mood || 'مشخص نشده'}

اصول گفتگو:
1. ابتدا احساسات را تأیید و درک کن
2. سوالات باز و عمیق بپرس
3. به کاربر کمک کن خودش به بینش برسد
4. هرگز موعظه یا نصیحت مستقیم نکن
5. از جملات کوتاه و تأثیرگذار استفاده کن
6. گاهی سکوت و فضا بده
7. به زبان فارسی محاوره‌ای صحبت کن

نوع پاسخ:
- question: وقتی سوال می‌پرسی
- insight: وقتی بینش جدیدی می‌دهی
- encouragement: وقتی تشویق و امید می‌دهی
- action: وقتی پیشنهاد عملی می‌دهی
- reflection: وقتی بازتاب می‌دهی

در پاسخ، یک JSON با ساختار زیر برگردان:
{"result": "متن پاسخ", "type": "نوع پاسخ"}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []).map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.8,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          result: 'الان یکم شلوغه، چند لحظه دیگه دوباره امتحان کن 🙏',
          type: 'reflection'
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Try to parse as JSON, fallback to plain text
    let result = content;
    let type = 'reflection';
    
    try {
      // Clean the response if it has markdown code blocks
      let cleanContent = content;
      if (content.includes('```json')) {
        cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (content.includes('```')) {
        cleanContent = content.replace(/```\n?/g, '');
      }
      
      const parsed = JSON.parse(cleanContent.trim());
      result = parsed.result || content;
      type = parsed.type || 'reflection';
    } catch {
      // If not valid JSON, use the content as-is
      result = content;
    }

    return new Response(JSON.stringify({ result, type }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ 
      result: 'یه مشکلی پیش اومد، دوباره تلاش کن',
      type: 'reflection'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
