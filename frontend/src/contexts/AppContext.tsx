// src/contexts/AppContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  preferences: UserPreferences;
}

interface UserPreferences {
  currency: 'KES' | 'USD' | 'EUR';
  language: 'en' | 'sw' | 'sheng';
  darkMode: boolean;
  notifications: boolean;
  mpesaAutoSync: boolean;
}

interface AppContextType {
  user: User | null;
  loading: boolean;
  darkMode: boolean;
  notifications: number;
  setUser: (user: User | null) => void;
  toggleDarkMode: () => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addNotification: () => void;
  clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    // Load user from localStorage
    const loadUser = async () => {
      try {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock user
        setUser({
          id: '1',
          name: 'Francis',
          email: 'francis@example.com',
          phoneNumber: '+254712345678',
          preferences: {
            currency: 'KES',
            language: 'en',
            darkMode: false,
            notifications: true,
            mpesaAutoSync: true,
          },
        });
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    // Dark mode is already applied by index.html boot script — just sync state
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      localStorage.setItem('thebase.theme', next ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  };

  const updatePreferences = (preferences: Partial<UserPreferences>) => {
    if (user) {
      setUser({
        ...user,
        preferences: {
          ...user.preferences,
          ...preferences,
        },
      });
    }
  };

  const addNotification = () => {
    setNotifications(prev => prev + 1);
  };

  const clearNotifications = () => {
    setNotifications(0);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        darkMode,
        notifications,
        setUser,
        toggleDarkMode,
        updatePreferences,
        addNotification,
        clearNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
