import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCurrentUser } from '../api/userApi';

export interface User {
  id: string;
  username: string;
  roles: { role: string }[];
}

interface UserContextValue {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const noop = () => undefined;

const UserContext = createContext<UserContextValue>({ user: null, setUser: noop });

export const useUser = () => useContext(UserContext);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    void fetchCurrentUser().then(setUser);
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
