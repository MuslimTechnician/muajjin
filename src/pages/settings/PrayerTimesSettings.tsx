import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CALCULATION_METHODS, MADHABS } from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Separator } from '@/components/ui/separator';
import { DEFAULT_SETTINGS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

export default function PrayerTimesSettings() {
  const navigate = useNavigate();
  const { t, getPrayerName } = useTranslation();
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

  const handleJamaahTimeChange = (prayer: keyof UserSettings['jamaahTimes'], value: string) => {
    setLocalSettings({
      ...localSettings,
      jamaahTimes: {
        ...localSettings.jamaahTimes,
        [prayer]: value
      }
    });
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
          <h1 className="text-lg font-semibold">{t('settings.prayerTimesSettings')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-6">
        {/* Calculation Method */}
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('settings.calculationMethod')}</Label>
          <Select
            value={localSettings.method?.toString()}
            onValueChange={(value) => updateSetting('method', parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('onboarding.selectCalculationMethod')} />
            </SelectTrigger>
            <SelectContent>
              {CALCULATION_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id.toString()}>
                  {method.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Madhab */}
        <div className="space-y-2">
          <Label>{t('settings.madhab')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={localSettings.madhab === 2 ? "default" : "outline"}
              onClick={() => updateSetting('madhab', 2)}
              className="w-full"
            >
              {t('madhabs.shafi')}
            </Button>
            <Button
              type="button"
              variant={localSettings.madhab === 1 ? "default" : "outline"}
              onClick={() => updateSetting('madhab', 1)}
              className="w-full"
            >
              {t('madhabs.hanafi')}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Jama'ah Times */}
        <div className="space-y-4">
          <Label className="text-base">{t('settings.jamaahTimes')}</Label>
          {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((prayer) => (
            <div key={prayer} className="space-y-2">
              <Label htmlFor={`jamaah-${prayer}`}>{getPrayerName(prayer)}</Label>
              <Input
                id={`jamaah-${prayer}`}
                type="time"
                value={localSettings.jamaahTimes[prayer] || ''}
                onChange={(e) => handleJamaahTimeChange(
                  prayer,
                  e.target.value
                )}
              />
            </div>
          ))}
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
