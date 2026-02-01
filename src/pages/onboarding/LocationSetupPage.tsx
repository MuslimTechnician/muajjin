import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';
import { detectLocation, LocationResult } from '@/services/locationService';
import { AlertCircle, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LocationSetupPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

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

      const methodText = result.method === 'gps' ? 'GPS' : 'IP-based';
      setLocationStatus({
        type: 'success',
        message: t('onboarding.locationDetected', {
          city: result.city,
          country: result.country,
        }),
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
    // Save to localStorage and continue
    const settings = {
      latitude: location.latitude || ONBOARDING_DEFAULTS.latitude,
      longitude: location.longitude || ONBOARDING_DEFAULTS.longitude,
      city: location.city || ONBOARDING_DEFAULTS.city,
      country: location.country || ONBOARDING_DEFAULTS.country,
      method: ONBOARDING_DEFAULTS.method, // Karachi (default)
      madhab: ONBOARDING_DEFAULTS.madhab, // User must select in next step
      timeFormat: 'system', // Auto-detect from system
      jamaahTimes: {},
      suhoorAdjustment: 0,
      iftarAdjustment: 0,
      hijriAdjustment: 0,
      hijriDateChangeAtMaghrib: true,
      manualLocation: true,
    };

    localStorage.setItem('muajjin-settings', JSON.stringify(settings));
    navigate('/onboarding/settings', { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Content */}
      <div className="mx-auto max-w-md flex-1 space-y-6 p-4">
        {/* Explanation */}
        <div className="space-y-2 text-center">
          <p className="text-lg font-medium">{t('onboarding.setLocation')}</p>
          <p className="text-sm text-muted-foreground">
            {t('onboarding.setLocationDesc')}
          </p>
        </div>

        {/* Location Name */}
        <div className="space-y-2">
          <Label htmlFor="location-name">{t('onboarding.locationName')}</Label>
          <Input
            id="location-name"
            placeholder={t('onboarding.locationPlaceholder')}
            value={location.city}
            onChange={(e) => setLocation({ ...location, city: e.target.value })}
          />
        </div>

        {/* Latitude */}
        <div className="space-y-2">
          <Label htmlFor="latitude">{t('onboarding.latitude')}</Label>
          <Input
            id="latitude"
            type="number"
            step="0.0001"
            placeholder={t('onboarding.latitudePlaceholder')}
            value={location.latitude || ''}
            onChange={(e) =>
              setLocation({
                ...location,
                latitude: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        {/* Longitude */}
        <div className="space-y-2">
          <Label htmlFor="longitude">{t('onboarding.longitude')}</Label>
          <Input
            id="longitude"
            type="number"
            step="0.0001"
            placeholder={t('onboarding.longitudePlaceholder')}
            value={location.longitude || ''}
            onChange={(e) =>
              setLocation({
                ...location,
                longitude: parseFloat(e.target.value) || 0,
              })
            }
          />
        </div>

        {/* Auto Detect Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoDetect}
          disabled={isDetecting}
          className="w-full">
          {isDetecting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('onboarding.detecting')}
            </>
          ) : (
            <>
              <MapPin className="mr-2 h-4 w-4" />
              {t('onboarding.autoDetect')}
            </>
          )}
        </Button>

        {/* Status Message */}
        {locationStatus && (
          <div
            className={`flex items-start gap-2 rounded-md border p-3 ${
              locationStatus.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200'
                : locationStatus.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
                  : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200'
            }`}>
            {locationStatus.type === 'success' && (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            {locationStatus.type === 'error' && (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            {locationStatus.type === 'info' && (
              <Loader2 className="mt-0.5 h-4 w-4 flex-shrink-0 animate-spin" />
            )}
            <p className="text-sm">{locationStatus.message}</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={!location.city}>
            {t('onboarding.continue')}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mx-auto max-w-md p-4">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-muted"></div>
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-muted"></div>
        </div>
      </div>
    </div>
  );
}
