import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { useTranslation } from '@/contexts/TranslationContext';

export function AppHeader() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 max-w-md mx-auto">
        {/* App Name/Logo */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold tracking-tight">MUAJJIN</h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-9 w-9"
          >
            <Settings className="h-5 w-5" />
            <span className="sr-only">{t('settings.title')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
