import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { Calendar, MapPin, Moon, Sunset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import packageInfo from '../../../package.json';
import { AppHeader } from '@/components/AppHeader';

export default function AboutSettings() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton={true} title={t('aboutPage.title')} />

      {/* Content */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-4">
        {/* App Info Card */}
        <Card className="border bg-muted/30 shadow-sm">
          <CardContent className="space-y-4 p-6 text-center">
            {/* Icon */}
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <img
                src="/icon.png"
                alt={t('aboutPage.appName')}
                className="h-full w-full object-contain"
              />
            </div>

            {/* Title */}
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">{t('aboutPage.appName')}</h2>
              <p className="text-sm text-muted-foreground">
                {t('aboutPage.tagline')}
              </p>
            </div>

            {/* Version */}
            <div className="flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                v{packageInfo.version || '1.0.0'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Features Grid */}
        <Card className="border bg-muted/30 shadow-sm">
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Salat Times */}
              <div className="flex items-center gap-3 rounded-lg border border-secondary p-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t('aboutPage.features.salatTimes')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('aboutPage.features.salatTimesDesc')}
                  </p>
                </div>
              </div>

              {/* Hijri Calendar */}
              <div className="flex items-center gap-3 rounded-lg border border-secondary p-3">
                <Moon className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t('aboutPage.features.hijriCalendar')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('aboutPage.features.hijriCalendarDesc')}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-3 rounded-lg border border-secondary p-3">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t('aboutPage.features.location')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('aboutPage.features.locationDesc')}
                  </p>
                </div>
              </div>

              {/* Saum */}
              <div className="flex items-center gap-3 rounded-lg border border-secondary p-3">
                <Sunset className="h-5 w-5 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t('aboutPage.features.saum')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('aboutPage.features.saumDesc')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Methods */}
        <Card className="border bg-muted/30 shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium">
              {t('aboutPage.calculationMethods')}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('aboutPage.calculationMethodsDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Tech Stack */}
        <Card className="border bg-muted/30 shadow-sm">
          <CardContent className="p-4">
            <h3 className="mb-2 text-sm font-medium">
              {t('aboutPage.builtWith')}
            </h3>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {t('aboutPage.builtWithDesc')}
            </p>
          </CardContent>
        </Card>

        {/* Footer - one translatable string in JSON (editable in language file only) */}
        <div className="space-y-2 py-4 text-center">
          <p className="text-xs text-muted-foreground">
            {t('aboutPage.madeWithLove')}
          </p>
          <a
            href="https://t.me/MuslimTechnician"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline inline-block">
            {t('aboutPage.credits')}
          </a>
        </div>
      </div>
    </div>
  );
}
