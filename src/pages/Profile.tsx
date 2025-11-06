import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Award, Zap, TrendingUp, Target, Star, Trophy, Medal, Crown, LogOut } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

const Profile = () => {
  const { signOut } = useAuth();
  const profile = {
    name: "Alex",
    level: 5,
    xp: 1250,
    xpToNext: 1500,
    streak: 7,
    totalEarned: 452.50,
    totalSaved: 265.20,
    goalsCompleted: 2,
    lessonsCompleted: 3
  };

  const badges = [
    { id: 1, name: "First Dollar", icon: Trophy, description: "Logged your first income", earned: true, color: "text-accent" },
    { id: 2, name: "Goal Setter", icon: Target, description: "Created your first savings goal", earned: true, color: "text-primary" },
    { id: 3, name: "Quick Learner", icon: Star, description: "Completed 5 lessons", earned: false, color: "text-muted-foreground" },
    { id: 4, name: "Streak Master", icon: Zap, description: "7-day activity streak", earned: true, color: "text-accent" },
    { id: 5, name: "Budget Boss", icon: Medal, description: "Stayed under budget for a month", earned: false, color: "text-muted-foreground" },
    { id: 6, name: "Big Earner", icon: Crown, description: "Earned $500 total", earned: false, color: "text-muted-foreground" },
  ];

  const achievements = [
    { id: 1, title: "3 Lessons Completed", date: "Today", xp: 225 },
    { id: 2, title: "Goal Reached: Concert Tickets", date: "2 days ago", xp: 100 },
    { id: 3, title: "First Income Logged", date: "1 week ago", xp: 25 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </Link>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
              👤
            </div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm opacity-90">Level {profile.level} Financial Rookie</p>
            
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">XP Progress</span>
                <span className="text-sm font-bold">{profile.xp}/{profile.xpToNext}</span>
              </div>
              <Progress value={(profile.xp / profile.xpToNext) * 100} className="h-2" />
              <p className="text-xs mt-2 opacity-90">
                {profile.xpToNext - profile.xp} XP to Level {profile.level + 1}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 mt-6 space-y-6">
        {/* Stats Grid */}
        <div>
          <h2 className="text-lg font-bold mb-3">Your Stats</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-card border-0">
              <div className="flex items-center gap-2 text-success mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Total Earned</span>
              </div>
              <p className="text-2xl font-bold">${profile.totalEarned.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-gradient-card border-0">
              <div className="flex items-center gap-2 text-primary mb-1">
                <Target className="w-4 h-4" />
                <span className="text-xs font-medium">Total Saved</span>
              </div>
              <p className="text-2xl font-bold">${profile.totalSaved.toFixed(2)}</p>
            </Card>
            <Card className="p-4 bg-gradient-card border-0">
              <div className="flex items-center gap-2 text-accent mb-1">
                <Award className="w-4 h-4" />
                <span className="text-xs font-medium">Goals Done</span>
              </div>
              <p className="text-2xl font-bold">{profile.goalsCompleted}</p>
            </Card>
            <Card className="p-4 bg-gradient-card border-0">
              <div className="flex items-center gap-2 text-secondary mb-1">
                <Zap className="w-4 h-4" />
                <span className="text-xs font-medium">Lessons</span>
              </div>
              <p className="text-2xl font-bold">{profile.lessonsCompleted}</p>
            </Card>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Badges & Achievements
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <Card 
                  key={badge.id}
                  className={`p-4 text-center bg-gradient-card border-0 ${
                    badge.earned ? "ring-2 ring-accent" : "opacity-50"
                  }`}
                >
                  <div className={`w-12 h-12 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    badge.earned ? "bg-accent/10" : "bg-muted"
                  }`}>
                    <Icon className={`w-6 h-6 ${badge.color}`} />
                  </div>
                  <p className="text-xs font-semibold">{badge.name}</p>
                  {badge.earned && (
                    <Badge variant="secondary" className="mt-2 text-xs bg-success/10 text-success border-0">
                      Earned
                    </Badge>
                  )}
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Achievements */}
        <div>
          <h2 className="text-lg font-bold mb-3">Recent Activity</h2>
          <Card className="divide-y bg-gradient-card border-0">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 flex justify-between items-center">
                <div>
                  <p className="font-semibold">{achievement.title}</p>
                  <p className="text-xs text-muted-foreground">{achievement.date}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-accent">
                    <Zap className="w-4 h-4" />
                    <span className="font-bold">+{achievement.xp}</span>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>

        {/* Settings Buttons */}
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            Account Settings
          </Button>
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={signOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
