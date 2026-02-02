import { Settings, Sun, Moon, Monitor, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/contexts/TranslationContext';
import { useEffect, useState } from 'react';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export function AppHeader({ title, showBackButton = false, onBack }: AppHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
    const currentIndex = themes.indexOf(theme as 'light' | 'dark' | 'system');
    const nextTheme = themes[(currentIndex + 1) % themes.length];
    setTheme(nextTheme);
  };

  const getThemeIcon = () => {
    if (!mounted) return <Sun className="w-5 h-5" />;

    // Show icon based on actual theme being applied
    const actualTheme = resolvedTheme || theme;
    if (theme === 'system') {
      // Show monitor icon when in system mode
      return <Monitor className="w-5 h-5" />;
    }
    return actualTheme === 'dark' ? (
      <Moon className="w-5 h-5" />
    ) : (
      <Sun className="w-5 h-5" />
    );
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border">
      <div className="max-w-md mx-auto px-5 py-2 flex items-center justify-between">
        {showBackButton ? (
          <>
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="rounded-full h-9 w-9"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            {/* Page Title */}
            <h1 className="text-xl font-bold">{title || t('settings.title')}</h1>

            {/* Empty div for spacing */}
            <div className="h-9 w-9" />
          </>
        ) : (
          <>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-9 w-9"
            >
              {getThemeIcon()}
            </Button>

            {/* App Name/Logo */}
            <h1 className="text-xl font-bold tracking-tight">{title || t('common.appName')}</h1>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="rounded-full h-9 w-9"
            >
              <Settings className="w-5 h-5" />
              <span className="sr-only">{t('settings.title')}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
