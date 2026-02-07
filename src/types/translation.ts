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
  salatTimes: {
    title: string;
    current: string;
    next: string;
    salat: string;
    jamaah: string;
    start: string;
    end: string;
    untilJamaah: string;
    untilEnd: string;
    remainingToTarget?: string;
  };
  saum: {
    title: string;
    suhoorEnds: string;
    iftarStarts: string;
    suhoorEndsIn: string;
    iftarStartsIn: string;
  };
  prohibited: {
    title: string;
    shuruq: string;
    ghurub: string;
    zawal: string;
    description: string;
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
    hijriDateChangeAtMaghrib: string;
    suhoorAdjustment: string;
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
  salats: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    shuruq: string;
    ghurub: string;
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
  update: {
    availableTitle: string;
    availableDescription: string;
    download: string;
    ignore: string;
    upToDateTitle: string;
    upToDateDescription: string;
    offlineTitle: string;
    offlineDescription: string;
    checkFailedTitle: string;
    checkFailedDescription: string;
  };
  aboutPage: {
    title: string;
    appName: string;
    tagline: string;
    checkForUpdate: string;
    features: {
      salatTimes: string;
      salatTimesDesc: string;
      hijriCalendar: string;
      hijriCalendarDesc: string;
      location: string;
      locationDesc: string;
      saum: string;
      saumDesc: string;
    };
    calculationMethods: string;
    calculationMethodsDesc: string;
    builtWith: string;
    builtWithDesc: string;
    madeWithLove: string;
    credits: string;
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
