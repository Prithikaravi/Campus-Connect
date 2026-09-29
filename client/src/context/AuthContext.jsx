import { createContext, useContext, useState } from "react";
import api, { storage } from "../services/api";

// Where each role lands after login
export const roleHome = {
  student: "/dashboard",
  faculty: "/faculty",
  club: "/club",
  admin: "/admin",
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => storage.get("cc_token"));
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(storage.get("cc_user"));
    } catch {
      return null;
    }
  });

  // ---- LOGIN: POST /api/auth/login ----
  // If your backend returns a different shape, only edit the 3 lines marked (ADJUST).
  const login = async (email, password, remember = true) => {
    const { data } = await api.post("/api/auth/login", { email, password });
    const newToken = data.token; // (ADJUST) e.g. data.accessToken
    const rawUser = data.user || data; // (ADJUST) if user fields are at top level
    const newUser = {
      ...rawUser,
      role: String(rawUser.role || "student").toLowerCase(), // (ADJUST)
    };
    storage.clear();
    storage.set("cc_token", newToken, remember);
    storage.set("cc_user", JSON.stringify(newUser), remember);
    setToken(newToken);
    setUser(newUser);
    return newUser;
  };

  // ---- REGISTER: POST /api/auth/register ----
  const register = async ({ name, email, password, role }) => {
    const { data } = await api.post("/api/auth/register", { name, email, password, role });
    return data;
  };

  const logout = () => {
    storage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);