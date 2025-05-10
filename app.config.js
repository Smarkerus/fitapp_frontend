import 'dotenv/config';

export default {
  expo: {
    name: 'fitapp_frontend',
    slug: 'fitapp_frontend',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY,
      },
    },
    android: {
      package: 'tutaj_podaj_package_name',
      permissions: ['INTERNET'],
      enableProguardInReleaseBuilds: false,
      googleServicesFile: './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY,
        },
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      'expo-font',
      [
        'expo-build-properties',
        {
          android: {
            minifyEnabled: false,
            enableProguardInReleaseBuilds: false,
          },
        },
      ],
    ],
  },
};
