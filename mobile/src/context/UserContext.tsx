import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

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
  const unauthorizedHandlerOwnerRef = useRef(Symbol('UserProviderUnauthorizedHandler'));

  const refreshUser = useCallback(async () => {
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
  }, []);

  const signIn = useCallback(async ({ username, password }: Credentials) => {
    await login(username, password);
    const currentUser = await fetchCurrentUser();
    if (!currentUser) {
      throw new Error('Session not established after login.');
    }
    setUser(currentUser);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      if (!(error instanceof UnauthorizedError)) {
        throw error;
      }
    }
    setUser(null);
  }, []);

  useEffect(() => {
    const owner = unauthorizedHandlerOwnerRef.current;
    setUnauthorizedHandler(() => {
      setUser(null);
    }, owner);

    return () => {
      setUnauthorizedHandler(null, owner);
    };
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshUser();
      } finally {
        setBootstrapping(false);
      }
    };

    void bootstrap();
  }, [refreshUser]);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      bootstrapping,
      signIn,
      signOut,
      refreshUser,
    }),
    [bootstrapping, refreshUser, signIn, signOut, user],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
