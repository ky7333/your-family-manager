import { BACKEND_BASE_URL } from '../config';

export async function fetchCurrentUser() {
  const response = await fetch(`${BACKEND_BASE_URL}/me`, {
    credentials: 'include',
  });
  if (!response.ok) return null;
  return await response.json();
}
