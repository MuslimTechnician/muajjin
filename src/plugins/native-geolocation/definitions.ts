import { registerPlugin } from '@capacitor/core';

export interface NativeGeolocationPlugin {
  /**
   * Get the current device location
   * @param options - Location options including enableHighAccuracy, timeout, and maximumAge
   * @returns Promise with position data
   */
  getCurrentPosition(options?: PositionOptions): Promise<Position>;

  /**
   * Request location permissions
   */
  requestPermissions(): Promise<PermissionStatus>;
}

export interface PositionOptions {
  /**
   * Enable high accuracy mode (GPS)
   * @default true
   */
  enableHighAccuracy?: boolean;

  /**
   * Maximum time to wait for location in milliseconds
   * @default 15000
   */
  timeout?: number;

  /**
   * Maximum age of cached location in milliseconds
   * @default 0
   */
  maximumAge?: number;
}

export interface Position {
  /**
   * Position coordinates
   */
  coords: Coordinates;

  /**
   * Timestamp of the position
   */
  timestamp: number;
}

export interface Coordinates {
  /**
   * Latitude in decimal degrees
   */
  latitude: number;

  /**
   * Longitude in decimal degrees
   */
  longitude: number;

  /**
   * Accuracy level in meters
   */
  accuracy: number;

  /**
   * Altitude in meters (if available)
   */
  altitude?: number;

  /**
   * Heading in degrees (if available)
   */
  heading?: number;

  /**
   * Speed in meters per second (if available)
   */
  speed?: number;
}

export interface PermissionStatus {
  /**
   * Coarse location permission state
   */
  coarseLocation: PermissionState;

  /**
   * Fine location permission state
   */
  location: PermissionState;
}

export type PermissionState =
  | 'granted'
  | 'denied'
  | 'prompt'
  | 'prompt-with-rationale';

const NativeGeolocation = registerPlugin<NativeGeolocationPlugin>(
  'NativeGeolocation',
  {
    web: () => import('./web').then((m) => new m.NativeGeolocationWeb()),
  },
);

export * from './definitions';
export { NativeGeolocation };
