import { Button } from '@/components/ui/button';
import { ReactNode } from 'react';

interface SelectionOption<T extends string> {
  value: T;
  label: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface SelectionButtonGroupProps<T extends string> {
  value: T;
  options: SelectionOption<T>[];
  onChange: (value: T) => void;
  gridClassName?: string;
  buttonClassName?: string;
}

export function SelectionButtonGroup<T extends string>({
  value,
  options,
  onChange,
  gridClassName = 'grid grid-cols-3 gap-3',
  buttonClassName = 'w-full',
}: SelectionButtonGroupProps<T>) {
  return (
    <div className={gridClassName}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          variant={value === option.value ? 'default' : 'outline'}
          onClick={() => onChange(option.value)}
          className={buttonClassName}
          disabled={option.disabled}>
          {option.icon}
          {option.label}
        </Button>
      ))}
    </div>
  );
}
