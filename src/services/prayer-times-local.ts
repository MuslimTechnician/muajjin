import {
  PrayerTimes,
  Coordinates,
  CalculationMethod,
  Madhab as AdhanMadhab,
} from 'adhan';
import { UserSettings } from '@/types';

export interface LocalPrayerTimes {
  Fajr: string;
  Shuruq: string;
  Dhuhr: string;
  Asr: string;
  Ghurub: string;
  Maghrib: string;
  Isha: string;
}

/**
 * Calculate salat times locally using adhan library (no API call needed)
 * @param date - The Gregorian date to calculate salat times for
 * @param settings - User settings including location and calculation method
 * @returns Salat times in 24-hour format ("HH:MM")
 */
export function calculatePrayerTimesLocally(
  date: Date,
  settings: UserSettings,
): LocalPrayerTimes {
  // Get coordinates from settings
  const latitude = settings.latitude || 21.3891; // Default: Makkah
  const longitude = settings.longitude || 39.8579;

  // Create coordinates using adhan Coordinates class
  const coordinates = new Coordinates(latitude, longitude);

  // Get calculation parameters using adhan CalculationMethod
  const params = getCalculationMethod(settings.method);

  // Set madhab using adhan Madhab enum
  // 0 = Shafi'i, Maliki, Hanbali (default)
  // 1 = Hanafi (Asr is later)
  params.madhab =
    settings.madhab === 1 ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;

  // Calculate prayer times using adhan PrayerTimes class
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Format to "HH:MM" strings (24-hour)
  return {
    Fajr: formatTime(prayerTimes.fajr),
    Shuruq: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Ghurub: formatTime(prayerTimes.maghrib), // Ghurub is sunset (same as Maghrib time)
    Maghrib: formatTime(prayerTimes.maghrib),
    Isha: formatTime(prayerTimes.isha),
  };
}

/**
 * Get calculation parameters for the specified method ID
 * Only includes methods supported by the adhan library
 */
function getCalculationMethod(methodId: number) {
  // Type-safe method mapping using adhan CalculationMethod
  const methods: Record<
    number,
    ReturnType<(typeof CalculationMethod)[keyof typeof CalculationMethod]>
  > = {
    1: CalculationMethod.Karachi(),
    2: CalculationMethod.NorthAmerica(),
    3: CalculationMethod.MuslimWorldLeague(),
    4: CalculationMethod.UmmAlQura(),
    5: CalculationMethod.Egyptian(),
    7: CalculationMethod.Tehran(),
    8: CalculationMethod.Dubai(),
    9: CalculationMethod.Kuwait(),
    10: CalculationMethod.Qatar(),
    11: CalculationMethod.Singapore(),
    12: CalculationMethod.MoonsightingCommittee(),
    15: CalculationMethod.MoonsightingCommittee(),
  };

  return methods[methodId] || CalculationMethod.Karachi();
}

/**
 * Format Date object to "HH:MM" string (24-hour format)
 */
function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Calculation methods supported by adhan library
 * Sorted alphabetically A-Z
 * Maps to the IDs used in the app
 */
export const CALCULATION_METHODS = [
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League' },
  { id: 4, name: 'Umm al-Qura, Makkah' },
  { id: 5, name: 'Egyptian General Authority of Survey' },
  { id: 7, name: 'Institute of Geophysics, University of Tehran' },
  { id: 8, name: 'Dubai' },
  { id: 9, name: 'Kuwait' },
  { id: 10, name: 'Qatar' },
  { id: 11, name: 'Majlis Ugama Islam Singapore, Singapore' },
  { id: 12, name: 'Moonsighting Committee Worldwide' },
];

// Map calculation method IDs to translation keys
export const CALCULATION_METHOD_KEYS: Record<number, string> = {
  1: 'calculationMethods.karachi',
  2: 'calculationMethods.northAmerica',
  3: 'calculationMethods.muslimWorldLeague',
  4: 'calculationMethods.ummAlQura',
  5: 'calculationMethods.egyptian',
  7: 'calculationMethods.tehran',
  8: 'calculationMethods.dubai',
  9: 'calculationMethods.kuwait',
  10: 'calculationMethods.qatar',
  11: 'calculationMethods.singapore',
  12: 'calculationMethods.moonsightingCommittee',
};

/**
 * Madhabs (schools of jurisprudence)
 */
export const MADHABS = [
  { id: 0, name: "Shafi'i, Maliki, Hanbali" },
  { id: 1, name: 'Hanafi' },
];
