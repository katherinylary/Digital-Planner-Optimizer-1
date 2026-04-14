import { useLocalStorage } from "./use-local-storage";

export interface DailyGoal {
  id: string;
  date: string;
  title: string;
  completed: boolean;
}

export function useGoals() {
  const [goals, setGoals] = useLocalStorage<DailyGoal[]>("planner_goals", []);

  const getGoalsForDate = (date: string) => {
    return goals.filter((g) => g.date === date);
  };

  const addGoal = (date: string, title: string) => {
    const newGoal: DailyGoal = {
      id: crypto.randomUUID(),
      date,
      title,
      completed: false,
    };
    setGoals([...goals, newGoal]);
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g)));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter((g) => g.id !== id));
  };

  return {
    getGoalsForDate,
    addGoal,
    toggleGoal,
    deleteGoal,
  };
}
