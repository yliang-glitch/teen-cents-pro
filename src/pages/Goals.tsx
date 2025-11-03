import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Plus, Target, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Goals = () => {
  const [goals, setGoals] = useState([
    { id: 1, title: "New Laptop", target: 800, current: 265.20, emoji: "💻", color: "primary" },
    { id: 2, title: "Concert Tickets", target: 150, current: 120, emoji: "🎵", color: "secondary" },
    { id: 3, title: "Emergency Fund", target: 500, current: 85, emoji: "🛡️", color: "success" },
    { id: 4, title: "Birthday Gift", target: 100, current: 45, emoji: "🎁", color: "accent" },
  ]);

  const [newGoal, setNewGoal] = useState({ title: "", target: "", emoji: "" });
  const [open, setOpen] = useState(false);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.target || !newGoal.emoji) {
      toast.error("Please fill in all fields");
      return;
    }

    const goal = {
      id: goals.length + 1,
      title: newGoal.title,
      target: parseFloat(newGoal.target),
      current: 0,
      emoji: newGoal.emoji,
      color: "primary"
    };

    setGoals([...goals, goal]);
    toast.success("Goal created! +50 XP", {
      description: `Start saving for ${newGoal.title}!`,
    });
    
    setNewGoal({ title: "", target: "", emoji: "" });
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Savings Goals</h1>
              <p className="text-sm opacity-90 mt-1">Track your progress</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="icon" variant="secondary" className="rounded-full shadow-lg">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="emoji">Emoji</Label>
                    <Input
                      id="emoji"
                      placeholder="🎯"
                      value={newGoal.emoji}
                      onChange={(e) => setNewGoal({ ...newGoal, emoji: e.target.value })}
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Goal Name</Label>
                    <Input
                      id="title"
                      placeholder="New Sneakers"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="target">Target Amount ($)</Label>
                    <Input
                      id="target"
                      type="number"
                      placeholder="150.00"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                    />
                  </div>
                  <Button onClick={handleAddGoal} className="w-full">
                    Create Goal +50 XP
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-4">
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
              ${goals.reduce((sum, g) => sum + g.current, 0).toFixed(2)}
            </p>
          </Card>
        </div>

        {/* Goals List */}
        <div className="space-y-3">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
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
                    <span className="text-3xl">{goal.emoji}</span>
                    <div>
                      <p className="font-bold text-lg">{goal.title}</p>
                      <p className="text-sm text-muted-foreground">
                        ${goal.current.toFixed(2)} of ${goal.target.toFixed(2)}
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
                    onClick={() => {
                      toast.success("Added $10 to goal!", {
                        description: `${goal.title}: $${(goal.current + 10).toFixed(2)}/$${goal.target.toFixed(2)}`,
                      });
                    }}
                  >
                    Add $10
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      toast.success("Added $25 to goal!", {
                        description: `${goal.title}: $${(goal.current + 25).toFixed(2)}/$${goal.target.toFixed(2)}`,
                      });
                    }}
                  >
                    Add $25
                  </Button>
                </div>
              </Card>
            );
          })}
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
    </div>
  );
};

export default Goals;
