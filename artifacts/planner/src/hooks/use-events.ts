import { useLocalStorage } from "./use-local-storage";

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  endTime?: string;
  description?: string;
  category: string;
}

export function useEvents() {
  const [events, setEvents] = useLocalStorage<Event[]>("planner_events", []);

  const addEvent = (event: Omit<Event, "id">) => {
    const newEvent: Event = { ...event, id: crypto.randomUUID() };
    setEvents([...events, newEvent]);
  };

  const updateEvent = (id: string, updates: Partial<Event>) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return { events, addEvent, updateEvent, deleteEvent };
}
