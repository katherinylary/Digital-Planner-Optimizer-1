import { useState, useEffect } from "react";
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
import { Briefcase, Plus, Trash2, FileText, Bell, CalendarDays, TrendingUp, TrendingDown, DollarSign, Building2, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Tipos e constantes existentes ────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
};

// ─── Tipos financeiros ─────────────────────────────────────────────────────────

type TransactionType = "entrada" | "saida";
type TransactionCategory =
  | "material_eletrico" | "mao_de_obra" | "equipamento" | "servico_terceiro"
  | "administrativo" | "receita_projeto" | "outro";

interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  project?: string;
}

interface Project {
  id: string;
  name: string;
  client: string;
  budgetTotal: number;
  budgetUsed: number;
  status: "em_andamento" | "concluido" | "pausado" | "aguardando";
  startDate: string;
  endDate?: string;
}

interface Supplier {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueDate: string;
  status: "pendente" | "pago" | "vencido" | "agendado";
  project?: string;
  notes?: string;
}

// ─── Labels legíveis ───────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  material_eletrico: "Material Elétrico",
  mao_de_obra: "Mão de Obra",
  equipamento: "Equipamento",
  servico_terceiro: "Serviço Terceirizado",
  administrativo: "Administrativo",
  receita_projeto: "Receita de Projeto",
  outro: "Outro",
};

const STATUS_LABELS: Record<Supplier["status"], string> = {
  pendente: "Pendente", pago: "Pago", vencido: "Vencido", agendado: "Agendado",
};

const STATUS_COLORS: Record<Supplier["status"], string> = {
  pendente: "bg-yellow-100 text-yellow-700",
  pago: "bg-green-100 text-green-700",
  vencido: "bg-red-100 text-red-700",
  agendado: "bg-blue-100 text-blue-700",
};

const PROJECT_STATUS_LABELS: Record<Project["status"], string> = {
  em_andamento: "Em andamento", concluido: "Concluído",
  pausado: "Pausado", aguardando: "Aguardando",
};

const PROJECT_STATUS_COLORS: Record<Project["status"], string> = {
  em_andamento: "bg-blue-100 text-blue-700",
  concluido: "bg-green-100 text-green-700",
  pausado: "bg-yellow-100 text-yellow-700",
  aguardando: "bg-gray-100 text-gray-700",
};

// ─── Hook de persistência financeira ──────────────────────────────────────────

