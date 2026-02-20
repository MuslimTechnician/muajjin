import { UserSettings } from '@/types';

/**
 * Default settings for values NOT set during onboarding
 * These are applied automatically and can be changed later in Settings
 */
export const DEFAULT_SETTINGS: UserSettings = {
  // Salat Times
  jamaahTimes: {}, // No Jama'ah times set by default
  method: 1, // Karachi (will be set in onboarding)
  madhab: 1, // Hanafi (will be set in onboarding)

  // Saum Adjustments
  suhoorAdjustment: 0, // No adjustment
  iftarAdjustment: 0, // No adjustment

  // Hijri Adjustment
  hijriAdjustment: 0, // No day adjustment
  hijriDateChangeAtMaghrib: true, // Default to Maghrib (Islamic tradition)

  // Location
  manualLocation: true, // Always use manual location
  city: 'Makkah', // Fallback (will be set in onboarding)
  country: 'Saudi Arabia', // Fallback (will be set in onboarding)
  latitude: 21.3891, // Makkah fallback (will be set in onboarding)
  longitude: 39.8579, // Makkah fallback (will be set in onboarding)

  // Display
  timeFormat: 'system' // Auto-detect from system settings
};

/**
 * Default settings for onboarding (only location + salat calculation preferences)
 * Users MUST select these values during onboarding
 */
export const ONBOARDING_DEFAULTS = {
  method: 1, // University of Islamic Sciences, Karachi (default - can be changed)
  madhab: null, // User must select
  city: '', // Empty - user must set
  country: 'Bangladesh', // Set by location detection
  latitude: 0, // Empty - user must set
  longitude: 0 // Empty - user must set
};

/**
 * Default container order for home screen
 */
export const DEFAULT_CONTAINER_ORDER = [
  'dateTime',
  'currentSalat',
  'nextSalat',
  'salatTimes',
  'prohibitedTimes',
  'saumTimes'
] // removed 'as const' from array

/**
 * Combined settings for when user skips onboarding (dev/testing only)
 * Includes all required fields with fallback values
 */
export const FALLBACK_SETTINGS: UserSettings = {
  method: 1,
  madhab: 1,
  timeFormat: 'system',
  jamaahTimes: {},
  suhoorAdjustment: 0,
  iftarAdjustment: 0,
  hijriAdjustment: 0,
  hijriDateChangeAtMaghrib: true,
  manualLocation: true,
  city: 'Makkah',
  country: 'Saudi Arabia',
  latitude: 21.3891,
  longitude: 39.8579
};
