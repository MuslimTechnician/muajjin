import umalqura from '@umalqura/core';

export interface HijriDateResult {
  day: string;
  month: {
    number: number;
    en: string;
    ar: string;
  };
  year: string;
  date: string; // DD-MM-YYYY format
}

const HIJRI_MONTHS = [
  { en: 'Muharram', ar: 'محرم' },
  { en: 'Safar', ar: 'صفر' },
  { en: 'Rabi al-Awwal', ar: 'ربيع الأول' },
  { en: 'Rabi al-Thani', ar: 'ربيع الثاني' },
  { en: 'Jumada al-Ula', ar: 'جمادى الأولى' },
  { en: 'Jumada al-Akhirah', ar: 'جمادى الآخرة' },
  { en: 'Rajab', ar: 'رجب' },
  { en: "Sha'ban", ar: 'شعبان' },
  { en: 'Ramadan', ar: 'رمضان' },
  { en: 'Shawwal', ar: 'شوال' },
  { en: "Dhu al-Qi'dah", ar: 'ذو القعدة' },
  { en: "Dhu al-Hijjah", ar: 'ذو الحجة' }
];

/**
 * Calculate Hijri date from Gregorian date using Umm al-Qura calendar
 * @param gregorianDate - The Gregorian date to convert
 * @param adjustment - Day adjustment (-3 to +3 days for lunar calendar variations)
 * @returns HijriDateResult with day, month, year, and formatted date
 */
export function calculateHijriDate(gregorianDate: Date, adjustment: number = 0): HijriDateResult {
  // Apply day adjustment
  const adjustedDate = new Date(gregorianDate);
  adjustedDate.setDate(adjustedDate.getDate() + adjustment);

  // Calculate Hijri date using Umm al-Qura calendar
  const hijri = umalqura(adjustedDate);

  const monthIndex = hijri.hm - 1; // Convert to 0-based index (hm is Hijri month)

  return {
    day: String(hijri.hd).padStart(2, '0'),
    month: {
      number: hijri.hm,
      en: HIJRI_MONTHS[monthIndex].en,
      ar: HIJRI_MONTHS[monthIndex].ar
    },
    year: String(hijri.hy),
    date: `${String(hijri.hd).padStart(2, '0')}-${String(hijri.hm).padStart(2, '0')}-${hijri.hy}`
  };
}

/**
 * Format Hijri date for display
 * @param hijriData - The Hijri date result
 * @returns Formatted string like "27 Rajab 1447"
 */
export function formatHijriDateLocal(hijriData: HijriDateResult | null): string {
  if (!hijriData) {
    return 'Loading Hijri date...';
  }

  return `${hijriData.day} ${hijriData.month.en} ${hijriData.year}`;
}

/**
 * Format Hijri date in Arabic
 * @param hijriData - The Hijri date result
 * @returns Formatted Arabic string
 */
export function formatHijriDateArabic(hijriData: HijriDateResult): string {
  return `${hijriData.day} ${hijriData.month.ar} ${hijriData.year} هـ`;
}
