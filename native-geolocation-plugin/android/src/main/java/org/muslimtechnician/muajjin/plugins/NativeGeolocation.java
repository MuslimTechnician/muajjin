package org.muslimtechnician.muajjin.plugins;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.hardware.GeomagneticField;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.view.Surface;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PermissionCallback;
import com.getcapacitor.annotation.Permission;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(
    name = "NativeGeolocation",
    permissions = {
        @Permission(strings = { Manifest.permission.ACCESS_FINE_LOCATION }, alias = "location"),
        @Permission(strings = { Manifest.permission.ACCESS_COARSE_LOCATION }, alias = "coarseLocation")
    }
)
public class NativeGeolocation extends Plugin {

    private static final String TAG = "NativeGeolocation";
    private LocationManager locationManager;
    private SensorManager sensorManager;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void load() {
        locationManager = (LocationManager) getContext().getSystemService(getContext().LOCATION_SERVICE);
        sensorManager = (SensorManager) getContext().getSystemService(getContext().SENSOR_SERVICE);
    }

    @PluginMethod
    public void getCurrentPosition(PluginCall call) {
        if (!hasRequiredPermissions()) {
            requestAllPermissions(call, "locationPermsCallback");
            return;
        }

        boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", true);
        long timeout = call.getLong("timeout", 15000L);
        long maximumAge = call.getLong("maximumAge", 0L);

        getCurrentPositionInternal(call, enableHighAccuracy, timeout, maximumAge);
    }

