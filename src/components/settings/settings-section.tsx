import { Label } from '@/components/ui/label';
import type { FC, ReactNode } from 'react';

interface SettingsSectionProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export const SettingsSection: FC<SettingsSectionProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label>{title}</Label>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
};
