import { useLocalStorage } from "./use-local-storage";

export interface WaterIntake {
  date: string;
  liters: number;
}

export function useWater() {
  const [waterRecords, setWaterRecords] = useLocalStorage<WaterIntake[]>("planner_water_liters", []);

  const getLitersForDate = (date: string): number => {
    return waterRecords.find((r) => r.date === date)?.liters ?? 0;
  };

  const setLitersForDate = (date: string, liters: number) => {
    const clamped = Math.max(0, Math.min(4, Math.round(liters * 2) / 2));
    const existingIndex = waterRecords.findIndex((r) => r.date === date);
    if (existingIndex >= 0) {
      const newRecords = [...waterRecords];
      newRecords[existingIndex] = { date, liters: clamped };
      setWaterRecords(newRecords);
    } else {
      setWaterRecords([...waterRecords, { date, liters: clamped }]);
    }
  };

  const getMonthlyAverage = (monthStr: string): number => {
    const records = waterRecords.filter((r) => r.date.startsWith(monthStr));
    if (records.length === 0) return 0;
    const sum = records.reduce((s, r) => s + r.liters, 0);
    return Math.round((sum / records.length) * 10) / 10;
  };

  const getMonthlyRecords = (monthStr: string): WaterIntake[] => {
    return waterRecords.filter((r) => r.date.startsWith(monthStr));
  };

  return {
    getLitersForDate,
    setLitersForDate,
    getMonthlyAverage,
    getMonthlyRecords,
    waterRecords,
  };
}
