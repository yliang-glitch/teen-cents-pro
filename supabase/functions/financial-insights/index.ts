import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FinancialInsight {
  id: string;
  title: string;
  summary: string;
  category: string;
  impact: "positive" | "negative" | "neutral";
  relatedLessonId: number | null;
  relatedLessonTitle: string | null;
}

const lessons = [
  { id: 1, title: "Money Basics", keywords: ["money", "currency", "basics", "fundamentals"] },
  { id: 2, title: "Earning vs. Spending", keywords: ["income", "expenses", "spending", "earning", "salary"] },
  { id: 3, title: "The Power of Saving", keywords: ["saving", "savings", "emergency fund", "piggy bank"] },
  { id: 4, title: "Setting Financial Goals", keywords: ["goals", "planning", "targets", "objectives"] },
  { id: 5, title: "Budgeting Like a Pro", keywords: ["budget", "budgeting", "planning", "allocation"] },
  { id: 6, title: "Understanding Credit", keywords: ["credit", "loans", "debt", "credit score", "borrowing"] },
  { id: 7, title: "Investing Basics", keywords: ["investing", "stocks", "bonds", "markets", "portfolio"] },
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

    const { userContext } = await req.json();
    
    const systemPrompt = `You are a financial education assistant for young people learning about money management. Generate 3 current, relevant financial insights or tips that would interest someone learning about personal finance.

Each insight should be educational, actionable, and relate to one of these topics:
- Basic money concepts
- Income and expenses
- Saving strategies
- Financial goal setting
- Budgeting
- Understanding credit
- Introduction to investing

Respond with a JSON array of exactly 3 insights. Each insight should have:
- id: a unique string
- title: a catchy headline (max 60 chars)
- summary: a brief explanation (max 120 chars)
- category: one of "saving", "spending", "investing", "budgeting", "credit", "general"
- impact: "positive", "negative", or "neutral" indicating the tone
- keywords: array of 2-3 keywords for matching to lessons

IMPORTANT: Respond ONLY with the JSON array, no other text.`;

    const userPrompt = userContext 
      ? `Generate financial insights for someone with: ${userContext}`
      : "Generate 3 general financial insights for a young person learning about money.";

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
          { role: "user", content: userPrompt },
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
      throw new Error("Failed to get insights from AI");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let insights: any[];
    try {
      // Handle potential markdown code blocks
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      insights = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Invalid response format from AI");
    }

    // Map insights to include related lessons
    const enrichedInsights: FinancialInsight[] = insights.map((insight: any) => {
      const insightKeywords = insight.keywords || [];
      const insightText = `${insight.title} ${insight.summary}`.toLowerCase();
      
      // Find matching lesson
      let matchedLesson = null;
      let maxScore = 0;
      
      for (const lesson of lessons) {
        let score = 0;
        for (const keyword of lesson.keywords) {
          if (insightText.includes(keyword.toLowerCase())) {
            score++;
          }
          if (insightKeywords.some((k: string) => k.toLowerCase().includes(keyword.toLowerCase()))) {
            score += 2;
          }
        }
        if (score > maxScore) {
          maxScore = score;
          matchedLesson = lesson;
        }
      }

      return {
        id: insight.id,
        title: insight.title,
        summary: insight.summary,
        category: insight.category,
        impact: insight.impact,
        relatedLessonId: matchedLesson?.id || null,
        relatedLessonTitle: matchedLesson?.title || null,
      };
    });

    return new Response(JSON.stringify({ insights: enrichedInsights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in financial-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
