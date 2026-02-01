/**
 * Location Detection Service
 * Provides automatic location detection using GPS and IP-based methods
 */

import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface LocationResult {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  method: 'gps' | 'ip' | 'manual';
}

export interface LocationError {
  message: string;
  code?: number;
  type: 'gps' | 'ip' | 'geocoding' | 'unknown';
}

/**
 * Get location using GPS (Capacitor Geolocation or browser navigator.geolocation)
 * @returns Promise<LocationResult>
 */
async function getLocationByGPS(): Promise<Omit<LocationResult, 'method'>> {
  try {
    // Check if running in native Capacitor app
    const isNative = Capacitor.isNativePlatform();

    if (isNative) {
      // Use Capacitor Geolocation for native apps
      // Request permissions first
      const permissionResult = await Geolocation.requestPermissions();

      if (permissionResult.location === 'denied' || permissionResult.coarseLocation === 'denied') {
        throw {
          message: 'Location permission denied. Please enable location access in app settings.',
          type: 'gps',
          code: 1
        } as LocationError;
      }

      // Get current position
      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      const { latitude, longitude } = position.coords;

      try {
        // Reverse geocode to get city and country
        const address = await reverseGeocode(latitude, longitude);
        return {
          latitude,
          longitude,
          city: address.city || 'Unknown',
          country: address.country || 'Unknown'
        };
      } catch (geocodingError) {
        // If geocoding fails, still return coordinates
        return {
          latitude,
          longitude,
          city: 'Unknown',
          country: 'Unknown'
        };
      }
    } else {
      // Use browser Geolocation for web
      return await getLocationByBrowser();
    }
  } catch (error: any) {
    // If Capacitor geolocation fails, try browser as fallback

    if (!Capacitor.isNativePlatform()) {
      throw error;
    }

    // Try browser geolocation as fallback
    try {
      return await getLocationByBrowser();
    } catch (browserError) {
      throw {
        message: error.message || 'Unable to retrieve location',
        code: error.code,
        type: 'gps'
      } as LocationError;
    }
  }
}

/**
 * Fallback to browser geolocation for web or when Capacitor fails
 */
async function getLocationByBrowser(): Promise<Omit<LocationResult, 'method'>> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        message: 'Geolocation is not supported by your browser',
        type: 'gps'
      } as LocationError);
      return;
    }

    // Options for GPS detection
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse geocode to get city and country
          const address = await reverseGeocode(latitude, longitude);
          resolve({
            latitude,
            longitude,
            city: address.city || 'Unknown',
            country: address.country || 'Unknown'
          });
        } catch (geocodingError) {
          // If geocoding fails, still return coordinates
          resolve({
            latitude,
            longitude,
            city: 'Unknown',
            country: 'Unknown'
          });
        }
      },
      (error) => {
        let errorMessage = 'Unable to retrieve location';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }

        reject({
          message: errorMessage,
          code: error.code,
          type: 'gps'
        } as LocationError);
      },
      options
    );
  });
}

/**
 * Get location using IP-based geolocation (fallback)
 * Fallback order: ip-api.com (higher limit) → ipwhois.app (HTTPS/CORS-friendly)
 * @returns Promise<LocationResult>
 */
async function getLocationByIP(): Promise<Omit<LocationResult, 'method'>> {
  try {
    // Try ip-api.com first (higher rate limit, but HTTP only)
    const response = await fetch('http://ip-api.com/json/?fields=status,message,country,countryCode,city,lat,lon');

    if (!response.ok) {
      throw new Error(`IP API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'success') {
      throw new Error(data.message || 'IP geolocation failed');
    }

    return {
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      city: data.city || 'Unknown',
      country: data.country || 'Unknown'
    };
  } catch (ipApiError) {
    try {
      // Fallback to ipwhois.app (HTTPS, CORS-friendly for GitHub Pages)
      const response = await fetch('https://ipwhois.app/json/');

      if (!response.ok) {
        throw new Error(`IP API fallback returned ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('IP geolocation fallback failed');
      }

      return {
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
        city: data.city || 'Unknown',
        country: data.country || 'Unknown'
      };
    } catch (fallbackError) {
      throw {
        message: 'All IP geolocation methods failed. Please enter location manually.',
        type: 'ip'
      } as LocationError;
    }
  }
}

/**
 * Reverse geocode coordinates to get city and country names
 * Uses OpenStreetMap Nominatim API (free, no API key required)
 * Rate limit: 1 request per second
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<{ city: string; country: string }>
 */
async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{ city: string; country: string }> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`,
      {
        headers: {
          'User-Agent': 'Muajjin-Prayer-Times-App' // Required by Nominatim policy
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Nominatim API returned ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    // Extract city and country from address
    const address = data.address || {};
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.suburb ||
      address.county ||
      '';
    const country = address.country || '';

    return {
      city,
      country
    };
  } catch (error) {
    throw {
      message: 'Failed to get location name from coordinates.',
      type: 'geocoding'
    } as LocationError;
  }
}

/**
 * Detect location automatically with GPS and IP fallback
 * Primary: GPS (high accuracy)
 * Fallback: IP-based location (WiFi/Mobile internet)
 * @returns Promise<LocationResult>
 */
export async function detectLocation(): Promise<LocationResult> {
  try {
    // Try GPS first (high accuracy, 15 second timeout)
    const gpsLocation = await getLocationByGPS();

    return {
      ...gpsLocation,
      method: 'gps'
    };
  } catch (gpsError) {
    const error = gpsError as LocationError;

    try {
      // Fallback to IP-based location
      const ipLocation = await getLocationByIP();

      return {
        ...ipLocation,
        method: 'ip'
      };
    } catch (ipError) {
      // Both methods failed
      throw new Error(
        'Could not detect location automatically. Please enable GPS or check your internet connection, then try again. You can also enter your location manually.'
      );
    }
  }
}

/**
 * Reverse geocode coordinates to get location name
 * Can be called independently if you already have coordinates
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @returns Promise<{ city: string; country: string }>
 */
export async function getLocationName(
  latitude: number,
  longitude: number
): Promise<{ city: string; country: string }> {
  return reverseGeocode(latitude, longitude);
}
