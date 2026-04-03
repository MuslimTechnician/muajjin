import {
  HeadingResult,
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

  async getCurrentHeading(): Promise<HeadingResult> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) {
        reject(new Error('Compass heading is not supported on this device'));
        return;
      }

      const handleOrientation = (event: Event) => {
        const orientationEvent = event as DeviceOrientationEvent & {
          webkitCompassHeading?: number;
        };

        if (typeof orientationEvent.webkitCompassHeading === 'number') {
          cleanup();
          resolve({ heading: orientationEvent.webkitCompassHeading });
          return;
        }

        if (
          typeof orientationEvent.alpha === 'number' &&
          orientationEvent.absolute
        ) {
          cleanup();
          resolve({ heading: (360 - orientationEvent.alpha + 360) % 360 });
        }
      };

      const timeoutId = window.setTimeout(() => {
        cleanup();
        reject(new Error('Compass heading is unavailable'));
      }, 3000);

      const cleanup = () => {
        window.clearTimeout(timeoutId);
        window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
        window.removeEventListener('deviceorientation', handleOrientation, true);
      };

      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
      window.addEventListener('deviceorientation', handleOrientation, true);
    });
  }
}
