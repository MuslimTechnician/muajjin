import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Minus, Plus } from 'lucide-react';
import type { ChangeEvent, FC, KeyboardEvent } from 'react';

import { MAX_QAZA_COUNT } from '../constants';
import type { QazaCounterKey } from '../types';

interface QazaCounterDrawerProps {
  isVisible: boolean;
  isOpen: boolean;
  activeKey: QazaCounterKey | null;
  activeCount: number;
  editing: boolean;
  editValue: string;
  onClose: () => void;
  onDecrement: () => void;
  onIncrement: () => void;
  onStartEdit: () => void;
  onEditChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEditBlur: () => void;
  onEditKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
  getLabel: (key: QazaCounterKey) => string;
  manualSetHint: string;
}

export const QazaCounterDrawer: FC<QazaCounterDrawerProps> = ({
  isVisible,
  isOpen,
  activeKey,
  activeCount,
  editing,
  editValue,
  onClose,
  onDecrement,
  onIncrement,
  onStartEdit,
  onEditChange,
  onEditBlur,
  onEditKeyDown,
  getLabel,
  manualSetHint,
}) => {
  if (!isVisible) return null;

  return (
    <>
      <div
        className={`fixed inset-x-0 bottom-14 top-0 z-[45] bg-black/35 duration-200 ${
          isOpen
            ? 'animate-in fade-in'
            : 'animate-out fade-out [animation-fill-mode:forwards]'
        }`}
        onClick={onClose}
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
            {activeKey ? getLabel(activeKey) : ''}
          </div>
        </div>

        <div className="mx-6 my-2 border-t border-border" />

        <div className="flex items-center justify-center gap-7 px-8 pb-4 pt-3">
          <Button
            variant="outline"
            size="icon"
            className="h-[52px] w-[52px] shrink-0 rounded-2xl bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90"
            onClick={onDecrement}
            disabled={activeCount === 0}>
            <Minus className="h-5 w-5" />
          </Button>

          {editing ? (
            <Input
              type="number"
              min={0}
              max={MAX_QAZA_COUNT}
              value={editValue}
              onChange={onEditChange}
              onBlur={onEditBlur}
              onKeyDown={onEditKeyDown}
              className="min-h-[56px] min-w-[64px] border-2 border-primary bg-primary/10 px-3 text-center text-[36px] font-bold tabular-nums tracking-tight text-primary"
              autoFocus
            />
          ) : (
            <button
              onClick={onStartEdit}
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
            onClick={onIncrement}>
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        <p className="pb-6 text-center text-xs text-muted-foreground/60">
          {manualSetHint}
        </p>
      </div>
    </>
  );
};
