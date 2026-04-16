import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import type { Task, Priority } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, Trash2, FolderPlus, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<Priority, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };

function TaskForm({ form, setForm, categories }: {
  form: { title: string; description: string; date: string; time: string; priority: Priority; category: string };
  setForm: (f: typeof form) => void;
  categories: string[];
}) {
  return (
    <>
      <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Textarea placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <div className="flex gap-2">
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
      </div>
      <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
        <SelectTrigger><SelectValue placeholder="Prioridade" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Baixa</SelectItem>
          <SelectItem value="medium">Média</SelectItem>
          <SelectItem value="high">Alta</SelectItem>
          <SelectItem value="urgent">Urgente</SelectItem>
        </SelectContent>
      </Select>
      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
        <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
        <SelectContent>
          {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent>
      </Select>
    </>
  );
}

export default function Tasks() {
  const { tasks, categories, addTask, updateTask, toggleTask, deleteTask, addCategory } = useTasks();
  const [activeTab, setActiveTab] = useState("Todas");
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", priority: "medium" as Priority, category: categories[0] || "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", date: "", time: "", priority: "medium" as Priority, category: "" });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask(form);
    setForm({ title: "", description: "", date: "", time: "", priority: "medium", category: categories[0] || "" });
    setOpen(false);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({ title: task.title, description: task.description || "", date: task.date || "", time: task.time || "", priority: task.priority, category: task.category });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingTask || !editForm.title.trim()) return;
    updateTask(editingTask.id, editForm);
    setEditOpen(false);
    setEditingTask(null);
  };

  const handleAddCategory = () => {
    if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); setCatOpen(false); }
  };

  const filtered = activeTab === "Todas" ? tasks : tasks.filter((t) => t.category === activeTab);
  const pending = filtered.filter((t) => !t.completed);
  const completed = filtered.filter((t) => t.completed);

  const renderTask = (task: Task, done = false) => (
    <Card key={task.id} className={cn(done && "opacity-60")} data-testid={done ? `task-done-${task.id}` : `task-${task.id}`}>
      <CardContent className="py-3 px-4 flex items-start gap-3 group">
        <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium text-sm", done && "line-through")}>{task.title}</p>
          {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>}
          {!done && (
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <Badge variant="secondary" className={cn("text-xs", PRIORITY_COLORS[task.priority])}>{PRIORITY_LABELS[task.priority]}</Badge>
              <Badge variant="outline" className="text-xs">{task.category}</Badge>
              {task.date && <span className="text-xs text-muted-foreground">{task.date}{task.time ? ` ${task.time}` : ""}</span>}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          {!done && (
            <button onClick={() => openEdit(task)} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <CheckSquare className="h-6 w-6" /> Tarefas
        </h1>
        <div className="flex gap-2">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-category"><FolderPlus className="h-4 w-4 mr-1" /> Nova Guia</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Nova Categoria</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nome da categoria" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
                <Button onClick={handleAddCategory} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-task"><Plus className="h-4 w-4 mr-1" /> Nova Tarefa</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Nova Tarefa</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <TaskForm form={form} setForm={setForm} categories={categories} />
                <Button onClick={handleAdd} className="w-full">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif italic">Editar Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <TaskForm form={editForm} setForm={setEditForm} categories={categories} />
            <Button onClick={handleEdit} className="w-full">Salvar alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab("Todas")} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors", activeTab === "Todas" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")} data-testid="tab-all">Todas</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveTab(c)} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors", activeTab === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80")} data-testid={`tab-${c}`}>{c}</button>
        ))}
      </div>

      {pending.length === 0 && completed.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhuma tarefa ainda. Comece adicionando uma! ✨</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pendentes ({pending.length})</h2>
              {pending.map((t) => renderTask(t, false))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Concluídas ({completed.length})</h2>
              {completed.map((t) => renderTask(t, true))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
