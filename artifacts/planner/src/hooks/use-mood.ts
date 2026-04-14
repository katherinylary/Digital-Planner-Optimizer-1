import { useLocalStorage } from "./use-local-storage";

export interface DailyMood {
  date: string;
  emoji: string;
}

export function useMood() {
  const [moodRecords, setMoodRecords] = useLocalStorage<DailyMood[]>("planner_mood", []);

  const getMoodForDate = (date: string) => {
    return moodRecords.find((r) => r.date === date)?.emoji || null;
  };

  const setMoodForDate = (date: string, emoji: string) => {
    const existingIndex = moodRecords.findIndex((r) => r.date === date);
    if (existingIndex >= 0) {
      const newRecords = [...moodRecords];
      newRecords[existingIndex] = { date, emoji };
      setMoodRecords(newRecords);
    } else {
      setMoodRecords([...moodRecords, { date, emoji }]);
    }
  };

  return {
    getMoodForDate,
    setMoodForDate,
  };
}
