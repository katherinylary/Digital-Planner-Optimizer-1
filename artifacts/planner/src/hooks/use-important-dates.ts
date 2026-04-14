import { useLocalStorage } from "./use-local-storage";

export interface ImportantDate {
  id: string;
  title: string;
  date: string;
  category: "birthday" | "anniversary" | "deadline" | "holiday" | "custom";
  recurring: boolean;
  description: string;
}

export function useImportantDates() {
  const [dates, setDates] = useLocalStorage<ImportantDate[]>("planner_important_dates", []);

  const addDate = (d: Omit<ImportantDate, "id">) => {
    setDates([...dates, { ...d, id: crypto.randomUUID() }]);
  };

  const updateDate = (id: string, updates: Partial<ImportantDate>) => {
    setDates(dates.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDate = (id: string) => {
    setDates(dates.filter((d) => d.id !== id));
  };

  return { dates, addDate, updateDate, deleteDate };
}