function useFinancial() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try { return JSON.parse(localStorage.getItem("planner_transactions") || "[]"); } catch { return []; }
  });
  const [projects, setProjects] = useState<Project[]>(() => {
    try { return JSON.parse(localStorage.getItem("planner_projects") || "[]"); } catch { return []; }
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    try { return JSON.parse(localStorage.getItem("planner_suppliers") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("planner_transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("planner_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("planner_suppliers", JSON.stringify(suppliers)); }, [suppliers]);

  const addTransaction = (t: Omit<Transaction, "id">) =>
    setTransactions((prev) => [...prev, { ...t, id: crypto.randomUUID() }]);
  const deleteTransaction = (id: string) =>
    setTransactions((prev) => prev.filter((t) => t.id !== id));

  const addProject = (p: Omit<Project, "id">) =>
    setProjects((prev) => [...prev, { ...p, id: crypto.randomUUID() }]);
  const deleteProject = (id: string) =>
    setProjects((prev) => prev.filter((p) => p.id !== id));
  const updateProjectBudget = (id: string, used: number) =>
    setProjects((prev) => prev.map((p) => p.id === id ? { ...p, budgetUsed: used } : p));

  const addSupplier = (s: Omit<Supplier, "id">) =>
    setSuppliers((prev) => [...prev, { ...s, id: crypto.randomUUID() }]);
  const deleteSupplier = (id: string) =>
    setSuppliers((prev) => prev.filter((s) => s.id !== id));
  const updateSupplierStatus = (id: string, status: Supplier["status"]) =>
    setSuppliers((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));

  return {
    transactions, projects, suppliers,
    addTransaction, deleteTransaction,
    addProject, deleteProject, updateProjectBudget,
    addSupplier, deleteSupplier, updateSupplierStatus,
  };
}

// ─── Componente principal ──────────────────────────────────────────────────────

export default function Professional() {
  const {
    activities, reminders, labels,
    addActivity, toggleActivity, deleteActivity,
    saveReport, getReportForDate,
    addReminder, deleteReminder, addLabel,
  } = useProfessional();

  const {
    transactions, projects, suppliers,
    addTransaction, deleteTransaction,
    addProject, deleteProject,
    addSupplier, deleteSupplier, updateSupplierStatus,
  } = useFinancial();

  const today = format(new Date(), "yyyy-MM-dd");
  const currentMonth = format(new Date(), "yyyy-MM");

  // Dialogs existentes
  const [actOpen, setActOpen] = useState(false);
  const [remOpen, setRemOpen] = useState(false);
  const [labelOpen, setLabelOpen] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [reportContent, setReportContent] = useState(getReportForDate(today)?.content || "");
  const [actForm, setActForm] = useState({
    title: "", priority: "medium" as ProfessionalActivity["priority"],
    labels: [] as string[], dueDate: "",
  });
  const [remForm, setRemForm] = useState({ title: "", date: "", description: "" });

  // Dialogs financeiros
  const [txOpen, setTxOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [activeFinTab, setActiveFinTab] = useState("overview");

  const [txForm, setTxForm] = useState<Omit<Transaction, "id">>({
    type: "saida", category: "material_eletrico", description: "",
    amount: 0, date: today, project: "",
  });
  const [projForm, setProjForm] = useState<Omit<Project, "id">>({
    name: "", client: "", budgetTotal: 0, budgetUsed: 0,
    status: "em_andamento", startDate: today, endDate: "",
  });
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, "id">>({
    name: "", category: "", amount: 0, dueDate: today,
    status: "pendente", project: "", notes: "",
  });

  // ── Handlers existentes ──────────────────────────────────────────────────────

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
  const handleSaveReport = () => saveReport(today, reportContent);

  const pending = activities.filter((a) => !a.completed);
  const completed = activities.filter((a) => a.completed);

  // ── Handlers financeiros ─────────────────────────────────────────────────────

  const handleAddTransaction = () => {
    if (!txForm.description.trim() || txForm.amount <= 0) return;
    addTransaction(txForm);
    setTxForm({ type: "saida", category: "material_eletrico", description: "", amount: 0, date: today, project: "" });
    setTxOpen(false);
  };
  const handleAddProject = () => {
    if (!projForm.name.trim()) return;
    addProject(projForm);
    setProjForm({ name: "", client: "", budgetTotal: 0, budgetUsed: 0, status: "em_andamento", startDate: today, endDate: "" });
    setProjOpen(false);
  };
  const handleAddSupplier = () => {
    if (!supplierForm.name.trim() || supplierForm.amount <= 0) return;
    addSupplier(supplierForm);
    setSupplierForm({ name: "", category: "", amount: 0, dueDate: today, status: "pendente", project: "", notes: "" });
    setSupplierOpen(false);
  };

  // ── Cálculos financeiros ─────────────────────────────────────────────────────

  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalEntradas = monthTx.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
  const totalSaidas = monthTx.filter((t) => t.type === "saida").reduce((s, t) => s + t.amount, 0);
  const saldo = totalEntradas - totalSaidas;

  const vencidosCount = suppliers.filter((s) => s.status === "vencido").length;
  const pendentesValor = suppliers
    .filter((s) => s.status === "pendente" || s.status === "agendado")
    .reduce((s, sup) => s + sup.amount, 0);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  // ── Categorias para gráfico simples ─────────────────────────────────────────

  const categoryTotals = monthTx
    .filter((t) => t.type === "saida")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const maxCategoryValue = Math.max(...Object.values(categoryTotals), 1);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
        <Briefcase className="h-6 w-6" /> Profissional
      </h1>

      <Tabs defaultValue="activities">
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="activities">Atividades</TabsTrigger>
          <TabsTrigger value="report">Relatório</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="reminders">Lembretes</TabsTrigger>
          <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>
        </TabsList>

        {/* ── ABA ATIVIDADES (original) ────────────────────────────────────── */}
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

        {/* ── ABA RELATÓRIO (original) ─────────────────────────────────────── */}
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

        {/* ── ABA CALENDÁRIO (original) ────────────────────────────────────── */}
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

        {/* ── ABA LEMBRETES (original) ─────────────────────────────────────── */}
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

        {/* ── ABA FINANCEIRO (nova) ────────────────────────────────────────── */}
        <TabsContent value="financeiro" className="mt-4 space-y-4">

          {/* Sub-abas internas */}
          <Tabs value={activeFinTab} onValueChange={setActiveFinTab}>
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="overview">Resumo</TabsTrigger>
              <TabsTrigger value="fluxo">Fluxo de Caixa</TabsTrigger>
              <TabsTrigger value="projetos">Projetos</TabsTrigger>
              <TabsTrigger value="fornecedores">Fornecedores</TabsTrigger>
            </TabsList>

            {/* ── RESUMO ───────────────────────────────────────────────────── */}
            <TabsContent value="overview" className="space-y-4 mt-4">

              {/* Cards de KPIs */}
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Entradas do mês</span>
                    </div>
                    <p className="text-lg font-bold text-green-600">{fmt(totalEntradas)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingDown className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Saídas do mês</span>
                    </div>
                    <p className="text-lg font-bold text-red-500">{fmt(totalSaidas)}</p>
                  </CardContent>
                </Card>
                <Card className={cn("col-span-2", saldo >= 0 ? "border-green-200" : "border-red-200")}>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className={cn("h-4 w-4", saldo >= 0 ? "text-green-600" : "text-red-500")} />
                      <span className="text-xs text-muted-foreground">Saldo do mês</span>
                      <span className="text-xs text-muted-foreground ml-auto">{format(new Date(), "MMMM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <p className={cn("text-2xl font-bold", saldo >= 0 ? "text-green-600" : "text-red-500")}>{fmt(saldo)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas */}
              {(vencidosCount > 0 || pendentesValor > 0) && (
                <div className="space-y-2">
                  {vencidosCount > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                      <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                      <p className="text-sm text-red-700">
                        <span className="font-semibold">{vencidosCount} pagamento{vencidosCount > 1 ? "s" : ""} vencido{vencidosCount > 1 ? "s" : ""}</span> — verifique fornecedores
                      </p>
                    </div>
                  )}
                  {pendentesValor > 0 && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
                      <p className="text-sm text-yellow-700">
                        <span className="font-semibold">{fmt(pendentesValor)}</span> em pagamentos pendentes/agendados
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Projetos resumo */}
              {projects.length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" /> Projetos em andamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    {projects.filter((p) => p.status === "em_andamento").slice(0, 3).map((p) => {
                      const pct = p.budgetTotal > 0 ? Math.min((p.budgetUsed / p.budgetTotal) * 100, 100) : 0;
                      return (
                        <div key={p.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium truncate">{p.name}</span>
                            <span className="text-xs text-muted-foreground ml-2 shrink-0">{pct.toFixed(0)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between mt-0.5">
                            <span className="text-xs text-muted-foreground">{fmt(p.budgetUsed)} usado</span>
                            <span className="text-xs text-muted-foreground">{fmt(p.budgetTotal)} total</span>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Gráfico de categorias de saídas */}
              {Object.keys(categoryTotals).length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-sm font-semibold">Saídas por categoria — {format(new Date(), "MMMM", { locale: ptBR })}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-4">
                    {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-muted-foreground">{CATEGORY_LABELS[cat as TransactionCategory] ?? cat}</span>
                          <span className="font-medium">{fmt(val)}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${(val / maxCategoryValue) * 100}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {transactions.length === 0 && projects.length === 0 && suppliers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground space-y-2">
                  <DollarSign className="h-10 w-10 mx-auto opacity-30" />
                  <p className="text-sm">Nenhum dado financeiro ainda.</p>
                  <p className="text-xs">Use as abas acima para adicionar transações, projetos e fornecedores.</p>
                </div>
              )}
            </TabsContent>

            {/* ── FLUXO DE CAIXA ────────────────────────────────────────────── */}
            <TabsContent value="fluxo" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Dialog open={txOpen} onOpenChange={setTxOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Transação</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-serif italic">Nova Transação</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Select value={txForm.type} onValueChange={(v) => setTxForm({ ...txForm, type: v as TransactionType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">✅ Entrada</SelectItem>
                          <SelectItem value="saida">🔴 Saída</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={txForm.category} onValueChange={(v) => setTxForm({ ...txForm, category: v as TransactionCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                            <SelectItem key={val} value={val}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input placeholder="Descrição" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} />
                      <Input type="number" placeholder="Valor (R$)" min={0} step={0.01} value={txForm.amount || ""} onChange={(e) => setTxForm({ ...txForm, amount: parseFloat(e.target.value) || 0 })} />
                      <Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
                      <Select value={txForm.project || ""} onValueChange={(v) => setTxForm({ ...txForm, project: v })}>
                        <SelectTrigger><SelectValue placeholder="Projeto (opcional)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem projeto</SelectItem>
                          {projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddTransaction} className="w-full">Salvar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {transactions.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhuma transação registrada</CardContent></Card>
              ) : (
                [...transactions].sort((a, b) => b.date.localeCompare(a.date)).map((t) => (
                  <Card key={t.id}>
                    <CardContent className="py-3 px-4 flex items-center gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", t.type === "entrada" ? "bg-green-100" : "bg-red-100")}>
                        {t.type === "entrada"
                          ? <TrendingUp className="h-4 w-4 text-green-600" />
                          : <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{t.description}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[t.category]}</span>
                          {t.project && <Badge variant="outline" className="text-xs">{t.project}</Badge>}
                          <span className="text-xs text-muted-foreground">{t.date}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("font-semibold text-sm", t.type === "entrada" ? "text-green-600" : "text-red-500")}>
                          {t.type === "entrada" ? "+" : "-"}{fmt(t.amount)}
                        </p>
                      </div>
                      <button onClick={() => deleteTransaction(t.id)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* ── PROJETOS / OBRAS ──────────────────────────────────────────── */}
            <TabsContent value="projetos" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Dialog open={projOpen} onOpenChange={setProjOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Projeto</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-serif italic">Novo Projeto / Obra</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Nome do projeto / obra" value={projForm.name} onChange={(e) => setProjForm({ ...projForm, name: e.target.value })} />
                      <Input placeholder="Cliente / Contratante" value={projForm.client} onChange={(e) => setProjForm({ ...projForm, client: e.target.value })} />
                      <Input type="number" placeholder="Orçamento total (R$)" min={0} step={0.01} value={projForm.budgetTotal || ""} onChange={(e) => setProjForm({ ...projForm, budgetTotal: parseFloat(e.target.value) || 0 })} />
                      <Input type="number" placeholder="Gasto até agora (R$)" min={0} step={0.01} value={projForm.budgetUsed || ""} onChange={(e) => setProjForm({ ...projForm, budgetUsed: parseFloat(e.target.value) || 0 })} />
                      <Select value={projForm.status} onValueChange={(v) => setProjForm({ ...projForm, status: v as Project["status"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="em_andamento">Em andamento</SelectItem>
                          <SelectItem value="aguardando">Aguardando</SelectItem>
                          <SelectItem value="pausado">Pausado</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="grid grid-cols-2 gap-2">
                        <div><label className="text-xs text-muted-foreground">Início</label><Input type="date" value={projForm.startDate} onChange={(e) => setProjForm({ ...projForm, startDate: e.target.value })} /></div>
                        <div><label className="text-xs text-muted-foreground">Previsão fim</label><Input type="date" value={projForm.endDate || ""} onChange={(e) => setProjForm({ ...projForm, endDate: e.target.value })} /></div>
                      </div>
                      <Button onClick={handleAddProject} className="w-full">Salvar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {projects.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum projeto cadastrado</CardContent></Card>
              ) : (
                projects.map((p) => {
                  const pct = p.budgetTotal > 0 ? Math.min((p.budgetUsed / p.budgetTotal) * 100, 100) : 0;
                  const restante = p.budgetTotal - p.budgetUsed;
                  return (
                    <Card key={p.id}>
                      <CardContent className="py-4 px-4 space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-semibold text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.client}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn("text-xs shrink-0", PROJECT_STATUS_COLORS[p.status])}>{PROJECT_STATUS_LABELS[p.status]}</Badge>
                            <button onClick={() => deleteProject(p.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-muted-foreground">Orçamento utilizado</span>
                            <span className={cn("font-semibold", pct > 85 ? "text-red-500" : pct > 60 ? "text-yellow-600" : "text-green-600")}>{pct.toFixed(1)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${pct}%` }} />
                          </div>
                          <div className="flex justify-between mt-1 text-xs">
                            <span className="text-muted-foreground">Usado: <span className="font-medium text-foreground">{fmt(p.budgetUsed)}</span></span>
                            <span className="text-muted-foreground">Restante: <span className={cn("font-medium", restante < 0 ? "text-red-500" : "text-foreground")}>{fmt(Math.max(restante, 0))}</span></span>
                          </div>
                        </div>
                        {(p.startDate || p.endDate) && (
                          <div className="flex gap-3 text-xs text-muted-foreground border-t pt-2 mt-1">
                            {p.startDate && <span>Início: {p.startDate}</span>}
                            {p.endDate && <span>Previsão: {p.endDate}</span>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            {/* ── FORNECEDORES / PAGAMENTOS ──────────────────────────────────── */}
            <TabsContent value="fornecedores" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Pagamento</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-serif italic">Fornecedor / Pagamento</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Fornecedor / empresa" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                      <Input placeholder="Categoria (ex: Distribuidora, Locação)" value={supplierForm.category} onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })} />
                      <Input type="number" placeholder="Valor (R$)" min={0} step={0.01} value={supplierForm.amount || ""} onChange={(e) => setSupplierForm({ ...supplierForm, amount: parseFloat(e.target.value) || 0 })} />
                      <div><label className="text-xs text-muted-foreground">Vencimento</label>
                        <Input type="date" value={supplierForm.dueDate} onChange={(e) => setSupplierForm({ ...supplierForm, dueDate: e.target.value })} />
                      </div>
                      <Select value={supplierForm.status} onValueChange={(v) => setSupplierForm({ ...supplierForm, status: v as Supplier["status"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={supplierForm.project || ""} onValueChange={(v) => setSupplierForm({ ...supplierForm, project: v })}>
                        <SelectTrigger><SelectValue placeholder="Projeto (opcional)" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Sem projeto</SelectItem>
                          {projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Textarea placeholder="Observações" value={supplierForm.notes || ""} onChange={(e) => setSupplierForm({ ...supplierForm, notes: e.target.value })} />
                      <Button onClick={handleAddSupplier} className="w-full">Salvar</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {suppliers.length === 0 ? (
                <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum fornecedor cadastrado</CardContent></Card>
              ) : (
                [...suppliers].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((s) => (
                  <Card key={s.id} className={cn(s.status === "vencido" && "border-red-300")}>
                    <CardContent className="py-3 px-4 flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{s.name}</p>
                          <Badge variant="secondary" className={cn("text-xs", STATUS_COLORS[s.status])}>{STATUS_LABELS[s.status]}</Badge>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          {s.category && <span className="text-xs text-muted-foreground">{s.category}</span>}
                          {s.project && <Badge variant="outline" className="text-xs">{s.project}</Badge>}
                          <span className="text-xs text-muted-foreground">Vence: {s.dueDate}</span>
                        </div>
                        {s.notes && <p className="text-xs text-muted-foreground mt-1 italic">{s.notes}</p>}
                        {/* Troca rápida de status */}
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(["pendente", "agendado", "pago", "vencido"] as Supplier["status"][]).filter((st) => st !== s.status).map((st) => (
                            <button key={st} onClick={() => updateSupplierStatus(s.id, st)} className="text-xs px-2 py-0.5 rounded border border-border hover:bg-muted transition-colors">
                              → {STATUS_LABELS[st]}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-sm">{fmt(s.amount)}</p>
                        {s.status === "pago" && <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto mt-1" />}
                        {s.status === "vencido" && <AlertCircle className="h-4 w-4 text-red-500 ml-auto mt-1" />}
                      </div>
                      <button onClick={() => deleteSupplier(s.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}
