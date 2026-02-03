import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  category: string;
  sentiment: "bullish" | "bearish" | "neutral";
  relatedTopic: string;
  relatedLessonId: number | null;
  relatedLessonTitle: string | null;
}

const lessons = [
  { id: 1, title: "Money Basics", keywords: ["money", "currency", "basics", "fundamentals", "cash", "dollar"] },
  { id: 2, title: "Earning vs. Spending", keywords: ["income", "expenses", "spending", "earning", "salary", "wages", "paycheck"] },
  { id: 3, title: "The Power of Saving", keywords: ["saving", "savings", "emergency fund", "piggy bank", "save", "accumulate"] },
  { id: 4, title: "Setting Financial Goals", keywords: ["goals", "planning", "targets", "objectives", "milestones", "achieve"] },
  { id: 5, title: "Budgeting Like a Pro", keywords: ["budget", "budgeting", "planning", "allocation", "expenses", "spending plan"] },
  { id: 6, title: "Understanding Credit", keywords: ["credit", "loans", "debt", "credit score", "borrowing", "interest rate", "apr"] },
  { id: 7, title: "Investing Basics", keywords: ["investing", "stocks", "bonds", "markets", "portfolio", "dividends", "returns", "etf", "mutual fund"] },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a financial news curator for young people learning about money. Generate 4 current, educational financial news items that are relevant and easy to understand.

Focus on news that teaches financial concepts like:
- Stock market trends and what they mean
- Interest rates and their impact on savings
- Inflation and purchasing power
- Cryptocurrency developments
- Economic indicators
- Personal finance tips from current events

Each news item should be:
- Educational and explain WHY it matters
- Written for beginners (no jargon without explanation)
- Current and relevant (use today's date context)
- Connected to practical money lessons

Respond with a JSON array of exactly 4 news items. Each item should have:
- id: unique string
- headline: catchy title (max 70 chars)
- summary: brief explanation of news and why it matters (max 150 chars)
- category: one of "markets", "economy", "crypto", "banking", "investing", "personal-finance"
- sentiment: "bullish" (positive/growing), "bearish" (negative/declining), or "neutral"
- relatedTopic: the financial concept this teaches (e.g., "compound interest", "diversification", "inflation")
- keywords: array of 2-3 keywords for matching to lessons

IMPORTANT: Respond ONLY with the JSON array, no other text. Make the news feel current and relevant.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Generate 4 current financial news items for today that would help a young person learn about money and markets." },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to get news from AI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    let rawNews: any[];
    try {
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      rawNews = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Map news to lessons
    const news: NewsItem[] = rawNews.map((item: any) => {
      const newsKeywords = item.keywords || [];
      const newsText = `${item.headline} ${item.summary} ${item.relatedTopic}`.toLowerCase();
      
      let matchedLesson = null;
      let maxScore = 0;
      
      for (const lesson of lessons) {
        let score = 0;
        for (const keyword of lesson.keywords) {
          if (newsText.includes(keyword.toLowerCase())) {
            score++;
          }
          if (newsKeywords.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase()))) {
            score += 2;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          matchedLesson = lesson;
        }
      }

      return {
        id: item.id,
        headline: item.headline,
        summary: item.summary,
        category: item.category,
        sentiment: item.sentiment,
        relatedTopic: item.relatedTopic,
        relatedLessonId: matchedLesson?.id || null,
        relatedLessonTitle: matchedLesson?.title || null,
      };
    });

    return new Response(JSON.stringify({ news }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in financial-news function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
