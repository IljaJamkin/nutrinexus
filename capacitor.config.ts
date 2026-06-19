import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nutrinexus.app',
  appName: 'NutriNexus',
  webDir: 'public', 
  server: {
    url: 'https://nutrinexusapp.vercel.app/',
    cleartext: true
  }
};

export default config;