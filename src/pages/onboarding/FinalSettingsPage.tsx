import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  CALCULATION_METHODS,
  CALCULATION_METHOD_KEYS,
} from '@/services/prayerTimesService';
import { UserSettings } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { CalendarDays, Scale } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function FinalSettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings: appSettings, updateSettings } = useApp();

  // Start from existing app settings (location set in previous step or defaults)
  const [settings, setSettings] = useState<UserSettings>(() => ({
    method: appSettings.method ?? ONBOARDING_DEFAULTS.method,
    madhab: appSettings.madhab ?? ONBOARDING_DEFAULTS.madhab ?? null,
    timeFormat: appSettings.timeFormat ?? 'system',
    jamaahTimes: appSettings.jamaahTimes ?? {},
    suhoorAdjustment: appSettings.suhoorAdjustment ?? 0,
    iftarAdjustment: appSettings.iftarAdjustment ?? 0,
    hijriAdjustment: appSettings.hijriAdjustment ?? 0,
    hijriDateChangeAtMaghrib: appSettings.hijriDateChangeAtMaghrib ?? true,
    manualLocation: appSettings.manualLocation ?? true,
    city: appSettings.city ?? ONBOARDING_DEFAULTS.city,
    country: appSettings.country ?? ONBOARDING_DEFAULTS.country,
    latitude: appSettings.latitude ?? ONBOARDING_DEFAULTS.latitude,
    longitude: appSettings.longitude ?? ONBOARDING_DEFAULTS.longitude,
  }));

  // Check if user has completed all required selections
  const isReadyToFinish = settings.madhab !== null;

  const handleFinish = () => {
    // Save all settings and mark onboarding as completed
    updateSettings({ ...settings, onboardingComplete: true });
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Content - same width/padding as dashboard and settings */}
      <div className="mx-auto max-w-md px-5 py-6 space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('onboarding.customizing')}</h1>
          <p className="text-base text-muted-foreground">
            {t('onboarding.selectCalculationMethod')}
          </p>
        </div>

        <Card className="shadow-lg">
            <CardContent className="p-6 space-y-6">
              {/* Calculation Method */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CalendarDays className="w-4 h-4 text-primary" />
                  <Label>{t('settings.calculationMethod')}</Label>
                </div>
                <Select
                  value={settings.method?.toString()}
                  onValueChange={(value) =>
                    setSettings({ ...settings, method: parseInt(value) })
                  }>
                  <SelectTrigger className="w-full bg-card">
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

              {/* Madhab Selection */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Scale className="w-4 h-4 text-primary" />
                  <Label>{t('settings.madhab')}</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t('settings.madhabDesc')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={settings.madhab === 0 ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, madhab: 0 })}
                    className="w-full">
                    {t('madhabs.shafi')}
                  </Button>
                  <Button
                    type="button"
                    variant={settings.madhab === 1 ? 'default' : 'outline'}
                    onClick={() => setSettings({ ...settings, madhab: 1 })}
                    className="w-full">
                    {t('madhabs.hanafi')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Finish Button - outside card for consistent onboarding layout */}
        <Button
          onClick={handleFinish}
          size="lg"
          className="w-full"
          disabled={!isReadyToFinish}>
          {!isReadyToFinish
            ? t('onboarding.madhabRequired')
            : t('onboarding.getStarted')}
        </Button>
      </div>

      {/* Progress indicator - same width/padding as content */}
      <div className="mx-auto max-w-md px-5 py-4">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
}
