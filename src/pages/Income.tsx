import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Briefcase, Gift, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Income = () => {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch recent income
  const { data: recentIncome, isLoading } = useQuery({
    queryKey: ["income", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("income")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Add income mutation
  const addIncomeMutation = useMutation({
    mutationFn: async (incomeData: { amount: number; title: string; category: string }) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("income")
        .insert({
          user_id: user.id,
          amount: incomeData.amount,
          title: incomeData.title,
          category: incomeData.category,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", user?.id] });
      toast.success(`Added $${amount} income! +25 XP`, {
        description: `${title} logged successfully`,
      });
      // Reset form
      setAmount("");
      setTitle("");
      setSelectedCategory("");
    },
    onError: (error) => {
      toast.error("Failed to add income", {
        description: error.message,
      });
    },
  });

  const categories = [
    { id: "gig", label: "Gig Work", icon: Briefcase, color: "text-primary" },
    { id: "allowance", label: "Allowance", icon: Gift, color: "text-secondary" },
    { id: "job", label: "Part-time Job", icon: TrendingUp, color: "text-success" },
    { id: "other", label: "Other", icon: DollarSign, color: "text-accent" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || !selectedCategory) {
      toast.error("Please fill in all fields");
      return;
    }
    
    addIncomeMutation.mutate({
      amount: parseFloat(amount),
      title,
      category: selectedCategory,
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-success text-success-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold">Add Income</h1>
          <p className="text-sm opacity-90 mt-1">Track your earnings and hustle!</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6 bg-gradient-card border-0 shadow-md">
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount" className="text-base font-semibold">Amount</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-10 text-2xl font-bold h-14"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title" className="text-base font-semibold">Description</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="What did you earn this from?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Category</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedCategory === cat.id
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${cat.color}`} />
                        <p className="text-sm font-medium">{cat.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>

          <Button type="submit" className="w-full h-12 text-lg font-semibold" size="lg">
            Add Income +25 XP
          </Button>
        </form>

        {/* Recent Income */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-3">Recent Income</h2>
          {isLoading ? (
            <Card className="p-4 bg-gradient-card border-0">
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ) : recentIncome && recentIncome.length > 0 ? (
            <Card className="divide-y bg-gradient-card border-0">
              {recentIncome.map((income) => {
                const category = categories.find(cat => cat.id === income.category);
                const Icon = category?.icon || DollarSign;
                const date = new Date(income.created_at);
                const isToday = date.toDateString() === new Date().toDateString();
                const dateText = isToday ? "Today" : date.toLocaleDateString();
                
                return (
                  <div key={income.id} className="p-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-success/10 p-2 rounded-xl">
                        <Icon className={`w-5 h-5 ${category?.color || "text-success"}`} />
                      </div>
                      <div>
                        <p className="font-semibold">{income.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {category?.label || "Other"} • {dateText}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-success">+${income.amount.toFixed(2)}</p>
                  </div>
                );
              })}
            </Card>
          ) : (
            <Card className="p-8 bg-gradient-card border-0 text-center">
              <p className="text-muted-foreground">No income recorded yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Income;
