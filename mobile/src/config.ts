import { Platform } from 'react-native';

const localBackendByPlatform = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

const normalizedConfiguredBackendUrl = process.env.EXPO_PUBLIC_BACKEND_BASE_URL
  ?.trim()
  .replace(/\/+$/, '');

export const BACKEND_BASE_URL =
  normalizedConfiguredBackendUrl && normalizedConfiguredBackendUrl.length > 0
    ? normalizedConfiguredBackendUrl
    : localBackendByPlatform;
