import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Zap, TrendingUp, Target, Star, Trophy, Medal, Crown, LogOut, Edit, ChevronRight, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { IOSHeader } from "@/components/IOSHeader";
import { IOSTabBar } from "@/components/IOSTabBar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = z.object({
  username: z.string().trim().min(1, "Username is required").max(50, "Username must be less than 50 characters"),
  avatar_url: z.string().trim().url("Must be a valid URL").optional().or(z.literal("")),
  bio: z.string().trim().max(200, "Bio must be less than 200 characters").optional(),
});

const emailSchema = z.object({
  email: z.string().trim().email("Must be a valid email address"),
});

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type EmailFormData = z.infer<typeof emailSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

const Profile = () => {
  const { signOut, user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<{
    username: string | null;
    avatar_url: string | null;
    bio: string | null;
  } | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user?.email || "" },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const profile = {
    name: profileData?.username || "User",
    level: 5,
    xp: 1250,
    xpToNext: 1500,
    streak: 7,
    totalEarned: 452.50,
    totalSaved: 265.20,
    goalsCompleted: 2,
    lessonsCompleted: 3
  };

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("username, avatar_url, bio")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
        setLoadingProfile(false);
        return;
      }

      if (data) {
        setProfileData(data);
        reset({
          username: data.username || "",
          avatar_url: data.avatar_url || "",
          bio: data.bio || "",
        });
      }
      setLoadingProfile(false);
    };

    fetchProfile();
  }, [user, reset, toast]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        username: data.username,
        avatar_url: data.avatar_url || null,
        bio: data.bio || null,
      })
      .eq("user_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
      return;
    }

    setProfileData({
      username: data.username,
      avatar_url: data.avatar_url || null,
      bio: data.bio || null,
    });

    toast({
      title: "Success",
      description: "Profile updated successfully",
    });

    setIsDialogOpen(false);
  };

  const onEmailSubmit = async (data: EmailFormData) => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      email: data.email,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Check your email to confirm the change",
    });

    setIsEmailDialogOpen(false);
  };

  const onPasswordSubmit = async (data: PasswordFormData) => {
    if (!user) return;

    const { error } = await supabase.auth.updateUser({
      password: data.newPassword,
    });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Password updated successfully",
    });

    resetPassword();
    setIsPasswordDialogOpen(false);
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
            {loadingProfile ? (
              <>
                <Skeleton className="w-20 h-20 rounded-full mx-auto mb-3 bg-white/20" />
                <Skeleton className="h-8 w-32 mx-auto mb-2 bg-white/20" />
                <Skeleton className="h-4 w-40 mx-auto bg-white/20" />
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-3 overflow-hidden">
                  {profileData?.avatar_url ? (
                    <img src={profileData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    "👤"
                  )}
                </div>
                <h1 className="text-2xl font-bold">{profile.name}</h1>
                <p className="text-sm opacity-90">Level {profile.level} Financial Rookie</p>
                {profileData?.bio && (
                  <p className="text-sm opacity-80 mt-2 max-w-xs mx-auto">{profileData.bio}</p>
                )}
              </>
            )}
            
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    {...register("username")}
                    placeholder="Enter your username"
                  />
                  {errors.username && (
                    <p className="text-sm text-destructive mt-1">{errors.username.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <Input
                    id="avatar_url"
                    {...register("avatar_url")}
                    placeholder="https://example.com/avatar.jpg"
                  />
                  {errors.avatar_url && (
                    <p className="text-sm text-destructive mt-1">{errors.avatar_url.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    {...register("bio")}
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                  {errors.bio && (
                    <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Save Changes</Button>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Change Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Email</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEmailSubmit(onEmailSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="current-email">Current Email</Label>
                  <Input
                    id="current-email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="new-email">New Email</Label>
                  <Input
                    id="new-email"
                    type="email"
                    {...registerEmail("email")}
                    placeholder="Enter new email address"
                  />
                  {emailErrors.email && (
                    <p className="text-sm text-destructive mt-1">{emailErrors.email.message}</p>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  You'll receive a confirmation email to verify the change.
                </p>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Update Email</Button>
                  <Button type="button" variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    {...registerPassword("newPassword")}
                    placeholder="Enter new password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-sm text-destructive mt-1">{passwordErrors.newPassword.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    {...registerPassword("confirmPassword")}
                    placeholder="Confirm new password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="flex-1">Update Password</Button>
                  <Button type="button" variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

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
