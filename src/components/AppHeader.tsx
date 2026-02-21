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

export function AppHeader({
  title,
  showBackButton = false,
  onBack,
}: AppHeaderProps) {
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
    if (!mounted) return <Sun className="h-5 w-5" />;

    // Show icon based on actual theme being applied
    const actualTheme = resolvedTheme || theme;
    if (theme === 'system') {
      // Show monitor icon when in system mode
      return <Monitor className="h-5 w-5" />;
    }
    return actualTheme === 'dark' ? (
      <Moon className="h-5 w-5" />
    ) : (
      <Sun className="h-5 w-5" />
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
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="mx-auto flex max-w-md items-center justify-between px-5 py-2">
        {showBackButton ? (
          <>
            {/* Back Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-9 w-9 rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>

            {/* Page Title */}
            <h1 className="text-xl font-bold">
              {title || t('settings.title')}
            </h1>

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
              className="h-9 w-9 rounded-full">
              {getThemeIcon()}
            </Button>

            {/* App Name/Logo */}
            <h1 className="text-xl font-bold tracking-tight">
              {title || t('common.appName')}
            </h1>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/settings')}
              className="h-9 w-9 rounded-full">
              <Settings className="h-5 w-5" />
              <span className="sr-only">{t('settings.title')}</span>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
