import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserSettings } from '@/types';
import { AppHeader } from '@/components/AppHeader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

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

  const adjustmentOptions = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton={true} title={t('settings.hijriSettings')} />

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Adjust Hijri Date */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.hijriAdjustment')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.hijriAdjustmentDesc')}
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {adjustmentOptions.map((value) => (
              <Button
                key={value}
                type="button"
                variant={
                  localSettings.hijriAdjustment === value
                    ? 'default'
                    : 'outline'
                }
                onClick={() =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    hijriAdjustment: value,
                  }))
                }
                className="flex-1 min-w-[60px]">
                {value > 0 ? `+${value}` : value}
              </Button>
            ))}
          </div>
        </div>

        {/* Change Hijri Date at Maghrib */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.hijriDateChangeAtMaghrib')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.hijriDateChangeAtMaghribDesc')}
            </p>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-card border border-border">
            <span className="font-medium">{t('settings.useMaghribForDateChange')}</span>
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
