import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserSettings } from '@/types';

type PrayerKey = keyof UserSettings['jamaahTimes'];

interface JamaahTimesFieldsProps {
  values: UserSettings['jamaahTimes'];
  onChange: (prayer: PrayerKey, value: string) => void;
  getPrayerLabel: (prayer: PrayerKey) => string;
  prayers?: PrayerKey[];
  containerClassName?: string;
  itemClassName?: string;
  inputClassName?: string;
}

const DEFAULT_PRAYERS: PrayerKey[] = [
  'Fajr',
  'Dhuhr',
  'Asr',
  'Maghrib',
  'Isha',
];

export function JamaahTimesFields({
  values,
  onChange,
  getPrayerLabel,
  prayers = DEFAULT_PRAYERS,
  containerClassName = 'space-y-3',
  itemClassName = 'space-y-1',
  inputClassName = 'bg-card',
}: JamaahTimesFieldsProps) {
  return (
    <div className={containerClassName}>
      {prayers.map((prayer) => (
        <div key={prayer} className={itemClassName}>
          <Label htmlFor={`jamaah-${prayer}`}>{getPrayerLabel(prayer)}</Label>

          <Input
            id={`jamaah-${prayer}`}
            type="time"
            value={values[prayer] || ''}
            onChange={(e) => onChange(prayer, e.target.value)}
            className={inputClassName}
          />
        </div>
      ))}
    </div>
  );
}
