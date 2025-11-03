import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, DollarSign, Coffee, ShoppingBag, Smartphone, Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const Expenses = () => {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const budget = {
    total: 200,
    spent: 187.30,
    remaining: 12.70
  };

  const categories = [
    { id: "food", label: "Food & Drinks", icon: Coffee, color: "text-accent" },
    { id: "shopping", label: "Shopping", icon: ShoppingBag, color: "text-secondary" },
    { id: "tech", label: "Tech & Apps", icon: Smartphone, color: "text-primary" },
    { id: "entertainment", label: "Entertainment", icon: Gamepad2, color: "text-destructive" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || !selectedCategory) {
      toast.error("Please fill in all fields");
      return;
    }
    
    const expenseAmount = parseFloat(amount);
    const newSpent = budget.spent + expenseAmount;
    const newRemaining = budget.total - newSpent;
    
    if (newRemaining < 0) {
      toast.error("Warning: Over budget!", {
        description: `You'll be $${Math.abs(newRemaining).toFixed(2)} over your monthly budget.`,
      });
    } else if (newRemaining < 20) {
      toast.warning("Budget Alert!", {
        description: `Only $${newRemaining.toFixed(2)} left this month. Be careful!`,
      });
    } else {
      toast.success(`Logged $${amount} expense`, {
        description: `${title} tracked successfully`,
      });
    }
    
    setAmount("");
    setTitle("");
    setSelectedCategory("");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-accent text-accent-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <h1 className="text-3xl font-bold">Add Expense</h1>
          <p className="text-sm opacity-90 mt-1">Track your spending wisely</p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6">
        {/* Budget Alert */}
        <Card className="p-4 mb-6 bg-gradient-card border-0 shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold">Monthly Budget</span>
            <span className="text-sm text-muted-foreground">
              ${budget.remaining.toFixed(2)} left
            </span>
          </div>
          <Progress value={(budget.spent / budget.total) * 100} className="h-2 mb-2" />
          <p className="text-xs text-muted-foreground">
            ${budget.spent.toFixed(2)} of ${budget.total.toFixed(2)} used
          </p>
        </Card>

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
                <Label htmlFor="title" className="text-base font-semibold">What did you buy?</Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g., Coffee, Movie tickets..."
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
                            ? "border-accent bg-accent/5 shadow-sm"
                            : "border-border hover:border-accent/50"
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
            Log Expense
          </Button>
        </form>

        {/* Recent Expenses */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-3">Recent Expenses</h2>
          <Card className="divide-y bg-gradient-card border-0">
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 p-2 rounded-xl">
                  <Coffee className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">Coffee</p>
                  <p className="text-xs text-muted-foreground">Food • Today</p>
                </div>
              </div>
              <p className="font-bold text-destructive">-$5.50</p>
            </div>
            <div className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-destructive/10 p-2 rounded-xl">
                  <Gamepad2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold">Game Subscription</p>
                  <p className="text-xs text-muted-foreground">Entertainment • 2 days ago</p>
                </div>
              </div>
              <p className="font-bold text-destructive">-$9.99</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
