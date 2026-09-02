import { createContext, useContext, useState, useEffect } from "react";
import { loginRequest, signup, getMe } from "../api/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // loading au démarrage

  // Vérifie si on a déjà un token et récupère l'utilisateur
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const me = await getMe();
          setUser(me);
        } catch {
          localStorage.removeItem("token"); // token invalide
        }
      }
      setAuthLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    try {
      const data = await loginRequest(email, password);
      localStorage.setItem("token", data.token);
      const me = await getMe();
      setUser(me);
    } catch (err) {
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const signupAndLogin = async (first_name, last_name, email, password) => {
  setAuthLoading(true);
  try {
    const data = await signup(first_name, last_name, email, password);
    localStorage.setItem("token", data.token);
    const me = await getMe();
    setUser(me);
  } finally {
    setAuthLoading(false);
  }
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("ftk_cart");
  };

  return (
    <AuthContext.Provider value={{ user, login, signupAndLogin, logout, authLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
