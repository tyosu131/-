import React, { createContext, useContext, useState } from 'react';
import { useRouter } from 'next/router';

interface AuthContextProps {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps>({
  token: null,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const router = useRouter();

  const login = (token: string) => {
    setToken(token);
    localStorage.setItem('token', token);
    router.push('/');  // トップページへリダイレクト
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
