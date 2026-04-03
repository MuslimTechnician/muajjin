import { cn } from '@/lib/utils';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card } from '@/components/ui/card';
import {
  CalendarDays,
  Compass,
  Home,
  LayoutGrid,
  Settings,
  X,
} from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

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
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (sheetOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sheetOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/80 transition-opacity duration-300',
          sheetOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0',
        )}
        onClick={() => setSheetOpen(false)}
      />

      {/* Nav Sheet */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-border bg-background shadow-lg transition-transform duration-300 ease-in-out',
          sheetOpen ? 'translate-x-0' : '-translate-x-full',
        )}>
        {/* Header */}
        <div className="border-b border-border px-5 py-5">
          <div className="flex w-full items-center gap-3">
            <img
              src="/icon.png"
              alt={t('common.appName')}
              className="h-10 w-10 rounded-xl"
            />
            <span className="flex-1 text-lg font-bold tracking-tight">
              {t('common.appName')}
            </span>
            <button
              onClick={() => setSheetOpen(false)}
              className="flex size-8 items-center justify-center rounded-sm opacity-70 transition-opacity hover:opacity-100">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex flex-col gap-2 px-3 py-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.matches(pathname);

            return (
              <Card
                key={item.to}
                className={cn(
                  'cursor-pointer p-3 transition-colors hover:bg-accent/50',
                  isActive && 'border-primary/30 bg-primary/5',
                )}
                onClick={() => {
                  setSheetOpen(false);
                  navigate(item.to);
                }}>
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 font-semibold">
                    {t(item.labelKey)}
                  </span>
                </div>
              </Card>
            );
          })}
        </nav>
      </div>

      {/* Bottom Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex items-center justify-between px-5 pb-[calc(env(safe-area-inset-bottom,0px)+0.5rem)] pt-2">
          <button
            onClick={() => setSheetOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label="Menu">
            <LayoutGrid className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/')}
            className="cursor-pointer text-lg font-bold tracking-tight">
            {t('common.appName')}
          </button>

          <button
            onClick={() => navigate('/settings')}
            className="flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            aria-label={t('navigation.settings')}>
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
    </>
  );
}
