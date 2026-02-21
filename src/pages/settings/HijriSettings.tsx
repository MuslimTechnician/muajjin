import { HijriAdjustmentSelector } from '@/components/HijriAdjustmentSelector';
import { HijriCalendarInfoCard } from '@/components/HijriCalendarInfoCard';
import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout';
import { SettingsSaveButton } from '@/components/settings/SettingsSaveButton';
import { SettingsSection } from '@/components/settings/SettingsSection';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserSettings } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HijriSettings() {
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

  return (
    <SettingsPageLayout title={t('settings.hijriSettings')}>
      {/* Adjust Hijri Date */}
      <HijriAdjustmentSelector
        value={localSettings.hijriAdjustment}
        onChange={(value) =>
          setLocalSettings((prev) => ({
            ...prev,
            hijriAdjustment: value,
          }))
        }
      />

      {/* Change Hijri Date at Maghrib */}
      <SettingsSection
        title={t('settings.hijriDateChangeAtMaghrib')}
        description={t('settings.hijriDateChangeAtMaghribDesc')}>
        <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <span className="font-medium">
            {t('settings.useMaghribForDateChange')}
          </span>
          <Switch
            checked={localSettings.hijriDateChangeAtMaghrib}
            onCheckedChange={(checked) =>
              setLocalSettings((prev) => ({
                ...prev,
                hijriDateChangeAtMaghrib: checked,
              }))
            }
          />
        </div>
      </SettingsSection>

      {/* Hijri Calendar Info */}
      <HijriCalendarInfoCard />

      <SettingsSaveButton onClick={handleSave} />
    </SettingsPageLayout>
  );
}
