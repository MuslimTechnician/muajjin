import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

interface MadhabSelectorProps {
  value: number | null;
  onChange: (value: 0 | 1) => void;
}

export function MadhabSelector({ value, onChange }: MadhabSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        type="button"
        variant={value === 0 ? 'default' : 'outline'}
        onClick={() => onChange(0)}
        className="w-full">
        {t('madhabs.shafi')}
      </Button>
      <Button
        type="button"
        variant={value === 1 ? 'default' : 'outline'}
        onClick={() => onChange(1)}
        className="w-full">
        {t('madhabs.hanafi')}
      </Button>
    </div>
  );
}
