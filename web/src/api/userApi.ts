import { BACKEND_BASE_URL } from '../config';

export async function fetchCurrentUser() {
  const response = await fetch(`${BACKEND_BASE_URL}/me`, {
    credentials: 'include',
  });
  if (!response.ok) return null;
  return await response.json();
}

export interface UserSearchResult {
  id: string;
  username: string;
}

export async function searchUsersByUsername(query: string, signal?: AbortSignal): Promise<UserSearchResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const response = await fetch(
    `${BACKEND_BASE_URL}/users/search?q=${encodeURIComponent(normalizedQuery)}`,
    {
      credentials: 'include',
      signal,
    },
  );
  if (!response.ok) {
    throw new Error('Failed to search users');
  }
  return response.json();
}
