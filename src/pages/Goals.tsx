import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, ChevronRight } from "lucide-react";
import { IOSHeader } from "@/components/IOSHeader";
import { IOSTabBar } from "@/components/IOSTabBar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const Goals = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newGoal, setNewGoal] = useState({ title: "", target: "" });
  const [open, setOpen] = useState(false);

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const addGoalMutation = useMutation({
    mutationFn: async (goal: { title: string; target_amount: number }) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          title: goal.title,
          target_amount: goal.target_amount,
          current_amount: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast.success("Goal created! +50 XP", {
        description: `Start saving for ${newGoal.title}!`,
      });
      setNewGoal({ title: "", target: "" });
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to create goal", {
        description: error.message,
      });
    },
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, amount }: { goalId: string; amount: number }) => {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) throw new Error("Goal not found");

      const newAmount = goal.current_amount + amount;

      const { data, error } = await supabase
        .from("goals")
        .update({ current_amount: newAmount })
        .eq("id", goalId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["goals", user?.id] });
      toast.success(`Added $${variables.amount} to goal!`, {
        description: `${data.title}: $${data.current_amount.toFixed(2)}/$${data.target_amount.toFixed(2)}`,
      });
    },
    onError: (error) => {
      toast.error("Failed to update goal", {
        description: error.message,
      });
    },
  });

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target) {
      toast.error("Please fill in all fields");
      return;
    }

    addGoalMutation.mutate({
      title: newGoal.title,
      target_amount: parseFloat(newGoal.target),
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-inset">
      <IOSHeader 
        title="Goals" 
        largeTitle 
        showBack 
        backPath="/"
        rightAction={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost" className="text-primary ios-press">
                <Plus className="w-6 h-6" />
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-center text-[17px]">New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="title" className="text-[13px] text-muted-foreground uppercase">Goal Name</Label>
                  <Input
                    id="title"
                    placeholder="New Sneakers"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="target" className="text-[13px] text-muted-foreground uppercase">Target Amount ($)</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="150.00"
                    value={newGoal.target}
                    onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    className="mt-1 h-12 rounded-xl"
                  />
                </div>
                <Button onClick={handleAddGoal} className="w-full h-12 rounded-xl text-[17px] font-semibold" disabled={addGoalMutation.isPending}>
                  {addGoalMutation.isPending ? "Creating..." : "Create Goal"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 bg-gradient-card border-0">
            <div className="flex items-center gap-2 text-primary mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Active Goals</span>
            </div>
            <p className="text-2xl font-bold">{goals.length}</p>
          </Card>
          <Card className="p-4 bg-gradient-card border-0">
            <div className="flex items-center gap-2 text-success mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-medium">Total Saved</span>
            </div>
            <p className="text-2xl font-bold">
              ${goals.reduce((sum, g) => sum + g.current_amount, 0).toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => (
              <Card key={i} className="p-5 bg-gradient-card border-0">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="h-3 w-full mb-3" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 flex-1" />
                </div>
              </Card>
            ))
          ) : goals.length === 0 ? (
            <Card className="p-8 bg-gradient-card border-0 text-center">
              <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">No goals yet. Create your first goal!</p>
            </Card>
          ) : (
            goals.map((goal) => {
              const progress = (goal.current_amount / goal.target_amount) * 100;
              const isCompleted = progress >= 100;
              
              return (
                <Card 
                  key={goal.id} 
                  className={`p-5 bg-gradient-card border-0 hover:shadow-md transition-all ${
                    isCompleted ? "ring-2 ring-success" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Target className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-bold text-lg">{goal.title}</p>
                        <p className="text-sm text-muted-foreground">
                          ${goal.current_amount.toFixed(2)} of ${goal.target_amount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${
                        isCompleted ? "text-success" : "text-primary"
                      }`}>
                        {Math.round(progress)}%
                      </p>
                      {isCompleted && (
                        <span className="text-xs text-success font-medium">Complete! 🎉</span>
                      )}
                    </div>
                  </div>
                  
                  <Progress value={progress} className="h-3 mb-3" />
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => updateGoalMutation.mutate({ goalId: goal.id, amount: 10 })}
                      disabled={updateGoalMutation.isPending}
                    >
                      Add $10
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => updateGoalMutation.mutate({ goalId: goal.id, amount: 25 })}
                      disabled={updateGoalMutation.isPending}
                    >
                      Add $25
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Tips Card */}
        <Card className="p-5 bg-gradient-success border-0 text-success-foreground">
          <h3 className="font-bold mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Pro Tip
          </h3>
          <p className="text-sm opacity-90">
            Set aside 20% of every income you log! Small, consistent savings add up fast. 💪
          </p>
        </Card>
      </div>

      <IOSTabBar />
    </div>
  );
};

export default Goals;
