import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AppHeader } from '@/components/AppHeader';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  CalendarDays,
  Sunrise,
  Moon,
  Clock,
  Palette,
  Languages,
  Info,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SettingsHome() {
  const navigate = useNavigate();
  const { t } = useTranslation();

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <AppHeader showBackButton={true} title={t('settings.title')} />

      {/* Settings Categories */}
      <div className="max-w-md mx-auto px-5 py-6 space-y-3">
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Card
              key={category.id}
              className="p-3 cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => navigate(category.route)}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${category.color}`} />
                </div>
                <span className="flex-1 font-semibold">{category.label}</span>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
