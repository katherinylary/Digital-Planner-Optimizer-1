import { useLocalStorage } from "./use-local-storage";

export interface SelfCareRitual {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom" | "once";
  category: "Skincare" | "Cabelo" | "Exercício" | "Meditação" | "Outros";
  completed: boolean;
}

export function useSelfCare() {
  const [rituals, setRituals] = useLocalStorage<SelfCareRitual[]>("planner_self_care", []);

  const addRitual = (ritual: Omit<SelfCareRitual, "id" | "completed">) => {
    setRituals([...rituals, { ...ritual, id: crypto.randomUUID(), completed: false }]);
  };

  const updateRitual = (id: string, updates: Partial<SelfCareRitual>) => {
    setRituals(rituals.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const toggleRitual = (id: string) => {
    setRituals(rituals.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r)));
  };

  const deleteRitual = (id: string) => {
    setRituals(rituals.filter((r) => r.id !== id));
  };

  return { rituals, addRitual, updateRitual, toggleRitual, deleteRitual };
}
