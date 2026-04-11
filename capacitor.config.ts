import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.chronosapex.app',
  appName: 'Chronos Apex',
  webDir: 'dist',
  server: {
    url: "https://5aebe91d-a9c5-4174-b000-db347d82e13b.lovableproject.com?forceHideBadge=true",
    cleartext: true
  }
};

export default config;
