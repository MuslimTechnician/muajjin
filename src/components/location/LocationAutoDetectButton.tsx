import { Button } from '@/components/ui/button';
import { useTranslation } from '@/contexts/TranslationContext';
import { Loader2, MapPin } from 'lucide-react';
import { Fragment } from 'react';

interface LocationAutoDetectButtonProps {
  isDetecting: boolean;
  onClick: () => void;
  variant?: 'outline' | 'secondary';
}

export function LocationAutoDetectButton({
  isDetecting,
  onClick,
  variant = 'outline',
}: LocationAutoDetectButtonProps) {
  const { t } = useTranslation();

  return (
    <Button
      type="button"
      variant={variant}
      onClick={onClick}
      disabled={isDetecting}
      className="w-full">
      {isDetecting ? (
        <Fragment>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t('onboarding.detecting')}
        </Fragment>
      ) : (
        <Fragment>
          <MapPin className="mr-2 h-4 w-4" />
          {t('onboarding.autoDetect')}
        </Fragment>
      )}
    </Button>
  );
}
