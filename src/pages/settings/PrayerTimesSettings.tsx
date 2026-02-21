import { CalculationMethodSelect } from '@/components/CalculationMethodSelect';
import { MadhabSelector } from '@/components/MadhabSelector';
import { JamaahTimesFields } from '@/components/settings/JamaahTimesFields';
import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout';
import { SettingsSaveButton } from '@/components/settings/SettingsSaveButton';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserSettings } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrayerTimesSettings() {
  const navigate = useNavigate();
  const { t, getSalatName } = useTranslation();
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState<UserSettings>({
    ...settings,
  });

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
  };

  const handleJamaahTimeChange = (
    prayer: keyof UserSettings['jamaahTimes'],
    value: string,
  ) => {
    setLocalSettings({
      ...localSettings,
      jamaahTimes: {
        ...localSettings.jamaahTimes,
        [prayer]: value,
      },
    });
  };

  return (
    <SettingsPageLayout
      title={t('settings.salatTimesSettings')}
      contentClassName="max-w-md mx-auto px-5 py-6 space-y-6">
      {/* Calculation Method */}
      <SettingsSection
        title={t('settings.calculationMethod')}
        description={t('settings.calculationMethodDesc')}>
        <CalculationMethodSelect
          value={localSettings.method}
          onChange={(value) => updateSetting('method', value)}
          triggerClassName="bg-card"
        />
      </SettingsSection>

      {/* Madhab */}
      <SettingsSection
        title={t('settings.madhab')}
        description={t('settings.madhabDesc')}>
        <MadhabSelector
          value={localSettings.madhab}
          onChange={(value) => updateSetting('madhab', value)}
        />
      </SettingsSection>

      {/* Jama'ah Times */}
      <SettingsSection
        title={t('settings.jamaahTimes')}
        description={t('settings.jamaahTimesDesc')}>
        <JamaahTimesFields
          values={localSettings.jamaahTimes}
          onChange={handleJamaahTimeChange}
          getPrayerLabel={getSalatName}
          containerClassName="space-y-3"
          itemClassName="space-y-1"
        />
      </SettingsSection>

      <SettingsSaveButton onClick={handleSave} />
    </SettingsPageLayout>
  );
}
