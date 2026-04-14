import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import { type FC, useCallback } from 'react';

import type { QazaCounterKey } from '../types';

interface PrayerRowProps {
  label: string;
  count: number;
  counterKey: QazaCounterKey;
  onEdit: (key: QazaCounterKey) => void;
}

export const PrayerRow: FC<PrayerRowProps> = ({
  label,
  count,
  counterKey,
  onEdit,
}) => {
  const handleClick = useCallback(() => {
    onEdit(counterKey);
  }, [counterKey, onEdit]);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <span className="flex-1 text-left text-[15px] font-medium tracking-tight">
        {label}
      </span>
      <span
        className={`min-w-[28px] text-right text-lg font-bold tabular-nums tracking-tight ${
          count > 0 ? 'text-primary' : 'text-muted-foreground'
        }`}>
        {count}
      </span>
      <Button
        size="icon"
        className="h-[34px] w-[34px] shrink-0 rounded-lg shadow-sm"
        onClick={handleClick}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  );
};
