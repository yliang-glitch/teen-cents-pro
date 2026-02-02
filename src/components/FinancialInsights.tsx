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
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
              Financial Insights
            </h2>
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 rounded-2xl">
            <div className="flex gap-3">
              <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
          className="text-primary h-8 px-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="ios-grouped-list">
        {insights.map((insight) => (
          <div key={insight.id} className="ios-list-item flex-col items-start gap-3">
            <div className="flex items-start gap-3 w-full">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                insight.impact === "positive" 
                  ? "bg-success/10" 
                  : insight.impact === "negative" 
                  ? "bg-destructive/10" 
                  : "bg-accent/10"
              }`}>
                {getImpactIcon(insight.impact)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-[15px] leading-tight">{insight.title}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full flex-shrink-0 ${getCategoryColor(insight.category)}`}>
                    {insight.category}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-snug">
                  {insight.summary}
                </p>
              </div>
            </div>
            
            {insight.relatedLessonId && (
              <Link 
                to="/learn" 
                className="flex items-center gap-2 text-primary text-[13px] font-medium ml-13 ios-press"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Learn more: {insight.relatedLessonTitle}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ))}
      </div>

      {insights.length === 0 && !loading && (
        <Card className="p-6 rounded-2xl text-center">
          <Lightbulb className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-[15px] text-muted-foreground">No insights available</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchInsights(true)}
            className="mt-3"
          >
            Try Again
          </Button>
        </Card>
      )}
    </div>
  );
};
