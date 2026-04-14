import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/translation-context';
import type { FC } from 'react';

interface SettingsSaveButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export const SettingsSaveButton: FC<SettingsSaveButtonProps> = ({
  onClick,
  disabled = false,
}) => {
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
};
