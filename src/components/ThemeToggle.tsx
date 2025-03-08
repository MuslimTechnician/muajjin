
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export function ThemeToggle() {
  const [theme, setTheme] = useLocalStorage<string>("theme", "light");
  const [mounted, setMounted] = useState(false);

  // Ensure this only runs on the client
  useEffect(() => {
    setMounted(true);
    // Apply theme immediately after component mounts
    applyTheme(theme);
  }, []);

  // Apply theme when it changes
  useEffect(() => {
    if (mounted) {
      applyTheme(theme);
    }
  }, [theme, mounted]);

  // Apply theme to document root
  const applyTheme = (currentTheme: string) => {
    const root = window.document.documentElement;
    
    if (currentTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (!mounted) {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-5 w-5" />
      ) : (
        <Sun className="h-5 w-5" />
      )}
    </Button>
  );
}
