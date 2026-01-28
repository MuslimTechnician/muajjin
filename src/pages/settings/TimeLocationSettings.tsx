import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { MapPin } from 'lucide-react';
import { detectLocation, LocationResult } from '@/services/locationService';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

export default function TimeLocationSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...userSettings });
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  useEffect(() => {
    setLocalSettings({ ...userSettings });
  }, [userSettings]);

  const handleSave = () => {
    setUserSettings(localSettings);
    navigate('/settings');
  };

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    // Clear status when user manually changes values
    if (locationStatus) {
      setLocationStatus(null);
    }
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setLocationStatus({
      type: 'info',
      message: t('onboarding.detectingGps')
    });

    try {
      const location: LocationResult = await detectLocation();

      // Update location fields
      setLocalSettings(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city
      }));

      // Show success message with detection method
      const methodText = location.method === 'gps' ? 'GPS' : 'IP-based';
      setLocationStatus({
        type: 'success',
        message: `${t('onboarding.locationDetected', { city: location.city, country: location.country })} (${methodText})`
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{t('settings.timeLocationSettings')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Time Format */}
        <div className="space-y-2">
          <Label>{t('settings.timeFormat')}</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={localSettings.timeFormat === '24h' ? "default" : "outline"}
              onClick={() => updateSetting('timeFormat', '24h')}
              className="w-full"
            >
              {t('settings.24hour')}
            </Button>
            <Button
              type="button"
              variant={localSettings.timeFormat === '12h' ? "default" : "outline"}
              onClick={() => updateSetting('timeFormat', '12h')}
              className="w-full"
            >
              {t('settings.12hour')}
            </Button>
            <Button
              type="button"
              variant={localSettings.timeFormat === 'system' ? "default" : "outline"}
              onClick={() => updateSetting('timeFormat', 'system')}
              className="w-full"
            >
              {t('settings.system')}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base">{t('settings.locationSection')}</Label>
          </div>

          {/* Location Name */}
          <div className="space-y-2">
            <Label htmlFor="location-name">{t('settings.locationNameLabel')}</Label>
            <Input
              id="location-name"
              placeholder={t('settings.locationNamePlaceholder')}
              value={localSettings.city || ''}
              onChange={(e) => updateSetting('city', e.target.value)}
            />
          </div>

          {/* Latitude */}
          <div className="space-y-2">
            <Label htmlFor="latitude">{t('settings.latitudeLabel')}</Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              placeholder={t('settings.latitudePlaceholder')}
              value={localSettings.latitude || ''}
              onChange={(e) => updateSetting('latitude', parseFloat(e.target.value) || 0)}
            />
          </div>

          {/* Longitude */}
          <div className="space-y-2">
            <Label htmlFor="longitude">{t('settings.longitudeLabel')}</Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              placeholder={t('settings.longitudePlaceholder')}
              value={localSettings.longitude || ''}
              onChange={(e) => updateSetting('longitude', parseFloat(e.target.value) || 0)}
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
        </div>

        {/* Save Button */}
        <div className="pt-4">
          <Button onClick={handleSave} className="w-full" size="lg">
            {t('common.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
