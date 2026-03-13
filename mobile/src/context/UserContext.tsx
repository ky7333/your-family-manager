import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { fetchCurrentUser, login, logout } from '../api/authApi';
import { UnauthorizedError, setUnauthorizedHandler } from '../api/http';
import type { User } from '../types/user';

interface Credentials {
  username: string;
  password: string;
}

interface UserContextValue {
  user: User | null;
  bootstrapping: boolean;
  signIn: (credentials: Credentials) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  bootstrapping: true,
  signIn: async () => undefined,
  signOut: async () => undefined,
  refreshUser: async () => undefined,
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null);
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const refreshUser = async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser();
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrap();
  }, []);

  const signIn = async ({ username, password }: Credentials) => {
    await login(username, password);
    const currentUser = await fetchCurrentUser();
    if (!currentUser) {
      throw new Error('Session not established after login.');
    }
    setUser(currentUser);
  };

  const signOut = async () => {
    try {
      await logout();
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }
    }
    setUser(null);
  };

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      bootstrapping,
      signIn,
      signOut,
      refreshUser,
    }),
    [bootstrapping, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
