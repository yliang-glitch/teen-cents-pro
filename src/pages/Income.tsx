import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign, Briefcase, Gift, TrendingUp, Pencil, Trash2, Search,
  Bitcoin, Coins, ChevronRight, ShoppingBag, Video, Baby, GraduationCap,
  Gamepad2, MoreHorizontal, Camera, StickyNote, Flame, ArrowDownUp,
  Zap,
} from "lucide-react";
import { IOSHeader } from "@/components/IOSHeader";
import { IOSTabBar } from "@/components/IOSTabBar";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import confetti from "canvas-confetti";
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

const hustleTypes = [
  { id: "reselling", label: "Reselling", icon: ShoppingBag },
  { id: "content", label: "Content Creation", icon: Video },
  { id: "babysitting", label: "Babysitting/Pet Sitting", icon: Baby },
  { id: "tutoring", label: "Tutoring", icon: GraduationCap },
  { id: "gaming", label: "Gaming", icon: Gamepad2 },
  { id: "other", label: "Other", icon: MoreHorizontal },
];

const getHustleIcon = (type: string | null) => {
  return hustleTypes.find((h) => h.id === type)?.icon || Briefcase;
};

const getHustleLabel = (type: string | null) => {
  return hustleTypes.find((h) => h.id === type)?.label || "Gig Work";
};

