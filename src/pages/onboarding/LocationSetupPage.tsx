import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { detectLocation, LocationResult } from '@/services/locationService';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

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
    longitude: 0
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
      message: t('onboarding.detectingGps')
    });

    try {
      const result: LocationResult = await detectLocation();

      setLocation({
        city: result.city,
        country: result.country,
        latitude: result.latitude,
        longitude: result.longitude
      });

      const methodText = result.method === 'gps' ? 'GPS' : 'IP-based';
      setLocationStatus({
        type: 'success',
        message: t('onboarding.locationDetected', { city: result.city, country: result.country })
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.locationFailed');
      setLocationStatus({
        type: 'error',
        message: errorMessage
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
      sehriAdjustment: 0,
      iftarAdjustment: 0,
      hijriAdjustment: 0,
      manualLocation: true
    };

    localStorage.setItem('muajjin-settings', JSON.stringify(settings));
    navigate('/onboarding/settings');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 p-4 max-w-md mx-auto space-y-6">
        {/* Explanation */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">{t('onboarding.setLocation')}</p>
          <p className="text-muted-foreground text-sm">
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
            onChange={(e) => setLocation({ ...location, latitude: parseFloat(e.target.value) || 0 })}
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
            onChange={(e) => setLocation({ ...location, longitude: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Auto Detect Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleAutoDetect}
          disabled={isDetecting}
          className="w-full"
        >
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
            className={`flex items-start gap-2 p-3 rounded-md border ${
              locationStatus.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200'
                : locationStatus.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200'
                : 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200'
            }`}
          >
            {locationStatus.type === 'success' && <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />}
            {locationStatus.type === 'error' && <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />}
            {locationStatus.type === 'info' && <Loader2 className="h-4 w-4 mt-0.5 flex-shrink-0 animate-spin" />}
            <p className="text-sm">{locationStatus.message}</p>
          </div>
        )}

        {/* Continue Button */}
        <div className="pt-4">
          <Button
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={!location.city}
          >
            {t('onboarding.continue')}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-muted rounded-full"></div>
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
