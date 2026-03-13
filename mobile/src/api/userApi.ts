import type { UserSearchResult } from '../types/user';
import { parseJson, request } from './http';

export async function searchUsersByUsername(
  query: string,
  signal?: AbortSignal,
): Promise<UserSearchResult[]> {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [];
  }

  const response = await request(`/users/search?q=${encodeURIComponent(normalizedQuery)}`, {
    signal: signal ?? null,
  });
  return parseJson<UserSearchResult[]>(response);
}
