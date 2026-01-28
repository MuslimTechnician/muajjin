import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Moon, Sunset } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import packageInfo from '../../../package.json';
import { useTranslation } from '@/contexts/TranslationContext';

export default function AboutSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
          <h1 className="text-lg font-semibold">{t('aboutPage.title')}</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-w-md mx-auto space-y-4">
        {/* App Info Card */}
        <Card className="bg-muted/30 border shadow-sm">
          <CardContent className="p-6 text-center space-y-4">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto flex items-center justify-center">
              <img src="/icon.png" alt={t('aboutPage.appName')} className="w-full h-full object-contain" />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{t('aboutPage.appName')}</h2>
              <p className="text-sm text-muted-foreground">{t('aboutPage.tagline')}</p>
            </div>

            {/* Version */}
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground">v{packageInfo.version || '1.0.0'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Card className="bg-muted/30 border shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Prayer Times */}
              <div className="flex items-center gap-3 p-3 border border-secondary rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{t('aboutPage.features.prayerTimes')}</p>
                  <p className="text-xs text-muted-foreground">{t('aboutPage.features.prayerTimesDesc')}</p>
                </div>
              </div>

              {/* Hijri Calendar */}
              <div className="flex items-center gap-3 p-3 border border-secondary rounded-lg">
                <Moon className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{t('aboutPage.features.hijriCalendar')}</p>
                  <p className="text-xs text-muted-foreground">{t('aboutPage.features.hijriCalendarDesc')}</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 p-3 border border-secondary rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{t('aboutPage.features.location')}</p>
                  <p className="text-xs text-muted-foreground">{t('aboutPage.features.locationDesc')}</p>
                </div>
              </div>

              {/* Fasting */}
              <div className="flex items-center gap-3 p-3 border border-secondary rounded-lg">
                <Sunset className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{t('aboutPage.features.fasting')}</p>
                  <p className="text-xs text-muted-foreground">{t('aboutPage.features.fastingDesc')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Methods */}
        <Card className="bg-muted/30 border shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">{t('aboutPage.calculationMethods')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('aboutPage.calculationMethodsDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="bg-muted/30 border shadow-sm">
          <CardContent className="p-4">
            <h3 className="text-sm font-medium mb-2">{t('aboutPage.builtWith')}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t('aboutPage.builtWithDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            {t('aboutPage.madeWithLove')}
          </p>
          <p className="text-xs text-muted-foreground">
            {t('aboutPage.credits')} <a href="https://t.me/MuslimTechnician" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Muslim Technician</a>
          </p>
        </div>
      </div>
    </div>
  );
}
