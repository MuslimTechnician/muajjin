/**
 * Translation file structure
 */

export interface TranslationMeta {
  languageName: string;
  languageCode: string;
  direction: 'ltr' | 'rtl';
  version: string;
}

export interface TranslationStrings {
  common: {
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    close: string;
  };
  prayerTimes: {
    title: string;
    current: string;
    next: string;
    prayer: string;
    jamaah: string;
    start: string;
    end: string;
    untilJamaah: string;
    untilEnd: string;
  };
  fasting: {
    title: string;
    sehriEnds: string;
    iftarStarts: string;
    sehriEndsIn: string;
    iftarStartsIn: string;
  };
  prohibited: {
    title: string;
  };
  settings: {
    title: string;
    displayAndLanguage: string;
    translations: string;
    importTranslation: string;
    selectLanguage: string;
    englishDefault: string;
    downloadTemplate: string;
    noTranslations: string;
    importSuccess: string;
    importError: string;
    deleteConfirm: string;
    calculationMethod: string;
    madhab: string;
    asrCalculation: string;
    hijriAdjustment: string;
    sehriAdjustment: string;
    iftarAdjustment: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
  };
  onboarding: {
    welcome: string;
    subtitle: string;
    getStarted: string;
    locationTitle: string;
    locationDescription: string;
    detectLocation: string;
    selectManually: string;
    searching: string;
    locationFound: string;
    customizing: string;
    calculationMethods: string;
    madhabs: string;
    adjustments: string;
    finish: string;
  };
  about: {
    title: string;
    version: string;
    description: string;
    features: {
      accurate: string;
      location: string;
      countdown: string;
      ramadan: string;
      hijri: string;
      theme: string;
      privacy: string;
    };
    philosophy: string;
    philosophyDesc: string;
  };
  prayers: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    sunrise: string;
    sunset: string;
  };
  calculationMethods: {
    muslimWorldLeague: string;
    egyptian: string;
    karachi: string;
    ummAlQura: string;
    dubai: string;
    moonsightingCommittee: string;
    northAmerica: string;
    kuwait: string;
    qatar: string;
    singapore: string;
    tehran: string;
    turkey: string;
    other: string;
  };
  madhabs: {
    shafi: string;
    hanafi: string;
  };
  errors: {
    locationFailed: string;
    locationDenied: string;
    invalidFile: string;
  };
}

export interface TranslationFile {
  meta: TranslationMeta;
  translations: TranslationStrings;
}

export interface StoredTranslation extends TranslationFile {
  id: string;
  importedAt: string;
}

export interface TranslationState {
  activeTranslationId: string | null;
  translations: Record<string, StoredTranslation>;
}
