import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Briefcase, Gift, TrendingUp, Pencil, Trash2, Search, Bitcoin, Coins } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Income = () => {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);
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

  // Update income mutation
  const updateIncomeMutation = useMutation({
    mutationFn: async (incomeData: { id: string; amount: number; title: string; category: string }) => {
      const { error } = await supabase
        .from("income")
        .update({
          amount: incomeData.amount,
          title: incomeData.title,
          category: incomeData.category,
        })
        .eq("id", incomeData.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", user?.id] });
      toast.success("Income updated successfully");
      setEditingIncome(null);
    },
    onError: (error) => {
      toast.error("Failed to update income", {
        description: error.message,
      });
    },
  });

  // Delete income mutation
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("income")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", user?.id] });
      toast.success("Income deleted successfully");
      setDeletingIncomeId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete income", {
        description: error.message,
      });
    },
  });

  const categories = [
    { id: "gig", label: "Gig Work", icon: Briefcase, color: "text-primary" },
    { id: "allowance", label: "Allowance", icon: Gift, color: "text-secondary" },
    { id: "job", label: "Part-time Job", icon: TrendingUp, color: "text-success" },
    { id: "other", label: "Other", icon: DollarSign, color: "text-accent" },
    { id: "btc", label: "Bitcoin (BTC)", icon: Bitcoin, color: "text-warning" },
    { id: "xrp", label: "Ripple (XRP)", icon: Coins, color: "text-muted-foreground" },
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIncome) return;
    
    updateIncomeMutation.mutate({
      id: editingIncome.id,
      amount: editingIncome.amount,
      title: editingIncome.title,
      category: editingIncome.category,
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
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Recent Income</h2>
          </div>
          
          {/* Search Input */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {isLoading ? (
            <Card className="p-4 bg-gradient-card border-0">
              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ) : recentIncome && recentIncome.length > 0 ? (
            <Card className="divide-y bg-gradient-card border-0">
              {recentIncome
                .filter((income) => 
                  income.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  categories.find(c => c.id === income.category)?.label.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((income) => {
                const category = categories.find(cat => cat.id === income.category);
                const Icon = category?.icon || DollarSign;
                const date = new Date(income.created_at);
                const isToday = date.toDateString() === new Date().toDateString();
                const dateText = isToday ? "Today" : date.toLocaleDateString();
                
                return (
                  <div key={income.id} className="p-4 flex justify-between items-center group">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="bg-success/10 p-2 rounded-xl">
                        <Icon className={`w-5 h-5 ${category?.color || "text-success"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold">{income.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {category?.label || "Other"} • {dateText}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-success">+${income.amount.toFixed(2)}</p>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => setEditingIncome(income)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeletingIncomeId(income.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingIncome} onOpenChange={(open) => !open && setEditingIncome(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Income</DialogTitle>
            <DialogDescription>Update your income details</DialogDescription>
          </DialogHeader>
          {editingIncome && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-amount">Amount</Label>
                <div className="relative mt-2">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editingIncome.amount}
                    onChange={(e) => setEditingIncome({ ...editingIncome, amount: parseFloat(e.target.value) })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-title">Description</Label>
                <Input
                  id="edit-title"
                  value={editingIncome.title}
                  onChange={(e) => setEditingIncome({ ...editingIncome, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setEditingIncome({ ...editingIncome, category: cat.id })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          editingIncome.category === cat.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 mx-auto mb-1 ${cat.color}`} />
                        <p className="text-xs font-medium">{cat.label}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditingIncome(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingIncomeId} onOpenChange={(open) => !open && setDeletingIncomeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingIncomeId && deleteIncomeMutation.mutate(deletingIncomeId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Income;
