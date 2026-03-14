export interface UserRole {
  role: string;
}

export interface User {
  id: string;
  username: string;
  roles: UserRole[];
}

export interface UserSearchResult {
  id: string;
  username: string;
}
