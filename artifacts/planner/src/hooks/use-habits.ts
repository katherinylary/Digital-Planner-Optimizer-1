import { useLocalStorage } from "./use-local-storage";

export interface Habit {
  id: string;
  title: string;
  frequency: "daily" | "weekdays" | "weekends" | "custom";
  customDays?: number[]; // 0-6
  category: string;
  completedDates: string[]; // YYYY-MM-DD
  streak: number;
  createdAt: number;
}

export function useHabits() {
  const [habits, setHabits] = useLocalStorage<Habit[]>("planner_habits", []);
  const [categories, setCategories] = useLocalStorage<string[]>("planner_habit_categories", [
    "Autocuidado",
    "Estudos",
    "Saúde",
  ]);

  const addHabit = (habit: Omit<Habit, "id" | "completedDates" | "streak" | "createdAt">) => {
    const newHabit: Habit = {
      ...habit,
      id: crypto.randomUUID(),
      completedDates: [],
      streak: 0,
      createdAt: Date.now(),
    };
    setHabits([...habits, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<Habit>) => {
    setHabits(habits.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter((h) => h.id !== id));
  };

  const toggleHabitDate = (id: string, date: string) => {
    setHabits(
      habits.map((h) => {
        if (h.id !== id) return h;
        const hasCompleted = h.completedDates.includes(date);
        const completedDates = hasCompleted
          ? h.completedDates.filter((d) => d !== date)
          : [...h.completedDates, date];
        // Calculate basic streak (simplified)
        return { ...h, completedDates };
      })
    );
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) setCategories([...categories, category]);
  };

  const deleteCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  return { habits, categories, addHabit, updateHabit, deleteHabit, toggleHabitDate, addCategory, deleteCategory };
}
