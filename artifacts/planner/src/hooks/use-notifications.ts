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
  const [toast, setToast] = useState<string | null>(null);

  const previousUnreadIdsRef = useRef<string[]>([]);
  const toastTimeoutRef = useRef<number | null>(null);

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
      setNotifications(data);

      const unread = data.filter((n) => !n.read);
      const unreadIds = unread.map((n) => n.id);

      const newestUnread = unread.find(
        (n) => !previousUnreadIdsRef.current.includes(n.id)
      );

      if (newestUnread) {
        setToast(newestUnread.message);

        if (toastTimeoutRef.current) {
          window.clearTimeout(toastTimeoutRef.current);
        }

        toastTimeoutRef.current = window.setTimeout(() => {
          setToast(null);
        }, 4000);
      }

      previousUnreadIdsRef.current = unreadIds;
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();

    const interval = window.setInterval(() => {
      loadNotifications();
    }, 10000);

    return () => {
      window.clearInterval(interval);

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
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
    toast,
    clearToast: () => setToast(null),
  };
}
