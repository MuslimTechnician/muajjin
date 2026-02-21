import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface NumberAdjustmentControlProps {
  id: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

export function NumberAdjustmentControl({
  id,
  value,
  min,
  max,
  onChange,
}: NumberAdjustmentControlProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.max(value - 1, min))}>
        -
      </Button>
      <Input
        id={id}
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="bg-card text-center"
      />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onChange(Math.min(value + 1, max))}>
        +
      </Button>
    </div>
  );
}
