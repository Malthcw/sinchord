import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type User = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: User | null;
  signIn: (user: User) => void;
  signOut: () => void;
  updateProfile: (updates: { name: string; email: string }) => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (nextUser: User) => setUser(nextUser),
      signOut: () => setUser(null),
      updateProfile: (updates: { name: string; email: string }) =>
        setUser((prev) => ({ id: prev?.id ?? 'local-user', ...updates })),
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used inside an <AuthProvider>');
  }
  return context;
}