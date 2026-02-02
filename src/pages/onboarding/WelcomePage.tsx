import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { Calendar, MapPin, Moon, Sunrise, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t, importTranslation, setActiveTranslation } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        const result = importTranslation(json);

        if (result.success && result.id) {
          // Auto-apply the newly imported translation
          setActiveTranslation(result.id);
          toast.success(t('settings.importSuccess'));
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } else {
          toast.error(result.error || t('settings.importError'));
        }
      } catch (error) {
        toast.error(t('errors.invalidFile'));
      }
    };
    reader.readAsText(file);
  };

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
    <div className="min-h-screen bg-background">
      {/* Content - same width/padding as dashboard and settings */}
      <div className="mx-auto max-w-md px-5 py-6 space-y-6">
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

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {t('onboarding.welcome')}
            </h1>
            <p className="text-base text-muted-foreground">
              {t('onboarding.subtitle')}
            </p>
          </div>

        {/* Features Grid */}
        <Card className="shadow-lg">
          <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="text-center space-y-2">
                      <div className={`w-12 h-12 mx-auto rounded-xl ${feature.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${feature.iconColor}`} />
                      </div>
                      <h3 className="font-semibold text-sm">{feature.title}</h3>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        {/* Translation Import */}
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="w-full">
          <Upload className="w-4 h-4 mr-2" />
          {t('settings.importTranslation')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileImport}
          className="hidden"
        />

        {/* Translation import help text (after import button) */}
        <a
          href="https://github.com/MuslimTechnician/muajjin/discussions/1"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto text-center text-xs text-muted-foreground text-primary hover:underline block">
          {t('onboarding.translationImportDescriptionWithLearnMore')}
        </a>

        {/* Get Started Button */}
        <Button
          onClick={() => navigate('/onboarding/location', { replace: true })}
          size="lg"
          className="w-full">
          {t('onboarding.getStarted')}
        </Button>
      </div>

      {/* Progress indicator - same width/padding as content */}
      <div className="mx-auto max-w-md px-5 py-4">
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <div className="w-2 h-2 rounded-full bg-muted" />
          <div className="w-2 h-2 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
