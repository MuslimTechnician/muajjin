
export interface PrayerTime {
  id: string; // Salat ID (e.g., 'fajr', 'dhuhr') - untranslated key for logic
  name: string; // Translated display name (e.g., 'Fajr', 'الفجر')
  start: string;
  end?: string;
  jamaah?: string;
}

export interface UserSettings {
  method: number;
  madhab: number;
  jamaahTimes: {
    Fajr?: string;
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
  start: string;
  end: string;
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
