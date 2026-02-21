import { OnboardingPageLayout } from '@/components/onboarding/OnboardingPageLayout';
import { OnboardingStepHeader } from '@/components/onboarding/OnboardingStepHeader';
import { ActiveLanguageSelect } from '@/components/translation/ActiveLanguageSelect';
import { TranslationImportControl } from '@/components/translation/TranslationImportControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { ArrowUpRight, Calendar, MapPin, Moon, Sunrise } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t, activeTranslation, importedTranslations, setActiveTranslation } =
    useTranslation();
  const importedTranslationsList = Object.values(importedTranslations);

  const features = [
    {
      icon: Calendar,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      title: t('onboarding.salatTimesFeature'),
      description: t('onboarding.salatTimesDesc'),
    },
    {
      icon: Sunrise,
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-500/10',
      title: t('onboarding.saumFeature'),
      description: t('onboarding.saumDesc'),
    },
    {
      icon: Moon,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      title: t('onboarding.hijriFeature'),
      description: t('onboarding.hijriDesc'),
    },
    {
      icon: MapPin,
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10',
      title: t('onboarding.gpsFeature'),
      description: t('onboarding.gpsDesc'),
    },
  ];

  return (
    <OnboardingPageLayout currentStep={1}>
      {/* App Logo */}
      <div className="flex justify-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center">
          <img
            src="/icon.png"
            alt={t('aboutPage.appName')}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <OnboardingStepHeader
        title={t('onboarding.welcome')}
        description={t('onboarding.subtitle')}
      />

      {/* Features Grid */}
      <Card className="shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="space-y-2 text-center">
                  <div
                    className={`mx-auto h-12 w-12 rounded-xl ${feature.iconBg} flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-sm font-semibold">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Language Selection */}
      <ActiveLanguageSelect
        value={activeTranslation?.id || 'en'}
        importedTranslations={importedTranslationsList}
        onValueChange={(value) =>
          setActiveTranslation(value === 'en' ? null : value)
        }
        sectionClassName="space-y-3"
        labelClassName="text-sm font-medium"
      />

      <TranslationImportControl
        buttonLabel={t('settings.importTranslation')}
        requireIdForSuccess={true}
        onImported={(id) => setActiveTranslation(id)}
        helper={
          <a
            href="https://github.com/MuslimTechnician/muajjin/discussions/1"
            target="_blank"
            rel="noopener noreferrer"
            className="mx-auto block text-center text-xs text-primary hover:underline">
            {t('onboarding.translationImportDescriptionWithLearnMore')}{' '}
            <ArrowUpRight className="inline h-4 w-4" />
          </a>
        }
        helperPosition="after"
      />

      {/* Get Started Button */}
      <Button
        onClick={() => navigate('/onboarding/location', { replace: true })}
        size="lg"
        className="w-full">
        {t('onboarding.getStarted')}
      </Button>
    </OnboardingPageLayout>
  );
}
