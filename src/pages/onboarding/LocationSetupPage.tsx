import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';
import { detectLocation, LocationResult } from '@/services/locationService';
import { useApp } from '@/contexts/AppContext';
import { AlertCircle, CheckCircle2, Info, Loader2, MapPin } from 'lucide-react';
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

  const getStatusIcon = () => {
    if (!locationStatus) return null;

    switch (locationStatus.type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusBgColor = () => {
    if (!locationStatus) return '';

    switch (locationStatus.type) {
      case 'success':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'error':
        return 'bg-destructive/10 text-destructive';
      case 'info':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Content - same width/padding as dashboard and settings */}
      <div className="mx-auto max-w-md px-5 py-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <MapPin className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('onboarding.setLocation')}</h1>
          <p className="text-base text-muted-foreground">
            {t('onboarding.setLocationDesc')}
          </p>
        </div>

        <Card className="shadow-lg">
            <CardContent className="p-6 space-y-4">
              {/* Form */}
              <div className="space-y-4">
                {/* Location Name */}
                <div className="space-y-2">
                  <Label htmlFor="location-name">{t('onboarding.locationName')}</Label>
                  <Input
                    id="location-name"
                    placeholder={t('onboarding.locationPlaceholder')}
                    value={location.city}
                    onChange={(e) => setLocation({ ...location, city: e.target.value })}
                    className="bg-card"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                      className="bg-card"
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
                      className="bg-card"
                    />
                  </div>
                </div>

                {/* Auto Detect Button */}
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAutoDetect}
                  disabled={isDetecting}
                  className="w-full">
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t('onboarding.detecting')}
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4 mr-2" />
                      {t('onboarding.autoDetect')}
                    </>
                  )}
                </Button>

                {/* Status Message */}
                {locationStatus && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${getStatusBgColor()}`}>
                    {getStatusIcon()}
                    <span className="text-sm font-medium">{locationStatus.message}</span>
                  </div>
                )}
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
      </div>

      {/* Progress indicator - same width/padding as content */}
      <div className="mx-auto max-w-md px-5 py-4">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
