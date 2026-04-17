import { useState, useEffect, useCallback } from "react";

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
  isOwner?: boolean;
  ownerEmail?: string;
}

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);

  const loadEvents = useCallback(async () => {
    const token = getToken();
    if (!token) return;

    const res = await fetch(${API_URL}/events, {
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();
    if (res.ok) setEvents(data);
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const addEvent = async (event: any) => {
    const token = getToken();

    const res = await fetch(`${API_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(event),
    });

    const data = await res.json();
    if (res.ok) setEvents((prev) => [...prev, data]);
  };

  const updateEvent = async (id: string, updates: any) => {
    const token = getToken();

    const res = await fetch(`${API_URL}/events/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (res.ok) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? data : e))
      );
    }
  };

  const deleteEvent = async (id: string) => {
    const token = getToken();

    await fetch(`${API_URL}/events/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  return { events, addEvent, updateEvent, deleteEvent };
}
