import { AppHeader } from '@/components/AppHeader';
import { ReactNode } from 'react';

interface SettingsPageLayoutProps {
  title: string;
  children: ReactNode;
  contentClassName?: string;
}

export function SettingsPageLayout({
  title,
  children,
  contentClassName = 'mx-auto max-w-md space-y-6 px-5 py-6',
}: SettingsPageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBackButton={true} title={title} />
      <div className={contentClassName}>{children}</div>
    </div>
  );
}
