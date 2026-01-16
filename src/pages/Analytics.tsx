import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { IOSHeader } from "@/components/IOSHeader";
import { IOSTabBar } from "@/components/IOSTabBar";

const Analytics = () => {
  // Sample data for the last 7 days
  const weeklyData = [
    { day: "Mon", income: 45, expenses: 22 },
    { day: "Tue", income: 30, expenses: 35 },
    { day: "Wed", income: 60, expenses: 18 },
    { day: "Thu", income: 25, expenses: 42 },
    { day: "Fri", income: 80, expenses: 28 },
    { day: "Sat", income: 55, expenses: 55 },
    { day: "Sun", income: 40, expenses: 30 },
  ];

  // Monthly trend data
  const monthlyData = [
    { month: "Jan", income: 450, expenses: 320 },
    { month: "Feb", income: 520, expenses: 380 },
    { month: "Mar", income: 480, expenses: 420 },
    { month: "Apr", income: 600, expenses: 390 },
    { month: "May", income: 680, expenses: 450 },
    { month: "Jun", income: 720, expenses: 480 },
  ];

  // Expense breakdown by category
  const expenseBreakdown = [
    { name: "Food & Drinks", value: 125, color: "hsl(var(--accent))" },
    { name: "Shopping", value: 85, color: "hsl(var(--secondary))" },
    { name: "Tech & Apps", value: 65, color: "hsl(var(--primary))" },
    { name: "Entertainment", value: 45, color: "hsl(var(--destructive))" },
  ];

  // Income sources breakdown
  const incomeBreakdown = [
    { name: "Gig Work", value: 180, color: "hsl(var(--primary))" },
    { name: "Part-time Job", value: 250, color: "hsl(var(--success))" },
    { name: "Allowance", value: 100, color: "hsl(var(--secondary))" },
    { name: "Other", value: 50, color: "hsl(var(--accent))" },
  ];

  const totalIncome = weeklyData.reduce((sum, day) => sum + day.income, 0);
  const totalExpenses = weeklyData.reduce((sum, day) => sum + day.expenses, 0);
  const netSavings = totalIncome - totalExpenses;

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-inset">
      <IOSHeader title="Analytics" largeTitle showBack backPath="/" />

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-gradient-card border-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-success/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week Income</p>
                <p className="text-2xl font-bold text-success">${totalIncome}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-card border-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-destructive/10 p-3 rounded-xl">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Week Expenses</p>
                <p className="text-2xl font-bold text-destructive">${totalExpenses}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-card border-0 shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Savings</p>
                <p className={`text-2xl font-bold ${netSavings >= 0 ? 'text-success' : 'text-destructive'}`}>
                  ${netSavings}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Weekly Trend Chart */}
        <Card className="p-6 bg-gradient-card border-0 shadow-md">
          <h2 className="text-xl font-bold mb-4">Weekly Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="income" 
                stroke="hsl(var(--success))" 
                strokeWidth={2}
                name="Income"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="hsl(var(--destructive))" 
                strokeWidth={2}
                name="Expenses"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Monthly Trend */}
        <Card className="p-6 bg-gradient-card border-0 shadow-md">
          <h2 className="text-xl font-bold mb-4">6-Month Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--success))" name="Income" />
              <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Breakdown Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <Card className="p-6 bg-gradient-card border-0 shadow-md">
            <h2 className="text-xl font-bold mb-4">Expense Breakdown</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={expenseBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                >
                  {expenseBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {expenseBreakdown.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold">${item.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Income Sources */}
          <Card className="p-6 bg-gradient-card border-0 shadow-md">
            <h2 className="text-xl font-bold mb-4">Income Sources</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={incomeBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="hsl(var(--success))"
                  dataKey="value"
                >
                  {incomeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px"
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {incomeBreakdown.map((item) => (
                <div key={item.name} className="flex justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-semibold">${item.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <IOSTabBar />
    </div>
  );
};

export default Analytics;
