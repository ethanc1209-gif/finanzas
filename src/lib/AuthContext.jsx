import React, { createContext, useState, useContext, useEffect } from 'react';
import { client } from '@/lib/app-params';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    client.auth.me()
      .then(u => { setUser(u); })
      .catch(() => {})
      .finally(() => setIsLoadingAuth(false));
  }, []);

  const navigateToLogin = () => client.auth.redirectToLogin(window.location.href);
  const logout = () => client.auth.logout(window.location.href);

  return (
    <AuthContext.Provider value={{
      user, isLoadingAuth, isLoadingPublicSettings,
      authError, navigateToLogin, logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};