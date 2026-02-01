import { UserSettings } from "@/types";
import {
  Madhab as AdhanMadhab,
  CalculationMethod,
  Coordinates,
  PrayerTimes,
} from "adhan";

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
 * @returns Salat times in 24-hour format (HH:MM)
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

  // Calculate salat times using adhan library
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  // Format times to HH:MM format (24-hour format)
  return {
    Fajr: formatTime(prayerTimes.fajr),
    Shuruq: formatTime(prayerTimes.sunrise),
    Dhuhr: formatTime(prayerTimes.dhuhr),
    Asr: formatTime(prayerTimes.asr),
    Ghurub: formatTime(prayerTimes.maghrib), // Ghurub is same as Maghrib
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
      return CalculationMethod.Dubai();
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
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
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
  { id: 1, name: "Hanafi" },
];
