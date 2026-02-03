import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Lightbulb, 
  BookOpen, 
  RefreshCw,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FinancialInsight {
  id: string;
  title: string;
  summary: string;
  category: string;
  impact: "positive" | "negative" | "neutral";
  relatedLessonId: number | null;
  relatedLessonTitle: string | null;
}

interface FinancialInsightsProps {
  userContext?: string;
}

export const FinancialInsights = ({ userContext }: FinancialInsightsProps) => {
  const [insights, setInsights] = useState<FinancialInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke("financial-insights", {
        body: { userContext },
      });

      if (error) throw error;

      if (data?.insights) {
        setInsights(data.insights);
      }
    } catch (error: any) {
      console.error("Error fetching insights:", error);
      if (error.message?.includes("429")) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Couldn't load insights. Try again later.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [userContext]);

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "positive":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "negative":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Lightbulb className="w-4 h-4 text-accent" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      saving: "bg-success/10 text-success",
      spending: "bg-destructive/10 text-destructive",
      investing: "bg-primary/10 text-primary",
      budgeting: "bg-accent/10 text-accent",
      credit: "bg-warning/10 text-warning",
      general: "bg-muted text-muted-foreground",
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
              Financial Insights
            </h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3 rounded-xl min-w-[240px] flex-shrink-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-3 w-3/4" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
            Financial Insights
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchInsights(true)}
          disabled={refreshing}
          className="text-primary h-7 px-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {insights.map((insight) => (
          <Card 
            key={insight.id} 
            className="p-3 rounded-xl min-w-[240px] flex-shrink-0 transition-all hover:shadow-md"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                  insight.impact === "positive" 
                    ? "bg-success/10" 
                    : insight.impact === "negative" 
                    ? "bg-destructive/10" 
                    : "bg-accent/10"
                }`}>
                  {getImpactIcon(insight.impact)}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getCategoryColor(insight.category)}`}>
                  {insight.category}
                </span>
              </div>
              
              <h3 className="font-semibold text-[13px] leading-tight line-clamp-2">
                {insight.title}
              </h3>
              
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                {insight.summary}
              </p>

              {insight.relatedLessonId && (
                <Link 
                  to="/learn" 
                  className="flex items-center gap-1 text-primary text-[11px] font-medium ios-press"
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate">{insight.relatedLessonTitle}</span>
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {insights.length === 0 && !loading && (
        <Card className="p-4 rounded-xl text-center">
          <Lightbulb className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">No insights available</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInsights(true)}
            className="mt-2"
          >
            Try Again
          </Button>
        </Card>
      )}
    </div>
  );
};
