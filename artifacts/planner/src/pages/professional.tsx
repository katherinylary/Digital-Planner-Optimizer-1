import { useState, useEffect, useRef } from "react";
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
import {
  Briefcase, Plus, Trash2, FileText, Bell, CalendarDays,
  TrendingUp, TrendingDown, DollarSign, Building2, AlertCircle,
  CheckCircle2, Clock, Upload, Loader2, BarChart3, ScanLine,
  PackageSearch, ChevronDown, ChevronUp, Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Prioridade de atividades ─────────────────────────────────────────────────

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  urgent: "bg-red-100 text-red-700",
};
const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa", medium: "Média", high: "Alta", urgent: "Urgente",
};

// ─── Tipos financeiros ────────────────────────────────────────────────────────

type TransactionType = "entrada" | "saida";
type TransactionCategory =
  | "material_eletrico" | "mao_de_obra" | "equipamento" | "servico_terceiro"
  | "administrativo" | "receita_projeto" | "outro";

interface NFItem {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface ExtractedNF {
  fornecedor: string;
  cnpj: string;
  dataEmissao: string;
  numeroNF: string;
  naturezaOperacao?: string;
  chaveAcesso?: string;
  items: NFItem[];
  subtotal: number;
  desconto: number;
  impostos: number;
  total: number;
}

interface Transaction {
  id: string;
  type: TransactionType;
  category: TransactionCategory;
  description: string;
  amount: number;
  date: string;
  project?: string;
  fromNF?: boolean;
  nfData?: ExtractedNF;
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

interface OrcamentoItem {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

interface Orcamento {
  id: string;
  titulo: string;
  projeto: string;
  fornecedor: string;
  cnpj?: string;
  data: string;
  validade?: string;
  items: OrcamentoItem[];
  desconto: number;
  total: number;
  observacoes?: string;
}

// ─── Labels legíveis ──────────────────────────────────────────────────────────

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

// ─── Hook financeiro com localStorage ────────────────────────────────────────

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
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>(() => {
    try { return JSON.parse(localStorage.getItem("planner_orcamentos") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("planner_transactions", JSON.stringify(transactions)); }, [transactions]);
  useEffect(() => { localStorage.setItem("planner_projects", JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem("planner_suppliers", JSON.stringify(suppliers)); }, [suppliers]);
  useEffect(() => { localStorage.setItem("planner_orcamentos", JSON.stringify(orcamentos)); }, [orcamentos]);

  return {
    transactions, projects, suppliers, orcamentos,
    addTransaction: (t: Omit<Transaction, "id">) =>
      setTransactions((p) => [...p, { ...t, id: crypto.randomUUID() }]),
    deleteTransaction: (id: string) =>
      setTransactions((p) => p.filter((t) => t.id !== id)),
    addProject: (p: Omit<Project, "id">) =>
      setProjects((prev) => [...prev, { ...p, id: crypto.randomUUID() }]),
    deleteProject: (id: string) =>
      setProjects((p) => p.filter((x) => x.id !== id)),
    addSupplier: (s: Omit<Supplier, "id">) =>
      setSuppliers((p) => [...p, { ...s, id: crypto.randomUUID() }]),
    deleteSupplier: (id: string) =>
      setSuppliers((p) => p.filter((s) => s.id !== id)),
    updateSupplierStatus: (id: string, status: Supplier["status"]) =>
      setSuppliers((p) => p.map((s) => s.id === id ? { ...s, status } : s)),
    addOrcamento: (o: Omit<Orcamento, "id">) =>
      setOrcamentos((p) => [...p, { ...o, id: crypto.randomUUID() }]),
    deleteOrcamento: (id: string) =>
      setOrcamentos((p) => p.filter((o) => o.id !== id)),
  };
}

// ─── Extração de NF via Claude API ───────────────────────────────────────────

async function extractNFWithAI(fileBase64: string, mimeType: string): Promise<ExtractedNF> {
  const contentBlock = mimeType.startsWith("image/")
    ? { type: "image", source: { type: "base64", media_type: mimeType, data: fileBase64 } }
    : { type: "document", source: { type: "base64", media_type: "application/pdf", data: fileBase64 } };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: [
          contentBlock,
          {
            type: "text",
            text: `Analise esta nota fiscal brasileira e extraia todos os dados. Retorne APENAS JSON válido sem markdown:
{
  "fornecedor": "nome do emitente",
  "cnpj": "CNPJ formatado",
  "dataEmissao": "YYYY-MM-DD",
  "numeroNF": "número",
  "naturezaOperacao": "natureza da operação",
  "chaveAcesso": "chave se visível",
  "items": [{"descricao":"","quantidade":1,"valorUnitario":0,"valorTotal":0}],
  "subtotal": 0,
  "desconto": 0,
  "impostos": 0,
  "total": 0
}
Use string vazia para campos ausentes e 0 para valores não encontrados.`,
          },
        ],
      }],
    }),
  });

  const data = await response.json();
  const text = (data.content || []).map((c: { type: string; text?: string }) => c.text || "").join("");
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean) as ExtractedNF;
}

