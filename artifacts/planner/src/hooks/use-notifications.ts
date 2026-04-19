import { useCallback, useEffect, useState } from "react";

const API_URL = "https://digital-planner-optimizer-1-4.onrender.com";
const TOKEN_KEY = "planner_auth_token";

export interface NotificationItem {
  id: string;
  message: string;
  read: boolean;
  createdAt: number;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const loadNotifications = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/notifications`, {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();

    if (res.ok) {
      setNotifications(data);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(`${API_URL}/notifications/${id}/read`, {
      method: "PATCH",
      headers: {
        Authorization: token,
      },
    });

    if (res.ok) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    }
  };

  return {
    notifications,
    loadNotifications,
    markAsRead,
  };
}
