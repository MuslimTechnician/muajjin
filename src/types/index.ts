
export interface PrayerTime {
  name: string;
  start: string;
  end?: string;
  jamaah?: string;
}

export interface PrayerTimesResponse {
  code: number;
  status: string;
  data: {
    timings: {
      [key: string]: string;
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
    };
    date: {
      readable: string;
      timestamp: string;
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string };
        month: { number: number; en: string };
        year: string;
        designation: { abbreviated: string; expanded: string };
      };
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string; ar: string };
        month: { number: number; en: string; ar: string };
        year: string;
        designation: { abbreviated: string; expanded: string };
        holidays: string[];
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: { [key: string]: number };
      };
      latitudeAdjustmentMethod: string;
      midnightMode: string;
      school: string;
      offset: { [key: string]: number };
    };
  };
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
}

export interface ProhibitedTime {
  name: string;
  time: string;
  description?: string;
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
