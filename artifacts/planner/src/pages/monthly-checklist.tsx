import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTasks } from "@/hooks/use-tasks";
import { useHabits } from "@/hooks/use-habits";
import { useSelfCare } from "@/hooks/use-self-care";
import { useFinance } from "@/hooks/use-finance";
import { useEvents } from "@/hooks/use-events";
import { useBooks } from "@/hooks/use-books";
import { useCourses } from "@/hooks/use-courses";
import { useWater } from "@/hooks/use-water";
import { useMood } from "@/hooks/use-mood";
import { useImportantDates } from "@/hooks/use-important-dates";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2, ChevronLeft, ChevronRight, Activity, Heart, Wallet,
  CalendarDays, BookMarked, Sparkles, Droplet, Smile, CalendarHeart, TrendingUp, TrendingDown, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ScoreRing({ percent, label, color = "stroke-primary" }: { percent: number; label: string; color?: string }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/30" />
          <circle cx="32" cy="32" r={r} fill="none" strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset} className={color} style={{ transition: "stroke-dashoffset 0.6s ease" }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{percent}%</span>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function SectionCard({ icon, title, children, accent = "border-primary/20" }: { icon: React.ReactNode; title: string; children: React.ReactNode; accent?: string }) {
  return (
    <Card className={cn("border", accent)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-serif italic flex items-center gap-2">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

function MoodCalendar({ moodRecords, monthStr }: { moodRecords: { date: string; emoji: string }[]; monthStr: string }) {
  const map: Record<string, string> = {};
  moodRecords.forEach((r) => { if (r.date.startsWith(monthStr)) map[r.date] = r.emoji; });
  const counts: Record<string, number> = {};
  Object.values(map).forEach((e) => { counts[e] = (counts[e] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const totalDays = Object.keys(map).length;
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{totalDays} dias com humor registrado</p>
      {sorted.slice(0, 5).map(([emoji, count]) => (
        <div key={emoji} className="flex items-center gap-2">
          <span className="text-lg w-7">{emoji}</span>
          <div className="flex-1">
            <Progress value={Math.round((count / totalDays) * 100)} className="h-2" />
          </div>
          <span className="text-xs text-muted-foreground w-10 text-right">{count}x</span>
        </div>
      ))}
      {sorted.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhum humor registrado</p>}
    </div>
  );
}

export default function MonthlyChecklist() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthStr = format(currentMonth, "yyyy-MM");
  const monthLabel = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });
  const monthStart = format(startOfMonth(currentMonth), "yyyy-MM-dd");
  const monthEnd = format(endOfMonth(currentMonth), "yyyy-MM-dd");
  const daysInMonth = endOfMonth(currentMonth).getDate();
  const passedDays = Math.min(daysInMonth, currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear()
    ? new Date().getDate() : daysInMonth);

  const { tasks } = useTasks();
  const { habits } = useHabits();
  const { rituals } = useSelfCare();
  const { getMonthlyTotals } = useFinance();
  const { events } = useEvents();
  const { books } = useBooks();
  const { courses } = useCourses();
  const { getMonthlyAverage, waterRecords } = useWater();
  const { moodRecords } = useMood();
  const { dates: importantDates } = useImportantDates();

  const monthMoodRecords = moodRecords || [];

  // Tasks
  const monthTasks = tasks.filter((t) => t.date?.startsWith(monthStr));
  const completedTasks = monthTasks.filter((t) => t.completed);
  const taskPercent = monthTasks.length > 0 ? Math.round((completedTasks.length / monthTasks.length) * 100) : 0;
  const taskCategories = [...new Set(monthTasks.map((t) => t.category))];

  // Habits
  const habitStats = habits.map((h) => {
    const completedInMonth = h.completedDates.filter((d) => d >= monthStart && d <= monthEnd).length;
    return { ...h, completedInMonth, pct: Math.round((completedInMonth / passedDays) * 100) };
  });
  const avgHabitPct = habitStats.length > 0 ? Math.round(habitStats.reduce((s, h) => s + h.pct, 0) / habitStats.length) : 0;

  // Self-care
  const monthRituals = rituals.filter((r) => r.date?.startsWith(monthStr) || !r.date);
  const completedRituals = monthRituals.filter((r) => r.completed);
  const ritualPct = monthRituals.length > 0 ? Math.round((completedRituals.length / monthRituals.length) * 100) : 0;

  // Finance
  const { income, expense, balance } = getMonthlyTotals(monthStr);

  // Events
  const monthEvents = events.filter((e) => e.date.startsWith(monthStr));

  // Books
  const booksRead = books.filter((b) => b.status === "finished");
  const booksReading = books.filter((b) => b.status === "reading");

  // Courses
  const coursesInProgress = courses.filter((c) => c.status === "in-progress");
  const coursesCompleted = courses.filter((c) => c.status === "completed");

  // Water
  const avgWater = getMonthlyAverage(monthStr);
  const monthWaterRecords = waterRecords.filter((r) => r.date.startsWith(monthStr));
  const daysHitGoal = monthWaterRecords.filter((r) => r.liters >= 2).length;
  const waterPct = passedDays > 0 ? Math.round((daysHitGoal / passedDays) * 100) : 0;

  // Important dates this month
  const monthImportantDates = importantDates.filter((d) => d.date.startsWith(monthStr));

  // Overall score (weighted)
  const scores = [taskPercent, avgHabitPct, ritualPct, waterPct].filter((_, i) => [monthTasks.length, habits.length, monthRituals.length, passedDays].at(i)! > 0);
  const overallScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "😊";
    if (score >= 40) return "💪";
    return "🌱";
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Mês incrível! Você arrasou!";
    if (score >= 60) return "Ótimo progresso! Continue assim!";
    if (score >= 40) return "Bom esforço! O próximo será ainda melhor!";
    return "Cada passo conta. Você está crescendo!";
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
        <CheckCircle2 className="h-6 w-6" /> Balanço Mensal
      </h1>

      {/* Month Navigation */}
      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))} data-testid="button-prev-month">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-medium capitalize">{monthLabel}</h2>
        <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))} data-testid="button-next-month">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Overall Score */}
      <Card className="bg-gradient-to-br from-primary/10 via-purple-50/50 to-pink-50/30 dark:from-primary/10 dark:via-purple-900/10 dark:to-pink-900/10 border-primary/30">
        <CardContent className="py-6 px-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="text-center">
              <div className="text-6xl mb-2">{getScoreEmoji(overallScore)}</div>
              <div className="text-4xl font-bold text-primary">{overallScore}%</div>
              <div className="text-sm text-muted-foreground mt-1">Pontuação Geral</div>
            </div>
            <div className="flex-1 space-y-3">
              <p className="text-lg font-serif italic text-primary">{getScoreMessage(overallScore)}</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <ScoreRing percent={taskPercent} label="Tarefas" color="stroke-blue-400" />
                <ScoreRing percent={avgHabitPct} label="Hábitos" color="stroke-orange-400" />
                <ScoreRing percent={ritualPct} label="Autocuidado" color="stroke-pink-400" />
                <ScoreRing percent={waterPct} label="Hidratação" color="stroke-cyan-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Tasks */}
        <SectionCard icon={<CheckCircle2 className="h-4 w-4 text-blue-500" />} title="Tarefas" accent="border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-blue-500">{taskPercent}%</span>
            <span className="text-sm text-muted-foreground">{completedTasks.length}/{monthTasks.length} concluídas</span>
          </div>
          <Progress value={taskPercent} className="h-2" />
          {taskCategories.map((cat) => {
            const catTasks = monthTasks.filter((t) => t.category === cat);
            const catDone = catTasks.filter((t) => t.completed);
            const pct = Math.round((catDone.length / catTasks.length) * 100);
            return (
              <div key={cat} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{cat}</span><span>{catDone.length}/{catTasks.length}</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>
            );
          })}
          {monthTasks.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhuma tarefa este mês</p>}
        </SectionCard>

        {/* Habits */}
        <SectionCard icon={<Activity className="h-4 w-4 text-orange-500" />} title="Hábitos" accent="border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-500">{avgHabitPct}%</span>
            <span className="text-sm text-muted-foreground">consistência média</span>
          </div>
          {habitStats.map((h) => (
            <div key={h.id} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium truncate max-w-[60%]">{h.title}</span>
                <span className="text-muted-foreground">{h.completedInMonth}/{passedDays} dias</span>
              </div>
              <Progress value={h.pct} className="h-1.5" />
            </div>
          ))}
          {habits.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhum hábito cadastrado</p>}
        </SectionCard>

        {/* Self-care */}
        <SectionCard icon={<Heart className="h-4 w-4 text-pink-500" />} title="Autocuidado" accent="border-pink-100">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-pink-500">{ritualPct}%</span>
            <span className="text-sm text-muted-foreground">{completedRituals.length}/{monthRituals.length} rituais</span>
          </div>
          <Progress value={ritualPct} className="h-2" />
          {["Skincare", "Cabelo", "Exercício", "Meditação", "Outros"].map((cat) => {
            const catRituals = rituals.filter((r) => r.category === cat);
            const done = catRituals.filter((r) => r.completed).length;
            if (catRituals.length === 0) return null;
            return (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{cat}</span>
                <Badge variant="secondary" className="text-xs">{done}/{catRituals.length}</Badge>
              </div>
            );
          })}
          {rituals.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhum ritual cadastrado</p>}
        </SectionCard>

        {/* Finance */}
        <SectionCard icon={<Wallet className="h-4 w-4 text-green-500" />} title="Finanças" accent="border-green-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-300">Receitas</span>
              </div>
              <span className="font-bold text-green-700 dark:text-green-300">R$ {income.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/20">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-600 dark:text-red-300">Despesas</span>
              </div>
              <span className="font-bold text-red-600 dark:text-red-300">R$ {expense.toFixed(2)}</span>
            </div>
            <div className={cn("flex items-center justify-between p-2 rounded-lg", balance >= 0 ? "bg-primary/10" : "bg-orange-50 dark:bg-orange-900/20")}>
              <span className="text-sm font-medium">Saldo</span>
              <span className={cn("font-bold", balance >= 0 ? "text-primary" : "text-orange-600")}>{balance >= 0 ? "+" : ""}R$ {balance.toFixed(2)}</span>
            </div>
          </div>
          {income === 0 && expense === 0 && <p className="text-xs text-muted-foreground text-center py-1">Nenhum lançamento este mês</p>}
        </SectionCard>

        {/* Water */}
        <SectionCard icon={<Droplet className="h-4 w-4 text-cyan-500" />} title="Hidratação" accent="border-cyan-100">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-cyan-500">{avgWater.toFixed(1)}L</span>
            <span className="text-sm text-muted-foreground">média diária</span>
          </div>
          <Progress value={Math.min(100, (avgWater / 2) * 100)} className="h-2" />
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-center">
              <div className="font-bold text-cyan-600">{daysHitGoal}</div>
              <div className="text-muted-foreground">dias com 2L+</div>
            </div>
            <div className="p-2 rounded-lg bg-muted text-center">
              <div className="font-bold">{monthWaterRecords.length}</div>
              <div className="text-muted-foreground">dias registrados</div>
            </div>
          </div>
        </SectionCard>

        {/* Mood */}
        <SectionCard icon={<Smile className="h-4 w-4 text-yellow-500" />} title="Humor do Mês" accent="border-yellow-100">
          <MoodCalendar moodRecords={monthMoodRecords} monthStr={monthStr} />
        </SectionCard>

        {/* Events */}
        <SectionCard icon={<CalendarDays className="h-4 w-4 text-purple-500" />} title="Agenda" accent="border-purple-100">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-purple-500">{monthEvents.length}</span>
            <span className="text-sm text-muted-foreground">eventos este mês</span>
          </div>
          {["Pessoal", "Faculdade", "Trabalho", "Saúde"].map((cat) => {
            const count = monthEvents.filter((e) => e.category === cat).length;
            if (count === 0) return null;
            return (
              <div key={cat} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{cat}</span>
                <Badge variant="outline" className="text-xs">{count}</Badge>
              </div>
            );
          })}
          {monthEvents.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nenhum evento este mês</p>}
        </SectionCard>

        {/* Books & Courses */}
        <SectionCard icon={<BookMarked className="h-4 w-4 text-indigo-500" />} title="Livros & Cursos" accent="border-indigo-100">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><BookMarked className="h-3.5 w-3.5" /> Lendo</span>
              <Badge variant="secondary">{booksReading.length}</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3.5 w-3.5" /> Finalizados</span>
              <Badge variant="secondary">{booksRead.length}</Badge>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Em andamento</span>
              <Badge variant="secondary">{coursesInProgress.length}</Badge>
            </div>
            {coursesInProgress.map((c) => (
              <div key={c.id} className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="truncate max-w-[70%]">{c.name}</span>
                  <span>{c.progress}%</span>
                </div>
                <Progress value={c.progress} className="h-1.5" />
              </div>
            ))}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Concluídos</span>
              <Badge variant="secondary">{coursesCompleted.length}</Badge>
            </div>
          </div>
        </SectionCard>

        {/* Important Dates */}
        {monthImportantDates.length > 0 && (
          <SectionCard icon={<CalendarHeart className="h-4 w-4 text-rose-500" />} title="Datas Especiais" accent="border-rose-100">
            <div className="space-y-2">
              {monthImportantDates.map((d) => (
                <div key={d.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-rose-50/50 dark:bg-rose-900/10">
                  <span>{d.category === "birthday" ? "🎂" : d.category === "anniversary" ? "💍" : d.category === "deadline" ? "⏰" : d.category === "holiday" ? "🎉" : "📌"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-xs truncate">{d.title}</p>
                    <p className="text-xs text-muted-foreground">{format(new Date(d.date + "T12:00:00"), "d 'de' MMM", { locale: ptBR })}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}
