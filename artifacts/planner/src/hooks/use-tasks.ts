import { useLocalStorage } from "./use-local-storage";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  priority: Priority;
  category: string;
  completed: boolean;
  createdAt: number;
}

export function useTasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>("planner_tasks", []);
  const [categories, setCategories] = useLocalStorage<string[]>("planner_task_categories", [
    "Autocuidado",
    "Faculdade",
    "Domésticas"
  ]);

  const addTask = (task: Omit<Task, "id" | "createdAt" | "completed">) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      createdAt: Date.now(),
    };
    setTasks([...tasks, newTask]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const addCategory = (category: string) => {
    if (!categories.includes(category)) {
      setCategories([...categories, category]);
    }
  };

  const deleteCategory = (category: string) => {
    setCategories(categories.filter((c) => c !== category));
  };

  return {
    tasks,
    categories,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addCategory,
    deleteCategory,
  };
}