// ─── Componente Leitor de NF ──────────────────────────────────────────────────

function NFReader({
  projects,
  onConfirm,
}: {
  projects: Project[];
  onConfirm: (tx: Omit<Transaction, "id">) => void;
}) {
  const [step, setStep] = useState<"upload" | "loading" | "review" | "done">("upload");
  const [extracted, setExtracted] = useState<ExtractedNF | null>(null);
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory>("material_eletrico");
  const [expandItems, setExpandItems] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handleFile = async (file: File) => {
    setError("");
    setStep("loading");
    try {
      const base64 = await new Promise<string>((res, rej) => {
        const r = new FileReader();
        r.onload = () => res((r.result as string).split(",")[1]);
        r.onerror = () => rej(new Error("Erro ao ler arquivo"));
        r.readAsDataURL(file);
      });
      const nf = await extractNFWithAI(base64, file.type);
      setExtracted(nf);
      setStep("review");
    } catch {
      setError("Não foi possível processar o arquivo. Tente uma imagem mais nítida ou outro PDF.");
      setStep("upload");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleConfirm = () => {
    if (!extracted) return;
    onConfirm({
      type: "saida",
      category: selectedCategory,
      description: `NF ${extracted.numeroNF || "s/n"} — ${extracted.fornecedor}`,
      amount: extracted.total,
      date: extracted.dataEmissao || format(new Date(), "yyyy-MM-dd"),
      project: selectedProject || undefined,
      fromNF: true,
      nfData: extracted,
    });
    setStep("done");
    setTimeout(() => { setStep("upload"); setExtracted(null); setSelectedProject(""); }, 2500);
  };

  if (step === "done") return (
    <div className="flex flex-col items-center gap-3 py-10">
      <CheckCircle2 className="h-12 w-12 text-green-500" />
      <p className="font-semibold text-green-700">Lançado no Fluxo de Caixa!</p>
      <p className="text-xs text-muted-foreground">Redirecionando para a aba Caixa...</p>
    </div>
  );

  if (step === "loading") return (
    <div className="flex flex-col items-center gap-4 py-10">
      <Loader2 className="h-10 w-10 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground font-medium">Analisando nota fiscal com IA...</p>
      <p className="text-xs text-muted-foreground">Extraindo fornecedor, CNPJ, itens, impostos e totais</p>
    </div>
  );

  if (step === "review" && extracted) return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-bold text-sm">{extracted.fornecedor || "Fornecedor não identificado"}</p>
            {extracted.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {extracted.cnpj}</p>}
            {extracted.naturezaOperacao && <p className="text-xs text-muted-foreground">Operação: {extracted.naturezaOperacao}</p>}
          </div>
          {extracted.numeroNF && (
            <Badge variant="outline" className="text-xs shrink-0">NF {extracted.numeroNF}</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Emissão: {extracted.dataEmissao || "—"}</p>
        {extracted.chaveAcesso && (
          <p className="text-xs text-muted-foreground break-all">Chave: {extracted.chaveAcesso}</p>
        )}
      </div>

      {extracted.items.length > 0 && (
        <div className="rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => setExpandItems(!expandItems)}
            className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/40 hover:bg-muted/60 transition-colors"
          >
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {extracted.items.length} item(ns)
            </span>
            {expandItems ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </button>
          {expandItems && (
            <div className="divide-y divide-border">
              {extracted.items.map((item, i) => (
                <div key={i} className="px-4 py-2 flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.descricao}</p>
                    <p className="text-xs text-muted-foreground">{item.quantidade}x {fmt(item.valorUnitario)}</p>
                  </div>
                  <p className="text-xs font-semibold shrink-0">{fmt(item.valorTotal)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="rounded-lg border border-border p-4 space-y-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{fmt(extracted.subtotal)}</span>
        </div>
        {extracted.desconto > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Desconto</span>
            <span className="text-green-600">- {fmt(extracted.desconto)}</span>
          </div>
        )}
        {extracted.impostos > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Impostos</span>
            <span>{fmt(extracted.impostos)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold border-t pt-1.5 mt-1">
          <span>Total</span>
          <span>{fmt(extracted.total)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Lançar como</p>
        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as TransactionCategory)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger><SelectValue placeholder="Vincular a projeto (opcional)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Sem projeto</SelectItem>
            {projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={() => { setStep("upload"); setExtracted(null); }}>
          Cancelar
        </Button>
        <Button className="flex-1" onClick={handleConfirm}>
          <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar lançamento
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer hover:border-primary hover:bg-muted/30 transition-colors"
      >
        <ScanLine className="h-10 w-10 text-muted-foreground" />
        <div className="text-center">
          <p className="font-medium text-sm">Arraste a NF ou clique para selecionar</p>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG ou PDF · a IA extrai tudo automaticamente</p>
        </div>
        <Button variant="outline" size="sm" type="button">
          <Upload className="h-4 w-4 mr-2" /> Selecionar arquivo
        </Button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*,application/pdf"
        className="hidden"
        onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
      />
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard de Orçamentos ──────────────────────────────────────────────────

function OrcamentoDashboard({
  orcamentos,
}: {
  orcamentos: Orcamento[];
  projects: Project[];
}) {
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const projetosComOrc = [...new Set(orcamentos.map((o) => o.projeto))].filter(Boolean);

  const byProjeto: Record<string, Orcamento[]> = {};
  orcamentos.forEach((o) => {
    if (!byProjeto[o.projeto]) byProjeto[o.projeto] = [];
    byProjeto[o.projeto].push(o);
  });

  const fornecedores = [...new Set(orcamentos.map((o) => o.fornecedor))];

  const comDesconto = orcamentos.filter((o) => o.desconto > 0).sort((a, b) => b.desconto - a.desconto);

  if (orcamentos.length === 0) return (
    <div className="text-center py-12 text-muted-foreground space-y-2">
      <BarChart3 className="h-10 w-10 mx-auto opacity-30" />
      <p className="text-sm">Nenhum orçamento cadastrado ainda.</p>
      <p className="text-xs">Adicione orçamentos para ver comparativos e análises.</p>
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Comparativo por projeto */}
      {projetosComOrc.map((proj) => {
        const orcs = byProjeto[proj] || [];
        if (orcs.length === 0) return null;
        const totals = orcs.map((o) => o.total);
        const minVal = Math.min(...totals);
        const maxVal = Math.max(...totals);
        const discPct = maxVal > 0 ? ((maxVal - minVal) / maxVal) * 100 : 0;
        const melhor = orcs.reduce((a, b) => a.total < b.total ? a : b);

        return (
          <Card key={proj}>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" /> {proj}
              </CardTitle>
              {orcs.length > 1 && (
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <Badge className="text-xs bg-orange-100 text-orange-700 border-orange-200">
                    Discrepância: {discPct.toFixed(1)}% · {fmt(maxVal - minVal)}
                  </Badge>
                  <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                    Melhor oferta: {melhor.fornecedor}
                  </Badge>
                </div>
              )}
            </CardHeader>
            <CardContent className="pb-4 space-y-3">
              {[...orcs].sort((a, b) => a.total - b.total).map((o, idx) => {
                const isBest = o.id === melhor.id;
                const barPct = maxVal > 0 ? (o.total / maxVal) * 100 : 0;
                const diffFromBest = o.total - melhor.total;
                return (
                  <div key={o.id} className={cn("rounded-lg border p-3 space-y-2", isBest && "border-green-300 bg-green-50/50")}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isBest && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                        <div>
                          <p className="text-sm font-semibold">{o.fornecedor}</p>
                          {o.cnpj && <p className="text-xs text-muted-foreground">CNPJ: {o.cnpj}</p>}
                          <p className="text-xs text-muted-foreground">
                            {o.data}{o.validade ? ` · válido até ${o.validade}` : ""}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn("text-base font-bold", isBest ? "text-green-600" : "text-foreground")}>
                          {fmt(o.total)}
                        </p>
                        {!isBest && diffFromBest > 0 && (
                          <p className="text-xs text-red-500">+{fmt(diffFromBest)}</p>
                        )}
                        {o.desconto > 0 && (
                          <p className="text-xs text-green-600">- {fmt(o.desconto)} desc.</p>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all", isBest ? "bg-green-500" : "bg-primary/60")}
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    {idx === 0 && orcs.length > 1 && (
                      <p className="text-xs text-green-700 flex items-center gap-1">
                        <Info className="h-3 w-3" /> Opção mais econômica
                      </p>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Evolução por fornecedor */}
      {fornecedores.map((forn) => {
        const historico = orcamentos
          .filter((o) => o.fornecedor === forn)
          .sort((a, b) => a.data.localeCompare(b.data));
        if (historico.length < 2) return null;
        return (
          <Card key={forn}>
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Evolução de preços — {forn}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-4 space-y-2">
              {historico.map((o, i) => {
                const prev = historico[i - 1];
                const delta = prev ? o.total - prev.total : null;
                const up = delta !== null && delta > 0;
                return (
                  <div key={o.id} className="flex items-center gap-3 p-2 rounded-lg border border-border">
                    <div className="flex-1">
                      <p className="text-xs font-medium">{o.titulo || o.projeto}</p>
                      <p className="text-xs text-muted-foreground">{o.data}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{fmt(o.total)}</p>
                      {delta !== null && (
                        <p className={cn("text-xs flex items-center gap-0.5 justify-end", up ? "text-red-500" : "text-green-600")}>
                          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {up ? "+" : ""}{fmt(delta)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Ranking de descontos */}
      {comDesconto.length > 0 && (
        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <PackageSearch className="h-4 w-4 text-primary" /> Descontos conquistados
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 space-y-2">
            {comDesconto.map((o) => {
              const pctDesc = (o.total + o.desconto) > 0
                ? (o.desconto / (o.total + o.desconto)) * 100 : 0;
              return (
                <div key={o.id} className="flex items-center gap-3 p-2 rounded-lg border border-green-200 bg-green-50/40">
                  <div className="flex-1">
                    <p className="text-xs font-medium">{o.fornecedor}</p>
                    <p className="text-xs text-muted-foreground">{o.projeto} · {o.data}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-green-600">- {fmt(o.desconto)}</p>
                    <p className="text-xs text-green-700">{pctDesc.toFixed(1)}% desconto</p>
                  </div>
                </div>
              );
            })}
            <div className="border-t pt-2 flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Total economizado</span>
              <span className="font-bold text-green-600">
                {fmt(comDesconto.reduce((s, o) => s + o.desconto, 0))}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function Professional() {
  const {
    activities, reminders, labels,
    addActivity, toggleActivity, deleteActivity,
    saveReport, getReportForDate,
    addReminder, deleteReminder, addLabel,
  } = useProfessional();

  const {
    transactions, projects, suppliers, orcamentos,
    addTransaction, deleteTransaction,
    addProject, deleteProject,
    addSupplier, deleteSupplier, updateSupplierStatus,
    addOrcamento, deleteOrcamento,
  } = useFinancial();

  const today = format(new Date(), "yyyy-MM-dd");
  const currentMonth = format(new Date(), "yyyy-MM");

  // Estados de dialogs de atividades
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

  // Estados financeiros
  const [txOpen, setTxOpen] = useState(false);
  const [projOpen, setProjOpen] = useState(false);
  const [supplierOpen, setSupplierOpen] = useState(false);
  const [orcOpen, setOrcOpen] = useState(false);
  const [activeFinTab, setActiveFinTab] = useState("overview");

  const [txForm, setTxForm] = useState<Omit<Transaction, "id">>({
    type: "saida", category: "material_eletrico",
    description: "", amount: 0, date: today, project: "",
  });
  const [projForm, setProjForm] = useState<Omit<Project, "id">>({
    name: "", client: "", budgetTotal: 0, budgetUsed: 0,
    status: "em_andamento", startDate: today, endDate: "",
  });
  const [supplierForm, setSupplierForm] = useState<Omit<Supplier, "id">>({
    name: "", category: "", amount: 0, dueDate: today,
    status: "pendente", project: "", notes: "",
  });

  const emptyOrc: Omit<Orcamento, "id"> = {
    titulo: "", projeto: "", fornecedor: "", cnpj: "",
    data: today, validade: "", items: [], desconto: 0, total: 0, observacoes: "",
  };
  const [orcForm, setOrcForm] = useState<Omit<Orcamento, "id">>(emptyOrc);
  const [orcItemForm, setOrcItemForm] = useState({ descricao: "", quantidade: 1, valorUnitario: 0 });

  const addOrcItem = () => {
    if (!orcItemForm.descricao.trim() || orcItemForm.valorUnitario <= 0) return;
    const vt = orcItemForm.quantidade * orcItemForm.valorUnitario;
    const newItems: OrcamentoItem[] = [...orcForm.items, { ...orcItemForm, valorTotal: vt }];
    const subtotal = newItems.reduce((s, i) => s + i.valorTotal, 0);
    setOrcForm({ ...orcForm, items: newItems, total: Math.max(subtotal - orcForm.desconto, 0) });
    setOrcItemForm({ descricao: "", quantidade: 1, valorUnitario: 0 });
  };

  const handleSaveOrc = () => {
    if (!orcForm.fornecedor.trim() || !orcForm.projeto.trim()) return;
    addOrcamento(orcForm);
    setOrcForm(emptyOrc);
    setOrcOpen(false);
  };

  // Handlers atividades
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

  // Handlers financeiros
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

  const pending = activities.filter((a) => !a.completed);
  const completed = activities.filter((a) => a.completed);

  const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
  const totalEntradas = monthTx.filter((t) => t.type === "entrada").reduce((s, t) => s + t.amount, 0);
  const totalSaidas = monthTx.filter((t) => t.type === "saida").reduce((s, t) => s + t.amount, 0);
  const saldo = totalEntradas - totalSaidas;
  const vencidosCount = suppliers.filter((s) => s.status === "vencido").length;
  const pendentesValor = suppliers
    .filter((s) => s.status === "pendente" || s.status === "agendado")
    .reduce((s, sup) => s + sup.amount, 0);
  const categoryTotals = monthTx
    .filter((t) => t.type === "saida")
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
  const maxCategoryValue = Math.max(...Object.values(categoryTotals), 1);
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

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

        {/* ABA ATIVIDADES */}
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
                      <SelectItem value="low">Baixa</SelectItem><SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="high">Alta</SelectItem><SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input type="date" value={actForm.dueDate} onChange={(e) => setActForm({ ...actForm, dueDate: e.target.value })} />
                  <div className="flex flex-wrap gap-2">
                    {labels.map((l) => (
                      <button key={l} onClick={() => setActForm({
                        ...actForm,
                        labels: actForm.labels.includes(l)
                          ? actForm.labels.filter((x) => x !== l)
                          : [...actForm.labels, l],
                      })} className={cn("px-2 py-1 rounded text-xs border transition-colors", actForm.labels.includes(l) ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>{l}</button>
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

        {/* ABA RELATÓRIO */}
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

        {/* ABA CALENDÁRIO */}
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
                {activities.filter((a) => a.dueDate).length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma atividade com data</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA LEMBRETES */}
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

        {/* ABA FINANCEIRO */}
        <TabsContent value="financeiro" className="mt-4 space-y-4">
          <Tabs value={activeFinTab} onValueChange={setActiveFinTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="overview">Resumo</TabsTrigger>
              <TabsTrigger value="fluxo">Caixa</TabsTrigger>
              <TabsTrigger value="nf">📄 NF</TabsTrigger>
              <TabsTrigger value="orcamentos">Orçamentos</TabsTrigger>
              <TabsTrigger value="fornecedores">Pgtos</TabsTrigger>
            </TabsList>

            {/* RESUMO */}
            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-1"><TrendingUp className="h-4 w-4 text-green-600" /><span className="text-xs text-muted-foreground">Entradas</span></div>
                    <p className="text-lg font-bold text-green-600">{fmt(totalEntradas)}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-1"><TrendingDown className="h-4 w-4 text-red-500" /><span className="text-xs text-muted-foreground">Saídas</span></div>
                    <p className="text-lg font-bold text-red-500">{fmt(totalSaidas)}</p>
                  </CardContent>
                </Card>
                <Card className={cn("col-span-2", saldo >= 0 ? "border-green-200" : "border-red-200")}>
                  <CardContent className="pt-4 pb-3 px-4">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className={cn("h-4 w-4", saldo >= 0 ? "text-green-600" : "text-red-500")} />
                      <span className="text-xs text-muted-foreground">Saldo — {format(new Date(), "MMMM/yyyy", { locale: ptBR })}</span>
                    </div>
                    <p className={cn("text-2xl font-bold", saldo >= 0 ? "text-green-600" : "text-red-500")}>{fmt(saldo)}</p>
                  </CardContent>
                </Card>
              </div>
              {vencidosCount > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-700"><span className="font-semibold">{vencidosCount} pagamento(s) vencido(s)</span> — verifique fornecedores</p>
                </div>
              )}
              {pendentesValor > 0 && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <Clock className="h-4 w-4 text-yellow-600 shrink-0" />
                  <p className="text-sm text-yellow-700"><span className="font-semibold">{fmt(pendentesValor)}</span> em pagamentos pendentes/agendados</p>
                </div>
              )}
              {projects.filter((p) => p.status === "em_andamento").length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-semibold flex items-center gap-2"><Building2 className="h-4 w-4 text-primary" /> Projetos em andamento</CardTitle></CardHeader>
                  <CardContent className="space-y-3 pb-4">
                    {projects.filter((p) => p.status === "em_andamento").slice(0, 3).map((p) => {
                      const pct = p.budgetTotal > 0 ? Math.min((p.budgetUsed / p.budgetTotal) * 100, 100) : 0;
                      return (
                        <div key={p.id}>
                          <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium truncate">{p.name}</span><span className="text-xs text-muted-foreground ml-2 shrink-0">{pct.toFixed(0)}%</span></div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={cn("h-full rounded-full transition-all", pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-green-500")} style={{ width: `${pct}%` }} /></div>
                          <div className="flex justify-between mt-0.5"><span className="text-xs text-muted-foreground">{fmt(p.budgetUsed)} usado</span><span className="text-xs text-muted-foreground">{fmt(p.budgetTotal)} total</span></div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
              {Object.keys(categoryTotals).length > 0 && (
                <Card>
                  <CardHeader className="pb-2 pt-4"><CardTitle className="text-sm font-semibold">Saídas por categoria — {format(new Date(), "MMMM", { locale: ptBR })}</CardTitle></CardHeader>
                  <CardContent className="space-y-2 pb-4">
                    {Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
                      <div key={cat}>
                        <div className="flex justify-between text-xs mb-0.5"><span className="text-muted-foreground">{CATEGORY_LABELS[cat as TransactionCategory] ?? cat}</span><span className="font-medium">{fmt(val)}</span></div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full rounded-full bg-primary/70 transition-all" style={{ width: `${(val / maxCategoryValue) * 100}%` }} /></div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* FLUXO DE CAIXA */}
            <TabsContent value="fluxo" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Dialog open={txOpen} onOpenChange={setTxOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Nova Transação</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-serif italic">Nova Transação</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Select value={txForm.type} onValueChange={(v) => setTxForm({ ...txForm, type: v as TransactionType })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="entrada">✅ Entrada</SelectItem><SelectItem value="saida">🔴 Saída</SelectItem></SelectContent>
                      </Select>
                      <Select value={txForm.category} onValueChange={(v) => setTxForm({ ...txForm, category: v as TransactionCategory })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(CATEGORY_LABELS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input placeholder="Descrição" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} />
                      <Input type="number" placeholder="Valor (R$)" min={0} step={0.01} value={txForm.amount || ""} onChange={(e) => setTxForm({ ...txForm, amount: parseFloat(e.target.value) || 0 })} />
                      <Input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} />
                      <Select value={txForm.project || ""} onValueChange={(v) => setTxForm({ ...txForm, project: v })}>
                        <SelectTrigger><SelectValue placeholder="Projeto (opcional)" /></SelectTrigger>
                        <SelectContent><SelectItem value="">Sem projeto</SelectItem>{projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}</SelectContent>
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
                        {t.type === "entrada" ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate">{t.description}</p>
                          {t.fromNF && <Badge variant="outline" className="text-xs shrink-0 border-blue-300 text-blue-600">NF</Badge>}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">{CATEGORY_LABELS[t.category]}</span>
                          {t.project && <Badge variant="outline" className="text-xs">{t.project}</Badge>}
                          <span className="text-xs text-muted-foreground">{t.date}</span>
                        </div>
                      </div>
                      <p className={cn("font-semibold text-sm shrink-0", t.type === "entrada" ? "text-green-600" : "text-red-500")}>
                        {t.type === "entrada" ? "+" : "-"}{fmt(t.amount)}
                      </p>
                      <button onClick={() => deleteTransaction(t.id)} className="text-muted-foreground hover:text-destructive ml-1"><Trash2 className="h-4 w-4" /></button>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            {/* LEITOR DE NF */}
            <TabsContent value="nf" className="mt-4 space-y-4">
              <Card>
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg font-serif italic flex items-center gap-2">
                    <ScanLine className="h-5 w-5 text-primary" /> Leitor de Nota Fiscal
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Envie uma foto ou PDF da NF. A IA extrai fornecedor, CNPJ, itens, impostos e descontos, e lança automaticamente no fluxo de caixa.
                  </p>
                </CardHeader>
                <CardContent>
                  <NFReader
                    projects={projects}
                    onConfirm={(tx) => {
                      addTransaction(tx);
                      setActiveFinTab("fluxo");
                    }}
                  />
                </CardContent>
              </Card>
              {transactions.filter((t) => t.fromNF).length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">NFs lançadas anteriormente</h3>
                  {transactions.filter((t) => t.fromNF).slice(0, 5).map((t) => (
                    <Card key={t.id}>
                      <CardContent className="py-2 px-4 flex items-center gap-3">
                        <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{t.description}</p>
                          <p className="text-xs text-muted-foreground">{t.date}{t.project ? ` · ${t.project}` : ""}</p>
                        </div>
                        <p className="text-sm font-semibold text-red-500 shrink-0">- {fmt(t.amount)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ORÇAMENTOS */}
            <TabsContent value="orcamentos" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Dialog open={orcOpen} onOpenChange={setOrcOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Orçamento</Button></DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle className="font-serif italic">Novo Orçamento</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Título / referência" value={orcForm.titulo} onChange={(e) => setOrcForm({ ...orcForm, titulo: e.target.value })} />
                      <Select value={orcForm.projeto} onValueChange={(v) => setOrcForm({ ...orcForm, projeto: v })}>
                        <SelectTrigger><SelectValue placeholder="Projeto / Obra" /></SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>)}
                          <SelectItem value="Geral">Geral (sem projeto)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input placeholder="Fornecedor" value={orcForm.fornecedor} onChange={(e) => setOrcForm({ ...orcForm, fornecedor: e.target.value })} />
                      <Input placeholder="CNPJ (opcional)" value={orcForm.cnpj || ""} onChange={(e) => setOrcForm({ ...orcForm, cnpj: e.target.value })} />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Data</label>
                          <Input type="date" value={orcForm.data} onChange={(e) => setOrcForm({ ...orcForm, data: e.target.value })} />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Validade</label>
                          <Input type="date" value={orcForm.validade || ""} onChange={(e) => setOrcForm({ ...orcForm, validade: e.target.value })} />
                        </div>
                      </div>

                      {/* Itens */}
                      <div className="border rounded-lg p-3 space-y-2 bg-muted/20">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Itens do orçamento</p>
                        <Input placeholder="Descrição do item" value={orcItemForm.descricao} onChange={(e) => setOrcItemForm({ ...orcItemForm, descricao: e.target.value })} />
                        <div className="grid grid-cols-2 gap-2">
                          <Input type="number" placeholder="Qtd" min={1} value={orcItemForm.quantidade || ""} onChange={(e) => setOrcItemForm({ ...orcItemForm, quantidade: parseFloat(e.target.value) || 1 })} />
                          <Input type="number" placeholder="Valor unit. R$" min={0} step={0.01} value={orcItemForm.valorUnitario || ""} onChange={(e) => setOrcItemForm({ ...orcItemForm, valorUnitario: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <Button variant="outline" size="sm" onClick={addOrcItem} className="w-full">+ Adicionar item</Button>
                        {orcForm.items.length > 0 && (
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {orcForm.items.map((item, i) => (
                              <div key={i} className="flex justify-between text-xs bg-background rounded px-2 py-1 border">
                                <span className="truncate flex-1">{item.descricao} ({item.quantidade}x)</span>
                                <span className="shrink-0 ml-2 font-medium">{fmt(item.valorTotal)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-muted-foreground">Desconto (R$)</label>
                        <Input
                          type="number" min={0} step={0.01}
                          value={orcForm.desconto || ""}
                          onChange={(e) => {
                            const desc = parseFloat(e.target.value) || 0;
                            const subtotal = orcForm.items.reduce((s, i) => s + i.valorTotal, 0);
                            setOrcForm({ ...orcForm, desconto: desc, total: Math.max(subtotal - desc, 0) });
                          }}
                        />
                      </div>
                      <div className="flex justify-between items-center border rounded-lg px-3 py-2 bg-muted/30">
                        <span className="text-sm text-muted-foreground font-medium">Total</span>
                        <span className="text-lg font-bold">{fmt(orcForm.total)}</span>
                      </div>
                      <Textarea placeholder="Observações" value={orcForm.observacoes || ""} onChange={(e) => setOrcForm({ ...orcForm, observacoes: e.target.value })} />
                      <Button onClick={handleSaveOrc} className="w-full">Salvar orçamento</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <OrcamentoDashboard
                orcamentos={orcamentos}
                projects={projects}
                onAdd={addOrcamento}
                onDelete={deleteOrcamento}
              />

              {orcamentos.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Todos os orçamentos</h3>
                  {[...orcamentos].sort((a, b) => b.data.localeCompare(a.data)).map((o) => (
                    <Card key={o.id}>
                      <CardContent className="py-3 px-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{o.fornecedor}</p>
                          <p className="text-xs text-muted-foreground">{o.projeto} · {o.data}</p>
                          {o.desconto > 0 && <p className="text-xs text-green-600">Desconto: {fmt(o.desconto)}</p>}
                        </div>
                        <p className="text-sm font-bold shrink-0">{fmt(o.total)}</p>
                        <button onClick={() => deleteOrcamento(o.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* FORNECEDORES / PAGAMENTOS */}
            <TabsContent value="fornecedores" className="space-y-4 mt-4">
              <div className="flex justify-end">
                <Dialog open={supplierOpen} onOpenChange={setSupplierOpen}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="h-4 w-4 mr-1" /> Novo Pagamento</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle className="font-serif italic">Fornecedor / Pagamento</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <Input placeholder="Fornecedor / empresa" value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
                      <Input placeholder="Categoria (ex: Distribuidora, Locação)" value={supplierForm.category} onChange={(e) => setSupplierForm({ ...supplierForm, category: e.target.value })} />
                      <Input type="number" placeholder="Valor (R$)" min={0} step={0.01} value={supplierForm.amount || ""} onChange={(e) => setSupplierForm({ ...supplierForm, amount: parseFloat(e.target.value) || 0 })} />
                      <div>
                        <label className="text-xs text-muted-foreground">Vencimento</label>
                        <Input type="date" value={supplierForm.dueDate} onChange={(e) => setSupplierForm({ ...supplierForm, dueDate: e.target.value })} />
                      </div>
                      <Select value={supplierForm.status} onValueChange={(v) => setSupplierForm({ ...supplierForm, status: v as Supplier["status"] })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem><SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem><SelectItem value="vencido">Vencido</SelectItem>
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
                <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">Nenhum pagamento cadastrado</CardContent></Card>
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
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {(["pendente", "agendado", "pago", "vencido"] as Supplier["status"][])
                            .filter((st) => st !== s.status)
                            .map((st) => (
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
