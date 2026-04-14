import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useImportantDates } from "@/hooks/use-important-dates";
import type { ImportantDate } from "@/hooks/use-important-dates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CalendarHeart, Plus, Trash2 } from "lucide-react";

const CAT_ICONS: Record<ImportantDate["category"], string> = {
  birthday: "🎂", anniversary: "💍", deadline: "⏰", holiday: "🎉", custom: "📌",
};
const CAT_LABELS: Record<ImportantDate["category"], string> = {
  birthday: "Aniversário", anniversary: "Aniversário de namoro/casamento", deadline: "Prazo", holiday: "Feriado", custom: "Outro",
};

export default function ImportantDates() {
  const { dates, addDate, deleteDate } = useImportantDates();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", category: "birthday" as ImportantDate["category"], recurring: false, description: "" });

  const handleAdd = () => {
    if (!form.title.trim() || !form.date) return;
    addDate(form);
    setForm({ title: "", date: "", category: "birthday", recurring: false, description: "" });
    setOpen(false);
  };

  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const upcoming = sorted.filter((d) => d.date >= format(new Date(), "yyyy-MM-dd"));
  const past = sorted.filter((d) => d.date < format(new Date(), "yyyy-MM-dd"));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <CalendarHeart className="h-6 w-6" /> Datas Importantes
        </h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" data-testid="button-add-date"><Plus className="h-4 w-4 mr-1" /> Nova Data</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-serif italic">Nova Data Importante</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <Input placeholder="Título" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-date-title" />
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="input-date-date" />
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as ImportantDate["category"] })}>
                <SelectTrigger data-testid="select-date-category"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="birthday">🎂 Aniversário</SelectItem>
                  <SelectItem value="anniversary">💍 Aniv. namoro/casamento</SelectItem>
                  <SelectItem value="deadline">⏰ Prazo</SelectItem>
                  <SelectItem value="holiday">🎉 Feriado</SelectItem>
                  <SelectItem value="custom">📌 Outro</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox checked={form.recurring} onCheckedChange={(c) => setForm({ ...form, recurring: c === true })} id="recurring" data-testid="checkbox-recurring" />
                <label htmlFor="recurring" className="text-sm">Recorrente (anual)</label>
              </div>
              <Textarea placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-date-description" />
              <Button onClick={handleAdd} className="w-full" data-testid="button-save-date">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {dates.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground"><p>Nenhuma data importante ainda 🗓️</p></CardContent></Card>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Próximas</h2>
              {upcoming.map((d) => (
                <Card key={d.id} data-testid={`date-${d.id}`}>
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <span className="text-2xl">{CAT_ICONS[d.category]}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{format(new Date(d.date + "T12:00:00"), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                      {d.description && <p className="text-xs text-muted-foreground mt-1">{d.description}</p>}
                      <div className="flex gap-1.5 mt-1.5">
                        <Badge variant="outline" className="text-xs">{CAT_LABELS[d.category]}</Badge>
                        {d.recurring && <Badge variant="secondary" className="text-xs">Anual</Badge>}
                      </div>
                    </div>
                    <button onClick={() => deleteDate(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {past.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Passadas</h2>
              {past.map((d) => (
                <Card key={d.id} className="opacity-60">
                  <CardContent className="py-3 px-4 flex items-start gap-3">
                    <span className="text-2xl">{CAT_ICONS[d.category]}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{d.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{format(new Date(d.date + "T12:00:00"), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                    </div>
                    <button onClick={() => deleteDate(d.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
