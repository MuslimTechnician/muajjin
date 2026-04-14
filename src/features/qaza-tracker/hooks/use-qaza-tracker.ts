import { useLocalStorage } from '@/hooks/use-local-storage';
import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, KeyboardEvent } from 'react';

import {
  DRAWER_ANIMATION_MS,
  INITIAL_COUNTS,
  MAX_QAZA_COUNT,
} from '../constants';
import type { QazaCounterKey, QazaCounts } from '../types';

export const useQazaTracker = () => {
  const [counts, setCounts] = useLocalStorage<QazaCounts>(
    'muajjin-qaza-tracker',
    INITIAL_COUNTS,
  );
  const [activeKey, setActiveKey] = useState<QazaCounterKey | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const activeCount = activeKey ? counts[activeKey] : 0;
  const isDrawerOpen = activeKey !== null && !isClosing;
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

  const openCounter = useCallback((key: QazaCounterKey) => {
    setIsClosing(false);
    setActiveKey(key);
    setEditing(false);
    setEditValue('');
  }, []);

  const closeCounter = useCallback(() => {
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

  const incrementCounter = useCallback(() => {
    if (!activeKey) return;
    setCounts((prev) => ({
      ...prev,
      [activeKey]: Math.min(MAX_QAZA_COUNT, prev[activeKey] + 1),
    }));
  }, [activeKey, setCounts]);

  const decrementCounter = useCallback(() => {
    if (!activeKey) return;
    setCounts((prev) => ({
      ...prev,
      [activeKey]: Math.max(0, prev[activeKey] - 1),
    }));
  }, [activeKey, setCounts]);

  const startManualEdit = useCallback(() => {
    if (!activeKey) return;
    setEditValue(String(counts[activeKey]));
    setEditing(true);
  }, [activeKey, counts]);

  const commitManualEdit = useCallback(() => {
    if (!activeKey) return;
    const parsed = Math.min(
      MAX_QAZA_COUNT,
      Math.max(0, parseInt(editValue, 10) || 0),
    );
    setCounts((prev) => ({ ...prev, [activeKey]: parsed }));
    setEditing(false);
    setEditValue('');
  }, [activeKey, editValue, setCounts]);

  const handleEditChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (e.target.value === '' || (val >= 0 && val <= MAX_QAZA_COUNT)) {
      setEditValue(e.target.value);
    }
  }, []);

  const handleEditKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') commitManualEdit();
      if (e.key === 'Escape') setEditing(false);
    },
    [commitManualEdit],
  );

  return {
    counts,
    activeKey,
    activeCount,
    editing,
    editValue,
    isDrawerOpen,
    isDrawerVisible,
    openCounter,
    closeCounter,
    incrementCounter,
    decrementCounter,
    startManualEdit,
    commitManualEdit,
    handleEditChange,
    handleEditKeyDown,
  };
};
