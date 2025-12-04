import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registrationStep: 'auth' | 'face' | 'blink' | 'complete';
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string, name: string) => Promise<User>;
  logout: () => Promise<void>;
  updateUserFace: (faceImageUrl: string) => Promise<void>;
  updateUserBlink: (blinkSequence: Blob) => Promise<void>;
  setRegistrationStep: (step: 'auth' | 'face' | 'blink' | 'complete') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registrationStep, setRegistrationStep] = useState<'auth' | 'face' | 'blink' | 'complete'>('auth');

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    // TODO: Replace with actual Supabase auth
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      faceImageUrl: 'stored', // Assume existing user has face data
      createdAt: new Date(),
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    setRegistrationStep('complete');
    
    return mockUser;
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    setIsLoading(true);
    
    // TODO: Replace with actual Supabase auth
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      createdAt: new Date(),
    };
    
    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);
    setRegistrationStep('face'); // New user needs to register face
    
    return mockUser;
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
    setRegistrationStep('auth');
  }, []);

  const updateUserFace = useCallback(async (faceImageUrl: string) => {
    // TODO: Replace with actual database update
    setUser(prev => prev ? { ...prev, faceImageUrl } : null);
    setRegistrationStep('blink');
  }, []);

  const updateUserBlink = useCallback(async (blinkSequence: Blob) => {
    // TODO: Replace with actual database update
    setUser(prev => prev ? { ...prev, blinkSequence } : null);
    setRegistrationStep('complete');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        registrationStep,
        login,
        signup,
        logout,
        updateUserFace,
        updateUserBlink,
        setRegistrationStep,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
