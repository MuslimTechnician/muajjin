import { NumberAdjustmentControl } from '@/components/settings/NumberAdjustmentControl';
import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout';
import { SettingsSaveButton } from '@/components/settings/SettingsSaveButton';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserSettings } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

export default function FastingSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  return (
    <SettingsPageLayout
      title={t('settings.saumSettings')}
      contentClassName="max-w-md mx-auto px-5 py-6 space-y-6">
      {/* Suhoor Adjustment */}
      <SettingsSection
        title={t('settings.suhoorAdjustment')}
        description={t('settings.suhoorAdjustmentDesc')}>
        <NumberAdjustmentControl
          id="suhoor-adjustment"
          value={localSettings.suhoorAdjustment || 0}
          min={-10}
          max={10}
          onChange={(value) => updateSetting('suhoorAdjustment', value)}
        />
      </SettingsSection>

      {/* Iftar Adjustment */}
      <SettingsSection
        title={t('settings.iftarAdjustment')}
        description={t('settings.iftarAdjustmentDesc')}>
        <NumberAdjustmentControl
          id="iftar-adjustment"
          value={localSettings.iftarAdjustment || 0}
          min={-10}
          max={10}
          onChange={(value) => updateSetting('iftarAdjustment', value)}
        />
      </SettingsSection>

      <SettingsSaveButton onClick={handleSave} />
    </SettingsPageLayout>
  );
}
