import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab as AdhanMadhab
} from 'adhan';
import { UserSettings } from '@/types';

export interface LocalPrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
}

/**
 * Calculate prayer times locally using adhan library (no API call needed)
 * @param date - The Gregorian date to calculate prayer times for
 * @param settings - User settings including location and calculation method
 * @returns Prayer times in 24-hour format (HH:MM)
 */
export function calculatePrayerTimesLocally(
  date: Date,
  settings: UserSettings
): LocalPrayerTimes {
  // Get coordinates from settings
  const latitude = settings.latitude || 23.81; // Default: Dhaka
  const longitude = settings.longitude || 90.41;
  const coordinates = new Coordinates(latitude, longitude);

  // Get calculation parameters based on method ID
  const params = getCalculationParameters(settings.method);

  // Set madhab (school of jurisprudence)
  // 0 = Shafi'i, Maliki, Hanbali (default)
  // 1 = Hanafi (Asr is later)
  params.madhab = settings.madhab === 1 ? AdhanMadhab.Hanafi : AdhanMadhab.Shafi;

  // Calculate prayer times using adhan library
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Format times to HH:MM format (24-hour format)
  return {
    Fajr: formatTime(prayerTimes.fajr),
    Sunrise: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Sunset: formatTime(prayerTimes.maghrib), // Sunset is same as Maghrib
    Maghrib: formatTime(prayerTimes.maghrib),
    Isha: formatTime(prayerTimes.isha),
  };
}

/**
 * Get calculation parameters for the specified method ID
 * Only includes methods supported by the adhan library
 */
function getCalculationParameters(methodId: number) {
  switch (methodId) {
    case 1:
      return CalculationMethod.Karachi();
    case 2:
      return CalculationMethod.NorthAmerica();
    case 3:
      return CalculationMethod.MuslimWorldLeague();
    case 4:
      return CalculationMethod.UmmAlQura();
    case 5:
      return CalculationMethod.Egyptian();
    case 7:
      return CalculationMethod.Tehran();
    case 8:
      return CalculationMethod.GulfRegion();
    case 9:
      return CalculationMethod.Kuwait();
    case 10:
      return CalculationMethod.Qatar();
    case 11:
      return CalculationMethod.Singapore();
    case 12:
    case 15:
      return CalculationMethod.MoonsightingCommittee();
    default:
      return CalculationMethod.Karachi();
  }
}

/**
 * Format Date object to HH:MM string (24-hour format)
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
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 8, name: "Gulf Region" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 9, name: "Kuwait" },
  { id: 11, name: "Majlis Ugama Islam Singapore, Singapore" },
  { id: 3, name: "Muslim World League" },
  { id: 12, name: "Moonsighting Committee Worldwide" },
  { id: 10, name: "Qatar" },
  { id: 4, name: "Umm al-Qura, Makkah" },
  { id: 1, name: "University of Islamic Sciences, Karachi" }
];

// Map calculation method IDs to translation keys
export const CALCULATION_METHOD_KEYS: Record<number, string> = {
  5: 'calculationMethods.egyptian',
  8: 'calculationMethods.other',
  7: 'calculationMethods.tehran',
  2: 'calculationMethods.northAmerica',
  9: 'calculationMethods.kuwait',
  11: 'calculationMethods.singapore',
  3: 'calculationMethods.muslimWorldLeague',
  12: 'calculationMethods.moonsightingCommittee',
  10: 'calculationMethods.qatar',
  4: 'calculationMethods.ummAlQura',
  1: 'calculationMethods.karachi'
};

/**
 * Madhabs (schools of jurisprudence)
 */
export const MADHABS = [
  { id: 0, name: "Shafi'i, Maliki, Hanbali" },
  { id: 1, name: "Hanafi" }
];
