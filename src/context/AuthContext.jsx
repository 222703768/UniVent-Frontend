import { createContext, useState, useEffect } from "react";


export const AuthContext = createContext(null);


export function AuthProvider({ children }) {

 
  const [token, setToken] = useState(() => {
    return sessionStorage.getItem("univent_token") || null;
  });

  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("univent_user");
    return stored ? JSON.parse(stored) : null;
  });

  
  const login = (authResponse) => {
    const userData = {
      userId: authResponse.userId,
      name: authResponse.name,
      email: authResponse.email,
      role: authResponse.role,
    };

    
    setToken(authResponse.token);
    setUser(userData);

    
    sessionStorage.setItem("univent_token", authResponse.token);
    sessionStorage.setItem("univent_user", JSON.stringify(userData));
  };

 
  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem("univent_token");
    sessionStorage.removeItem("univent_user");
  };

 
  const isAuthenticated = () => {
    return token !== null && user !== null;
  };

  
  const getHomePath = () => {
    if (!user) return "/login";
    switch (user.role) {
      case "STUDENT": return "/student";
      case "ORGANIZER": return "/organizer";
      case "ADMIN": return "/admin";
      default: return "/login";
    }
  };


  const value = {
    token,
    user,
    login,
    logout,
    isAuthenticated,
    getHomePath,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}