import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, MapPin, Moon, Sunset, Upload } from 'lucide-react';
import { useTranslation } from '@/contexts/TranslationContext';
import { toast } from 'sonner';

export default function WelcomePage() {
  const navigate = useNavigate();
  const { t, importTranslation, setActiveTranslation, importedTranslations } = useTranslation();
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
    { icon: Calendar, title: t('onboarding.salatTimesFeature'), description: t('onboarding.salatTimesDesc') },
    { icon: Sunset, title: t('onboarding.saumFeature'), description: t('onboarding.saumDesc') },
    { icon: Moon, title: t('onboarding.hijriFeature'), description: t('onboarding.hijriDesc') },
    { icon: MapPin, title: t('onboarding.gpsFeature'), description: t('onboarding.gpsDesc') }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Content */}
      <div className="flex-1 flex flex-col justify-center p-4 max-w-md mx-auto">
        <div className="text-center space-y-8">
          {/* Icon/Logo */}
          <div className="w-20 h-20 mx-auto flex items-center justify-center">
            <img src="/icon.png" alt="Muajjin" className="w-full h-full object-contain" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('onboarding.welcome')}</h1>
            <p className="text-muted-foreground text-lg">{t('onboarding.subtitle')}</p>
          </div>

          {/* Features Grid */}
          <Card className="bg-muted/30 border shadow-sm">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3">
                {features.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 border border-secondary rounded-lg"
                    >
                      <Icon className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-sm font-medium leading-tight">{feature.title}</p>
                        <p className="text-xs text-muted-foreground leading-tight mt-0.5">
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
          <div className="text-center space-y-2">
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full max-w-xs mx-auto"
            >
              <Upload className="h-4 w-4 mr-2" />
              {t('settings.importTranslation')}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {t('onboarding.translationImportDescription')}
              {' '}<a
                href="https://github.com/MuslimTechnician/muajjin/discussions/1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {t('onboarding.learnMore')}
              </a>
            </p>
          </div>

          {/* Get Started Button */}
          <Button
            onClick={() => navigate('/onboarding/location')}
            size="lg"
            className="w-full max-w-xs mx-auto"
          >
            {t('onboarding.getStarted')}
          </Button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="p-4 max-w-md mx-auto">
        <div className="flex gap-2">
          <div className="h-1 flex-1 bg-primary rounded-full"></div>
          <div className="h-1 flex-1 bg-muted rounded-full"></div>
          <div className="h-1 flex-1 bg-muted rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
