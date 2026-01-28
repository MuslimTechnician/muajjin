
export interface PrayerTime {
  name: string;
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
  sehriAdjustment: number;
  iftarAdjustment: number;
  hijriAdjustment: number;
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
  prayerTimesContainer: number;
  prohibitedTimesContainer: number;
  fastingTimesContainer: number;
};
