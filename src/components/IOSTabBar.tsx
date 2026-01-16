import { Link, useLocation } from "react-router-dom";
import { Wallet, BarChart3, Target, BookOpen, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Wallet, label: "Home" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
  { path: "/goals", icon: Target, label: "Goals" },
  { path: "/learn", icon: BookOpen, label: "Learn" },
  { path: "/profile", icon: User, label: "Profile" },
];

export const IOSTabBar = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 ios-tab-bar safe-area-bottom z-50">
      <div className="max-w-lg mx-auto flex justify-around py-2 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              className="flex flex-col items-center gap-0.5 py-1 px-3 ios-press"
            >
              <Icon 
                className={`w-6 h-6 transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
