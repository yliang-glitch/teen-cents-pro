import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Award, TrendingUp, Lock, CheckCircle2, Zap, ChevronRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { IOSHeader } from "@/components/IOSHeader";
import { IOSTabBar } from "@/components/IOSTabBar";

const Learn = () => {
  const [completedLessons] = useState([1, 2, 3]);
  
  const lessons = [
    {
      id: 1,
      title: "Money Basics",
      description: "Learn what money is and how it works",
      xp: 50,
      duration: "5 min",
      difficulty: "Beginner",
      completed: true
    },
    {
      id: 2,
      title: "Earning vs. Spending",
      description: "Understanding income and expenses",
      xp: 75,
      duration: "8 min",
      difficulty: "Beginner",
      completed: true
    },
    {
      id: 3,
      title: "The Power of Saving",
      description: "Why saving money matters",
      xp: 100,
      duration: "10 min",
      difficulty: "Beginner",
      completed: true
    },
    {
      id: 4,
      title: "Setting Financial Goals",
      description: "How to plan and achieve your money goals",
      xp: 100,
      duration: "12 min",
      difficulty: "Intermediate",
      completed: false
    },
    {
      id: 5,
      title: "Budgeting Like a Pro",
      description: "Create and stick to a budget",
      xp: 150,
      duration: "15 min",
      difficulty: "Intermediate",
      completed: false
    },
    {
      id: 6,
      title: "Understanding Credit",
      description: "What is credit and why it matters",
      xp: 150,
      duration: "12 min",
      difficulty: "Intermediate",
      locked: true
    },
    {
      id: 7,
      title: "Investing Basics",
      description: "Make your money grow over time",
      xp: 200,
      duration: "20 min",
      difficulty: "Advanced",
      locked: true
    },
  ];

  const stats = {
    totalXP: 225,
    lessonsCompleted: completedLessons.length,
    totalLessons: lessons.length,
    streak: 7
  };

  return (
    <div className="min-h-screen bg-background pb-24 safe-area-inset">
      <IOSHeader title="Learn" largeTitle showBack backPath="/" />

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Progress Card */}
        <Card className="p-4 rounded-2xl mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[13px] text-muted-foreground font-medium">Progress</span>
            <span className="text-[13px] font-semibold text-primary">
              {stats.lessonsCompleted}/{stats.totalLessons} lessons
            </span>
          </div>
          <Progress 
            value={(stats.lessonsCompleted / stats.totalLessons) * 100} 
            className="h-2"
          />
        </Card>
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card className="p-4 text-center bg-gradient-card border-0">
            <div className="flex justify-center mb-1">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <p className="text-2xl font-bold text-accent">{stats.totalXP}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-card border-0">
            <div className="flex justify-center mb-1">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{stats.lessonsCompleted}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </Card>
          <Card className="p-4 text-center bg-gradient-card border-0">
            <div className="flex justify-center mb-1">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold text-primary">{stats.streak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Lessons */}
        <div>
          <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            All Lessons
          </h2>
          
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Card 
                key={lesson.id} 
                className={`p-5 bg-gradient-card border-0 hover:shadow-md transition-all ${
                  lesson.locked ? "opacity-60" : "cursor-pointer"
                } ${lesson.completed ? "ring-2 ring-success/30" : ""}`}
              >
                <div className="flex gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                    lesson.completed 
                      ? "bg-success/10" 
                      : lesson.locked 
                      ? "bg-muted"
                      : "bg-primary/10"
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle2 className="w-6 h-6 text-success" />
                    ) : lesson.locked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <BookOpen className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold">{lesson.title}</h3>
                      {lesson.completed && (
                        <Badge variant="secondary" className="bg-success/10 text-success border-0">
                          Done
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {lesson.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-accent" />
                        {lesson.xp} XP
                      </span>
                      <span>⏱️ {lesson.duration}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          lesson.difficulty === "Beginner" 
                            ? "border-success text-success"
                            : lesson.difficulty === "Intermediate"
                            ? "border-primary text-primary"
                            : "border-destructive text-destructive"
                        }`}
                      >
                        {lesson.difficulty}
                      </Badge>
                    </div>
                    
                    {!lesson.locked && !lesson.completed && (
                      <Button size="sm" className="mt-3 w-full">
                        Start Lesson
                      </Button>
                    )}
                    
                    {lesson.locked && (
                      <p className="mt-3 text-xs text-muted-foreground italic">
                        Complete previous lessons to unlock
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Achievement Card */}
        <Card className="mt-6 p-4 rounded-2xl bg-primary border-0 text-primary-foreground">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-[15px]">Keep Learning!</h3>
              <p className="text-[13px] opacity-80">
                Complete 2 more lessons to earn the "Quick Learner" badge!
              </p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60" />
          </div>
        </Card>
      </div>

      <IOSTabBar />
    </div>
  );
};

export default Learn;