    @PermissionCallback
    private void locationPermsCallback(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("User denied location permission");
            return;
        }
        boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", true);
        long timeout = call.getLong("timeout", 15000L);
        long maximumAge = call.getLong("maximumAge", 0L);
        getCurrentPositionInternal(call, enableHighAccuracy, timeout, maximumAge);
    }

    private void getCurrentPositionInternal(PluginCall call, boolean enableHighAccuracy, long timeout, long maximumAge) {
        try {
            // Check if location is enabled
            if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) &&
                !locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                call.reject("Location services are disabled");
                return;
            }

            // Get best available location from cache
            Location bestLocation = null;
            long minTimeThreshold = maximumAge <= 0
                ? Long.MAX_VALUE
                : System.currentTimeMillis() - maximumAge;

            try {
                Location gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);

                if (gpsLocation != null && gpsLocation.getTime() >= minTimeThreshold) {
                    bestLocation = gpsLocation;
                }
                if (networkLocation != null) {
                    boolean networkLocationIsFresh = networkLocation.getTime() >= minTimeThreshold;
                    if (networkLocationIsFresh &&
                        (bestLocation == null || networkLocation.getTime() > bestLocation.getTime())) {
                        bestLocation = networkLocation;
                    }
                }
            } catch (SecurityException e) {
                call.reject("Security exception: " + e.getMessage());
                return;
            }

            if (bestLocation != null) {
                // We have a recent cached location
                call.resolve(createPositionResult(bestLocation));
                return;
            }

            // No recent cached location, request a fresh one
            final PluginCall pendingCall = call;
            bridge.saveCall(call);
            final Handler handler = new Handler(Looper.getMainLooper());
            final boolean[] resolved = { false };
            final Location[] bestFreshLocation = { null };
            final float desiredAccuracyMeters = enableHighAccuracy ? 25f : 100f;

            LocationListener locationListener = new LocationListener() {
                @Override
                public void onLocationChanged(Location location) {
                    try {
                        if (resolved[0]) {
                            return;
                        }

                        if (
                            bestFreshLocation[0] == null ||
                            location.getAccuracy() < bestFreshLocation[0].getAccuracy() ||
                            (
                                location.getAccuracy() == bestFreshLocation[0].getAccuracy() &&
                                location.getTime() > bestFreshLocation[0].getTime()
                            )
                        ) {
                            bestFreshLocation[0] = location;
                        }

                        boolean isGoodEnough = location.hasAccuracy() && location.getAccuracy() <= desiredAccuracyMeters;
                        boolean isGpsFix = LocationManager.GPS_PROVIDER.equals(location.getProvider());

                        if (isGoodEnough || (enableHighAccuracy && isGpsFix && location.hasAccuracy() && location.getAccuracy() <= 50f)) {
                            resolved[0] = true;
                            handler.removeCallbacksAndMessages(null);
                            locationManager.removeUpdates(this);
                            PluginCall savedCall = bridge.getSavedCall(pendingCall.getCallbackId());
                            if (savedCall != null) {
                                savedCall.resolve(createPositionResult(bestFreshLocation[0]));
                                bridge.releaseCall(savedCall);
                            }
                        }
                    } catch (Exception e) {
                        // Already resolved or rejected
                    }
                }

                @Override
                public void onStatusChanged(String provider, int status, Bundle extras) {}

                @Override
                public void onProviderEnabled(String provider) {}

                @Override
                public void onProviderDisabled(String provider) {}
            };

            // Request location updates
            try {
                long minTime = 0;
                float minDistance = 0;

                if (enableHighAccuracy && locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    locationManager.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        minTime,
                        minDistance,
                        locationListener,
                        Looper.getMainLooper()
                    );
                }

                if (locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                    locationManager.requestLocationUpdates(
                        LocationManager.NETWORK_PROVIDER,
                        minTime,
                        minDistance,
                        locationListener,
                        Looper.getMainLooper()
                    );
                }

                // Set timeout
                handler.postDelayed(() -> {
                    try {
                        if (resolved[0]) {
                            return;
                        }

                        resolved[0] = true;
                        locationManager.removeUpdates(locationListener);
                        PluginCall savedCall = bridge.getSavedCall(pendingCall.getCallbackId());
                        if (savedCall != null) {
                            if (bestFreshLocation[0] != null) {
                                savedCall.resolve(createPositionResult(bestFreshLocation[0]));
                            } else {
                                savedCall.reject("Location request timed out");
                            }
                            bridge.releaseCall(savedCall);
                        }
                    } catch (Exception e) {
                        // Already resolved or rejected
                    }
                }, timeout);

            } catch (SecurityException e) {
                call.reject("Security exception: " + e.getMessage());
            }

        } catch (Exception e) {
            call.reject("Error getting location: " + e.getMessage());
        }
    }

    private JSObject createPositionResult(Location location) {
        JSObject coords = new JSObject();
        coords.put("latitude", location.getLatitude());
        coords.put("longitude", location.getLongitude());
        coords.put("accuracy", (double) location.getAccuracy());
        if (location.hasAltitude()) {
            coords.put("altitude", (double) location.getAltitude());
        }
        if (location.hasBearing()) {
            coords.put("heading", (double) location.getBearing());
        }
        if (location.hasSpeed()) {
            coords.put("speed", (double) location.getSpeed());
        }

        JSObject result = new JSObject();
        result.put("coords", coords);
        result.put("timestamp", location.getTime());

        return result;
    }

    private Location getBestLastKnownLocation() {
        Location bestLocation = null;

        try {
            Location gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
            Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);

            if (gpsLocation != null) {
                bestLocation = gpsLocation;
            }

            if (networkLocation != null &&
                (bestLocation == null || networkLocation.getTime() > bestLocation.getTime())) {
                bestLocation = networkLocation;
            }
        } catch (SecurityException ignored) {
            return null;
        }

        return bestLocation;
    }

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        // Let Capacitor handle the permission request automatically
        requestAllPermissions(call, "locationPermsCallback");
    }

    @PluginMethod
    public void getCurrentHeading(PluginCall call) {
        if (sensorManager == null) {
            call.reject("Sensor manager unavailable");
            return;
        }

        Sensor geomagneticRotationVectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR);
        Sensor rotationVectorSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR);
        Sensor accelerometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
        Sensor magnetometerSensor = sensorManager.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD);

        if (
            geomagneticRotationVectorSensor == null &&
            rotationVectorSensor == null &&
            (accelerometerSensor == null || magnetometerSensor == null)
        ) {
            call.reject("Compass sensors are not available");
            return;
        }

        final float[] rotationMatrix = new float[9];
        final float[] remappedMatrix = new float[9];
        final float[] orientation = new float[3];
        final float[] gravityReading = new float[3];
        final float[] magneticReading = new float[3];
        final boolean[] hasGravity = { false };
        final boolean[] hasMagnetic = { false };
        final boolean[] resolved = { false };

        final PluginCall pendingCall = call;
        bridge.saveCall(call);

        final SensorEventListener listener = new SensorEventListener() {
            @Override
            public void onSensorChanged(SensorEvent event) {
                boolean canResolve = false;

                if (
                    event.sensor.getType() == Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR ||
                    event.sensor.getType() == Sensor.TYPE_ROTATION_VECTOR
                ) {
                    SensorManager.getRotationMatrixFromVector(rotationMatrix, event.values);
                    canResolve = true;
                } else if (event.sensor.getType() == Sensor.TYPE_ACCELEROMETER) {
                    System.arraycopy(event.values, 0, gravityReading, 0, gravityReading.length);
                    hasGravity[0] = true;
                } else if (event.sensor.getType() == Sensor.TYPE_MAGNETIC_FIELD) {
                    System.arraycopy(event.values, 0, magneticReading, 0, magneticReading.length);
                    hasMagnetic[0] = true;
                }

                if (!canResolve && hasGravity[0] && hasMagnetic[0]) {
                    canResolve = SensorManager.getRotationMatrix(
                        rotationMatrix,
                        null,
                        gravityReading,
                        magneticReading
                    );
                }

                if (!canResolve || resolved[0]) {
                    return;
                }

                int worldAxisForX = SensorManager.AXIS_X;
                int worldAxisForY = SensorManager.AXIS_Y;

                if (getActivity() != null && getActivity().getDisplay() != null) {
                    int rotation = getActivity().getDisplay().getRotation();
                    switch (rotation) {
                        case Surface.ROTATION_90:
                            worldAxisForX = SensorManager.AXIS_Y;
                            worldAxisForY = SensorManager.AXIS_MINUS_X;
                            break;
                        case Surface.ROTATION_180:
                            worldAxisForX = SensorManager.AXIS_MINUS_X;
                            worldAxisForY = SensorManager.AXIS_MINUS_Y;
                            break;
                        case Surface.ROTATION_270:
                            worldAxisForX = SensorManager.AXIS_MINUS_Y;
                            worldAxisForY = SensorManager.AXIS_X;
                            break;
                        case Surface.ROTATION_0:
                        default:
                            break;
                    }
                }

                SensorManager.remapCoordinateSystem(
                    rotationMatrix,
                    worldAxisForX,
                    worldAxisForY,
                    remappedMatrix
                );
                SensorManager.getOrientation(remappedMatrix, orientation);

                double azimuth = Math.toDegrees(orientation[0]);
                double heading = (azimuth + 360.0) % 360.0;

                Location referenceLocation = getBestLastKnownLocation();
                if (referenceLocation != null) {
                    GeomagneticField geomagneticField = new GeomagneticField(
                        (float) referenceLocation.getLatitude(),
                        (float) referenceLocation.getLongitude(),
                        referenceLocation.hasAltitude() ? (float) referenceLocation.getAltitude() : 0f,
                        referenceLocation.getTime() > 0 ? referenceLocation.getTime() : System.currentTimeMillis()
                    );
                    heading = (heading + geomagneticField.getDeclination() + 360.0) % 360.0;
                }

                resolved[0] = true;
                sensorManager.unregisterListener(this);

                PluginCall savedCall = bridge.getSavedCall(pendingCall.getCallbackId());
                if (savedCall != null) {
                    JSObject result = new JSObject();
                    result.put("heading", heading);
                    savedCall.resolve(result);
                    bridge.releaseCall(savedCall);
                }
            }

            @Override
            public void onAccuracyChanged(Sensor sensor, int accuracy) {
            }
        };

        if (geomagneticRotationVectorSensor != null) {
            sensorManager.registerListener(
                listener,
                geomagneticRotationVectorSensor,
                SensorManager.SENSOR_DELAY_GAME
            );
        } else if (accelerometerSensor != null && magnetometerSensor != null) {
            sensorManager.registerListener(listener, accelerometerSensor, SensorManager.SENSOR_DELAY_GAME);
            sensorManager.registerListener(listener, magnetometerSensor, SensorManager.SENSOR_DELAY_GAME);
        } else if (rotationVectorSensor != null) {
            // Last resort only. Rotation vector can be gyro-dominant and may drift,
            // but it is better than hard-failing when no geomagnetic path is available.
            sensorManager.registerListener(listener, rotationVectorSensor, SensorManager.SENSOR_DELAY_GAME);
        }

        new Handler(Looper.getMainLooper()).postDelayed(() -> {
            if (resolved[0]) {
                return;
            }

            sensorManager.unregisterListener(listener);
            PluginCall savedCall = bridge.getSavedCall(pendingCall.getCallbackId());
            if (savedCall != null) {
                savedCall.reject("Compass heading is unavailable");
                bridge.releaseCall(savedCall);
            }
        }, 4000);
    }
}
