import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';

interface SettingsSaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function SettingsSaveButton({
  onClick,
  disabled = false,
}: SettingsSaveButtonProps) {
  const { t } = useTranslation();

  return (
    <div className="pt-4">
      <Button
        onClick={onClick}
        className="w-full"
        size="lg"
        disabled={disabled}>
        {t('common.save')}
      </Button>
    </div>
  );
}
