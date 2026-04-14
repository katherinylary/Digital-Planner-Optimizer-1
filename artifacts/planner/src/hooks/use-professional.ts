import { useLocalStorage } from "./use-local-storage";

export interface ProfessionalActivity {
  id: string;
  title: string;
  priority: "low" | "medium" | "high" | "urgent";
  labels: string[];
  dueDate?: string;
  completed: boolean;
  createdAt: number;
}

export interface WorkReport {
  id: string;
  date: string;
  content: string;
  createdAt: number;
}

export interface ProfessionalReminder {
  id: string;
  title: string;
  date: string;
  description: string;
}

export function useProfessional() {
  const [activities, setActivities] = useLocalStorage<ProfessionalActivity[]>("planner_prof_activities", []);
  const [reports, setReports] = useLocalStorage<WorkReport[]>("planner_work_reports", []);
  const [reminders, setReminders] = useLocalStorage<ProfessionalReminder[]>("planner_prof_reminders", []);
  const [labels, setLabels] = useLocalStorage<string[]>("planner_prof_labels", ["Reunião", "Projeto", "Entrega", "Follow-up"]);

  const addActivity = (a: Omit<ProfessionalActivity, "id" | "createdAt" | "completed">) => {
    setActivities([...activities, { ...a, id: crypto.randomUUID(), completed: false, createdAt: Date.now() }]);
  };

  const updateActivity = (id: string, updates: Partial<ProfessionalActivity>) => {
    setActivities(activities.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  const toggleActivity = (id: string) => {
    setActivities(activities.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a)));
  };

  const deleteActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
  };

  const saveReport = (date: string, content: string) => {
    const existing = reports.findIndex((r) => r.date === date);
    if (existing >= 0) {
      const updated = [...reports];
      updated[existing] = { ...updated[existing], content };
      setReports(updated);
    } else {
      setReports([...reports, { id: crypto.randomUUID(), date, content, createdAt: Date.now() }]);
    }
  };

  const getReportForDate = (date: string) => reports.find((r) => r.date === date);

  const addReminder = (r: Omit<ProfessionalReminder, "id">) => {
    setReminders([...reminders, { ...r, id: crypto.randomUUID() }]);
  };

  const deleteReminder = (id: string) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  const addLabel = (label: string) => {
    if (!labels.includes(label)) setLabels([...labels, label]);
  };

  return {
    activities, reports, reminders, labels,
    addActivity, updateActivity, toggleActivity, deleteActivity,
    saveReport, getReportForDate,
    addReminder, deleteReminder, addLabel,
  };
}
