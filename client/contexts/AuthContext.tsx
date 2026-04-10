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
  login: (username: string, password: string, role: UserRole) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('aura_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('aura_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string, role: UserRole) => {
    // Frontend-only login simulation
    // In a real app, this would call a backend API
    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      email: `${username}@tortoisecare.local`,
      role,
      fullName: username.charAt(0).toUpperCase() + username.slice(1),
    };
    
    setUser(newUser);
    localStorage.setItem('aura_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('aura_user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('aura_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user,
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
