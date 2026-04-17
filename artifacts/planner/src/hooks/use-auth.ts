import { useState, useEffect, useCallback } from "react";

const API_URL = "https://digital-planner-optimizer-1-4.onrender.com";
const TOKEN_KEY = "planner_auth_token";
const USERNAME_KEY = "planner_auth_username";

export function useAjjghghyuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [storedUsername, setStoredUsername] = useState("");

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const username = localStorage.getItem(USERNAME_KEY) || "";

    if (token) {
      setIsAuthenticated(true);
    }

    if (username) {
      setStoredUsername(username);
    }

    setIsLoading(false);
  }, []);

  const setupCredentials = useCallback(async (username: string, password: string) => {
    const res = await fetch(${API_URL}/register, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao criar conta");
    }

    const loginRes = await fetch(${API_URL}/login, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: username,
        password,
      }),
    });

    const loginData = await loginRes.json();

    if (!loginRes.ok || !loginData.token) {
      throw new Error(loginData.error || "Erro ao entrar após cadastro");
    }

    localStorage.setItem(TOKEN_KEY, loginData.token);
    localStorage.setItem(USERNAME_KEY, username);

    setStoredUsername(username);
    setIsAuthenticated(true);
    setIsSetup(true);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(${API_URL}/login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        return false;
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USERNAME_KEY, username);

      setStoredUsername(username);
      setIsAuthenticated(true);
      setIsSetup(true);

      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
    setIsAuthenticated(false);
    setStoredUsername("");
  }, []);

  const changeCredentials = useCallback(async () => {
    return false;
  }, []);

  const removeAuth = useCallback(async () => {
    return false;
  }, []);

  return {
    isAuthenticated,
    isSetup,
    isLoading,
    storedUsername,
    setupCredentials,
    login,
    logout,
    changeCredentials,
    removeAuth,
  };
}
