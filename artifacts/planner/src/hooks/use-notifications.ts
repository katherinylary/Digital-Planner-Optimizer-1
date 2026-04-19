import { useCallback, useEffect, useRef, useState } from "react";

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
  const previousCountRef = useRef(0);

  const loadNotifications = useCallback(async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch(`${API_URL}/notifications`, {
        headers: {
          Authorization: token,
        },
      });

      if (!res.ok) return;

      const data: NotificationItem[] = await res.json();

      if (
        previousCountRef.current > 0 &&
        data.length > previousCountRef.current
      ) {
        const newest = data[0];
        if (newest && !newest.read) {
          alert(`Nova notificação: ${newest.message}`);
        }
      }

      previousCountRef.current = data.length;
      setNotifications(data);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (id: string) => {
    try {
      const token = getToken();
      if (!token) return;

      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: token,
        },
      });

      loadNotifications();
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
    }
  };

  return {
    notifications,
    loadNotifications,
    markAsRead,
  };
}
