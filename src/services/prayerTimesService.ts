
import { PrayerTimesResponse, UserSettings } from '@/types';

const API_BASE_URL = 'https://api.aladhan.com/v1';

export async function fetchPrayerTimes(date: Date, settings: UserSettings): Promise<PrayerTimesResponse> {
  const dateStr = formatDate(date);
  
  let url: string;
  
  if (settings.manualLocation && settings.latitude && settings.longitude) {
    // Use coordinates if manual location is enabled and coordinates are provided
    url = `${API_BASE_URL}/timings/${dateStr}?latitude=${settings.latitude}&longitude=${settings.longitude}&method=${settings.method}&school=${settings.madhab}`;
  } else if (settings.city && settings.country) {
    // Use city/country as the default way to get prayer times
    url = `${API_BASE_URL}/timingsByCity/${dateStr}?city=${settings.city}&country=${settings.country}&method=${settings.method}&school=${settings.madhab}`;
  } else {
    // Fallback to default location if nothing else is available
    url = `${API_BASE_URL}/timingsByCity/${dateStr}?city=Dhaka&country=Bangladesh&method=${settings.method}&school=${settings.madhab}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch prayer times');
  }
  
  return response.json();
}

export async function fetchHijriDate(date: Date, adjustment: number): Promise<any> {
  const dateStr = formatDate(date);
  const url = `${API_BASE_URL}/gToH/${dateStr}?adjustment=${adjustment}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch Hijri date');
  }
  
  return response.json();
}

function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}

export const CALCULATION_METHODS = [
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 2, name: "Islamic Society of North America (ISNA)" },
  { id: 3, name: "Muslim World League" },
  { id: 4, name: "Umm al-Qura, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 7, name: "Institute of Geophysics, University of Tehran" },
  { id: 8, name: "Gulf Region" },
  { id: 9, name: "Kuwait" },
  { id: 10, name: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapore, Singapore" },
  { id: 12, name: "Union Organization islamic de France" },
  { id: 13, name: "Diyanet İşleri Başkanlığı, Turkey" },
  { id: 14, name: "Spiritual Administration of Muslims of Russia" },
  { id: 15, name: "Moonsighting Committee Worldwide (also requires shafaq parameter)" }
];

export const MADHABS = [
  { id: 0, name: "Shafi'i, Maliki, Hanbali" },
  { id: 1, name: "Hanafi" }
];
