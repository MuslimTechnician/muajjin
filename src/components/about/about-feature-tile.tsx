import { LucideIcon } from 'lucide-react';

interface AboutFeatureTileProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function AboutFeatureTile({
  icon: Icon,
  title,
  description,
}: AboutFeatureTileProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-secondary p-3">
      <Icon className="h-5 w-5 text-primary" />
      <div className="text-left">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
