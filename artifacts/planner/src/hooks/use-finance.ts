import { useLocalStorage } from "./use-local-storage";

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  note?: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string;
}

export function useFinance() {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>("planner_finance_transactions", []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>("planner_finance_budgets", []);
  const [expenseCategories, setExpenseCategories] = useLocalStorage<string[]>("planner_finance_expense_cats", [
    "Alimentação", "Moradia", "Transporte", "Saúde", "Educação", "Lazer", "Roupas", "Beleza", "Outros",
  ]);
  const [incomeCategories, setIncomeCategories] = useLocalStorage<string[]>("planner_finance_income_cats", [
    "Salário", "Freelance", "Investimentos", "Outros",
  ]);

  const addTransaction = (t: Omit<Transaction, "id">) => {
    setTransactions([...transactions, { ...t, id: crypto.randomUUID() }]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const setBudget = (category: string, limit: number, month: string) => {
    const existing = budgets.findIndex((b) => b.category === category && b.month === month);
    if (existing >= 0) {
      const updated = [...budgets];
      updated[existing] = { ...updated[existing], limit };
      setBudgets(updated);
    } else {
      setBudgets([...budgets, { id: crypto.randomUUID(), category, limit, month }]);
    }
  };

  const getBudgetForMonth = (month: string) => budgets.filter((b) => b.month === month);

  const getMonthlyTotals = (month: string) => {
    const monthTx = transactions.filter((t) => t.date.startsWith(month));
    const income = monthTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  };

  const getExpenseByCategory = (month: string) => {
    const monthTx = transactions.filter((t) => t.date.startsWith(month) && t.type === "expense");
    const byCategory: Record<string, number> = {};
    monthTx.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return byCategory;
  };

  const addExpenseCategory = (cat: string) => {
    if (!expenseCategories.includes(cat)) setExpenseCategories([...expenseCategories, cat]);
  };

  const addIncomeCategory = (cat: string) => {
    if (!incomeCategories.includes(cat)) setIncomeCategories([...incomeCategories, cat]);
  };

  return {
    transactions, budgets, expenseCategories, incomeCategories,
    addTransaction, deleteTransaction, updateTransaction,
    setBudget, getBudgetForMonth, getMonthlyTotals, getExpenseByCategory,
    addExpenseCategory, addIncomeCategory,
  };
}
