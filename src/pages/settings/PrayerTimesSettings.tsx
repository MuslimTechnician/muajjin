import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  CALCULATION_METHODS,
  CALCULATION_METHOD_KEYS,
} from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { AppHeader } from '@/components/AppHeader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton={true} title={t('settings.salatTimesSettings')} />

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-6">
        {/* Calculation Method */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.calculationMethod')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.calculationMethodDesc')}
            </p>
          </div>
          <Select
            value={localSettings.method?.toString()}
            onValueChange={(value) => updateSetting('method', parseInt(value))}>
            <SelectTrigger className="bg-card">
              <SelectValue
                placeholder={t('onboarding.selectCalculationMethod')}
              />
            </SelectTrigger>
            <SelectContent>
              {CALCULATION_METHODS.map((method) => (
                <SelectItem key={method.id} value={method.id.toString()}>
                  {t(
                    CALCULATION_METHOD_KEYS[method.id] ||
                      'calculationMethods.other',
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Madhab */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.madhab')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.madhabDesc')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant={localSettings.madhab === 0 ? 'default' : 'outline'}
              onClick={() => updateSetting('madhab', 0)}
              className="w-full">
              {t('madhabs.shafi')}
            </Button>
            <Button
              type="button"
              variant={localSettings.madhab === 1 ? 'default' : 'outline'}
              onClick={() => updateSetting('madhab', 1)}
              className="w-full">
              {t('madhabs.hanafi')}
            </Button>
          </div>
        </div>

        {/* Jama'ah Times */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>{t('settings.jamaahTimes')}</Label>
            <p className="text-sm text-muted-foreground">
              {t('settings.jamaahTimesDesc')}
            </p>
          </div>
          <div className="space-y-3">
            {(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(
              (salat) => (
                <div key={salat} className="space-y-1">
                  <Label htmlFor={`jamaah-${salat}`}>{getSalatName(salat)}</Label>
                  <Input
                    id={`jamaah-${salat}`}
                    type="time"
                    value={localSettings.jamaahTimes[salat] || ''}
                    onChange={(e) =>
                      handleJamaahTimeChange(salat, e.target.value)
                    }
                    className="bg-card"
                  />
                </div>
              ),
            )}
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
