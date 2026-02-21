import { CalculationMethodSelect } from '@/components/CalculationMethodSelect';
import { HijriAdjustmentSelector } from '@/components/HijriAdjustmentSelector';
import { HijriCalendarInfoCard } from '@/components/HijriCalendarInfoCard';
import { MadhabSelector } from '@/components/MadhabSelector';
import { OnboardingPageLayout } from '@/components/onboarding/OnboardingPageLayout';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ONBOARDING_DEFAULTS } from '@/constants/defaultSettings';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { UserSettings } from '@/types';
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
    <OnboardingPageLayout currentStep={3}>
      <OnboardingStepHeader
        title={t('onboarding.customizing')}
        description={t('onboarding.selectCalculationMethod')}
        icon={<CalendarDays className="h-10 w-10 text-primary" />}
      />

      <Card className="shadow-lg">
        <CardContent className="space-y-6 p-6">
          {/* Calculation Method */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4 text-primary" />
              <Label>{t('settings.calculationMethod')}</Label>
            </div>
            <CalculationMethodSelect
              value={settings.method}
              onChange={(value) => setSettings({ ...settings, method: value })}
              triggerClassName="w-full bg-card"
            />
          </div>

          {/* Madhab Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Scale className="h-4 w-4 text-primary" />
              <Label>{t('settings.madhab')}</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('settings.madhabDesc')}
            </p>
            <MadhabSelector
              value={settings.madhab}
              onChange={(value) => setSettings({ ...settings, madhab: value })}
            />
          </div>

          {/* Hijri Date Adjustment */}
          <HijriAdjustmentSelector
            value={settings.hijriAdjustment}
            onChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                hijriAdjustment: value,
              }))
            }
            showIcon={true}
          />

          {/* Hijri Calendar Info */}
          <HijriCalendarInfoCard />
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
    </OnboardingPageLayout>
  );
}
