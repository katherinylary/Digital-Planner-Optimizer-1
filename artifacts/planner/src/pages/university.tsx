import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import type { Priority } from "@/hooks/use-tasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<Priority, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};

const PRIORITY_LABELS: Record<Priority, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };
const TYPE_LABELS: Record<string, string> = { assignment: "Trabalho", exam: "Prova", project: "Projeto", reading: "Leitura" };

export default function University() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", priority: "medium" as Priority, type: "assignment", subject: "" });

  const uniTasks = tasks.filter((t) => t.category === "Faculdade");

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addTask({
      title: form.title,
      description: `[${TYPE_LABELS[form.type] || form.type}] ${form.subject ? `${form.subject} - ` : ""}${form.description}`,
      date: form.date,
      time: form.time,
      priority: form.priority,
      category: "Faculdade",
    });
    setForm({ title: "", description: "", date: "", time: "", priority: "medium", type: "assignment", subject: "" });
    setOpen(false);
  };

  const pending = uniTasks.filter((t) => !t.completed).sort((a, b) => {
    const order: Record<Priority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    return order[a.priority] - order[b.priority];
  });
  const completed = uniTasks.filter((t) => t.completed);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <GraduationCap className="h-6 w-6" /> Faculdade
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="button-add-uni"><Plus className="h-4 w-4 mr-1" /> Nova Atividade</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif italic">Nova Atividade da Faculdade</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Nome da atividade" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-uni-title" />
              <Input placeholder="Disciplina" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} data-testid="input-uni-subject" />
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger data-testid="select-uni-type"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Trabalho</SelectItem>
                  <SelectItem value="exam">Prova</SelectItem>
                  <SelectItem value="project">Projeto</SelectItem>
                  <SelectItem value="reading">Leitura</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as Priority })}>
                <SelectTrigger data-testid="select-uni-priority"><SelectValue placeholder="Prioridade" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                </SelectContent>
              </Select>
              <Textarea placeholder="Descrição da atividade" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-uni-description" />
              <div className="flex gap-2">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="input-uni-date" />
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} data-testid="input-uni-time" />
              </div>
              <Button onClick={handleAdd} className="w-full" data-testid="button-save-uni">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {uniTasks.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhuma atividade da faculdade. Bons estudos! 📚</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pendentes ({pending.length})</h2>
              {pending.map((task) => (
                <Card key={task.id} data-testid={`uni-task-${task.id}`}>
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge variant="secondary" className={cn("text-xs", PRIORITY_COLORS[task.priority])}>{PRIORITY_LABELS[task.priority]}</Badge>
                        {task.date && <span className="text-xs text-muted-foreground">{task.date}{task.time ? ` ${task.time}` : ""}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {completed.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Concluídas ({completed.length})</h2>
              {completed.map((task) => (
                <Card key={task.id} className="opacity-60">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <Checkbox checked={task.completed} onCheckedChange={() => toggleTask(task.id)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className="text-sm line-through flex-1">{task.title}</span>
                    <button onClick={() => deleteTask(task.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
