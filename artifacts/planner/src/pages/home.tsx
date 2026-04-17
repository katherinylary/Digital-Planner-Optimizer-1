import { useTheme } from "@/hooks/use-theme";
import { format, addDays, isToday, isTomorrow, parseISO, getDayOfYear } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useWater } from "@/hooks/use-water";
import { useMood } from "@/hooks/use-mood";
import { useGoals } from "@/hooks/use-goals";
import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Droplet, Plus, Target, CheckCircle2, Sparkles, NotebookPen, CalendarDays, Clock, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const MOODS = ["😊", "😢", "😡", "😴", "🥰", "😎", "🤩", "😤", "😌", "🥺", "😭", "😋", "🤔", "💪", "🌸", "✨", "🦋", "💖", "🔥", "⭐", "🌈", "☀️", "🌙"];

const CATEGORY_COLORS: Record<string, string> = {
  Pessoal: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
  Faculdade: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Trabalho: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Saúde: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
};

const QUOTES = [
  { text: "Ela acreditou que poderia, então ela conseguiu.", author: "R.S. Grey" },
  { text: "Você é mais corajosa do que acredita, mais forte do que parece e mais inteligente do que pensa.", author: "A.A. Milne" },
  { text: "A vida não é medida pelo número de respirações que damos, mas pelos momentos que nos tiram o fôlego.", author: "Maya Angelou" },
  { text: "Cuide de si mesma como cuidaria de alguém que você ama.", author: "" },
  { text: "Pequenos passos todos os dias levam a grandes conquistas.", author: "" },
  { text: "Você tem permissão para ser um obra em andamento e uma obra de arte ao mesmo tempo.", author: "" },
  { text: "Hoje é um bom dia para ter um ótimo dia.", author: "" },
  { text: "Floresça onde você foi plantada.", author: "" },
  { text: "Seja a energia que você quer atrair.", author: "" },
  { text: "A mais poderosa força do universo é uma mulher que decidiu avançar.", author: "" },
  { text: "Sua única limitação é a sua imaginação. Sonhe alto!", author: "" },
  { text: "Cada dia é uma nova oportunidade de crescer, aprender e ser melhor.", author: "" },
  { text: "Você não precisa ser perfeita para ser incrível.", author: "" },
  { text: "Confie no processo. Suas melhores histórias ainda estão sendo escritas.", author: "" },
  { text: "A mulher que não precisa de aprovação é a mais temida do mundo.", author: "Mohadesa Najumi" },
  { text: "Gentileza começa por você mesma.", author: "" },
  { text: "Uma mulher com objetivos é imparável.", author: "" },
  { text: "Acredite na magia dos novos começos.", author: "" },
  { text: "Você é exatamente o que o mundo precisa.", author: "" },
  { text: "Não espere a tempestade passar. Aprenda a dançar na chuva.", author: "" },
  { text: "Sua voz importa. Seu tempo importa. Você importa.", author: "" },
  { text: "A gratidão transforma o que temos em suficiente.", author: "" },
  { text: "Desperte com determinação. Durma com satisfação.", author: "" },
  { text: "Seja a protagonista da sua própria história.", author: "" },
  { text: "Hoje escolho ser feliz. Amanhã, faço o mesmo.", author: "" },
  { text: "Você foi feita para coisas grandes, não esqueça disso.", author: "" },
  { text: "A força que você precisa já está dentro de você.", author: "" },
  { text: "Ame-se primeiro. O resto vem depois.", author: "" },
  { text: "Cada conquista começa com a decisão de tentar.", author: "" },
  { text: "Respire fundo. Você está fazendo melhor do que imagina.", author: "" },
  { text: "Sonhos não têm prazo de validade. Continue.", author: "" },
];

function getDailyQuote() {
  const dayOfYear = getDayOfYear(new Date());
  return QUOTES[dayOfYear % QUOTES.length];
}

