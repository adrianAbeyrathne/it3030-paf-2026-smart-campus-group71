import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const AuthContext = createContext(null);
const ROLE_STORAGE_KEY = 'smart-campus-role';

export function AuthProvider({ children }) {
  const adminUser = {
    name: 'Dr. Smith',
    role: 'ADMIN',
    email: 'admin@sliit.lk'
  };

  const normalUser = {
    name: 'John Student',
    role: 'USER',
    email: 'student@sliit.lk'
  };

  const [user, setUser] = useState(() => {
    const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
    return savedRole === 'USER' ? normalUser : adminUser;
  });

  const isAdmin = () => user?.role === 'ADMIN';
  const canManageResources = () => isAdmin();

  const switchUser = () => {
    setUser((prevUser) => (prevUser?.role === 'ADMIN' ? normalUser : adminUser));
  };

  useEffect(() => {
    localStorage.setItem(ROLE_STORAGE_KEY, user?.role || 'ADMIN');
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      adminUser,
      normalUser,
      isAuthenticated: true,
      isAdmin,
      canManageResources,
      switchUser,
      logout: () => {}
    }),
    [user]
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
