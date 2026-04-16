import { useState } from "react";
import { format, subDays } from "date-fns";
import { useHabits } from "@/hooks/use-habits";
import type { Habit } from "@/hooks/use-habits";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Activity, Plus, Trash2, FolderPlus, Flame, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const FREQ_LABELS: Record<string, string> = {
  daily: "Diário", weekdays: "Dias úteis", weekends: "Fins de semana", custom: "Personalizado",
};

function HabitForm({ form, setForm, categories }: {
  form: { title: string; frequency: Habit["frequency"]; category: string };
  setForm: (f: typeof form) => void;
  categories: string[];
}) {
  return (
    <>
      <Input placeholder="Nome do hábito" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
      <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as Habit["frequency"] })}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Diário</SelectItem>
          <SelectItem value="weekdays">Dias úteis</SelectItem>
          <SelectItem value="weekends">Fins de semana</SelectItem>
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

export default function Habits() {
  const { habits, categories, addHabit, updateHabit, toggleHabitDate, deleteHabit, addCategory } = useHabits();
  const [activeTab, setActiveTab] = useState("Todos");
  const [open, setOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [form, setForm] = useState({ title: "", frequency: "daily" as Habit["frequency"], category: categories[0] || "" });

  const [editOpen, setEditOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editForm, setEditForm] = useState({ title: "", frequency: "daily" as Habit["frequency"], category: "" });

  const today = format(new Date(), "yyyy-MM-dd");
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), "yyyy-MM-dd"));

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addHabit(form);
    setForm({ title: "", frequency: "daily", category: categories[0] || "" });
    setOpen(false);
  };

  const openEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setEditForm({ title: habit.title, frequency: habit.frequency, category: habit.category });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingHabit || !editForm.title.trim()) return;
    updateHabit(editingHabit.id, editForm);
    setEditOpen(false);
    setEditingHabit(null);
  };

  const handleAddCategory = () => {
    if (newCat.trim()) { addCategory(newCat.trim()); setNewCat(""); setCatOpen(false); }
  };

  const filtered = activeTab === "Todos" ? habits : habits.filter((h) => h.category === activeTab);

  const getStreak = (completedDates: string[]) => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = format(d, "yyyy-MM-dd");
      if (completedDates.includes(ds)) { streak++; d.setDate(d.getDate() - 1); } else break;
    }
    return streak;
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <Activity className="h-6 w-6" /> Hábitos
        </h1>
        <div className="flex gap-2">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><FolderPlus className="h-4 w-4 mr-1" /> Nova Guia</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Nova Categoria</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nome da categoria" value={newCat} onChange={(e) => setNewCat(e.target.value)} />
                <Button onClick={handleAddCategory} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button size="sm" data-testid="button-add-habit"><Plus className="h-4 w-4 mr-1" /> Novo Hábito</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Novo Hábito</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <HabitForm form={form} setForm={setForm} categories={categories} />
                <Button onClick={handleAdd} className="w-full">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-serif italic">Editar Hábito</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <HabitForm form={editForm} setForm={setEditForm} categories={categories} />
            <Button onClick={handleEdit} className="w-full">Salvar alterações</Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setActiveTab("Todos")} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors", activeTab === "Todos" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")} data-testid="tab-all-habits">Todos</button>
        {categories.map((c) => (
          <button key={c} onClick={() => setActiveTab(c)} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors", activeTab === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhum hábito ainda. Comece criando um! 🌟</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((habit) => {
            const streak = getStreak(habit.completedDates);
            return (
              <Card key={habit.id} data-testid={`habit-${habit.id}`}>
                <CardContent className="py-4 px-4">
                  <div className="flex items-start justify-between mb-3 group">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium">{habit.title}</h3>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">{habit.category}</Badge>
                        <Badge variant="secondary" className="text-xs">{FREQ_LABELS[habit.frequency]}</Badge>
                        {streak > 0 && (
                          <span className="text-xs text-orange-500 flex items-center gap-0.5"><Flame className="h-3 w-3" />{streak} dias</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(habit)} className="text-muted-foreground hover:text-primary transition-colors p-1" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteHabit(habit.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {last7.map((d) => {
                      const done = habit.completedDates.includes(d);
                      const dayLabel = format(new Date(d + "T12:00:00"), "EEE", { locale: undefined }).charAt(0).toUpperCase();
                      return (
                        <button key={d} onClick={() => toggleHabitDate(habit.id, d)} className="flex flex-col items-center gap-1 flex-1">
                          <span className="text-[10px] text-muted-foreground">{dayLabel}</span>
                          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all", done ? "bg-primary text-primary-foreground scale-105" : "bg-muted text-muted-foreground hover:bg-muted/80")}>
                            {done ? "✓" : format(new Date(d + "T12:00:00"), "d")}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
