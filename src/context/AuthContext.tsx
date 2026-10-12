import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { INITIAL_USERS } from '../data/initialData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (name: string, email: string, password?: string, handle?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  switchDemoUser: (userId: string) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  authModalMode: 'login' | 'signup' | 'forgot';
  setAuthModalMode: (mode: 'login' | 'signup' | 'forgot') => void;
  allUsers: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'papip_auth_user_v1';
const ALL_USERS_KEY = 'papip_all_users_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allUsers, setAllUsers] = useState<User[]>(() => {
    try {
      const stored = localStorage.getItem(ALL_USERS_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    // Default to Alex Vance for instant rich interaction, can switch to any user or guest
    return INITIAL_USERS[0];
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup' | 'forgot'>('login');

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(ALL_USERS_KEY, JSON.stringify(allUsers));
  }, [allUsers]);

  const login = async (email: string): Promise<boolean> => {
    // Find matching user or generate profile for this email
    const existing = allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      setIsAuthModalOpen(false);
      return true;
    }

    // If new email, create profile
    const namePart = email.split('@')[0];
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: namePart.charAt(0).toUpperCase() + namePart.slice(1),
      handle: `@${namePart.toLowerCase()}`,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${namePart}`,
      bannerUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
      bio: 'Video enthusiast and creator on PaPip.',
      joinedDate: 'Just now',
      subscribersCount: 0,
      isVerified: false,
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const signup = async (
    name: string,
    email: string,
    _password?: string,
    handle?: string
  ): Promise<boolean> => {
    const cleanHandle = handle ? (handle.startsWith('@') ? handle : `@${handle}`) : `@${name.toLowerCase().replace(/\s+/g, '')}`;
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      handle: cleanHandle,
      email,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
      bannerUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1200&q=80',
      bio: 'New creator on PaPip. Watch. Create. Share.',
      joinedDate: 'Oct 2026',
      subscribersCount: 0,
      isVerified: false,
    };

    setAllUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthModalOpen(false);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setAllUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
  };

  const switchDemoUser = (userId: string) => {
    const found = allUsers.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      setIsAuthModalOpen(false);
    }
  };

  const openAuthModal = (mode: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        signup,
        logout,
        updateProfile,
        switchDemoUser,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        setAuthModalMode,
        allUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
