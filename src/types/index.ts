export interface PrayerTime {
  id: string; // Salat ID (e.g., 'fajr', 'dhuhr') - untranslated key for logic
  name: string; // Translated display name (e.g., 'Fajr', 'الفجر')
  start: string; // "HH:MM" in 24h format (use formatTime() for display)
  end?: string; // "HH:MM" in 24h format
  jamaah?: string; // "HH:MM" in 24h format (user optional)
}

export interface UserSettings {
  method: number;
  madhab: number;
  jamaahTimes: {
    Fajr?: string; // Stored as string "HH:MM" for user input
    Dhuhr?: string;
    Asr?: string;
    Maghrib?: string;
    Isha?: string;
  };
  suhoorAdjustment: number;
  iftarAdjustment: number;
  hijriAdjustment: number;
  hijriDateChangeAtMaghrib: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  country?: string;
  manualLocation: boolean;
  timeFormat: 'system' | '12h' | '24h';
}

export interface ProhibitedTime {
  name: string;
  start: string; // "HH:MM" in 24h format
  end: string; // "HH:MM" in 24h format
}

export type CalculationMethod = {
  id: number;
  name: string;
};

export type Madhab = {
  id: number;
  name: string;
};

export type ContainerOrder = {
  dateTimeContainer: number;
  salatTimesContainer: number;
  prohibitedTimesContainer: number;
  saumTimesContainer: number;
};
