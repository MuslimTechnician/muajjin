import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/TranslationContext';
import { Moon } from 'lucide-react';

interface HijriAdjustmentSelectorProps {
  value: number;
  onChange: (value: number) => void;
  showIcon?: boolean;
}

const ADJUSTMENT_OPTIONS = [-3, -2, -1, 0, 1, 2, 3];

export function HijriAdjustmentSelector({
  value,
  onChange,
  showIcon = false,
}: HijriAdjustmentSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-sm font-semibold">
          {showIcon ? <Moon className="h-4 w-4 text-primary" /> : null}
          <Label>{t('settings.hijriAdjustment')}</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('settings.hijriAdjustmentDesc')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {ADJUSTMENT_OPTIONS.map((option) => (
          <Button
            key={option}
            type="button"
            variant={value === option ? 'default' : 'outline'}
            onClick={() => onChange(option)}
            className="min-w-[60px] flex-1">
            {option > 0 ? `+${option}` : option}
          </Button>
        ))}
      </div>
    </div>
  );
}
