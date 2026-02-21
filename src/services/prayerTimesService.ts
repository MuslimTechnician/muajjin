// Re-export calculation methods and madhabs from local service
export {
  CALCULATION_METHOD_KEYS,
  CALCULATION_METHODS,
  MADHABS,
} from './prayerTimesLocal';

// Note: Salat times and Hijri date calculations are done locally
// Salat times: uses adhan library (see prayerTimesLocal.ts)
// Hijri date: uses @umalqura/core library (see hijriUtils.ts)
// Works offline. Internet used only for location detection (GPS/IP) and city names.
