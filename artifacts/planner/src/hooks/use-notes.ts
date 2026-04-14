import { useLocalStorage } from "./use-local-storage";

export interface Note {
  id: string;
  date: string;
  content: string;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>("planner_notes", []);

  const addNote = (date: string, content: string) => {
    setNotes([...notes, { id: crypto.randomUUID(), date, content }]);
  };

  const updateNote = (id: string, content: string) => {
    setNotes(notes.map((n) => (n.id === id ? { ...n, content } : n)));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  const getNotesForDate = (date: string) => notes.filter((n) => n.date === date);

  return { notes, addNote, updateNote, deleteNote, getNotesForDate };
}
