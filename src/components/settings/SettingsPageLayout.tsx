import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface SettingsPageLayoutProps {
  title: string;
  children: ReactNode;
  contentClassName?: string;
  showBackButton?: boolean;
}

export function SettingsPageLayout({
  title,
  children,
  contentClassName = 'mx-auto max-w-md space-y-6 px-5 py-6',
  showBackButton = true,
}: SettingsPageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-16">
      <div className={contentClassName}>
        <div className="space-y-4">
          {showBackButton ? (
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="size-10 rounded-full">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="flex-1 text-center text-2xl font-bold tracking-tight">
                {title}
              </h1>
              <div className="size-10" />
            </div>
          ) : (
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            </div>
          )}
        </div>
        {children}
      </div>
      <BottomNav />
    </div>
  );
}
