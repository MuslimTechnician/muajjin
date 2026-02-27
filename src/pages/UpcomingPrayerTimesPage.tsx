import { AppHeader } from '@/components/AppHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { calculatePrayerTimesLocally } from '@/services/prayerTimesLocal';
import { formatTime } from '@/utils/timeUtils';
import { Calendar } from 'lucide-react';
import { type PointerEvent, useMemo, useRef, useState } from 'react';

type UpcomingPrayer = {
  id: string;
  name: string;
  start: string;
  end: string;
};

type UpcomingDay = {
  dateKey: string;
  dateLabel: string;
  prayers: UpcomingPrayer[];
};

const PRAYER_CONFIG = [
  { id: 'fajr', key: 'Fajr' as const, endKey: 'Shuruq' as const },
  { id: 'dhuhr', key: 'Dhuhr' as const, endKey: 'Asr' as const },
  { id: 'asr', key: 'Asr' as const, endKey: 'Maghrib' as const },
  { id: 'maghrib', key: 'Maghrib' as const, endKey: 'Isha' as const },
  { id: 'isha', key: 'Isha' as const, endKey: 'Fajr' as const },
] as const;

const DATE_PICKER_MIN = '1900-01-01';
const DATE_PICKER_MAX = '2100-12-31';

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string): string {
  const date = parseInputDate(value);
  const day = date.toLocaleDateString(undefined, { day: 'numeric' });
  const month = date.toLocaleDateString(undefined, { month: 'long' });
  const year = date.toLocaleDateString(undefined, { year: 'numeric' });
  return `${day} ${month}, ${year}`;
}

const UpcomingPrayerTimesPage = () => {
  const { settings } = useApp();
  const { t, getSalatName } = useTranslation();

  const [startDateValue, setStartDateValue] = useState(() =>
    formatDateForInput(new Date()),
  );
  const [singleDayOnly, setSingleDayOnly] = useState(false);
  const [monthOffset, setMonthOffset] = useState(0);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const openDatePicker = () => {
    const input = dateInputRef.current;
    if (!input) return;

    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }

    input.focus();
  };

  const handleDatePointerDown = (e: PointerEvent<HTMLInputElement>) => {
    e.preventDefault();
    openDatePicker();
  };

  const viewedMonthLabel = useMemo(() => {
    const selectedDate = parseInputDate(startDateValue);
    const viewedMonthDate = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + monthOffset,
      1,
    );

    return viewedMonthDate.toLocaleDateString(undefined, {
      month: 'long',
      year: 'numeric',
    });
  }, [monthOffset, startDateValue]);

  const upcomingDays = useMemo<UpcomingDay[]>(() => {
    const selectedDate = parseInputDate(startDateValue);
    selectedDate.setHours(0, 0, 0, 0);

    const datesToRender: Date[] = [];

    if (singleDayOnly) {
      datesToRender.push(new Date(selectedDate));
    } else {
      const viewedMonthDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() + monthOffset,
        1,
      );
      const year = viewedMonthDate.getFullYear();
      const month = viewedMonthDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        datesToRender.push(new Date(year, month, day));
      }
    }

    return datesToRender.map((date) => {
      date.setHours(0, 0, 0, 0);

      const timings = calculatePrayerTimesLocally(date, settings);

      const prayers = PRAYER_CONFIG.map(({ id, key, endKey }) => ({
        id,
        name: getSalatName(key),
        start: timings[key],
        end: timings[endKey],
      }));

      return {
        dateKey: formatDateForInput(date),
        dateLabel: date.toLocaleDateString(undefined, {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        prayers,
      };
    });
  }, [getSalatName, monthOffset, settings, singleDayOnly, startDateValue]);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader showBackButton={true} title={t('salatTimes.upcomingTitle')} />

      <div className="mx-auto max-w-md space-y-4 px-5 py-6">
        <Card className="p-4">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <p className="mb-1 text-sm font-medium">
                {t('salatTimes.datePickerLabel')}
              </p>
              <div className="relative">
                <Input
                  type="text"
                  value={formatDisplayDate(startDateValue)}
                  readOnly
                  tabIndex={-1}
                  className="cursor-pointer select-none pr-10"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    openDatePicker();
                  }}
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  ref={dateInputRef}
                  type="date"
                  value={startDateValue}
                  min={DATE_PICKER_MIN}
                  max={DATE_PICKER_MAX}
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute left-0 h-0 w-0 opacity-0"
                  onPointerDown={handleDatePointerDown}
                  onChange={(e) => {
                    setStartDateValue(e.target.value);
                    setMonthOffset(0);
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t('salatTimes.singleDayCompact')}
              </p>
              <Switch
                checked={singleDayOnly}
                onCheckedChange={setSingleDayOnly}
              />
            </div>
          </div>
        </Card>

        <p className="text-sm text-muted-foreground">
          {singleDayOnly
            ? t('salatTimes.singleDaySubtitle')
            : t('salatTimes.monthlySubtitle', { month: viewedMonthLabel })}
        </p>

        {!singleDayOnly && (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={() => setMonthOffset((prev) => prev - 1)}>
              {t('salatTimes.previousMonth')}
            </Button>
            <Button
              variant="outline"
              onClick={() => setMonthOffset((prev) => prev + 1)}>
              {t('salatTimes.nextMonth')}
            </Button>
          </div>
        )}

        <div className="space-y-3">
          {upcomingDays.map((day) => (
            <Card key={day.dateKey} className="overflow-hidden">
              <div className="border-b bg-muted/30 px-4 py-2 text-sm font-semibold text-muted-foreground">
                {day.dateLabel}
              </div>

              <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-2 border-b bg-muted/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <div className="text-left">{t('salatTimes.salat')}</div>
                <div className="text-right">{t('salatTimes.start')}</div>
                <div className="text-right">{t('salatTimes.end')}</div>
              </div>

              <div className="divide-y divide-border">
                {day.prayers.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-2 px-4 py-2">
                    <span className="text-left font-medium">{prayer.name}</span>
                    <span className="text-right tabular-nums">
                      {formatTime(prayer.start, settings.timeFormat)}
                    </span>
                    <span className="text-right tabular-nums">
                      {formatTime(prayer.end, settings.timeFormat)}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingPrayerTimesPage;
