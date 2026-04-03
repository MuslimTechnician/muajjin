import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';
import { CalendarDays, Compass, Home, Settings } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    labelKey: 'navigation.home',
    to: '/',
    icon: Home,
    matches: (pathname: string) => pathname === '/',
  },
  {
    labelKey: 'navigation.calendar',
    to: '/upcoming-prayer-times',
    icon: CalendarDays,
    matches: (pathname: string) =>
      pathname.startsWith('/upcoming-prayer-times'),
  },
  {
    labelKey: 'navigation.compass',
    to: '/qibla',
    icon: Compass,
    matches: (pathname: string) => pathname.startsWith('/qibla'),
  },
  {
    labelKey: 'navigation.settings',
    to: '/settings',
    icon: Settings,
    matches: (pathname: string) => pathname.startsWith('/settings'),
  },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto grid max-w-md grid-cols-4 px-3 pb-[calc(env(safe-area-inset-bottom,0px)+0.75rem)] pt-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.matches(pathname);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2 text-xs font-medium text-muted-foreground transition-colors',
                isActive && 'bg-primary/10 text-primary',
              )}>
              <Icon className="h-5 w-5" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
