import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

export default function FastingSettings() {
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

  const updateSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-lg font-semibold">{t('settings.saumSettings')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Suhoor Adjustment */}
        <div className="space-y-2">
          <Label htmlFor="sehri-adjustment">{t('settings.suhoorAdjustment')}</Label>
          <Input
            id="sehri-adjustment"
            type="number"
            min={-10}
            max={10}
            value={localSettings.suhoorAdjustment}
            onChange={(e) => updateSetting('suhoorAdjustment', parseInt(e.target.value) || 0)}
          />
        </div>

        {/* Iftar Adjustment */}
        <div className="space-y-2">
          <Label htmlFor="iftar-adjustment">{t('settings.iftarAdjustment')}</Label>
          <Input
            id="iftar-adjustment"
            type="number"
            min={-10}
            max={10}
            value={localSettings.iftarAdjustment}
            onChange={(e) => updateSetting('iftarAdjustment', parseInt(e.target.value) || 0)}
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
