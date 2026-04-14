import { useLocalStorage } from "./use-local-storage";

export interface Book {
  id: string;
  title: string;
  author: string;
  status: "want" | "reading" | "finished";
  rating: number;
  notes: string;
  createdAt: number;
}

export function useBooks() {
  const [books, setBooks] = useLocalStorage<Book[]>("planner_books", []);

  const addBook = (book: Omit<Book, "id" | "createdAt">) => {
    setBooks([...books, { ...book, id: crypto.randomUUID(), createdAt: Date.now() }]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(books.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter((b) => b.id !== id));
  };

  return { books, addBook, updateBook, deleteBook };
}
