import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Zap,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { IOSTabBar } from "@/components/IOSTabBar";
import { FinancialInsights } from "@/components/FinancialInsights";
import { FinancialNews } from "@/components/FinancialNews";

const Index = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("User");
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      setLoadingProfile(true);
      const { data } = await supabase
        .from("profiles")
        .select("username")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data?.username) {
        setUsername(data.username);
      }
      setLoadingProfile(false);
    };

    fetchUsername();
  }, [user]);

  // Fetch income data
  const { data: incomeData = [], isLoading: loadingIncome } = useQuery({
    queryKey: ["income", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch expenses data
  const { data: expensesData = [], isLoading: loadingExpenses } = useQuery({
    queryKey: ["expenses", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch goals data
  const { data: goalsData = [], isLoading: loadingGoals } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(2);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const totalEarnings = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalSpent = expensesData.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalBalance = totalEarnings - totalSpent;

  // Combine and sort recent transactions
  const recentTransactions = [
    ...incomeData.slice(0, 5).map(item => ({
      id: item.id,
      type: "income" as const,
      title: item.title,
      amount: Number(item.amount),
      category: item.category,
      date: item.created_at,
    })),
    ...expensesData.slice(0, 5).map(item => ({
      id: item.id,
      type: "expense" as const,
      title: item.title,
      amount: Number(item.amount),
      category: item.category,
      date: item.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const isLoading = loadingIncome || loadingExpenses || loadingGoals;

  const stats = {
    totalEarnings,
    totalSpent,
    totalSavings: totalBalance,
    level: 5,
    xp: 1250,
    xpToNext: 1500,
    streak: 7
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-inset">
      {/* iOS Large Title Header */}
      <header className="pt-4 px-4 pb-2 safe-area-top">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start mb-1">
            {loadingProfile ? (
              <Skeleton className="h-10 w-48" />
            ) : (
              <h1 className="ios-large-title">Hey, {username}! 👋</h1>
            )}
            <div className="flex items-center gap-1.5 bg-accent/15 text-accent px-3 py-1.5 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-semibold">{stats.streak}</span>
            </div>
          </div>
          <p className="text-muted-foreground text-[15px]">Level {stats.level} Financial Rookie</p>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 space-y-6">
        {/* Balance Card - iOS Style */}
        <Card className="p-5 bg-primary text-primary-foreground rounded-2xl shadow-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8" />
          
          <div className="relative">
            <p className="text-[13px] font-medium opacity-80 mb-1">Total Balance</p>
            <p className="text-[42px] font-bold tracking-tight leading-none mb-4">
              ${stats.totalSavings.toFixed(2)}
            </p>
            
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] opacity-70">Income</p>
                  <p className="text-[15px] font-semibold">${stats.totalEarnings.toFixed(2)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[11px] opacity-70">Expenses</p>
                  <p className="text-[15px] font-semibold">${stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* XP Progress */}
        <Card className="p-4 rounded-2xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-muted-foreground font-medium">XP Progress</span>
            <span className="text-[13px] font-semibold text-primary">{stats.xp}/{stats.xpToNext}</span>
          </div>
          <Progress value={(stats.xp / stats.xpToNext) * 100} className="h-2" />
        </Card>

        {/* Quick Actions - iOS Button Style */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/income" className="ios-press">
            <Card className="p-4 rounded-2xl bg-success hover:bg-success/90 transition-colors border-0">
              <div className="flex items-center gap-3 text-success-foreground">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[15px]">Add Income</p>
                  <p className="text-[11px] opacity-80">Log earnings</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link to="/expenses" className="ios-press">
            <Card className="p-4 rounded-2xl bg-accent hover:bg-accent/90 transition-colors border-0">
              <div className="flex items-center gap-3 text-accent-foreground">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-[15px]">Add Expense</p>
                  <p className="text-[11px] opacity-80">Track spending</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Savings Goals - iOS Grouped List */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide">
              Savings Goals
            </h2>
            <Link to="/goals" className="text-primary text-[15px] font-medium ios-press">
              See All
            </Link>
          </div>
          
          <div className="ios-grouped-list">
            {isLoading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="ios-list-item">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-2 w-full" />
                    </div>
                  </div>
                </div>
              ))
            ) : goalsData.length === 0 ? (
              <Link to="/goals" className="ios-list-item ios-press">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-[15px]">Create your first goal</p>
                    <p className="text-[13px] text-muted-foreground">Start saving today</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </Link>
            ) : (
              goalsData.map(goal => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                return (
                  <Link key={goal.id} to="/goals" className="ios-list-item ios-press">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-medium text-[15px]">{goal.title}</p>
                          <span className="text-[13px] font-semibold text-primary">
                            {Math.round(progress)}%
                          </span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-[11px] text-muted-foreground mt-1">
                          ${goal.current_amount.toFixed(2)} of ${goal.target_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground ml-2" />
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity - iOS Grouped List */}
        <div>
          <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wide mb-3 px-1">
            Recent Activity
          </h2>
          
          <div className="ios-grouped-list">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="ios-list-item">
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-16" />
                </div>
              ))
            ) : recentTransactions.length === 0 ? (
              <div className="py-8 text-center">
                <TrendingUp className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-[15px] text-muted-foreground">No transactions yet</p>
                <p className="text-[13px] text-muted-foreground">Start tracking your money!</p>
              </div>
            ) : (
              recentTransactions.map(tx => {
                const txDate = new Date(tx.date);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);
                
                let dateLabel = format(txDate, 'MMM d');
                if (txDate.toDateString() === today.toDateString()) {
                  dateLabel = 'Today';
                } else if (txDate.toDateString() === yesterday.toDateString()) {
                  dateLabel = 'Yesterday';
                }

                return (
                  <div key={tx.id} className="ios-list-item">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === "income" ? "bg-success/10" : "bg-destructive/10"
                      }`}>
                        {tx.type === "income" ? (
                          <ArrowUpRight className="w-5 h-5 text-success" />
                        ) : (
                          <ArrowDownRight className="w-5 h-5 text-destructive" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[15px]">{tx.title}</p>
                        <p className="text-[13px] text-muted-foreground">{dateLabel}</p>
                      </div>
                    </div>
                    <p className={`font-semibold text-[15px] ${
                      tx.type === "income" ? "text-success" : "text-destructive"
                    }`}>
                      {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Financial News */}
        <FinancialNews />

        {/* AI Financial Insights */}
        <FinancialInsights 
          userContext={totalBalance > 0 
            ? `Balance: $${totalBalance.toFixed(2)}, Income: $${totalEarnings.toFixed(2)}, Expenses: $${totalSpent.toFixed(2)}` 
            : undefined
          } 
        />

        {/* Learning Prompt - iOS Card */}
        <Link to="/learn" className="ios-press block">
          <Card className="p-4 rounded-2xl bg-primary border-0 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-6 -mt-6" />
            <div className="flex items-center justify-between text-primary-foreground relative">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-[17px]">Continue Learning</p>
                  <p className="text-[13px] opacity-80">Earn 50 XP • 5 min read</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 opacity-60" />
            </div>
          </Card>
        </Link>
      </div>

      {/* iOS Tab Bar */}
      <IOSTabBar />
    </div>
  );
};

export default Index;