function WaterDroplet({ index, liters, onSet }: { index: number; liters: number; onSet: (v: number) => void }) {
  const halfVal = index - 0.5;
  const fullVal = index;
  const isFull = liters >= fullVal;
  const isHalf = liters >= halfVal && liters < fullVal;

  const handleClick = () => {
    if (isFull) onSet(halfVal);
    else if (isHalf) onSet(halfVal - 0.5 < 0 ? 0 : halfVal - 0.5);
    else onSet(fullVal);
  };

  const handleHalfClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isHalf) onSet(halfVal - 0.5 < 0 ? 0 : halfVal - 0.5);
    else onSet(halfVal);
  };

  const handleFullClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFull) onSet(halfVal);
    else onSet(fullVal);
  };

  return (
    <div className="flex flex-col items-center gap-1" title={`${index - 0.5}L / ${index}L`}>
      <div className="relative w-10 h-14 cursor-pointer select-none">
        <div className="absolute inset-0 overflow-hidden rounded-b-full rounded-t-[60%]">
          <div className={cn("absolute inset-0 transition-colors duration-200", isFull ? "bg-blue-400" : isHalf ? "bg-blue-300" : "bg-muted/50")} />
          {!isFull && !isHalf && (
            <div className="absolute inset-0 border-2 border-blue-200/50 rounded-b-full rounded-t-[60%]" />
          )}
        </div>
        <div className="absolute inset-0 flex flex-col">
          <button
            onClick={handleFullClick}
            className="flex-1 w-full rounded-t-[60%]"
            title={isFull ? `Reduzir para ${halfVal}L` : `Completar ${index}L`}
          />
          <button
            onClick={handleHalfClick}
            className="flex-1 w-full rounded-b-full"
            title={isHalf ? `Remover ${halfVal}L` : `Adicionar ${halfVal}L`}
          />
        </div>
        {(isFull || isHalf) && (
          <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold pointer-events-none select-none">
            <Droplet className="h-4 w-4 fill-white/80 text-white/80" />
          </div>
        )}
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{index}L</span>
    </div>
  );
}

