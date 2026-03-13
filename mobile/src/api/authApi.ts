import type { User } from '../types/user';
import { request, parseJson } from './http';

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await request('/me');
    return parseJson<User>(response);
  } catch {
    return null;
  }
}

export async function login(username: string, password: string): Promise<void> {
  await request('/j_security_check', {
    method: 'POST',
    skipJsonContentType: true,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`,
  });
}

export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' });
}
