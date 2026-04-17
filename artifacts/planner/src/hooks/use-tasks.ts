import { useCallback, useEffect, useState } from "react";
import { useLocalStorage } from "./use-local-storage";

const API_URL = "https://digital-planner-optimizer-1-4.onrender.com";
const TOKEN_KEY = "planner_auth_token";

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

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [categories, setCategories] = useLocalStorage<string[]>(
    "planner_task_categories",
    ["Autocuidado", "Faculdade", "Domésticas"]
  );

  const loadTasks = useCallback(async () => {
    const token = getToken();

    if (!token) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/tasks`, {
        headers: {
          Authorization: token,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Erro ao carregar tarefas:", data);
        setTasks([]);
      } else {
        setTasks(data);
      }
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const addTask = useCallback(
    async (task: Omit<Task, "id" | "createdAt" | "completed">) => {
      const token = getToken();
      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const payload = {
        ...task,
        completed: false,
        createdAt: Date.now(),
      };

      const res = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao criar tarefa");
      }

      setTasks((prev) => [data, ...prev]);
      return data;
    },
    []
  );

  const updateTask = useCallback(
    async (id: string, updates: Partial<Task>) => {
      const token = getToken();
      if (!token) {
        throw new Error("Usuário não autenticado");
      }

      const current = tasks.find((t) => t.id === id);
      if (!current) return;

      const payload = {
        ...current,
        ...updates,
      };

      const res = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao atualizar tarefa");
      }

      setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    },
    [tasks]
  );

  const toggleTask = useCallback(
    async (id: string) => {
      const current = tasks.find((t) => t.id === id);
      if (!current) return;

      await updateTask(id, { completed: !current.completed });
    },
    [tasks, updateTask]
  );

  const deleteTask = useCallback(async (id: string) => {
    const token = getToken();
    if (!token) {
      throw new Error("Usuário não autenticado");
    }

    const res = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: token,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Erro ao deletar tarefa");
    }

    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
    isLoading,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addCategory,
    deleteCategory,
    reloadTasks: loadTasks,
  };
}
