import { useTranslation } from '@/contexts/TranslationContext';
import { Info } from 'lucide-react';

export function HijriCalendarInfoCard() {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Info className="h-4 w-4 text-primary" />
        <span>{t('settings.hijriCalendarInfoTitle')}</span>
      </div>
      <p className="text-left text-sm text-muted-foreground">
        {t('settings.hijriCalendarInfoDesc')}
      </p>
    </div>
  );
}
