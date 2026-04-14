import { BottomNav } from '@/components/bottom-nav';
import { useTranslation } from '@/contexts/translation-context';
import {
  COUNTER_KEYS,
  PrayerRow,
  QazaCounterDrawer,
  useQazaTracker,
} from '@/features/qaza-tracker';
import type { FC } from 'react';

const QazaTrackerPage: FC = () => {
  const { t } = useTranslation();
  const tracker = useQazaTracker();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-md space-y-6 px-5 py-6 pb-20">
        <h1 className="text-2xl font-bold tracking-tight">{t('qaza.title')}</h1>

        <div className="space-y-2">
          {COUNTER_KEYS.map((key) => (
            <PrayerRow
              key={key}
              label={t(`qaza.${key}`)}
              count={tracker.counts[key]}
              counterKey={key}
              onEdit={tracker.openCounter}
            />
          ))}
        </div>
      </div>

      <QazaCounterDrawer
        isVisible={tracker.isDrawerVisible}
        isOpen={tracker.isDrawerOpen}
        activeKey={tracker.activeKey}
        activeCount={tracker.activeCount}
        editing={tracker.editing}
        editValue={tracker.editValue}
        onClose={tracker.closeCounter}
        onDecrement={tracker.decrementCounter}
        onIncrement={tracker.incrementCounter}
        onStartEdit={tracker.startManualEdit}
        onEditChange={tracker.handleEditChange}
        onEditBlur={tracker.commitManualEdit}
        onEditKeyDown={tracker.handleEditKeyDown}
        getLabel={(key) => t(`qaza.${key}`)}
        manualSetHint={t('qaza.tapToSetManually')}
      />

      <BottomNav />
    </div>
  );
};

export default QazaTrackerPage;
