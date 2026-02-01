import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { Calendar, MapPin, Moon, Sunset, Upload } from 'lucide-react';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t, importTranslation, setActiveTranslation, importedTranslations } =
    useTranslation();
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
      title: t('onboarding.salatTimesFeature'),
      description: t('onboarding.salatTimesDesc'),
    },
    {
      icon: Sunset,
      title: t('onboarding.saumFeature'),
      description: t('onboarding.saumDesc'),
    },
    {
      icon: Moon,
      title: t('onboarding.hijriFeature'),
      description: t('onboarding.hijriDesc'),
    },
    {
      icon: MapPin,
      title: t('onboarding.gpsFeature'),
      description: t('onboarding.gpsDesc'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Content */}
      <div className="mx-auto flex max-w-md flex-1 flex-col justify-center p-4">
        <div className="space-y-8 text-center">
          {/* Icon/Logo */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center">
            <img
              src="/icon.png"
              alt="Muajjin"
              className="h-full w-full object-contain"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              {t('onboarding.welcome')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('onboarding.subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <Card className="border bg-muted/30 shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 rounded-lg border border-secondary p-3">
                      <Icon className="h-5 w-5 flex-shrink-0 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium leading-tight">
                          {feature.title}
                        </p>
                        <p className="mt-0.5 text-xs leading-tight text-muted-foreground">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Translation Import */}
          <div className="space-y-2 text-center">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="mx-auto w-full max-w-xs">
              <Upload className="mr-2 h-4 w-4" />
              {t('settings.importTranslation')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <p className="mx-auto max-w-xs text-xs text-muted-foreground">
              {t('onboarding.translationImportDescription')}{' '}
              <a
                href="https://github.com/MuslimTechnician/muajjin/discussions/1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline">
                {t('onboarding.learnMore')}
              </a>
            </p>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={() => navigate('/onboarding/location', { replace: true })}
            size="lg"
            className="mx-auto w-full max-w-xs">
            {t('onboarding.getStarted')}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mx-auto max-w-md p-4">
        <div className="flex gap-2">
          <div className="h-1 flex-1 rounded-full bg-primary"></div>
          <div className="h-1 flex-1 rounded-full bg-muted"></div>
          <div className="h-1 flex-1 rounded-full bg-muted"></div>
        </div>
      </div>
    </div>
  );
}
