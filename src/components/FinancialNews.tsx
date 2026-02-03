import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Newspaper,
  RefreshCw,
  Zap,
  BookOpen,
  ChevronRight
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

export const FinancialNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNews = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase.functions.invoke("financial-news");

      if (error) throw error;

      if (data?.news) {
        setNews(data.news);
      }
    } catch (error: any) {
      console.error("Error fetching news:", error);
      if (error.message?.includes("429")) {
        toast.error("Too many requests. Please wait a moment.");
      } else {
        toast.error("Couldn't load news. Try again later.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "bearish":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getSentimentBg = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "bg-success/10";
      case "bearish":
        return "bg-destructive/10";
      default:
        return "bg-muted";
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      markets: "bg-primary/10 text-primary",
      economy: "bg-accent/10 text-accent",
      crypto: "bg-warning/10 text-warning",
      banking: "bg-success/10 text-success",
      investing: "bg-secondary/50 text-secondary-foreground",
      "personal-finance": "bg-muted text-muted-foreground",
    };
    return colors[category] || colors["personal-finance"];
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" />
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
              Financial News
            </h2>
          </div>
        </div>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 rounded-2xl">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
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
          <Newspaper className="w-4 h-4 text-primary" />
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
            Financial News
          </h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fetchNews(true)}
          disabled={refreshing}
          className="text-primary h-8 px-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="space-y-2">
        {news.map((item) => (
          <Card 
            key={item.id} 
            className="p-4 rounded-2xl transition-all hover:shadow-md"
          >
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getSentimentBg(item.sentiment)}`}>
                  {getSentimentIcon(item.sentiment)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] leading-tight line-clamp-2">
                    {item.headline}
                  </h3>
                </div>
              </div>
              
              <p className="text-[13px] text-muted-foreground leading-snug pl-10">
                {item.summary}
              </p>
              
              <div className="flex items-center gap-2 pl-10 flex-wrap">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-primary/5 text-primary flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  {item.relatedTopic}
                </span>
              </div>

              {item.relatedLessonId && (
                <Link 
                  to="/learn" 
                  className="flex items-center gap-2 text-primary text-[13px] font-medium pl-10 pt-1 ios-press"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Learn: {item.relatedLessonTitle}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {news.length === 0 && !loading && (
        <Card className="p-6 rounded-2xl text-center">
          <Newspaper className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
          <p className="text-[15px] text-muted-foreground">No news available</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(true)}
            className="mt-3"
          >
            Try Again
          </Button>
        </Card>
      )}
    </div>
  );
};
