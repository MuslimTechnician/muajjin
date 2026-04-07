import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/contexts/TranslationContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Minus, Pencil, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

type QazaCounterKey =
  | 'fajr'
  | 'dhuhr'
  | 'asr'
  | 'maghrib'
  | 'isha'
  | 'other'
  | 'saum';

interface QazaCounts {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  other: number;
  saum: number;
}

const COUNTER_KEYS: QazaCounterKey[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
  'other',
  'saum',
];

const INITIAL_COUNTS: QazaCounts = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
  other: 0,
  saum: 0,
};

const MAX_COUNT = 99999;
const DRAWER_ANIMATION_MS = 300;

interface PrayerRowProps {
  label: string;
  count: number;
  counterKey: QazaCounterKey;
  onEdit: (key: QazaCounterKey) => void;
}

function PrayerRow({ label, count, counterKey, onEdit }: PrayerRowProps) {
  const handleClick = useCallback(() => {
    onEdit(counterKey);
  }, [onEdit, counterKey]);

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
}

export default function QazaTrackerPage() {
  const { t } = useTranslation();
  const [counts, setCounts] = useLocalStorage<QazaCounts>(
    'muajjin-qaza-tracker',
    INITIAL_COUNTS,
  );
  const [activeKey, setActiveKey] = useState<QazaCounterKey | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const activeCount = activeKey ? counts[activeKey] : 0;
  const isOpen = activeKey !== null && !isClosing;
  const isDrawerVisible = activeKey !== null;

  useEffect(() => {
    if (isDrawerVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerVisible]);

  const handleOpen = useCallback((key: QazaCounterKey) => {
    setIsClosing(false);
    setActiveKey(key);
    setEditing(false);
    setEditValue('');
  }, []);

  const handleClose = useCallback(() => {
    if (!activeKey || isClosing) return;
    setIsClosing(true);
    setEditing(false);
    setEditValue('');
  }, [activeKey, isClosing]);

  useEffect(() => {
    if (!isClosing) return;
    const timeoutId = window.setTimeout(() => {
      setActiveKey(null);
      setIsClosing(false);
    }, DRAWER_ANIMATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isClosing]);

  const handleIncrement = useCallback(() => {
    if (!activeKey) return;
    setCounts((prev) => ({
      ...prev,
      [activeKey]: Math.min(MAX_COUNT, prev[activeKey] + 1),
    }));
  }, [activeKey, setCounts]);

  const handleDecrement = useCallback(() => {
    if (!activeKey) return;
    setCounts((prev) => ({
      ...prev,
      [activeKey]: Math.max(0, prev[activeKey] - 1),
    }));
  }, [activeKey, setCounts]);

  const startEdit = useCallback(() => {
    if (!activeKey) return;
    setEditValue(String(counts[activeKey]));
    setEditing(true);
  }, [activeKey, counts]);

  const commitEdit = useCallback(() => {
    if (!activeKey) return;
    const parsed = Math.min(
      MAX_COUNT,
      Math.max(0, parseInt(editValue, 10) || 0),
    );
    setCounts((prev) => ({ ...prev, [activeKey]: parsed }));
    setEditing(false);
    setEditValue('');
  }, [activeKey, editValue, setCounts]);

  const handleEditChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (e.target.value === '' || (val >= 0 && val <= MAX_COUNT)) {
        setEditValue(e.target.value);
      }
    },
    [],
  );

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitEdit();
      if (e.key === 'Escape') setEditing(false);
    },
    [commitEdit],
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md space-y-6 px-5 py-6 pb-20">
        <h1 className="text-2xl font-bold tracking-tight">{t('qaza.title')}</h1>

        <div className="space-y-2">
          {COUNTER_KEYS.map((key) => (
            <PrayerRow
              key={key}
              label={t(`qaza.${key}`)}
              count={counts[key]}
              counterKey={key}
              onEdit={handleOpen}
            />
          ))}
        </div>
      </div>

      {isDrawerVisible && (
        <>
          <div
            className={`fixed inset-x-0 bottom-14 top-0 z-[45] bg-black/35 duration-200 ${
              isOpen
                ? 'animate-in fade-in'
                : 'animate-out fade-out [animation-fill-mode:forwards]'
            }`}
            onClick={handleClose}
          />

          <div
            className={`fixed inset-x-0 bottom-14 z-[50] rounded-t-3xl border-t border-border bg-card shadow-[0_-4px_24px_rgba(0,0,0,0.12)] duration-300 ${
              isOpen
                ? 'animate-in slide-in-from-bottom'
                : 'animate-out slide-out-to-bottom [animation-fill-mode:forwards]'
            }`}>
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-1 w-9 rounded-full bg-border" />
            </div>

            <div className="px-6 pb-2 pt-3 text-center">
              <div className="text-[22px] font-bold tracking-tight">
                {activeKey ? t(`qaza.${activeKey}`) : ''}
              </div>
            </div>

            <div className="mx-6 my-2 border-t border-border" />

            <div className="flex items-center justify-center gap-7 px-8 pb-4 pt-3">
              <Button
                variant="outline"
                size="icon"
                className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90"
                onClick={handleDecrement}
                disabled={activeCount === 0}>
                <Minus className="h-5 w-5" />
              </Button>

              {editing ? (
                <Input
                  type="number"
                  min={0}
                  max={MAX_COUNT}
                  value={editValue}
                  onChange={handleEditChange}
                  onBlur={commitEdit}
                  onKeyDown={handleEditKeyDown}
                  className="min-h-[56px] min-w-[64px] border-2 border-primary bg-primary/10 px-3 text-center text-[36px] font-bold tabular-nums tracking-tight text-primary"
                  autoFocus
                />
              ) : (
                <button
                  onClick={startEdit}
                  className={`flex min-h-[56px] min-w-[64px] items-center justify-center rounded-2xl px-3 text-[36px] font-bold tabular-nums tracking-tight transition-colors ${
                    activeCount > 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                  {activeCount}
                </button>
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-muted"
                onClick={handleIncrement}>
                <Plus className="h-5 w-5" />
              </Button>
            </div>

            <p className="pb-6 text-center text-xs text-muted-foreground/60">
              {t('qaza.tapToSetManually')}
            </p>
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
}
