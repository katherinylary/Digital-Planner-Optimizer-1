import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEvents } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, Clock, ChevronLeft, ChevronRight, LayoutList, CalendarIcon, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);

export default function Schedule() {
  const { events, addEvent, deleteEvent } = useEvents();
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: format(new Date(), "yyyy-MM-dd"), time: "09:00", endTime: "10:00", description: "", category: "Pessoal" });

  const handleAdd = () => {
    if (!form.title.trim()) return;
    addEvent({ title: form.title, date: form.date, time: form.time, endTime: form.endTime, description: form.description, category: form.category });
    setForm({ title: "", date: format(new Date(), "yyyy-MM-dd"), time: "09:00", endTime: "10:00", description: "", category: "Pessoal" });
    setOpen(false);
  };

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayEvents = events.filter((e) => e.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));

  const monthDays = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const startDay = getDay(startOfMonth(currentMonth));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <CalendarDays className="h-6 w-6" /> Agenda
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button onClick={() => setView("timeline")} className={cn("px-3 py-1.5 text-sm", view === "timeline" ? "bg-primary text-primary-foreground" : "hover:bg-muted")} data-testid="button-view-timeline">
              <LayoutList className="h-4 w-4" />
            </button>
            <button onClick={() => setView("calendar")} className={cn("px-3 py-1.5 text-sm", view === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-muted")} data-testid="button-view-calendar">
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-event"><Plus className="h-4 w-4 mr-1" /> Novo Evento</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="font-serif italic">Novo Evento</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Título do evento" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} data-testid="input-event-title" />
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} data-testid="input-event-date" />
                <div className="flex gap-2">
                  <Input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} data-testid="input-event-time" />
                  <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} data-testid="input-event-end-time" />
                </div>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="select-event-category"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pessoal">Pessoal</SelectItem>
                    <SelectItem value="Faculdade">Faculdade</SelectItem>
                    <SelectItem value="Trabalho">Trabalho</SelectItem>
                    <SelectItem value="Saúde">Saúde</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} data-testid="input-event-description" />
                <Button onClick={handleAdd} className="w-full" data-testid="button-save-event">Salvar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {view === "timeline" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))} data-testid="button-prev-day"><ChevronLeft className="h-4 w-4" /></Button>
            <h2 className="text-lg font-medium capitalize">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</h2>
            <Button variant="ghost" size="icon" onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))} data-testid="button-next-day"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {HOURS.map((hour) => {
                  const hourStr = hour.toString().padStart(2, "0");
                  const hourEvents = dayEvents.filter((e) => e.time.startsWith(hourStr));
                  return (
                    <div key={hour} className="flex min-h-[60px]">
                      <div className="w-16 sm:w-20 py-3 px-2 text-right text-sm text-muted-foreground border-r border-border shrink-0">
                        {hourStr}:00
                      </div>
                      <div className="flex-1 p-2 space-y-1">
                        {hourEvents.map((ev) => (
                          <div key={ev.id} className="flex items-center justify-between bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm" data-testid={`event-${ev.id}`}>
                            <div>
                              <span className="font-medium">{ev.title}</span>
                              <span className="ml-2 text-xs opacity-70">{ev.time}{ev.endTime ? ` - ${ev.endTime}` : ""}</span>
                            </div>
                            <button onClick={() => deleteEvent(ev.id)} className="text-destructive hover:text-destructive/80 ml-2" data-testid={`button-delete-event-${ev.id}`}><Trash2 className="h-3.5 w-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} data-testid="button-prev-month"><ChevronLeft className="h-4 w-4" /></Button>
              <CardTitle className="text-lg capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} data-testid="button-next-month"><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => <div key={d} className="py-1 font-medium">{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => <div key={`empty-${i}`} />)}
              {monthDays.map((day) => {
                const dayStr = format(day, "yyyy-MM-dd");
                const count = events.filter((e) => e.date === dayStr).length;
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <button
                    key={dayStr}
                    onClick={() => { setSelectedDate(day); setView("timeline"); }}
                    className={cn(
                      "aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-colors",
                      isToday && "ring-2 ring-primary",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && "hover:bg-muted"
                    )}
                    data-testid={`calendar-day-${dayStr}`}
                  >
                    {format(day, "d")}
                    {count > 0 && <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary")} />}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
