import { createContext, useContext, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const value = useMemo(
    () => ({
      user: {
        name: 'Admin User',
        role: 'ADMIN',
        email: 'admin@sliit.lk'
      },
      isAuthenticated: true,
      logout: () => {}
    }),
    []
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
