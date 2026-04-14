import { useState } from "react";
import { format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFinance } from "@/hooks/use-finance";
import type { Transaction } from "@/hooks/use-finance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, Plus, Trash2, TrendingUp, TrendingDown, ChevronLeft, ChevronRight, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function Finance() {
  const {
    transactions, expenseCategories, incomeCategories,
    addTransaction, deleteTransaction,
    setBudget, getBudgetForMonth,
    getMonthlyTotals, getExpenseByCategory,
    addExpenseCategory, addIncomeCategory,
  } = useFinance();

  const [currentMonth, setCurrentMonth] = useState(format(new Date(), "yyyy-MM"));
  const [open, setOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState("");
  const [newCatType, setNewCatType] = useState<"income" | "expense">("expense");

  const [form, setForm] = useState<{
    title: string; amount: string; type: Transaction["type"]; category: string; date: string; note: string;
  }>({ title: "", amount: "", type: "expense", category: expenseCategories[0] || "", date: format(new Date(), "yyyy-MM-dd"), note: "" });

  const [budgetForm, setBudgetForm] = useState({ category: expenseCategories[0] || "", limit: "" });

  const totals = getMonthlyTotals(currentMonth);
  const expByCategory = getExpenseByCategory(currentMonth);
  const monthBudgets = getBudgetForMonth(currentMonth);

  const monthTx = transactions
    .filter((t) => t.date.startsWith(currentMonth))
    .sort((a, b) => b.date.localeCompare(a.date));

  const handleAdd = () => {
    const amount = parseFloat(form.amount.replace(",", "."));
    if (!form.title.trim() || isNaN(amount) || amount <= 0) return;
    addTransaction({ title: form.title, amount, type: form.type, category: form.category, date: form.date, note: form.note });
    setForm({ title: "", amount: "", type: "expense", category: expenseCategories[0] || "", date: format(new Date(), "yyyy-MM-dd"), note: "" });
    setOpen(false);
  };

  const handleSetBudget = () => {
    const limit = parseFloat(budgetForm.limit.replace(",", "."));
    if (!budgetForm.category || isNaN(limit) || limit <= 0) return;
    setBudget(budgetForm.category, limit, currentMonth);
    setBudgetForm({ category: expenseCategories[0] || "", limit: "" });
    setBudgetOpen(false);
  };

  const handleAddCategory = () => {
    if (!newCat.trim()) return;
    if (newCatType === "expense") addExpenseCategory(newCat.trim());
    else addIncomeCategory(newCat.trim());
    setNewCat("");
    setCatOpen(false);
  };

  const prevMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m - 2);
    setCurrentMonth(format(d, "yyyy-MM"));
  };
  const nextMonth = () => {
    const [y, m] = currentMonth.split("-").map(Number);
    const d = new Date(y, m);
    setCurrentMonth(format(d, "yyyy-MM"));
  };

  const balanceIsPositive = totals.balance >= 0;

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <Wallet className="h-6 w-6" /> Finanças
        </h1>
        <div className="flex gap-2 flex-wrap">
          <Dialog open={catOpen} onOpenChange={setCatOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-add-finance-category">+ Categoria</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Nova Categoria</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={newCatType} onValueChange={(v) => setNewCatType(v as typeof newCatType)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Nome da categoria" value={newCat} onChange={(e) => setNewCat(e.target.value)} data-testid="input-finance-category" />
                <Button onClick={handleAddCategory} className="w-full">Criar</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" data-testid="button-set-budget">
                <PiggyBank className="h-4 w-4 mr-1" /> Definir Meta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Meta de Gastos</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Select value={budgetForm.category} onValueChange={(v) => setBudgetForm({ ...budgetForm, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Input placeholder="Limite (ex: 500)" value={budgetForm.limit} onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })} type="number" data-testid="input-budget-limit" />
                <Button onClick={handleSetBudget} className="w-full">Salvar Meta</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-transaction">
                <Plus className="h-4 w-4 mr-1" /> Lançamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Novo Lançamento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <div className="flex rounded-lg border border-border overflow-hidden">
                  <button onClick={() => setForm({ ...form, type: "expense", category: expenseCategories[0] || "" })} className={cn("flex-1 py-2 text-sm font-medium transition-colors", form.type === "expense" ? "bg-rose-500 text-white" : "hover:bg-muted")} data-testid="button-type-expense">Despesa</button>
                  <button onClick={() => setForm({ ...form, type: "income", category: incomeCategories[0] || "" })} className={cn("flex-1 py-2 text-sm font-medium transition-colors", form.type === "income" ? "bg-emerald-500 text-white" : "hover:bg-muted")} data-testid="button-type-income">Receita</button>
                </div>
                <Input placeholder="Descrição" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-transaction-title" />
                <Input placeholder="Valor (ex: 150,00)" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} data-testid="input-transaction-amount" />
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="select-transaction-category"><SelectValue placeholder="Categoria" /></SelectTrigger>
                  <SelectContent>
                    {(form.type === "expense" ? expenseCategories : incomeCategories).map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="input-transaction-date" />
                <Textarea placeholder="Observação (opcional)" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} data-testid="input-transaction-note" />
                <Button onClick={handleAdd} className="w-full" data-testid="button-save-transaction">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={prevMonth} data-testid="button-prev-month"><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-medium capitalize min-w-[160px] text-center">
          {format(new Date(currentMonth + "-01"), "MMMM 'de' yyyy", { locale: ptBR })}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth} data-testid="button-next-month"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-800/20 dark:border-emerald-800">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Receitas</span>
            </div>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300" data-testid="text-total-income">{formatBRL(totals.income)}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200 dark:from-rose-900/20 dark:to-rose-800/20 dark:border-rose-800">
          <CardContent className="pt-4 pb-4 px-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Despesas</span>
            </div>
            <p className="text-2xl font-bold text-rose-700 dark:text-rose-300" data-testid="text-total-expense">{formatBRL(totals.expense)}</p>
          </CardContent>
        </Card>

        <Card className={cn(
          "bg-gradient-to-br border",
          balanceIsPositive
            ? "from-primary/5 to-primary/10 border-primary/20"
            : "from-orange-50 to-orange-100 border-orange-200 dark:from-orange-900/20 dark:to-orange-800/20 dark:border-orange-800"
        )}>
          <CardContent className="pt-4 pb-4 px-4">
            <div className={cn("flex items-center gap-2 mb-1", balanceIsPositive ? "text-primary" : "text-orange-600 dark:text-orange-400")}>
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Saldo</span>
            </div>
            <p className={cn("text-2xl font-bold", balanceIsPositive ? "text-primary" : "text-orange-700 dark:text-orange-300")} data-testid="text-balance">{formatBRL(totals.balance)}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
          <TabsTrigger value="categories">Por Categoria</TabsTrigger>
          <TabsTrigger value="budget">Metas</TabsTrigger>
        </TabsList>

        {/* Transactions list */}
        <TabsContent value="transactions" className="mt-4 space-y-2">
          {monthTx.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhum lançamento neste mês 💰</p></CardContent></Card>
          ) : (
            monthTx.map((t) => (
              <Card key={t.id} data-testid={`transaction-${t.id}`}>
                <CardContent className="py-3 px-4 flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0", t.type === "income" ? "bg-emerald-500" : "bg-rose-400")}>
                    {t.type === "income" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-xs">{t.category}</Badge>
                      <span className="text-xs text-muted-foreground">{format(new Date(t.date + "T12:00:00"), "d 'de' MMM", { locale: ptBR })}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("font-semibold text-sm", t.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400")}>
                      {t.type === "income" ? "+" : "-"}{formatBRL(t.amount)}
                    </span>
                    <button onClick={() => deleteTransaction(t.id)} className="text-muted-foreground hover:text-destructive transition-colors" data-testid={`button-delete-transaction-${t.id}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* By category */}
        <TabsContent value="categories" className="mt-4 space-y-3">
          {Object.keys(expByCategory).length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhuma despesa registrada neste mês</p></CardContent></Card>
          ) : (
            Object.entries(expByCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([cat, amount]) => {
                const pct = totals.expense > 0 ? Math.round((amount / totals.expense) * 100) : 0;
                return (
                  <Card key={cat} data-testid={`category-${cat}`}>
                    <CardContent className="py-3 px-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-sm">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{pct}%</span>
                          <span className="font-semibold text-sm text-rose-500">{formatBRL(amount)}</span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </CardContent>
                  </Card>
                );
              })
          )}
        </TabsContent>

        {/* Budgets */}
        <TabsContent value="budget" className="mt-4 space-y-3">
          <div className="flex justify-end">
            <Button variant="outline" size="sm" onClick={() => setBudgetOpen(true)} data-testid="button-add-budget">
              <PiggyBank className="h-4 w-4 mr-1" /> Nova Meta
            </Button>
          </div>
          {monthBudgets.length === 0 ? (
            <Card><CardContent className="py-8 text-center text-muted-foreground"><p>Nenhuma meta definida para este mês 🐷</p></CardContent></Card>
          ) : (
            monthBudgets.map((b) => {
              const spent = expByCategory[b.category] || 0;
              const pct = Math.min(Math.round((spent / b.limit) * 100), 100);
              const over = spent > b.limit;
              return (
                <Card key={b.id} data-testid={`budget-${b.id}`}>
                  <CardContent className="py-4 px-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{b.category}</span>
                      <div className="text-right">
                        <span className={cn("text-sm font-semibold", over ? "text-destructive" : "text-muted-foreground")}>
                          {formatBRL(spent)}
                        </span>
                        <span className="text-xs text-muted-foreground"> / {formatBRL(b.limit)}</span>
                      </div>
                    </div>
                    <Progress value={pct} className={cn("h-3", over ? "[&>div]:bg-destructive" : "")} />
                    <p className={cn("text-xs mt-1", over ? "text-destructive font-medium" : "text-muted-foreground")}>
                      {over ? `⚠️ Limite ultrapassado em ${formatBRL(spent - b.limit)}` : `Restam ${formatBRL(b.limit - spent)}`}
                    </p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
