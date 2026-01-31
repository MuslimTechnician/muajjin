import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

export default function HijriSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [userSettings, setUserSettings] = useLocalStorage<UserSettings>('muajjin-settings', DEFAULT_SETTINGS);
  const [localSettings, setLocalSettings] = useState<UserSettings>({ ...userSettings });

  useEffect(() => {
    setLocalSettings({ ...userSettings });
  }, [userSettings]);

  const handleSave = () => {
    setUserSettings(localSettings);
    navigate('/settings');
  };

  const adjustmentOptions = [-3, -2, -1, 0, 1, 2, 3];

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
          <h1 className="text-lg font-semibold">{t('settings.hijriSettings')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Adjust Hijri Date */}
        <div className="space-y-3">
          <Label>{t('settings.hijriAdjustment')}</Label>
          <div className="grid grid-cols-7 gap-2">
            {adjustmentOptions.map((value) => (
              <Button
                key={value}
                type="button"
                variant={localSettings.hijriAdjustment === value ? "default" : "outline"}
                onClick={() => setLocalSettings(prev => ({ ...prev, hijriAdjustment: value }))}
                className="w-full"
              >
                {value > 0 ? `+${value}` : value}
              </Button>
            ))}
          </div>
        </div>

        {/* Change Hijri Date at Maghrib */}
        <div className="flex items-center justify-between">
          <Label>{t('settings.hijriDateChangeAtMaghrib')}</Label>
          <Switch
            checked={localSettings.hijriDateChangeAtMaghrib}
            onCheckedChange={(checked) => setLocalSettings(prev => ({ ...prev, hijriDateChangeAtMaghrib: checked }))}
          />
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
