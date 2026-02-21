import {
  NativeGeolocationPlugin,
  Position,
  PositionOptions,
  PermissionStatus,
} from './definitions';

export class NativeGeolocationWeb implements NativeGeolocationPlugin {
  async getCurrentPosition(options?: PositionOptions): Promise<Position> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      const geoOptions: PositionOptions = {
        enableHighAccuracy: options?.enableHighAccuracy ?? true,
        timeout: options?.timeout ?? 15000,
        maximumAge: options?.maximumAge ?? 0,
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude ?? undefined,
              heading: position.coords.heading ?? undefined,
              speed: position.coords.speed ?? undefined,
            },
            timestamp: position.timestamp,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        geoOptions,
      );
    });
  }

  async requestPermissions(): Promise<PermissionStatus> {
    // Web doesn't have explicit permission requests - it's handled by the browser
    return {
      location: 'prompt',
      coarseLocation: 'prompt',
    };
  }
}
