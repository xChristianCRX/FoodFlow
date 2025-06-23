import { useEffect, useState, useCallback } from "react";
import { api } from "../libs/axios";
import { createContext } from "use-context-selector";
import { jwtDecode } from "jwt-decode";

interface User {
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    const token = response.data.token;

    localStorage.setItem("token", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    const decoded = jwtDecode<JwtPayload>(token);
    setUser({ username: decoded.sub, role: decoded.role });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }, []);

  // Carregar usuário e token ao montar o provider
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode<JwtPayload>(token);

      // Opcional: verificar expiração do token
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }
      setUser({ username: decoded.sub, role: decoded.role });
    } catch {
      logout();
    }
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
