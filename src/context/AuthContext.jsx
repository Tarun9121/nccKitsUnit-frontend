import { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ userId: null, role: null });

  const login = (userId, role) => setAuth({ userId, role });
  const logout = () => setAuth({ userId: null, role: null });

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
