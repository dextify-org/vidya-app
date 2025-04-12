import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'media.vidya.app',
  appName: 'VIDYA',
  webDir: 'build',
  server: {
    androidScheme: "http",
    url:"http://192.168.1.28:3000",
    cleartext: true
  }
};

export default config;
