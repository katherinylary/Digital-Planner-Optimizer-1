import { useState, useEffect, useCallback } from "react";

const CREDENTIALS_KEY = "planner_auth_credentials";
const SESSION_KEY = "planner_session";

interface Credentials {
  username: string;
  passwordHash: string;
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function getStoredCredentials(): Credentials | null {
  const raw = localStorage.getItem(CREDENTIALS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storedUsername, setStoredUsername] = useState("");

  useEffect(() => {
    const creds = getStoredCredentials();
    if (!creds) {
      setIsSetup(false);
    } else {
      setIsSetup(true);
      setStoredUsername(creds.username);
    }

    const session = sessionStorage.getItem(SESSION_KEY);
    if (session === "authenticated") {
      setIsAuthenticated(true);
    }

    setIsLoading(false);
  }, []);

  const setupCredentials = useCallback(async (username: string, password: string) => {
    const passwordHash = await sha256(password);
    const creds: Credentials = { username, passwordHash };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
    sessionStorage.setItem(SESSION_KEY, "authenticated");
    setStoredUsername(username);
    setIsSetup(true);
    setIsAuthenticated(true);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const creds = getStoredCredentials();
    if (!creds) return false;
    const hash = await sha256(password);
    if (creds.username === username && creds.passwordHash === hash) {
      sessionStorage.setItem(SESSION_KEY, "authenticated");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  const changeCredentials = useCallback(async (
    currentPassword: string,
    newUsername: string,
    newPassword: string
  ): Promise<boolean> => {
    const creds = getStoredCredentials();
    if (!creds) return false;
    const currentHash = await sha256(currentPassword);
    if (creds.passwordHash !== currentHash) return false;
    const newHash = await sha256(newPassword);
    const updated: Credentials = { username: newUsername, passwordHash: newHash };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(updated));
    setStoredUsername(newUsername);
    return true;
  }, []);

  const removeAuth = useCallback(async (currentPassword: string): Promise<boolean> => {
    const creds = getStoredCredentials();
    if (!creds) return false;
    const hash = await sha256(currentPassword);
    if (creds.passwordHash !== hash) return false;
    localStorage.removeItem(CREDENTIALS_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setIsSetup(false);
    setIsAuthenticated(true);
    return true;
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
