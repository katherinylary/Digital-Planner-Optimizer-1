import { useState } from "react";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export default function MonthlyChecklist() {
  const { tasks } = useTasks();
  const { habits } = useHabits();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStr = format(currentMonth, "yyyy-MM");
  const monthTasks = tasks.filter((t) => t.date?.startsWith(monthStr));
  const completedTasks = monthTasks.filter((t) => t.completed);
  const taskPercent = monthTasks.length > 0 ? Math.round((completedTasks.length / monthTasks.length) * 100) : 0;

  const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");
  const daysInMonth = endOfMonth(currentMonth).getDate();

  const habitStats = habits.map((h) => {
    const completedInMonth = h.completedDates.filter((d) => d >= monthStart && d <= monthEnd).length;
    return { ...h, completedInMonth, percentage: Math.round((completedInMonth / daysInMonth) * 100) };
  });

  const categories = [...new Set(monthTasks.map((t) => t.category))];

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
        <CheckCircle2 className="h-6 w-6" /> Checklist Mensal
      </h1>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} data-testid="button-prev-month"><ChevronLeft className="h-4 w-4" /></Button>
        <h2 className="text-lg font-medium capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} data-testid="button-next-month"><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-primary/5 to-secondary/20">
          <CardHeader><CardTitle className="text-lg font-serif italic">Tarefas do Mês</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{taskPercent}%</span>
              <p className="text-sm text-muted-foreground mt-1">{completedTasks.length} de {monthTasks.length} concluídas</p>
            </div>
            <Progress value={taskPercent} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg font-serif italic">Hábitos do Mês</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {habitStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Nenhum hábito registrado</p>
            ) : (
              habitStats.map((h) => (
                <div key={h.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{h.title}</span>
                    <span className="text-muted-foreground">{h.completedInMonth}/{daysInMonth} dias</span>
                  </div>
                  <Progress value={h.percentage} className="h-2" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {categories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-serif italic">Por Categoria</h2>
          {categories.map((cat) => {
            const catTasks = monthTasks.filter((t) => t.category === cat);
            const catCompleted = catTasks.filter((t) => t.completed);
            const pct = Math.round((catCompleted.length / catTasks.length) * 100);
            return (
              <Card key={cat}>
                <CardContent className="py-4 px-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{cat}</h3>
                    <span className="text-sm text-muted-foreground">{pct}%</span>
                  </div>
                  <Progress value={pct} className="h-2 mb-3" />
                  <div className="space-y-1">
                    {catTasks.map((t) => (
                      <div key={t.id} className="flex items-center gap-2 text-sm">
                        <span className={t.completed ? "text-primary" : "text-muted-foreground"}>{t.completed ? "✓" : "○"}</span>
                        <span className={t.completed ? "line-through text-muted-foreground" : ""}>{t.title}</span>
                      </div>
                    ))}
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
