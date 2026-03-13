import { Platform } from 'react-native';

const localBackendByPlatform = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

export const BACKEND_BASE_URL =
  process.env.EXPO_PUBLIC_BACKEND_BASE_URL?.trim() || localBackendByPlatform;
