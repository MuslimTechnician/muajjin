import { AboutFeatureTile } from '@/components/about/AboutFeatureTile';
import { AboutInfoCard } from '@/components/about/AboutInfoCard';
import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { requestUpdateCheck, UPDATE_ENABLED } from '@/features/update';
import { Calendar, MapPin, Moon, Sunset } from 'lucide-react';
import packageInfo from '../../../package.json';

export default function AboutSettings() {
  const { t } = useTranslation();

  return (
    <SettingsPageLayout
      title={t('aboutPage.title')}
      contentClassName="mx-auto max-w-md space-y-4 px-5 py-6">
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
          <div className="flex flex-col items-center justify-center gap-3">
            <span className="text-xs text-muted-foreground">
              v{packageInfo.version || '1.0.0'}
            </span>
            {UPDATE_ENABLED && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  requestUpdateCheck({ force: true, notifyUpToDate: true })
                }>
                {t('aboutPage.checkForUpdate')}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Card className="border bg-muted/30 shadow-sm">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <AboutFeatureTile
              icon={Calendar}
              title={t('aboutPage.features.salatTimes')}
              description={t('aboutPage.features.salatTimesDesc')}
            />
            <AboutFeatureTile
              icon={Moon}
              title={t('aboutPage.features.hijriCalendar')}
              description={t('aboutPage.features.hijriCalendarDesc')}
            />
            <AboutFeatureTile
              icon={MapPin}
              title={t('aboutPage.features.location')}
              description={t('aboutPage.features.locationDesc')}
            />
            <AboutFeatureTile
              icon={Sunset}
              title={t('aboutPage.features.saum')}
              description={t('aboutPage.features.saumDesc')}
            />
          </div>
        </CardContent>
      </Card>

      <AboutInfoCard
        title={t('aboutPage.calculationMethods')}
        description={t('aboutPage.calculationMethodsDesc')}
      />
      <AboutInfoCard
        title={t('aboutPage.builtWith')}
        description={t('aboutPage.builtWithDesc')}
      />

      {/* Footer - one translatable string in JSON (editable in language file only) */}
      <div className="space-y-2 py-4 text-center">
        <p className="text-xs text-muted-foreground">
          {t('aboutPage.madeWithLove')}
        </p>
        <a
          href="https://t.me/MuslimTechnician"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-xs text-primary hover:underline">
          {t('aboutPage.credits')}
        </a>
      </div>
    </SettingsPageLayout>
  );
}
