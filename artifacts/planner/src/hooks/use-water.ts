import { useLocalStorage } from "./use-local-storage";

export interface WaterIntake {
  date: string;
  glasses: number;
}

export function useWater() {
  const [waterRecords, setWaterRecords] = useLocalStorage<WaterIntake[]>("planner_water", []);

  const getWaterForDate = (date: string) => {
    return waterRecords.find((r) => r.date === date)?.glasses || 0;
  };

  const setWaterForDate = (date: string, glasses: number) => {
    const existingIndex = waterRecords.findIndex((r) => r.date === date);
    if (existingIndex >= 0) {
      const newRecords = [...waterRecords];
      newRecords[existingIndex] = { date, glasses };
      setWaterRecords(newRecords);
    } else {
      setWaterRecords([...waterRecords, { date, glasses }]);
    }
  };

  return {
    getWaterForDate,
    setWaterForDate,
  };
}
