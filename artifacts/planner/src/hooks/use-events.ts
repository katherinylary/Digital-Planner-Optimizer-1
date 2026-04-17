import { useCallback, useEffect, useState } from "react";

const API_URL = "https://digital-planner-optimizer-1-4.onrender.com";
const TOKEN_KEY = "planner_auth_token";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  description?: string;
  category: string;

  participantEmails?: string[]; // 👈 novo
  isOwner?: boolean;            // 👈 novo
  ownerEmail?: string;          // 👈 opcional
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/events`, {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro ao carregar eventos:", data);
        setEvents([]);
      } else {
        setEvents(data);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const addEvent = async (event: Omit<Event, "id">) => {
  const token = localStorage.getItem("planner_auth_token");

  const res = await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token || "",
    },
    body: JSON.stringify(event),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Erro ao criar evento");
  }

  setEvents((prev) => [data, ...prev]);
};

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao criar evento");
    }

    setEvents((prev) =>
      [...prev, data].sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.time.localeCompare(b.time);
      })
    );
  }, []);

  const updateEvent = useCallback(async (id: string, updates: Partial<Event>) => {
    const token = getToken();
    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao atualizar evento");
    }

    setEvents((prev) =>
      prev
        .map((e) => (e.id === id ? data : e))
        .sort((a, b) => {
          const d = a.date.localeCompare(b.date);
          return d !== 0 ? d : a.time.localeCompare(b.time);
        })
    );
  }, []);

  const deleteEvent = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao deletar evento");
    }

    setEvents((prev) => prev.filter((e) => e.id !== id));
  }, []);

  return {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    reloadEvents: loadEvents,
  };
}
