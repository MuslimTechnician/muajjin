import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/contexts/TranslationContext';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const settingsItems = [
    {
      id: 'prayer-times',
      label: t('settings.salatTimesSettings'),
      route: '/settings/prayer-times',
    },
    {
      id: 'fasting',
      label: t('settings.saumSettings'),
      route: '/settings/fasting',
    },
    {
      id: 'hijri',
      label: t('settings.hijriSettings'),
      route: '/settings/hijri',
    },
    {
      id: 'time-location',
      label: t('settings.timeLocationSettings'),
      route: '/settings/time-location',
    },
    {
      id: 'display',
      label: t('settings.displaySettings'),
      route: '/settings/display',
    },
    {
      id: 'translations',
      label: t('settings.translations'),
      route: '/settings/translations',
    },
    {
      id: 'about',
      label: t('settings.aboutSettings'),
      route: '/settings/about',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-50 w-full border-b bg-background px-4 py-3">
        <div className="mx-auto flex max-w-md items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
        </div>
      </div>

      {/* Settings Menu */}
      <div className="mx-auto max-w-md space-y-2 p-4">
        {settingsItems.map((item) => (
          <Card
            key={item.id}
            className="cursor-pointer rounded-sm border shadow-sm transition-colors hover:bg-muted/50"
            onClick={() => navigate(item.route)}>
            <div className="p-4">
              <p className="text-base font-medium">{item.label}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
