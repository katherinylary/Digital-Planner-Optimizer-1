import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProfessional } from "@/hooks/use-professional";
import type { ProfessionalActivity } from "@/hooks/use-professional";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, Plus, Trash2, FileText, Bell, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700", medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700", urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<string, string> = { low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente" };

export default function Professional() {
  const { activities, reminders, labels, addActivity, toggleActivity, deleteActivity, saveReport, getReportForDate, addReminder, deleteReminder, addLabel } = useProfessional();
  const today = format(new Date(), "yyyy-MM-dd");
  const [actOpen, setActOpen] = useState(false);
  const [remOpen, setRemOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [reportContent, setReportContent] = useState(getReportForDate(today)?.content || "");
  const [actForm, setActForm] = useState({ title: "", priority: "medium" as ProfessionalActivity["priority"], labels: [] as string[], dueDate: "" });
  const [remForm, setRemForm] = useState({ title: "", date: "", description: "" });

  const handleAddActivity = () => {
    if (!actForm.title.trim()) return;
    addActivity(actForm);
    setActForm({ title: "", priority: "medium", labels: [], dueDate: "" });
    setActOpen(false);
  };

  const handleAddReminder = () => {
    if (!remForm.title.trim()) return;
    addReminder(remForm);
    setRemForm({ title: "", date: "", description: "" });
    setRemOpen(false);
  };

  const handleSaveReport = () => { saveReport(today, reportContent); };

  const pending = activities.filter((a) => !a.completed);
  const completed = activities.filter((a) => a.completed);

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
        <Briefcase className="h-6 w-6" /> Profissional
      </h1>

      <Tabs defaultValue="activities">
        <Tabs defaultValue="dashboard">
  <TabsList className="w-full grid grid-cols-5">
    <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
    <TabsTrigger value="cashflow">Fluxo de Caixa</TabsTrigger>
    <TabsTrigger value="budget">Orçamentos</TabsTrigger>
    <TabsTrigger value="purchases">Compras</TabsTrigger>
    <TabsTrigger value="report">Relatórios</TabsTrigger>
  </TabsList>
          <TabsContent value="dashboard" className="mt-4">
  <div className="grid gap-4 md:grid-cols-4">

    <Card>
      <CardHeader>
        <CardTitle>Saldo Atual</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-green-600">
          R$ 125.000
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Receitas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-blue-600">
          R$ 280.000
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-red-600">
          R$ 155.000
        </p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Orçamentos</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-primary">
          18
        </p>
      </CardContent>
    </Card>

  </div>
</TabsContent>
          <TabsContent value="cashflow" className="mt-4">
  <Card>
    <CardHeader>
      <CardTitle>Fluxo de Caixa</CardTitle>
    </CardHeader>

    <CardContent className="space-y-3">

      <div className="flex justify-between border-b pb-2">
        <span>Pagamento Cliente A</span>
        <span className="text-green-600 font-semibold">
          + R$ 35.000
        </span>
      </div>

      <div className="flex justify-between border-b pb-2">
        <span>Compra de Materiais</span>
        <span className="text-red-600 font-semibold">
          - R$ 12.500
        </span>
      </div>

      <div className="flex justify-between border-b pb-2">
        <span>Folha de Pagamento</span>
        <span className="text-red-600 font-semibold">
          - R$ 28.000
        </span>
      </div>

    </CardContent>
  </Card>
</TabsContent>
          <TabsContent value="budget" className="mt-4">
  <Card>
    <CardHeader>
      <CardTitle>Controle de Orçamentos</CardTitle>
    </CardHeader>

    <CardContent className="space-y-3">

      <div className="p-3 border rounded-lg">
        <p className="font-medium">
          Instalação Elétrica - Condomínio Alpha
        </p>

        <p className="text-sm text-muted-foreground">
          Valor: R$ 87.000
        </p>
      </div>

      <div className="p-3 border rounded-lg">
        <p className="font-medium">
          Subestação Industrial
        </p>

        <p className="text-sm text-muted-foreground">
          Valor: R$ 145.000
        </p>
      </div>

    </CardContent>
  </Card>
</TabsContent>
          <TabsContent value="purchases" className="mt-4">
  <Card>
    <CardHeader>
      <CardTitle>Controle de Compras</CardTitle>
    </CardHeader>

    <CardContent className="space-y-3">

      <div className="flex justify-between border-b pb-2">
        <span>Cabo 35mm²</span>
        <span>R$ 7.200</span>
      </div>

      <div className="flex justify-between border-b pb-2">
        <span>Disjuntores</span>
        <span>R$ 3.800</span>
      </div>

      <div className="flex justify-between border-b pb-2">
        <span>Eletrocalhas</span>
        <span>R$ 2.950</span>
      </div>

    </CardContent>
  </Card>
</TabsContent>

        <TabsContent value="activities" className="space-y-4 mt-4">
          <div className="flex gap-2 justify-end">
            <Dialog open={labelOpen} onOpenChange={setLabelOpen}>
              <DialogTrigger asChild><Button variant="outline" size="sm">+ Etiqueta</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-serif italic">Nova Etiqueta</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Nome" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                  <Button onClick={() => { if (newLabel.trim()) { addLabel(newLabel.trim()); setNewLabel(""); setLabelOpen(false); } }} className="w-full">Criar</Button>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={actOpen} onOpenChange={setActOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Atividade</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-serif italic">Nova Atividade</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Título" value={actForm.title} onChange={(e) => setActForm({ ...actForm, title: e.target.value })} />
                  <Select value={actForm.priority} onValueChange={(v) => setActForm({ ...actForm, priority: v as ProfessionalActivity["priority"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baixa</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={actForm.dueDate} onChange={(e) => setActForm({ ...actForm, dueDate: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    {labels.map((l) => (
                      <button key={l} onClick={() => setActForm({ ...actForm, labels: actForm.labels.includes(l) ? actForm.labels.filter((x) => x !== l) : [...actForm.labels, l] })} className={cn("px-2 py-1 rounded text-xs border transition-colors", actForm.labels.includes(l) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>{l}</button>
                    ))}
                  </div>
                  <Button onClick={handleAddActivity} className="w-full">Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {pending.map((a) => (
            <Card key={a.id}>
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <Checkbox checked={a.completed} onCheckedChange={() => toggleActivity(a.id)} className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{a.title}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className={cn("text-xs", PRIORITY_COLORS[a.priority])}>{PRIORITY_LABELS[a.priority]}</Badge>
                    {a.labels.map((l) => <Badge key={l} variant="outline" className="text-xs">{l}</Badge>)}
                    {a.dueDate && <span className="text-xs text-muted-foreground">{a.dueDate}</span>}
                  </div>
                </div>
                <button onClick={() => deleteActivity(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </CardContent>
            </Card>
          ))}
          {completed.length > 0 && (
            <div className="space-y-2 pt-2">
              <h3 className="text-sm text-muted-foreground uppercase tracking-wider">Concluídas</h3>
              {completed.map((a) => (
                <Card key={a.id} className="opacity-60">
                  <CardContent className="py-2 px-4 flex items-center gap-3">
                    <Checkbox checked={a.completed} onCheckedChange={() => toggleActivity(a.id)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className="text-sm line-through flex-1">{a.title}</span>
                    <button onClick={() => deleteActivity(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="report" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-serif italic flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Relatório do Dia
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">{format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="O que foi trabalhado hoje..." value={reportContent} onChange={(e) => setReportContent(e.target.value)} className="min-h-[200px]" />
              <Button onClick={handleSaveReport}>Salvar Relatório</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif italic flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Agenda Profissional</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activities.filter((a) => a.dueDate).sort((a, b) => (a.dueDate || "").localeCompare(b.dueDate || "")).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                    <div className={cn("w-3 h-3 rounded-full", a.completed ? "bg-green-400" : "bg-primary")} />
                    <div className="flex-1">
                      <p className={cn("text-sm font-medium", a.completed && "line-through text-muted-foreground")}>{a.title}</p>
                      <span className="text-xs text-muted-foreground">{a.dueDate}</span>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", PRIORITY_COLORS[a.priority])}>{PRIORITY_LABELS[a.priority]}</Badge>
                  </div>
                ))}
                {activities.filter((a) => a.dueDate).length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhuma atividade com data</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reminders" className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Dialog open={remOpen} onOpenChange={setRemOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Lembrete</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-serif italic">Novo Lembrete</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Título" value={remForm.title} onChange={(e) => setRemForm({ ...remForm, title: e.target.value })} />
                  <Input type="date" value={remForm.date} onChange={(e) => setRemForm({ ...remForm, date: e.target.value })} />
                  <Textarea placeholder="Descrição" value={remForm.description} onChange={(e) => setRemForm({ ...remForm, description: e.target.value })} />
                  <Button onClick={handleAddReminder} className="w-full">Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {reminders.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground">Nenhum lembrete</CardContent></Card>
          ) : (
            reminders.sort((a, b) => a.date.localeCompare(b.date)).map((r) => (
              <Card key={r.id}>
                <CardContent className="py-3 px-4 flex items-start gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{r.title}</p>
                    {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                    <span className="text-xs text-muted-foreground">{r.date}</span>
                  </div>
                  <button onClick={() => deleteReminder(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
