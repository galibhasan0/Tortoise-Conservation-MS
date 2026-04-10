import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole =
  | 'Admin'
  | 'Supervisor'
  | 'Vet'
  | 'Caretaker'
  | 'Breeding Officer'
  | 'Env Tech'
  | 'Collection Officer'
  | 'Staff';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  fullName: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string, role?: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  permissions: string[];
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapApiUser(apiUser: any): User {
  return {
    id: String(apiUser.user_id),
    username: apiUser.username,
    email: apiUser.email ?? `${apiUser.username}@tortoisecare.local`,
    role: apiUser.role_name as UserRole,
    fullName: apiUser.full_name ?? apiUser.username,
    avatar: apiUser.avatar,
  };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/auth/me', { credentials: 'include' })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(mapApiUser(data.data.user));
          setPermissions(data.data.permissions ?? []);
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const login = async (username: string, password: string, _role?: UserRole) => {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message ?? 'Login failed');
    }

    setUser(mapApiUser(data.data.user));
    setPermissions(data.data.permissions ?? []);
  };

  const logout = async () => {
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {}
    setUser(null);
    setPermissions([]);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const hasPermission = (permission: string) => permissions.includes(permission);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        permissions,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
