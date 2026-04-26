import { createContext, useCallback, useContext, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);
const TOKEN_KEY = 'smart-campus-token';

function parseToken(token) {
  try {
    const decoded = jwtDecode(token);
    // Check expiry
    if (decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return {
      id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      role: decoded.role,
      picture: decoded.picture
    };
  } catch {
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    return token ? parseToken(token) : null;
  });

  const login = useCallback((token) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(parseToken(token));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    // Sign out from Google too
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  }, []);

  const isAdmin       = () => user?.role === 'ADMIN';
  const isTechnician  = () => user?.role === 'TECHNICIAN';
  const isUser        = () => user?.role === 'USER';
  const hasRole       = (role) => user?.role === role;
  const canManageResources = () => isAdmin();

  const value = {
    user,
    login,
    logout,
    isAdmin,
    isTechnician,
    isUser,
    hasRole,
    canManageResources,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
