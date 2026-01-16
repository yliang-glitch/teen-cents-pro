import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface IOSHeaderProps {
  title: string;
  largeTitle?: boolean;
  showBack?: boolean;
  backPath?: string;
  rightAction?: React.ReactNode;
}

export const IOSHeader = ({ 
  title, 
  largeTitle = false, 
  showBack = false, 
  backPath = "/",
  rightAction 
}: IOSHeaderProps) => {
  return (
    <header className="sticky top-0 z-40 ios-nav-bar safe-area-top">
      <div className="max-w-lg mx-auto">
        {/* Standard Navigation Bar */}
        <div className="flex items-center justify-between h-11 px-4">
          <div className="w-20">
            {showBack && (
              <Link 
                to={backPath} 
                className="flex items-center gap-0.5 text-primary ios-press -ml-2"
              >
                <ChevronLeft className="w-6 h-6" />
                <span className="text-[17px]">Back</span>
              </Link>
            )}
          </div>
          
          {!largeTitle && (
            <h1 className="ios-title text-center flex-1">{title}</h1>
          )}
          
          <div className="w-20 flex justify-end">
            {rightAction}
          </div>
        </div>
        
        {/* Large Title */}
        {largeTitle && (
          <div className="px-4 pb-2">
            <h1 className="ios-large-title">{title}</h1>
          </div>
        )}
      </div>
    </header>
  );
};
