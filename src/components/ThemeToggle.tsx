import { Button } from "@/components/ui/button";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        disabled
        aria-label="Toggle theme"
        className="h-9 w-9"
      >
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  // Show icon based on theme mode, not resolved theme
  // System mode should always show Monitor icon
  const getIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5" />;
    if (theme === "dark") return <Moon className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={cycleTheme}
      aria-label="Toggle theme"
      className="h-9 w-9"
    >
      {getIcon()}
    </Button>
  );
}
