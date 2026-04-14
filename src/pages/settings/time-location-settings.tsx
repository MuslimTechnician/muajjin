import { LabeledInputField } from '@/components/form/labeled-input-field';
import { LocationAutoDetectButton } from '@/components/location/location-auto-detect-button';
import {
  LocationStatus,
  LocationStatusAlert,
} from '@/components/location/location-status-alert';
import { SettingsPageLayout } from '@/components/settings/settings-page-layout';
import { SettingsSaveButton } from '@/components/settings/settings-save-button';
import { SettingsSection } from '@/components/settings/settings-section';
import { Label } from '@/components/ui/label';
import { SelectionButtonGroup } from '@/components/ui/selection-button-group';
import { useApp } from '@/contexts/app-context';
import { useTranslation } from '@/contexts/translation-context';
import { detectLocation, LocationResult } from '@/services/location-service';
import { UserSettings } from '@/types';
import { MapPin } from 'lucide-react';
import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TimeLocationSettings: FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState<UserSettings>({
    ...settings,
  });
  const [isDetecting, setIsDetecting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<LocationStatus | null>(
    null,
  );

  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleSave = () => {
    updateSettings(localSettings);
    navigate(-1);
  };

  const updateSetting = <K extends keyof UserSettings>(
    key: K,
    value: UserSettings[K],
  ) => {
    setLocalSettings((prev) => ({ ...prev, [key]: value }));
    // Clear status when user manually changes values
    if (locationStatus) {
      setLocationStatus(null);
    }
  };

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    setLocationStatus({
      type: 'info',
      message: t('onboarding.detectingGps'),
    });

    try {
      const location: LocationResult = await detectLocation();

      // Update location fields
      setLocalSettings((prev) => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        city: location.city,
      }));

      // One translatable string (single key with {{city}}, {{country}}, {{method}})
      const methodText = location.method === 'gps' ? 'GPS' : 'IP-based';
      setLocationStatus({
        type: 'success',
        message: t('onboarding.locationDetectedWithMethod', {
          city: location.city,
          country: location.country,
          method: methodText,
        }),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error && error.message.startsWith('errors.')
          ? t(error.message)
          : error instanceof Error
            ? error.message
            : t('errors.locationFailed');
      setLocationStatus({
        type: 'error',
        message: errorMessage,
      });
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <SettingsPageLayout
      title={t('settings.timeLocationSettings')}
      contentClassName="max-w-md mx-auto px-5 py-6 space-y-6">
      {/* Time Format */}
      <SettingsSection
        title={t('settings.timeFormat')}
        description={t('settings.timeFormatDesc')}>
        <SelectionButtonGroup
          value={localSettings.timeFormat}
          onChange={(value) => updateSetting('timeFormat', value)}
          options={[
            { value: '24h', label: t('settings.24hour') },
            { value: '12h', label: t('settings.12hour') },
            { value: 'system', label: t('settings.system') },
          ]}
        />
      </SettingsSection>

      {/* Location Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground" />
          <Label className="text-base">{t('settings.locationSection')}</Label>
        </div>

        {/* Location Name */}
        <LabeledInputField
          id="location-name"
          label={t('settings.locationNameLabel')}
          placeholder={t('settings.locationNamePlaceholder')}
          value={localSettings.city || ''}
          onChange={(value) => updateSetting('city', value)}
          containerClassName="space-y-1"
        />

        {/* Latitude */}
        <LabeledInputField
          id="latitude"
          type="number"
          step="0.0001"
          label={t('settings.latitudeLabel')}
          placeholder={t('settings.latitudePlaceholder')}
          value={localSettings.latitude || ''}
          onChange={(value) =>
            updateSetting('latitude', parseFloat(value) || 0)
          }
          containerClassName="space-y-1"
        />

        {/* Longitude */}
        <LabeledInputField
          id="longitude"
          type="number"
          step="0.0001"
          label={t('settings.longitudeLabel')}
          placeholder={t('settings.longitudePlaceholder')}
          value={localSettings.longitude || ''}
          onChange={(value) =>
            updateSetting('longitude', parseFloat(value) || 0)
          }
          containerClassName="space-y-1"
        />

        {/* Auto Detect Button */}
        <LocationAutoDetectButton
          isDetecting={isDetecting}
          onClick={handleAutoDetect}
        />

        {/* Status Message */}
        <LocationStatusAlert status={locationStatus} mode="settings" />
      </div>

      <SettingsSaveButton onClick={handleSave} />
    </SettingsPageLayout>
  );
};

export default TimeLocationSettings;
