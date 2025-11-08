import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  TrendingUp, 
  Target, 
  Award, 
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Zap,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState<string>("User");
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [stats] = useState({
    totalEarnings: 452.50,
    totalSpent: 187.30,
    totalSavings: 265.20,
    level: 5,
    xp: 1250,
    xpToNext: 1500,
    streak: 7
  });

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

  const recentTransactions = [
    { id: 1, type: "income", title: "Lawn Mowing", amount: 40, category: "Gig", date: "Today" },
    { id: 2, type: "expense", title: "Coffee", amount: 5.50, category: "Food", date: "Today" },
    { id: 3, type: "income", title: "Tutoring", amount: 60, category: "Service", date: "Yesterday" },
  ];

  const savingsGoals = [
    { id: 1, title: "New Laptop", target: 800, current: 265.20, emoji: "💻" },
    { id: 2, title: "Concert Tickets", target: 150, current: 120, emoji: "🎵" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              {loadingProfile ? (
                <>
                  <Skeleton className="h-8 w-32 mb-2 bg-white/20" />
                  <Skeleton className="h-4 w-40 bg-white/20" />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold">Hey, {username}! 👋</h1>
                  <p className="text-sm opacity-90">Level {stats.level} Financial Rookie</p>
                </>
              )}
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                <Zap className="w-4 h-4" />
                <span className="font-bold">{stats.streak} Day Streak!</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 mb-4">
            <p className="text-sm opacity-90 mb-1">Total Balance</p>
            <p className="text-4xl font-bold">${stats.totalSavings.toFixed(2)}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="w-4 h-4 text-success" />
                <span>${stats.totalEarnings.toFixed(2)} earned</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="w-4 h-4 text-destructive" />
                <span>${stats.totalSpent.toFixed(2)} spent</span>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
            <div className="flex justify-between text-sm mb-2">
              <span>XP Progress</span>
              <span className="font-bold">{stats.xp}/{stats.xpToNext}</span>
            </div>
            <Progress value={(stats.xp / stats.xpToNext) * 100} className="h-2" />
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link to="/income">
            <Card className="p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-success border-0">
              <div className="flex items-center gap-3">
                <div className="bg-success-foreground/20 p-2 rounded-xl">
                  <Plus className="w-5 h-5 text-success-foreground" />
                </div>
                <div className="text-success-foreground">
                  <p className="font-semibold">Add Income</p>
                  <p className="text-xs opacity-90">Log earnings</p>
                </div>
              </div>
            </Card>
          </Link>
          
          <Link to="/expenses">
            <Card className="p-4 hover:shadow-md transition-all cursor-pointer bg-gradient-accent border-0">
              <div className="flex items-center gap-3">
                <div className="bg-accent-foreground/20 p-2 rounded-xl">
                  <Wallet className="w-5 h-5 text-accent-foreground" />
                </div>
                <div className="text-accent-foreground">
                  <p className="font-semibold">Add Expense</p>
                  <p className="text-xs opacity-90">Track spending</p>
                </div>
              </div>
            </Card>
          </Link>
        </div>

        {/* Savings Goals */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Savings Goals
            </h2>
            <Link to="/goals">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {savingsGoals.map(goal => (
              <Card key={goal.id} className="p-4 hover:shadow-md transition-all bg-gradient-card border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="font-semibold">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {Math.round((goal.current / goal.target) * 100)}%
                  </span>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Activity
          </h2>
          <Card className="divide-y bg-gradient-card border-0">
            {recentTransactions.map(tx => (
              <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${
                    tx.type === "income" ? "bg-success/10" : "bg-destructive/10"
                  }`}>
                    {tx.type === "income" ? (
                      <ArrowUpRight className="w-4 h-4 text-success" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{tx.title}</p>
                    <p className="text-xs text-muted-foreground">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <p className={`font-bold ${
                  tx.type === "income" ? "text-success" : "text-destructive"
                }`}>
                  {tx.type === "income" ? "+" : "-"}${tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </Card>
        </div>

        {/* Learning Prompt */}
        <Link to="/learn">
          <Card className="p-4 bg-gradient-primary border-0 hover:shadow-lg transition-all cursor-pointer">
            <div className="flex items-center justify-between text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold">Continue Learning</p>
                  <p className="text-sm opacity-90">Earn 50 XP • 5 min read</p>
                </div>
              </div>
              <Award className="w-6 h-6" />
            </div>
          </Card>
        </Link>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto flex justify-around py-3 px-4">
          <Link to="/" className="flex flex-col items-center gap-1 text-primary">
            <Wallet className="w-6 h-6" />
            <span className="text-xs font-medium">Home</span>
          </Link>
          <Link to="/analytics" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <BarChart3 className="w-6 h-6" />
            <span className="text-xs">Analytics</span>
          </Link>
          <Link to="/goals" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Target className="w-6 h-6" />
            <span className="text-xs">Goals</span>
          </Link>
          <Link to="/learn" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <BookOpen className="w-6 h-6" />
            <span className="text-xs">Learn</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <Award className="w-6 h-6" />
            <span className="text-xs">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Index;
