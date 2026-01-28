import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CALCULATION_METHODS, MADHABS } from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';

export default function FinalSettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Get existing settings or use onboarding defaults
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('muajjin-settings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      method: ONBOARDING_DEFAULTS.method, // Karachi (default)
      madhab: ONBOARDING_DEFAULTS.madhab ?? null, // User must select
      timeFormat: 'system', // Auto-detect from system (not selected in onboarding)
      jamaahTimes: {},
      sehriAdjustment: 0,
      iftarAdjustment: 0,
      hijriAdjustment: 0,
      manualLocation: true,
      city: ONBOARDING_DEFAULTS.city,
      country: ONBOARDING_DEFAULTS.country,
      latitude: ONBOARDING_DEFAULTS.latitude,
      longitude: ONBOARDING_DEFAULTS.longitude
    };
  });

  // Check if user has completed all required selections
  const isReadyToFinish = settings.madhab !== null;

  const handleFinish = () => {
    // Save all settings
    localStorage.setItem('muajjin-settings', JSON.stringify(settings));
    // Mark onboarding as completed
    localStorage.setItem('muajjin-onboarding-completed', 'true');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto space-y-6 pb-20">
        {/* Explanation */}
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">{t('onboarding.customizing')}</p>
          <p className="text-muted-foreground text-sm">
            {t('onboarding.selectCalculationMethod')}
          </p>
        </div>

        {/* Calculation Method */}
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('settings.calculationMethod')}</Label>
          <Select
            value={settings.method?.toString()}
            onValueChange={(value) => setSettings({ ...settings, method: parseInt(value) })}
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
        <div className="space-y-3">
          <Label className="text-base font-medium">{t('settings.madhab')}</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant={settings.madhab === 2 ? "default" : "outline"}
              onClick={() => setSettings({ ...settings, madhab: 2 })}
              className="w-full"
            >
              {t('madhabs.shafi')}
            </Button>
            <Button
              type="button"
              variant={settings.madhab === 1 ? "default" : "outline"}
              onClick={() => setSettings({ ...settings, madhab: 1 })}
              className="w-full"
            >
              {t('madhabs.hanafi')}
            </Button>
          </div>
        </div>

        {/* Finish Button */}
        <div className="pt-4">
          <Button
            onClick={handleFinish}
            className="w-full"
            size="lg"
            disabled={!isReadyToFinish}
          >
            {!isReadyToFinish ? t('onboarding.madhabRequired') : t('onboarding.getStarted')}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="p-4 max-w-md mx-auto border-t">
        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-muted rounded-full"></div>
          <div className="h-1 flex-1 bg-muted rounded-full"></div>
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
