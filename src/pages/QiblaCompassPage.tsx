import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { useApp } from '@/contexts/AppContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { NativeGeolocation } from '@/plugins/native-geolocation';
import { Capacitor } from '@capacitor/core';
import { Coordinates, Qibla } from 'adhan';
import {
  Compass,
  LocateFixed,
  MapPin,
  Navigation,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const KAABA_LATITUDE = 21.4225241;
const KAABA_LONGITUDE = 39.8261818;

type OrientationPermissionState =
  | 'idle'
  | 'request-required'
  | 'granted'
  | 'denied'
  | 'unsupported';

interface DeviceOrientationEventWithCompass extends DeviceOrientationEvent {
  webkitCompassHeading?: number;
}

interface DeviceOrientationEventConstructorWithPermission {
  requestPermission?: () => Promise<'granted' | 'denied'>;
}

function normalizeDegrees(degrees: number) {
  return ((degrees % 360) + 360) % 360;
}

function normalizeSignedDegrees(degrees: number) {
  const normalized = normalizeDegrees(degrees);
  return normalized > 180 ? normalized - 360 : normalized;
}

function getContinuousAngle(nextAngle: number, previousAngle: number) {
  return previousAngle + normalizeSignedDegrees(nextAngle - previousAngle);
}

function hasValidCoordinates(latitude?: number, longitude?: number) {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
}

function toRadians(degrees: number) {
  return (degrees * Math.PI) / 180;
}

function calculateDistanceToKaaba(latitude: number, longitude: number) {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(KAABA_LATITUDE - latitude);
  const deltaLon = toRadians(KAABA_LONGITUDE - longitude);
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(KAABA_LATITUDE);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function formatDistance(distanceKm: number) {
  return distanceKm >= 1000
    ? `${distanceKm.toFixed(0)} km`
    : `${distanceKm.toFixed(1)} km`;
}

function getTurnInstruction(
  delta: number,
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  const absoluteDelta = Math.abs(delta);

  if (absoluteDelta < 5) {
    return t('qibla.aligned');
  }

  if (absoluteDelta > 175) {
    return t('qibla.turnAround');
  }

  return delta > 0
    ? t('qibla.turnRight', { degrees: Math.round(absoluteDelta) })
    : t('qibla.turnLeft', { degrees: Math.round(absoluteDelta) });
}

export default function QiblaCompassPage() {
  const { t } = useTranslation();
  const { settings } = useApp();
  const [heading, setHeading] = useState<number | null>(null);
  const [displayDialRotation, setDisplayDialRotation] = useState(0);
  const [permissionState, setPermissionState] =
    useState<OrientationPermissionState>('idle');

  const coordinates = useMemo(() => {
    if (!hasValidCoordinates(settings.latitude, settings.longitude)) {
      return null;
    }

    return {
      latitude: settings.latitude as number,
      longitude: settings.longitude as number,
    };
  }, [settings.latitude, settings.longitude]);

  const qiblaBearing = useMemo(() => {
    if (!coordinates) {
      return null;
    }

    return Qibla(new Coordinates(coordinates.latitude, coordinates.longitude));
  }, [coordinates]);

  const distanceToKaaba = useMemo(() => {
    if (!coordinates) {
      return null;
    }

    return calculateDistanceToKaaba(
      coordinates.latitude,
      coordinates.longitude,
    );
  }, [coordinates]);

  const directionDelta = useMemo(() => {
    if (heading === null || qiblaBearing === null) {
      return null;
    }

    return normalizeSignedDegrees(qiblaBearing - heading);
  }, [heading, qiblaBearing]);

  useEffect(() => {
    if (heading === null) {
      return;
    }

    setDisplayDialRotation((previousRotation) =>
      getContinuousAngle(-heading, previousRotation),
    );
  }, [heading]);

  const dialRotation = displayDialRotation;
  const qiblaMarkerRotation = (qiblaBearing ?? 0) + dialRotation;

  const subscribeToOrientation = useCallback(() => {
    if (typeof window === 'undefined') {
      setPermissionState('unsupported');
      return () => undefined;
    }

    const updateHeading = (event: Event) => {
      const orientationEvent = event as DeviceOrientationEventWithCompass;

      if (typeof orientationEvent.webkitCompassHeading === 'number') {
        setHeading(normalizeDegrees(orientationEvent.webkitCompassHeading));
        return;
      }

      if (
        typeof orientationEvent.alpha === 'number' &&
        orientationEvent.absolute
      ) {
        setHeading(normalizeDegrees(360 - orientationEvent.alpha));
      }
    };

    window.addEventListener('deviceorientationabsolute', updateHeading, true);
    window.addEventListener('deviceorientation', updateHeading, true);
    setPermissionState('granted');

    return () => {
      window.removeEventListener(
        'deviceorientationabsolute',
        updateHeading,
        true,
      );
      window.removeEventListener('deviceorientation', updateHeading, true);
    };
  }, []);

  const startBrowserOrientationFallback = useCallback(() => {
    if (
      typeof window === 'undefined' ||
      !('DeviceOrientationEvent' in window)
    ) {
      setPermissionState('unsupported');
      return () => undefined;
    }

    const orientationConstructor =
      DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission;

    if (typeof orientationConstructor.requestPermission === 'function') {
      setPermissionState('request-required');
      return () => undefined;
    }

    return subscribeToOrientation();
  }, [subscribeToOrientation]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let intervalId: number | null = null;
    let cancelled = false;
    let polling = false;
    let nativeFailureCount = 0;
    let cleanupFallback: (() => void) | null = null;

    const pollHeading = async () => {
      if (polling || cancelled) {
        return;
      }

      polling = true;

      try {
        const result = await NativeGeolocation.getCurrentHeading();
        if (!cancelled) {
          nativeFailureCount = 0;
          setHeading(normalizeDegrees(result.heading));
          setPermissionState('granted');
        }
      } catch (error) {
        if (!cancelled) {
          nativeFailureCount += 1;

          if (nativeFailureCount >= 3 && cleanupFallback === null) {
            cleanupFallback = startBrowserOrientationFallback();
          }
        }
      } finally {
        polling = false;
      }
    };

    pollHeading();
    intervalId = window.setInterval(pollHeading, 700);

    return () => {
      cancelled = true;
      if (cleanupFallback) {
        cleanupFallback();
      }
      if (intervalId !== null) {
        window.clearInterval(intervalId);
      }
    };
  }, [startBrowserOrientationFallback]);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      return;
    }

    if (
      typeof window === 'undefined' ||
      !('DeviceOrientationEvent' in window)
    ) {
      setPermissionState('unsupported');
      return;
    }

    const orientationConstructor =
      DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission;

    if (typeof orientationConstructor.requestPermission === 'function') {
      setPermissionState('request-required');
      return;
    }

    return subscribeToOrientation();
  }, [subscribeToOrientation]);

  const requestOrientationPermission = useCallback(async () => {
    try {
      const orientationConstructor =
        DeviceOrientationEvent as unknown as DeviceOrientationEventConstructorWithPermission;
      const result = await orientationConstructor.requestPermission?.();

      if (result !== 'granted') {
        setPermissionState('denied');
        return;
      }

      subscribeToOrientation();
    } catch (error) {
      setPermissionState('denied');
    }
  }, [subscribeToOrientation]);

  const locationLabel = [settings.city, settings.country]
    .filter(Boolean)
    .join(', ');

  const turnInstruction =
    directionDelta === null ? null : getTurnInstruction(directionDelta, t);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="mx-auto max-w-md space-y-6 px-5 py-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {t('qibla.title')}
        </h1>

        <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card">
          <CardContent className="space-y-6 p-6">
            <div className="space-y-2 text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Compass className="h-3.5 w-3.5" />
                {t('qibla.badge')}
              </div>
              {/* <CardTitle className="text-2xl">{t('qibla.title')}</CardTitle> */}
              <CardDescription>{t('qibla.description')}</CardDescription>
            </div>

            <div className="flex justify-center">
              <div className="relative h-72 w-72 rounded-full border border-border bg-card shadow-sm">
                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{
                    transform: `rotate(${dialRotation}deg)`,
                  }}>
                  <div className="absolute inset-3 rounded-full border border-dashed border-primary/20" />
                  <div className="absolute inset-7 rounded-full border border-border/70" />
                  <div className="absolute left-1/2 top-3 -translate-x-1/2 text-xs font-semibold tracking-[0.3em] text-red-500">
                    {t('qibla.north')}
                  </div>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-semibold tracking-[0.3em] text-muted-foreground">
                    {t('qibla.south')}
                  </div>
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.3em] text-muted-foreground">
                    {t('qibla.west')}
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold tracking-[0.3em] text-muted-foreground">
                    {t('qibla.east')}
                  </div>
                </div>

                <div
                  className="absolute inset-0 transition-transform duration-300 ease-out"
                  style={{
                    transform: `rotate(${qiblaMarkerRotation}deg)`,
                  }}>
                  <div className="absolute left-1/2 top-8 h-24 w-1 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_20px_rgba(0,0,0,0.12)]" />
                  <div className="absolute left-1/2 top-4 h-0 w-0 -translate-x-1/2 border-x-[14px] border-b-[22px] border-x-transparent border-b-primary" />
                </div>

                <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-primary/15 bg-background text-primary shadow-sm">
                  <Navigation className="h-6 w-6" />
                </div>
              </div>
            </div>

            <div className="space-y-2 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                {heading === null
                  ? t('qibla.staticBearingLabel')
                  : t('qibla.liveGuidanceLabel')}
              </p>
              <p className="text-3xl font-bold tracking-tight">
                {turnInstruction ??
                  t('qibla.bearingOnly', {
                    degrees: Math.round(qiblaBearing ?? 0),
                  })}
              </p>
              <p className="text-sm text-muted-foreground">
                {permissionState === 'granted' && heading === null
                  ? t('qibla.sensorWaiting')
                  : t('qibla.calibrationHint')}
              </p>
            </div>

            {permissionState === 'request-required' ? (
              <Button onClick={requestOrientationPermission} className="w-full">
                <Compass className="h-4 w-4" />
                {t('qibla.enableCompass')}
              </Button>
            ) : null}

            {permissionState === 'denied' ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {t('qibla.permissionDenied')}
              </p>
            ) : null}

            {permissionState === 'unsupported' ? (
              <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                {t('qibla.sensorUnsupported')}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Card className="flex-1">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Navigation className="h-4 w-4" />
                <span className="text-sm">{t('qibla.qiblaBearing')}</span>
              </div>
              <p className="text-2xl font-semibold">
                {qiblaBearing === null ? '--' : `${Math.round(qiblaBearing)}°`}
              </p>
            </CardContent>
          </Card>

          <Card className="flex-1">
            <CardContent className="space-y-2 p-5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <LocateFixed className="h-4 w-4" />
                <span className="text-sm">{t('qibla.distance')}</span>
              </div>
              <p className="text-2xl font-semibold">
                {distanceToKaaba === null
                  ? '--'
                  : formatDistance(distanceToKaaba)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {t('qibla.yourLocation')}
              </div>
              <p className="font-medium">
                {locationLabel || t('qibla.locationUnavailable')}
              </p>
              <p className="text-sm text-muted-foreground">
                {coordinates
                  ? `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`
                  : t('qibla.locationHelp')}
              </p>
            </div>

            {!coordinates ? (
              <Button asChild variant="secondary" className="w-full">
                <Link to="/settings/time-location">
                  {t('qibla.openLocationSettings')}
                </Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </div>
  );
}
