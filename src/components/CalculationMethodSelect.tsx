import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/contexts/TranslationContext';
import {
  CALCULATION_METHODS,
  CALCULATION_METHOD_KEYS,
} from '@/services/prayerTimesService';

interface CalculationMethodSelectProps {
  value: number | null | undefined;
  onChange: (value: number) => void;
  triggerClassName?: string;
  placeholder?: string;
}

export function CalculationMethodSelect({
  value,
  onChange,
  triggerClassName = 'bg-card',
  placeholder,
}: CalculationMethodSelectProps) {
  const { t } = useTranslation();

  return (
    <Select
      value={value?.toString()}
      onValueChange={(v) => onChange(parseInt(v))}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue
          placeholder={placeholder || t('onboarding.selectCalculationMethod')}
        />
      </SelectTrigger>
      <SelectContent>
        {CALCULATION_METHODS.map((method) => (
          <SelectItem key={method.id} value={method.id.toString()}>
            {t(
              CALCULATION_METHOD_KEYS[method.id] || 'calculationMethods.other',
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
