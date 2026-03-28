import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'media.vidya.app',
  appName: 'VIDYA',
  webDir: 'build',
  server: {
    androidScheme: "http",
    cleartext: true,
  },
  
};

export default config;
