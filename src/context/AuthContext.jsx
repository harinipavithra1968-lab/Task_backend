import { createContext, useContext, useState } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "null")
  );

  const save = ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const login = async (identifier, password) => {
    const data = await api("/auth/login", {
      method: "POST",
      body: {
        identifier,
        password,
      },
    });

    save(data);
  };

  const register = async (form) => {
    const data = await api("/auth/register", {
      method: "POST",
      body: form,
    });

    save(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}