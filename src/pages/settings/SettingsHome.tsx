import { SettingsPageLayout } from '@/components/settings/SettingsPageLayout';
import { Card } from '@/components/ui/card';
import { SelectionButtonGroup } from '@/components/ui/SelectionButtonGroup';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  CalendarDays,
  ChevronRight,
  Clock,
  Info,
  Languages,
  Monitor,
  Moon,
  Palette,
  Sun,
  Sunrise,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SettingsHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const settingsCategories = [
    {
      id: 'prayer-times',
      icon: CalendarDays,
      label: t('settings.salatTimesSettings'),
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      route: '/settings/prayer-times',
    },
    {
      id: 'fasting',
      icon: Sunrise,
      label: t('settings.saumSettings'),
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
      route: '/settings/fasting',
    },
    {
      id: 'hijri',
      icon: Moon,
      label: t('settings.hijriSettings'),
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      route: '/settings/hijri',
    },
    {
      id: 'time-location',
      icon: Clock,
      label: t('settings.timeLocationSettings'),
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      route: '/settings/time-location',
    },
    {
      id: 'display',
      icon: Palette,
      label: t('settings.displaySettings'),
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
      route: '/settings/display',
    },
    {
      id: 'translations',
      icon: Languages,
      label: t('settings.translations'),
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      route: '/settings/translations',
    },
    {
      id: 'about',
      icon: Info,
      label: t('settings.aboutSettings'),
      color: 'text-muted-foreground',
      bgColor: 'bg-muted/20',
      route: '/settings/about',
    },
  ];

  return (
    <SettingsPageLayout
      title={t('settings.title')}
      showBackButton={false}
      contentClassName="max-w-md mx-auto px-5 py-6 space-y-3">
      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="font-semibold">{t('settings.theme')}</p>
            <p className="text-sm text-muted-foreground">
              {t('settings.themeDesc')}
            </p>
          </div>

          <SelectionButtonGroup
            value={theme as 'light' | 'dark' | 'system'}
            onChange={(value) => setTheme(value)}
            options={[
              {
                value: 'light',
                icon: <Sun className="mr-2 h-4 w-4" />,
                label: t('settings.light'),
                disabled: !mounted,
              },
              {
                value: 'dark',
                icon: <Moon className="mr-2 h-4 w-4" />,
                label: t('settings.dark'),
                disabled: !mounted,
              },
              {
                value: 'system',
                icon: <Monitor className="mr-2 h-4 w-4" />,
                label: t('settings.system'),
                disabled: !mounted,
              },
            ]}
          />
        </div>
      </Card>

      {settingsCategories.map((category) => {
        const Icon = category.icon;
        return (
          <Card
            key={category.id}
            className="cursor-pointer p-3 transition-colors hover:bg-accent/50"
            onClick={() => navigate(category.route)}>
            <div className="flex items-center gap-3">
              <div
                className={`h-10 w-10 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${category.color}`} />
              </div>

              <span className="flex-1 font-semibold">{category.label}</span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        );
      })}
    </SettingsPageLayout>
  );
}
