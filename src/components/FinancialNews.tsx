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

const CACHE_KEY = "financial_news_cache";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface CachedNews {
  news: NewsItem[];
  timestamp: number;
}

export const FinancialNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getCachedNews = (): NewsItem[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { news, timestamp }: CachedNews = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return news;
        }
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  };

  const setCachedNews = (newsItems: NewsItem[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        news: newsItems,
        timestamp: Date.now(),
      }));
    } catch {
      // Ignore cache errors
    }
  };

  const fetchNews = async (isRefresh = false) => {
    // Use cache if available and not refreshing
    if (!isRefresh) {
      const cached = getCachedNews();
      if (cached) {
        setNews(cached);
        setLoading(false);
        return;
      }
    }

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
        setCachedNews(data.news);
      }
    } catch (error: any) {
      console.error("Error fetching news:", error);
      // On rate limit, try to use stale cache
      const staleCache = localStorage.getItem(CACHE_KEY);
      if (staleCache) {
        const { news: cachedNews }: CachedNews = JSON.parse(staleCache);
        setNews(cachedNews);
        toast.info("Showing cached news. Refresh later for updates.");
      } else if (error.message?.includes("429")) {
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
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-primary" />
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
              Financial News
            </h2>
          </div>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-3 rounded-xl min-w-[260px] flex-shrink-0">
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
          className="text-primary h-7 px-2"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {news.map((item) => (
          <Card 
            key={item.id} 
            className="p-3 rounded-xl min-w-[260px] flex-shrink-0 transition-all hover:shadow-md"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${getSentimentBg(item.sentiment)}`}>
                  {getSentimentIcon(item.sentiment)}
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                  {item.category}
                </span>
              </div>
              
              <h3 className="font-semibold text-[13px] leading-tight line-clamp-2">
                {item.headline}
              </h3>
              
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                {item.summary}
              </p>

              {item.relatedLessonId && (
                <Link 
                  to="/learn" 
                  className="flex items-center gap-1 text-primary text-[11px] font-medium ios-press"
                >
                  <BookOpen className="w-3 h-3" />
                  <span className="truncate">{item.relatedLessonTitle}</span>
                  <ChevronRight className="w-3 h-3 flex-shrink-0" />
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>

      {news.length === 0 && !loading && (
        <Card className="p-4 rounded-xl text-center">
          <Newspaper className="w-8 h-8 mx-auto mb-1 text-muted-foreground" />
          <p className="text-[13px] text-muted-foreground">No news available</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(true)}
            className="mt-2"
          >
            Try Again
          </Button>
        </Card>
      )}
    </div>
  );
};
