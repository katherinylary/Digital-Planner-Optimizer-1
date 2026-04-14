import { useLocalStorage } from "./use-local-storage";

export interface Course {
  id: string;
  name: string;
  description: string;
  institution: string;
  hasCertificate: boolean;
  certificateHours: number;
  status: "want" | "in-progress" | "completed";
  progress: number;
  createdAt: number;
}

export function useCourses() {
  const [courses, setCourses] = useLocalStorage<Course[]>("planner_courses", []);

  const addCourse = (course: Omit<Course, "id" | "createdAt">) => {
    setCourses([...courses, { ...course, id: crypto.randomUUID(), createdAt: Date.now() }]);
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    setCourses(courses.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCourse = (id: string) => {
    setCourses(courses.filter((c) => c.id !== id));
  };

  return { courses, addCourse, updateCourse, deleteCourse };
}
