
import { Home, Settings } from "lucide-react";
import { Section } from "@/pages/HomePage";

interface BottomNavBarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
}

export function BottomNavBar({ activeSection, onSectionChange }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t flex items-center justify-around z-10">
      <button 
        onClick={() => onSectionChange('home')} 
        className={`flex flex-col items-center justify-center w-1/2 h-full ${
          activeSection === "home" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Home size={24} />
        <span className="text-xs mt-1">Home</span>
      </button>
      <button 
        onClick={() => onSectionChange('settings')} 
        className={`flex flex-col items-center justify-center w-1/2 h-full ${
          activeSection === "settings" ? "text-primary" : "text-muted-foreground"
        }`}
      >
        <Settings size={24} />
        <span className="text-xs mt-1">Settings</span>
      </button>
    </div>
  );
}
