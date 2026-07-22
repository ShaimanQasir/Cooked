import { Platform } from 'react-native';

// Backend API Configuration
// Change BASE_URL based on your setup:
//   Android Emulator: http://10.0.2.2:8000/api
//   iOS Simulator:     http://localhost:8000/api
//   Physical Device:   http://<your-machine-ip>:8000/api

const DEV_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:8000/api'
    : 'http://localhost:8000/api';

export const config = {
  API_BASE_URL: __DEV__ ? DEV_BASE_URL : 'https://your-production-api.com/api',
};
