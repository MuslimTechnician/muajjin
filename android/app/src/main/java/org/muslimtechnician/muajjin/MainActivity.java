package org.muslimtechnician.muajjin;

import android.os.Bundle;
import android.webkit.WebView;

import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Edge-to-edge and status bar colors handled by @capawesome/capacitor-android-edge-to-edge-support plugin
        // Configured in capacitor.config.ts

        // Hide scrollbars in Capacitor WebView
        Bridge bridge = this.getBridge();
        if (bridge != null) {
            WebView webView = bridge.getWebView();
            if (webView != null) {
                webView.setVerticalScrollBarEnabled(false);
                webView.setHorizontalScrollBarEnabled(false);
            }
        }
    }

    @Override
    public void onBackPressed() {
        // Let Capacitor handle the back press
        super.onBackPressed();
    }
}
