import { registerPlugin } from '@capacitor/core';

export type {
  PositionOptions,
  Position,
  Coordinates,
  PermissionStatus,
  PermissionState,
} from './definitions';

export interface NativeGeolocationPlugin {
  getCurrentPosition(options?: PositionOptions): Promise<Position>;
  requestPermissions(): Promise<PermissionStatus>;
}

interface Position {
  coords: Coordinates;
  timestamp: number;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude?: number;
  heading?: number;
  speed?: number;
}

interface PermissionStatus {
  coarseLocation: PermissionState;
  location: PermissionState;
}

type PermissionState =
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

export { NativeGeolocation };
