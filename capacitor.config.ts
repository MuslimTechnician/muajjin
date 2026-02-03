import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'org.muslimtechnician.muajjin',
  appName: 'Muajjin',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    buildOptions: {
      signingType: 'apksigner'
    }
  },
  plugins: {
    EdgeToEdge: {
      backgroundColor: '#ffffff'
    }
  }
};

export default config;
