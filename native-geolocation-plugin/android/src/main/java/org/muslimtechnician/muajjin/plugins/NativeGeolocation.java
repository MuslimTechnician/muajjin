package org.muslimtechnician.muajjin.plugins;

import android.Manifest;
import android.content.pm.PackageManager;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

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
    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @Override
    public void load() {
        locationManager = (LocationManager) getContext().getSystemService(getContext().LOCATION_SERVICE);
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

        getCurrentPositionInternal(call, enableHighAccuracy, timeout);
    }

    @PermissionCallback
    private void locationPermsCallback(PluginCall call) {
        if (!hasRequiredPermissions()) {
            call.reject("User denied location permission");
            return;
        }
        boolean enableHighAccuracy = call.getBoolean("enableHighAccuracy", true);
        long timeout = call.getLong("timeout", 15000L);
        getCurrentPositionInternal(call, enableHighAccuracy, timeout);
    }

    private void getCurrentPositionInternal(PluginCall call, boolean enableHighAccuracy, long timeout) {
        try {
            // Check if location is enabled
            if (!locationManager.isProviderEnabled(LocationManager.GPS_PROVIDER) &&
                !locationManager.isProviderEnabled(LocationManager.NETWORK_PROVIDER)) {
                call.reject("Location services are disabled");
                return;
            }

            // Get best available location from cache
            Location bestLocation = null;
            long minTimeThreshold = System.currentTimeMillis() - 60000; // 1 minute ago

            try {
                Location gpsLocation = locationManager.getLastKnownLocation(LocationManager.GPS_PROVIDER);
                Location networkLocation = locationManager.getLastKnownLocation(LocationManager.NETWORK_PROVIDER);

                if (gpsLocation != null && gpsLocation.getTime() > minTimeThreshold) {
                    bestLocation = gpsLocation;
                }
                if (networkLocation != null) {
                    if (bestLocation == null || networkLocation.getTime() > bestLocation.getTime()) {
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

            LocationListener locationListener = new LocationListener() {
                @Override
                public void onLocationChanged(Location location) {
                    try {
                        locationManager.removeUpdates(this);
                        PluginCall savedCall = bridge.getSavedCall(pendingCall.getCallbackId());
                        if (savedCall != null) {
                            savedCall.resolve(createPositionResult(location));
                            bridge.releaseCall(savedCall);
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
                String provider = enableHighAccuracy ? LocationManager.GPS_PROVIDER : LocationManager.NETWORK_PROVIDER;
                long minTime = 0;
                float minDistance = 0;

                locationManager.requestLocationUpdates(provider, minTime, minDistance, locationListener, Looper.getMainLooper());

                // Set timeout
                Handler handler = new Handler(Looper.getMainLooper());
                handler.postDelayed(() -> {
                    try {
                        locationManager.removeUpdates(locationListener);
                        PluginCall savedCall = bridge.getSavedCall(pendingCall.getCallbackId());
                        if (savedCall != null) {
                            savedCall.reject("Location request timed out");
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

    @PluginMethod
    public void requestPermissions(PluginCall call) {
        // Let Capacitor handle the permission request automatically
        requestAllPermissions(call, "locationPermsCallback");
    }
}
