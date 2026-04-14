import { useLocalStorage } from "./use-local-storage";

export interface DiaryEntry {
  id: string;
  date: string;
  content: string;
  mood?: string;
  stickers: string[];
  createdAt: number;
}

export function useDiary() {
  const [entries, setEntries] = useLocalStorage<DiaryEntry[]>("planner_diary", []);

  const getEntryForDate = (date: string) => {
    return entries.find((e) => e.date === date);
  };

  const saveEntry = (date: string, content: string, mood: string | undefined, stickers: string[]) => {
    const existingIndex = entries.findIndex((e) => e.date === date);
    if (existingIndex >= 0) {
      const newEntries = [...entries];
      newEntries[existingIndex] = {
        ...newEntries[existingIndex],
        content,
        mood,
        stickers,
      };
      setEntries(newEntries);
    } else {
      setEntries([
        ...entries,
        {
          id: crypto.randomUUID(),
          date,
          content,
          mood,
          stickers,
          createdAt: Date.now(),
        },
      ]);
    }
  };

  return {
    entries,
    getEntryForDate,
    saveEntry,
  };
}