export default function Home() {
  const { theme } = useTheme();
  const today = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  const { tasks, toggleTask } = useTasks();
  const { getLitersForDate, setLitersForDate } = useWater();
  const { getMoodForDate, setMoodForDate } = useMood();
  const { getGoalsForDate, addGoal, toggleGoal } = useGoals();
  const { events } = useEvents();

  const todayTasks = tasks.filter(t => t.date === today || !t.completed);
  const pendingTasks = todayTasks.filter(t => !t.completed);

  const liters = getLitersForDate(today);
  const currentMood = getMoodForDate(today);
  const todayGoals = getGoalsForDate(today);
  const dailyQuote = getDailyQuote();

  const [newGoal, setNewGoal] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addGoal(today, newGoal.trim());
      setNewGoal("");
    }
  };

  const upcomingEvents = events
    .filter((ev) => ev.date >= today && ev.date <= format(addDays(new Date(), 7), "yyyy-MM-dd"))
    .sort((a, b) => { const d = a.date.localeCompare(b.date); return d !== 0 ? d : a.time.localeCompare(b.time); })
    .slice(0, 5);

  const getDateLabel = (dateStr: string) => {
    try {
      const d = parseISO(dateStr);
      if (isToday(d)) return "Hoje";
      if (isTomorrow(d)) return "Amanhã";
      return format(d, "EEE, d MMM", { locale: ptBR });
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-serif italic text-primary flex items-center gap-2">
  {theme === "masculino" ? "Olá!" : "Olá, linda!"}
  <Sparkles className="h-6 w-6 text-yellow-400" />
</h1>
        </h1>
        <p className="text-muted-foreground capitalize mt-1">{displayDate}</p>
      </div>

      {/* Daily Quote */}
      <Card className="bg-gradient-to-r from-primary/10 via-purple-50/50 to-pink-50/50 dark:from-primary/10 dark:via-purple-900/10 dark:to-pink-900/10 border-primary/20">
        <CardContent className="py-4 px-5 flex items-start gap-3">
          <Quote className="h-5 w-5 text-primary/60 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm italic font-medium text-foreground leading-relaxed">"{dailyQuote.text}"</p>
            {dailyQuote.author && <p className="text-xs text-muted-foreground mt-1">— {dailyQuote.author}</p>}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-8 space-y-6">

          {/* Goals */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/30 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif italic flex items-center gap-2 text-primary">
                <Target className="h-5 w-5" /> Intenções de Hoje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todayGoals.map(goal => (
                  <div key={goal.id} className="flex items-center gap-3 bg-background/50 p-3 rounded-lg border border-border/50">
                    <Checkbox
                      id={`goal-${goal.id}`}
                      checked={goal.completed}
                      onCheckedChange={() => toggleGoal(goal.id)}
                      className="rounded-full data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                    />
                    <label htmlFor={`goal-${goal.id}`} className={cn("flex-1 cursor-pointer transition-all", goal.completed && "text-muted-foreground line-through")}>
                      {goal.title}
                    </label>
                  </div>
                ))}
                <form onSubmit={handleAddGoal} className="flex gap-2">
                  <Input
                    placeholder="Adicionar uma intenção..."
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    className="bg-background/50 border-primary/20 focus-visible:ring-primary/30"
                  />
                  <Button type="submit" size="icon" variant="secondary" className="shrink-0 text-primary">
                    <Plus className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-serif italic flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Próximos Eventos
              </CardTitle>
              <Link href="/schedule" className="text-sm text-primary hover:underline font-medium">Ver agenda</Link>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><p>Nenhum evento nos próximos 7 dias 🗓️</p></div>
              ) : (
                <div className="space-y-2">
                  {upcomingEvents.map((ev) => (
                    <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/30 transition-colors">
                      <div className="flex flex-col items-center justify-center w-10 shrink-0">
                        <span className="text-xs font-semibold text-primary leading-tight">{getDateLabel(ev.date).split(",")[0]}</span>
                        {ev.date !== today && <span className="text-xs text-muted-foreground leading-tight">{format(parseISO(ev.date), "d/MM")}</span>}
                      </div>
                      <div className="w-px h-8 bg-border shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{ev.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground">{ev.time}{ev.endTime ? ` - ${ev.endTime}` : ""}</span>
                          <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-medium", CATEGORY_COLORS[ev.category] || "bg-muted text-muted-foreground")}>
                            {ev.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-serif italic flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" /> Prioridades
              </CardTitle>
              <Link href="/tasks" className="text-sm text-primary hover:underline font-medium">Ver todas</Link>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground"><p>Tudo em dia por aqui! ✨</p></div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map(task => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                      <Checkbox
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                      />
                      <div className="flex-1 min-w-0">
                        <label htmlFor={`task-${task.id}`} className="text-sm font-medium cursor-pointer block truncate">{task.title}</label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{task.category}</span>
                          {task.priority === "urgent" && <span className="text-xs text-destructive font-medium">Urgente</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 space-y-6">

          {/* Mood */}
          <Card className="border-pink-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300" />
            <CardHeader className="pb-3 text-center">
              <CardTitle className="text-lg font-serif italic">Como você está hoje?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-2">
                {MOODS.slice(0, 14).map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setMoodForDate(today, emoji)}
                    className={cn(
                      "text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                      currentMood === emoji ? "bg-primary/20 scale-110 shadow-sm" : "hover:bg-muted"
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Water Tracker */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-serif italic flex items-center justify-center gap-2 text-blue-400">
                <Droplet className="h-5 w-5" /> Hidratação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-muted-foreground text-center">
                  Clique na metade inferior para ½L e na metade superior para 1L completo
                </p>
                <div className="flex gap-3 justify-center">
                  {[1, 2, 3, 4].map((i) => (
                    <WaterDroplet key={i} index={i} liters={liters} onSet={setLitersForDate.bind(null, today)} />
                  ))}
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-500">{liters.toFixed(1)}</span>
                  <span className="text-sm text-muted-foreground"> L de 2.0 L</span>
                </div>
                {liters >= 2 && (
                  <p className="text-xs text-green-600 font-medium">🎉 Meta diária atingida!</p>
                )}
                <div className="flex gap-1 mt-1">
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2" onClick={() => setLitersForDate(today, 0)}>
                    Zerar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs h-7 px-2 text-blue-500" onClick={() => setLitersForDate(today, Math.min(4, liters + 0.5))}>
                    +0.5L
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick links */}
          <div className="grid grid-cols-2 gap-3">
            <Link href="/diary" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-center">
              <NotebookPen className="h-6 w-6" />
              <span className="text-sm font-medium">Diário</span>
            </Link>
            <Link href="/self-care" className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors text-center dark:bg-purple-900/20 dark:text-purple-300">
              <Sparkles className="h-6 w-6" />
              <span className="text-sm font-medium">Rituais</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
