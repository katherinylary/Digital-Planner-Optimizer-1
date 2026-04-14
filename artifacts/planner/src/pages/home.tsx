import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";
import { useTasks } from "@/hooks/use-tasks";
import { useWater } from "@/hooks/use-water";
import { useMood } from "@/hooks/use-mood";
import { useGoals } from "@/hooks/use-goals";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Droplet, Plus, Target, CheckCircle2, Sparkles, NotebookPen } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";

const MOODS = ["😊", "😢", "😡", "😴", "🥰", "😎", "🤩", "😤", "😌", "🥺", "😭", "😋", "🤔", "💪", "🌸", "✨", "🦋", "💖", "🔥", "⭐", "🌈", "☀️", "🌙"];

export default function Home() {
  const today = format(new Date(), "yyyy-MM-dd");
  const displayDate = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
  
  const { tasks, toggleTask } = useTasks();
  const { getWaterForDate, setWaterForDate } = useWater();
  const { getMoodForDate, setMoodForDate } = useMood();
  const { getGoalsForDate, addGoal, toggleGoal, deleteGoal } = useGoals();

  const todayTasks = tasks.filter(t => t.date === today || !t.completed); // Show pending or today's tasks
  const pendingTasks = todayTasks.filter(t => !t.completed);
  
  const waterGlasses = getWaterForDate(today);
  const currentMood = getMoodForDate(today);
  const todayGoals = getGoalsForDate(today);

  const [newGoal, setNewGoal] = useState("");

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (newGoal.trim()) {
      addGoal(today, newGoal.trim());
      setNewGoal("");
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif italic text-primary flex items-center gap-2">
            Olá, linda! <Sparkles className="h-6 w-6 text-yellow-400" />
          </h1>
          <p className="text-muted-foreground capitalize mt-1">{displayDate}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Goals */}
          <Card className="bg-gradient-to-br from-primary/5 to-secondary/30 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif italic flex items-center gap-2 text-primary">
                <Target className="h-5 w-5" />
                Intenções de Hoje
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
                    <label 
                      htmlFor={`goal-${goal.id}`}
                      className={cn(
                        "flex-1 cursor-pointer transition-all",
                        goal.completed && "text-muted-foreground line-through"
                      )}
                    >
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

          {/* Tasks Overview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg font-serif italic flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                Prioridades
              </CardTitle>
              <Link href="/tasks" className="text-sm text-primary hover:underline font-medium">
                Ver todas
              </Link>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Tudo em dia por aqui! ✨</p>
                </div>
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
                        <label 
                          htmlFor={`task-${task.id}`}
                          className="text-sm font-medium cursor-pointer block truncate"
                        >
                          {task.title}
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {task.category}
                          </span>
                          {task.priority === 'urgent' && <span className="text-xs text-destructive font-medium">Urgente</span>}
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
          
          {/* Mood Tracker */}
          <Card className="border-pink-100 overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300"></div>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-serif italic flex items-center justify-center gap-2 text-blue-400">
                <Droplet className="h-5 w-5" />
                Hidratação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center gap-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((glass) => (
                    <button
                      key={glass}
                      onClick={() => setWaterForDate(today, glass === waterGlasses ? glass - 1 : glass)}
                      className={cn(
                        "transition-all duration-300",
                        glass <= waterGlasses ? "text-blue-400 scale-110" : "text-muted hover:text-blue-200"
                      )}
                    >
                      <Droplet className="h-8 w-8" fill={glass <= waterGlasses ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground font-medium">
                  {waterGlasses} de 8 copos
                </p>
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
