import { LabeledInputField } from '@/components/form/LabeledInputField';
import { LocationAutoDetectButton } from '@/components/location/LocationAutoDetectButton';
import {
  LocationStatus,
  LocationStatusAlert,
} from '@/components/location/LocationStatusAlert';
import { OnboardingPageLayout } from '@/components/onboarding/OnboardingPageLayout';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { detectLocation, LocationResult } from '@/services/locationService';
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LocationSetupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { updateSettings } = useApp();
  const [location, setLocation] = useState<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  }>({
    city: '',
    country: '',
    latitude: 0,
    longitude: 0,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus | null>(
    null,
  );

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setLocationStatus({
      type: 'info',
      message: t('onboarding.detectingGps'),
    });

    try {
      const result: LocationResult = await detectLocation();

      setLocation({
        city: result.city,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude,
      });

      setLocationStatus({
        type: 'success',
        message: `${result.city}, ${result.country}`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t('errors.locationFailed');
      setLocationStatus({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleContinue = () => {
    // Save to global settings via AppContext and continue
    const settings = {
      latitude: location.latitude || ONBOARDING_DEFAULTS.latitude,
      longitude: location.longitude || ONBOARDING_DEFAULTS.longitude,
      city: location.city || ONBOARDING_DEFAULTS.city,
      country: location.country || ONBOARDING_DEFAULTS.country,
      method: ONBOARDING_DEFAULTS.method,
      madhab: ONBOARDING_DEFAULTS.madhab,
      timeFormat: 'system' as const,
      jamaahTimes: {},
      suhoorAdjustment: 0,
      iftarAdjustment: 0,
      hijriAdjustment: 0,
      hijriDateChangeAtMaghrib: true,
      manualLocation: true,
    };

    updateSettings(settings);
    navigate('/onboarding/settings', { replace: true });
  };

  return (
    <OnboardingPageLayout currentStep={2}>
      <OnboardingStepHeader
        title={t('onboarding.setLocation')}
        description={t('onboarding.setLocationDesc')}
        icon={<MapPin className="h-10 w-10 text-primary" />}
      />

      <Card className="shadow-lg">
        <CardContent className="space-y-4 p-6">
          {/* Form */}
          <div className="space-y-4">
            {/* Location Name */}
            <LabeledInputField
              id="location-name"
              label={t('onboarding.locationName')}
              placeholder={t('onboarding.locationPlaceholder')}
              value={location.city}
              onChange={(value) => setLocation({ ...location, city: value })}
              containerClassName="space-y-2"
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Latitude */}
              <LabeledInputField
                id="latitude"
                type="number"
                step="0.0001"
                label={t('onboarding.latitude')}
                placeholder={t('onboarding.latitudePlaceholder')}
                value={location.latitude || ''}
                onChange={(value) =>
                  setLocation({
                    ...location,
                    latitude: parseFloat(value) || 0,
                  })
                }
                containerClassName="space-y-2"
              />

              {/* Longitude */}
              <LabeledInputField
                id="longitude"
                type="number"
                step="0.0001"
                label={t('onboarding.longitude')}
                placeholder={t('onboarding.longitudePlaceholder')}
                value={location.longitude || ''}
                onChange={(value) =>
                  setLocation({
                    ...location,
                    longitude: parseFloat(value) || 0,
                  })
                }
                containerClassName="space-y-2"
              />
            </div>

            {/* Auto Detect Button */}
            <LocationAutoDetectButton
              variant="secondary"
              isDetecting={isDetecting}
              onClick={handleAutoDetect}
            />

            {/* Status Message */}
            <LocationStatusAlert status={locationStatus} mode="onboarding" />
          </div>
        </CardContent>
      </Card>

      {/* Continue Button - outside card for better reachability */}
      <Button
        onClick={handleContinue}
        size="lg"
        className="w-full"
        disabled={!location.city}>
        {t('onboarding.continue')}
      </Button>
    </OnboardingPageLayout>
  );
}
