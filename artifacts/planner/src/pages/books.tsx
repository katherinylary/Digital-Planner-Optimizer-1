import { useState } from "react";
import { useBooks } from "@/hooks/use-books";
import type { Book } from "@/hooks/use-books";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookMarked, Plus, Trash2, Star, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(value === star ? 0 : star)} className="transition-transform hover:scale-110">
          <Star className={cn("h-5 w-5", star <= value ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
        </button>
      ))}
    </div>
  );
}

type BookForm = { title: string; author: string; status: Book["status"]; rating: number; notes: string };
const BLANK: BookForm = { title: "", author: "", status: "want", rating: 0, notes: "" };

function BookFormFields({ form, setForm }: { form: BookForm; setForm: (f: BookForm) => void }) {
  return (
    <>
      <Input placeholder="Título do livro" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Input placeholder="Autor" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} />
      <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as Book["status"] })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="want">Quero Ler</SelectItem>
          <SelectItem value="reading">Lendo</SelectItem>
          <SelectItem value="finished">Finalizado</SelectItem>
        </SelectContent>
      </Select>
      <div>
        <p className="text-sm text-muted-foreground mb-1">Avaliação</p>
        <StarRating value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
      </div>
      <Textarea placeholder="Pontos principais / anotações" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
    </>
  );
}

export default function Books() {
  const { books, addBook, updateBook, deleteBook } = useBooks();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BookForm>(BLANK);

  const [editOpen, setEditOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editForm, setEditForm] = useState<BookForm>(BLANK);

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addBook(form);
    setForm(BLANK);
    setOpen(false);
  };

  const openEdit = (book: Book) => {
    setEditingBook(book);
    setEditForm({ title: book.title, author: book.author, status: book.status, rating: book.rating || 0, notes: book.notes || "" });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingBook || !editForm.title.trim()) return;
    updateBook(editingBook.id, editForm);
    setEditOpen(false);
    setEditingBook(null);
  };

  const renderBookList = (status: Book["status"]) => {
    const filtered = books.filter((b) => b.status === status);
    if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8">Nenhum livro aqui ainda 📖</p>;
    return (
      <div className="space-y-3">
        {filtered.map((book) => (
          <Card key={book.id} data-testid={`book-${book.id}`}>
            <CardContent className="py-4 px-4">
              <div className="flex justify-between items-start gap-3 group">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium">{book.title}</h3>
                  <p className="text-sm text-muted-foreground">{book.author}</p>
                  {book.rating > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className={cn("h-3.5 w-3.5", s <= book.rating ? "fill-yellow-400 text-yellow-400" : "text-muted")} />)}
                    </div>
                  )}
                  {book.notes && <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{book.notes}</p>}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {status !== "finished" && (
                    <Select value={book.status} onValueChange={(v) => updateBook(book.id, { status: v as Book["status"] })}>
                      <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="want">Quero Ler</SelectItem>
                        <SelectItem value="reading">Lendo</SelectItem>
                        <SelectItem value="finished">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <button onClick={() => openEdit(book)} className="text-muted-foreground hover:text-primary transition-colors p-1 opacity-0 group-hover:opacity-100" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => deleteBook(book.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1 opacity-0 group-hover:opacity-100">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <BookMarked className="h-6 w-6" /> Livros
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="button-add-book"><Plus className="h-4 w-4 mr-1" /> Novo Livro</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif italic">Adicionar Livro</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <BookFormFields form={form} setForm={setForm} />
              <Button onClick={handleAdd} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif italic">Editar Livro</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <BookFormFields form={editForm} setForm={setEditForm} />
            <Button onClick={handleEdit} className="w-full">Salvar alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="want">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="want">Quero Ler ({books.filter((b) => b.status === "want").length})</TabsTrigger>
          <TabsTrigger value="reading">Lendo ({books.filter((b) => b.status === "reading").length})</TabsTrigger>
          <TabsTrigger value="finished">Finalizados ({books.filter((b) => b.status === "finished").length})</TabsTrigger>
        </TabsList>
        <TabsContent value="want" className="mt-4">{renderBookList("want")}</TabsContent>
        <TabsContent value="reading" className="mt-4">{renderBookList("reading")}</TabsContent>
        <TabsContent value="finished" className="mt-4">{renderBookList("finished")}</TabsContent>
      </Tabs>
    </div>
  );
}
