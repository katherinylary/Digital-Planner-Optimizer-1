import { useState } from "react";
import { useSelfCare } from "@/hooks/use-self-care";
import type { SelfCareRitual } from "@/hooks/use-self-care";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, Plus, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, string> = {
  "Skincare": "🧴",
  "Cabelo": "💇‍♀️",
  "Exercício": "🏃‍♀️",
  "Meditação": "🧘‍♀️",
  "Outros": "✨",
};

const FREQ_LABELS: Record<string, string> = {
  once: "Uma vez",
  daily: "Diariamente",
  weekdays: "Dias úteis",
  weekends: "Fins de semana",
  custom: "Personalizado",
};

export default function SelfCare() {
  const { rituals, addRitual, toggleRitual, deleteRitual } = useSelfCare();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [form, setForm] = useState({
    title: "", description: "", date: "", time: "",
    frequency: "daily" as SelfCareRitual["frequency"],
    category: "Skincare" as SelfCareRitual["category"],
  });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addRitual(form);
    setForm({ title: "", description: "", date: "", time: "", frequency: "daily", category: "Skincare" });
    setOpen(false);
  };

  const cats = ["Todos", "Skincare", "Cabelo", "Exercício", "Meditação", "Outros"];
  const filtered = activeCategory === "Todos" ? rituals : rituals.filter((r) => r.category === activeCategory);
  const pending = filtered.filter((r) => !r.completed);
  const completed = filtered.filter((r) => r.completed);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <Heart className="h-6 w-6" /> Autocuidado
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="button-add-ritual"><Plus className="h-4 w-4 mr-1" /> Novo Ritual</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif italic flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Novo Ritual de Autocuidado</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="O que você vai fazer?" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-ritual-title" />
              <Textarea placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-ritual-description" />
              <div className="flex gap-2">
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="input-ritual-date" />
                <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} data-testid="input-ritual-time" />
              </div>
              <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v as SelfCareRitual["frequency"] })}>
                <SelectTrigger data-testid="select-ritual-frequency"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="once">Uma vez</SelectItem>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekdays">Dias úteis</SelectItem>
                  <SelectItem value="weekends">Fins de semana</SelectItem>
                </SelectContent>
              </Select>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as SelfCareRitual["category"] })}>
                <SelectTrigger data-testid="select-ritual-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Skincare">🧴 Skincare</SelectItem>
                  <SelectItem value="Cabelo">💇‍♀️ Cabelo</SelectItem>
                  <SelectItem value="Exercício">🏃‍♀️ Exercício</SelectItem>
                  <SelectItem value="Meditação">🧘‍♀️ Meditação</SelectItem>
                  <SelectItem value="Outros">✨ Outros</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAdd} className="w-full" data-testid="button-save-ritual">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-2 flex-wrap">
        {cats.map((c) => (
          <button key={c} onClick={() => setActiveCategory(c)} className={cn("px-3 py-1.5 rounded-full text-sm font-medium transition-colors", activeCategory === c ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")} data-testid={`tab-selfcare-${c}`}>
            {c !== "Todos" ? `${CATEGORY_ICONS[c] || ""} ${c}` : c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhum ritual ainda. Cuide de você! 🌸</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <Card key={r.id} data-testid={`ritual-${r.id}`}>
              <CardContent className="py-3 px-4 flex items-start gap-3">
                <Checkbox checked={r.completed} onCheckedChange={() => toggleRitual(r.id)} className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{CATEGORY_ICONS[r.category]} {r.title}</p>
                  {r.description && <p className="text-xs text-muted-foreground mt-0.5">{r.description}</p>}
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge variant="secondary" className="text-xs">{FREQ_LABELS[r.frequency]}</Badge>
                    {r.date && <span className="text-xs text-muted-foreground">{r.date}{r.time ? ` às ${r.time}` : ""}</span>}
                  </div>
                </div>
                <button onClick={() => deleteRitual(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </CardContent>
            </Card>
          ))}
          {completed.length > 0 && (
            <>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider pt-2">Concluídos</h3>
              {completed.map((r) => (
                <Card key={r.id} className="opacity-60">
                  <CardContent className="py-3 px-4 flex items-center gap-3">
                    <Checkbox checked={r.completed} onCheckedChange={() => toggleRitual(r.id)} className="data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                    <span className="text-sm line-through flex-1">{CATEGORY_ICONS[r.category]} {r.title}</span>
                    <button onClick={() => deleteRitual(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
