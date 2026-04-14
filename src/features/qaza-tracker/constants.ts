import type { QazaCounterKey, QazaCounts } from './types';

export const COUNTER_KEYS: QazaCounterKey[] = [
  'fajr',
  'dhuhr',
  'asr',
  'maghrib',
  'isha',
  'other',
  'saum',
];

export const INITIAL_COUNTS: QazaCounts = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
  other: 0,
  saum: 0,
};

export const MAX_QAZA_COUNT = 99999;
export const DRAWER_ANIMATION_MS = 300;
