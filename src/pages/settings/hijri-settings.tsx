import { HijriAdjustmentSelector } from '@/components/hijri-adjustment-selector';
import { HijriCalendarInfoCard } from '@/components/hijri-calendar-info-card';
import { SettingsPageLayout } from '@/components/settings/settings-page-layout';
import { SettingsSaveButton } from '@/components/settings/settings-save-button';
import { SettingsSection } from '@/components/settings/settings-section';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/app-context';
import { useTranslation } from '@/contexts/translation-context';
import { UserSettings } from '@/types';
import { type FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HijriSettings: FC = () => {
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
};

export default HijriSettings;