const Income = () => {
  const [amount, setAmount] = useState("");
  const [title, setTitle] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [deletingIncomeId, setDeletingIncomeId] = useState<string | null>(null);

  // Hustle-specific state
  const [hustleType, setHustleType] = useState("");
  const [cost, setCost] = useState("");
  const [note, setNote] = useState("");
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [hustleFilter, setHustleFilter] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successAmount, setSuccessAmount] = useState("");

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
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Monthly hustle stats
  const monthlyHustleTotal = useMemo(() => {
    if (!recentIncome) return 0;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return recentIncome
      .filter(
        (i: any) =>
          i.category === "gig" &&
          new Date(i.created_at) >= startOfMonth
      )
      .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
  }, [recentIncome]);

  // Hustle logs only
  const hustleLogs = useMemo(() => {
    if (!recentIncome) return [];
    let logs = recentIncome.filter((i: any) => i.category === "gig");
    if (hustleFilter) {
      logs = logs.filter((i: any) => i.hustle_type === hustleFilter);
    }
    return logs;
  }, [recentIncome, hustleFilter]);

  // Weekly streak tracker - consecutive days with hustle income
  const streakData = useMemo(() => {
    if (!recentIncome) return { streak: 0, weekDays: [] as { label: string; active: boolean; isToday: boolean }[] };
    const hustleDates = new Set(
      recentIncome
        .filter((i: any) => i.category === "gig")
        .map((i: any) => new Date(i.created_at).toDateString())
    );
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let checkDate = new Date(today);
    if (!hustleDates.has(checkDate.toDateString())) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    while (hustleDates.has(checkDate.toDateString())) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    const weekDays: { label: string; active: boolean; isToday: boolean }[] = [];
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      weekDays.push({ label: dayLabels[d.getDay()], active: hustleDates.has(d.toDateString()), isToday: i === 0 });
    }
    return { streak, weekDays };
  }, [recentIncome]);

  const fireConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
      colors: ["#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"],
    });
  };

  // Add income mutation
  const addIncomeMutation = useMutation({
    mutationFn: async (incomeData: {
      amount: number;
      title: string;
      category: string;
      hustle_type?: string;
      cost?: number;
      note?: string;
      screenshot_url?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase.from("income").insert({
        user_id: user.id,
        amount: incomeData.amount,
        title: incomeData.title,
        category: incomeData.category,
        hustle_type: incomeData.hustle_type || null,
        cost: incomeData.cost ?? null,
        note: incomeData.note || null,
        screenshot_url: incomeData.screenshot_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", user?.id] });

      if (selectedCategory === "gig") {
        setSuccessAmount(amount);
        setShowSuccess(true);
        fireConfetti();
        setTimeout(() => setShowSuccess(false), 2500);
      } else {
        toast.success(`Added $${amount} income! +25 XP`, {
          description: `${title} logged successfully`,
        });
      }

      setAmount("");
      setTitle("");
      setSelectedCategory("");
      setHustleType("");
      setCost("");
      setNote("");
      setScreenshotUrl("");
    },
    onError: (error) => {
      toast.error("Failed to add income", { description: error.message });
    },
  });

  // Update income mutation
  const updateIncomeMutation = useMutation({
    mutationFn: async (incomeData: { id: string; amount: number; title: string; category: string }) => {
      const { error } = await supabase
        .from("income")
        .update({ amount: incomeData.amount, title: incomeData.title, category: incomeData.category })
        .eq("id", incomeData.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", user?.id] });
      toast.success("Income updated successfully");
      setEditingIncome(null);
    },
    onError: (error) => {
      toast.error("Failed to update income", { description: error.message });
    },
  });

  // Delete income mutation
  const deleteIncomeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("income").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income", user?.id] });
      toast.success("Income deleted successfully");
      setDeletingIncomeId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete income", { description: error.message });
    },
  });

  const categories = [
    { id: "gig", label: "Gig Work", icon: Briefcase, color: "text-teal" },
    { id: "allowance", label: "Allowance", icon: Gift, color: "text-secondary" },
    { id: "job", label: "Part-time Job", icon: TrendingUp, color: "text-success" },
    { id: "other", label: "Other", icon: DollarSign, color: "text-accent" },
    { id: "btc", label: "Bitcoin (BTC)", icon: Bitcoin, color: "text-warning" },
    { id: "xrp", label: "Ripple (XRP)", icon: Coins, color: "text-muted-foreground" },
  ];

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const filePath = `${user.id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("receipts").upload(filePath, file);
    if (error) {
      toast.error("Upload failed");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(filePath);
    setScreenshotUrl(urlData.publicUrl);
    setUploading(false);
    toast.success("Screenshot uploaded!");
  };

  const profit = useMemo(() => {
    const sale = parseFloat(amount);
    const c = parseFloat(cost);
    if (!isNaN(sale) && !isNaN(c) && c > 0) return sale - c;
    return null;
  }, [amount, cost]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !title || !selectedCategory) {
      toast.error("Please fill in all fields");
      return;
    }
    if (selectedCategory === "gig" && !hustleType) {
      toast.error("Please select a hustle type");
      return;
    }
    addIncomeMutation.mutate({
      amount: parseFloat(amount),
      title,
      category: selectedCategory,
      hustle_type: selectedCategory === "gig" ? hustleType : undefined,
      cost: selectedCategory === "gig" && cost ? parseFloat(cost) : undefined,
      note: selectedCategory === "gig" && note ? note : undefined,
      screenshot_url: selectedCategory === "gig" && screenshotUrl ? screenshotUrl : undefined,
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
    <div className="min-h-screen bg-background pb-24 safe-area-inset">
      <IOSHeader title="Income" largeTitle showBack backPath="/" />

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Success Overlay */}
        {showSuccess && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
            <div className="text-center space-y-3">
              <div className="text-6xl">🎉</div>
              <p className="text-2xl font-bold text-teal">
                +${parseFloat(successAmount).toFixed(2)} added to hustles!
              </p>
              <p className="text-muted-foreground">Keep grinding! 💪</p>
            </div>
          </div>
        )}

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
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          if (cat.id !== "gig") {
                            setHustleType("");
                            setCost("");
                            setNote("");
                            setScreenshotUrl("");
                          }
                        }}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          selectedCategory === cat.id
                            ? cat.id === "gig"
                              ? "border-teal bg-teal/10 shadow-sm"
                              : "border-primary bg-primary/5 shadow-sm"
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

              {/* Hustle-specific fields */}
              {selectedCategory === "gig" && (
                <div className="space-y-4 pt-2 border-t border-teal/20">
                  <div className="flex items-center gap-2 pt-2">
                    <Flame className="w-5 h-5 text-teal" />
                    <p className="text-base font-semibold text-teal">Hustle Details</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Hustle Type</Label>
                    <Select value={hustleType} onValueChange={setHustleType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select hustle type..." />
                      </SelectTrigger>
                      <SelectContent>
                        {hustleTypes.map((ht) => (
                          <SelectItem key={ht.id} value={ht.id}>
                            <span className="flex items-center gap-2">
                              <ht.icon className="w-4 h-4" />
                              {ht.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Profit Calculator */}
                  <div>
                    <Label className="text-sm font-medium">Cost (optional)</Label>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="What did it cost you?"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    {profit !== null && (
                      <div className={`mt-2 p-2.5 rounded-lg text-sm font-bold flex items-center gap-2 ${
                        profit >= 0
                          ? "bg-teal/10 text-teal"
                          : "bg-destructive/10 text-destructive"
                      }`}>
                        <ArrowDownUp className="w-4 h-4" />
                        Profit = ${profit.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Quick Note */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <StickyNote className="w-3.5 h-3.5" /> Quick Note (optional)
                    </Label>
                    <Textarea
                      placeholder="Any details about this hustle..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="mt-1 resize-none"
                      rows={2}
                    />
                  </div>

                  {/* Screenshot Upload */}
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Screenshot (optional)
                    </Label>
                    <div className="mt-1">
                      {screenshotUrl ? (
                        <div className="relative rounded-lg overflow-hidden border border-teal/30">
                          <img src={screenshotUrl} alt="Screenshot" className="w-full max-h-40 object-cover" />
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="absolute top-2 right-2"
                            onClick={() => setScreenshotUrl("")}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-teal/30 rounded-lg cursor-pointer hover:border-teal/60 transition-colors text-sm text-muted-foreground">
                          <Camera className="w-4 h-4" />
                          {uploading ? "Uploading..." : "Upload PayPal/Venmo screenshot"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleScreenshotUpload}
                            disabled={uploading}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Button
            type="submit"
            className={`w-full h-12 text-lg font-semibold ${
              selectedCategory === "gig"
                ? "bg-teal hover:bg-teal/90 text-teal-foreground"
                : ""
            }`}
            size="lg"
          >
            {selectedCategory === "gig" ? "Log Hustle 🔥" : "Add Income +25 XP"}
          </Button>
        </form>

        {/* Hustle Stats & Logs Section */}
        {hustleLogs.length > 0 && (
          <div className="mt-8">
            {/* Monthly Stats Bar */}
            <Card className="p-4 bg-teal/10 border border-teal/20 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-teal uppercase tracking-wide">Total Hustle Earnings This Month</p>
                  <p className="text-2xl font-bold text-teal">${monthlyHustleTotal.toFixed(2)}</p>
                </div>
                <Flame className="w-8 h-8 text-teal" />
              </div>
            </Card>

            {/* Weekly Streak Tracker */}
            <Card className="p-4 border border-teal/20 mb-4 overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-teal" />
                  <p className="text-sm font-bold">Hustle Streak</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-2xl font-black text-teal">{streakData.streak}</span>
                  <span className="text-xs text-muted-foreground font-medium">
                    {streakData.streak === 1 ? "day" : "days"}
                  </span>
                </div>
              </div>
              <div className="flex justify-between gap-1">
                {streakData.weekDays.map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        day.active
                          ? "bg-teal text-teal-foreground shadow-md"
                          : day.isToday
                          ? "border-2 border-teal/40 text-teal"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {day.active ? "🔥" : day.label}
                    </div>
                    <span className={`text-[10px] font-medium ${day.isToday ? "text-teal" : "text-muted-foreground"}`}>
                      {day.isToday ? "Today" : day.label}
                    </span>
                  </div>
                ))}
              </div>
              {streakData.streak >= 3 && (
                <p className="text-xs text-teal font-semibold text-center mt-3">
                  {streakData.streak >= 7 ? "🏆 Legendary week! Keep dominating!" : "🔥 You're on fire! Don't break the streak!"}
                </p>
              )}
            </Card>


            <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
              <button
                onClick={() => setHustleFilter(null)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  !hustleFilter
                    ? "bg-teal text-teal-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All
              </button>
              {hustleTypes.map((ht) => (
                <button
                  key={ht.id}
                  onClick={() => setHustleFilter(hustleFilter === ht.id ? null : ht.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                    hustleFilter === ht.id
                      ? "bg-teal text-teal-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <ht.icon className="w-3 h-3" />
                  {ht.label}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-bold mb-3">Recent Hustles</h2>

            <div className="space-y-3">
              {hustleLogs.map((income: any) => {
                const HIcon = getHustleIcon(income.hustle_type);
                const date = new Date(income.created_at);
                const isToday = date.toDateString() === new Date().toDateString();
                const dateText = isToday ? "Today" : date.toLocaleDateString();
                const incomeProfit =
                  income.cost != null && income.cost > 0
                    ? income.amount - income.cost
                    : null;

                return (
                  <Card key={income.id} className="p-4 border-0 bg-gradient-card shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="bg-teal/15 p-2.5 rounded-xl shrink-0">
                        <HIcon className="w-5 h-5 text-teal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold truncate">{income.title}</p>
                          <p className="font-bold text-teal shrink-0">+${income.amount.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="secondary" className="text-[10px] bg-teal/10 text-teal border-0">
                            {getHustleLabel(income.hustle_type)}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{dateText}</span>
                        </div>
                        {incomeProfit !== null && (
                          <p className={`text-xs font-semibold mt-1 ${incomeProfit >= 0 ? "text-teal" : "text-destructive"}`}>
                            Profit: ${incomeProfit.toFixed(2)}
                          </p>
                        )}
                        {income.note && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">{income.note}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingIncome(income)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => setDeletingIncomeId(income.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Income (all categories) */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Recent Income</h2>
          </div>

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
                .filter(
                  (income: any) =>
                    income.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    categories
                      .find((c) => c.id === income.category)
                      ?.label.toLowerCase()
                      .includes(searchQuery.toLowerCase())
                )
                .map((income: any) => {
                  const category = categories.find((cat) => cat.id === income.category);
                  const Icon = category?.icon || DollarSign;
                  const date = new Date(income.created_at);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const dateText = isToday ? "Today" : date.toLocaleDateString();

                  return (
                    <div key={income.id} className="p-4 flex justify-between items-center group">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`${income.category === "gig" ? "bg-teal/10" : "bg-success/10"} p-2 rounded-xl`}>
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
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditingIncome(income)}>
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

      <IOSTabBar />
    </div>
  );
};

export default Income;
