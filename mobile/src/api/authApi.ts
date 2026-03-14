import type { User } from '../types/user';
import { UnauthorizedError, parseJson, request } from './http';

export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await request('/me');
    return parseJson<User>(response);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return null;
    }
    throw error;
  }
}

export async function login(username: string, password: string): Promise<void> {
  try {
    await request('/j_security_check', {
      method: 'POST',
      skipJsonContentType: true,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `j_username=${encodeURIComponent(username)}&j_password=${encodeURIComponent(password)}`,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw new UnauthorizedError('Invalid username or password');
    }
    throw error;
  }
}

export async function logout(): Promise<void> {
  await request('/logout', { method: 'POST' });
}
