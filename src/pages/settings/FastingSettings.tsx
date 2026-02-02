import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserSettings } from '@/types';
import { AppHeader } from '@/components/AppHeader';
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton={true} title={t('settings.saumSettings')} />

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Suhoor Adjustment */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.suhoorAdjustment')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.suhoorAdjustmentDesc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                updateSetting(
                  'suhoorAdjustment',
                  Math.max((localSettings.suhoorAdjustment || 0) - 1, -10),
                )
              }>
              -
            </Button>
            <Input
              id="suhoor-adjustment"
              type="number"
              min={-10}
              max={10}
              value={localSettings.suhoorAdjustment}
              onChange={(e) =>
                updateSetting('suhoorAdjustment', parseInt(e.target.value) || 0)
              }
              className="bg-card text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                updateSetting(
                  'suhoorAdjustment',
                  Math.min((localSettings.suhoorAdjustment || 0) + 1, 10),
                )
              }>
              +
            </Button>
          </div>
        </div>

        {/* Iftar Adjustment */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.iftarAdjustment')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.iftarAdjustmentDesc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                updateSetting(
                  'iftarAdjustment',
                  Math.max((localSettings.iftarAdjustment || 0) - 1, -10),
                )
              }>
              -
            </Button>
            <Input
              id="iftar-adjustment"
              type="number"
              min={-10}
              max={10}
              value={localSettings.iftarAdjustment}
              onChange={(e) =>
                updateSetting('iftarAdjustment', parseInt(e.target.value) || 0)
              }
              className="bg-card text-center"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                updateSetting(
                  'iftarAdjustment',
                  Math.min((localSettings.iftarAdjustment || 0) + 1, 10),
                )
              }>
              +
            </Button>
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
