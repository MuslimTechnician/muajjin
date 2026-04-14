import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface LabeledInputFieldProps {
  id: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  step?: string | number;
  containerClassName?: string;
  inputClassName?: string;
}

export function LabeledInputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  step,
  containerClassName = 'space-y-1',
  inputClassName = 'bg-card',
}: LabeledInputFieldProps) {
  return (
    <div className={cn(containerClassName)}>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        step={step}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(inputClassName)}
      />
    </div>
  );
}
