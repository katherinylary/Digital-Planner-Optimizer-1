import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, getDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEvents } from "@/hooks/use-events";
import type { Event } from "@/hooks/use-events";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Plus, ChevronLeft, ChevronRight, LayoutList, CalendarIcon, Trash2, Pencil, CalendarClock } from "lucide-react";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 6);
const CATEGORIES = ["Pessoal", "Faculdade", "Trabalho", "Saúde"];

const POSTPONE_OPTIONS = [
  { label: "+1 dia", days: 1 },
  { label: "+2 dias", days: 2 },
  { label: "+3 dias", days: 3 },
  { label: "+1 semana", days: 7 },
];

function addDaysToDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return format(d, "yyyy-MM-dd");
}

export default function Schedule() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [view, setView] = useState<"timeline" | "calendar">("timeline");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd"),
    time: "09:00",
    endTime: "10:00",
    description: "",
    category: "Pessoal",
    participants: "",
  });

  const [editOpen, setEditOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    date: "",
    time: "",
    endTime: "",
    description: "",
    category: "",
  });

  const [postponeOpen, setPostponeOpen] = useState(false);
  const [postponingEvent, setPostponingEvent] = useState<Event | null>(null);
  const [postponeCustomDate, setPostponeCustomDate] = useState("");

  const handleAdd = () => {
    if (!form.title.trim()) return;

    const emails = form.participants
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    addEvent({
      title: form.title,
      date: form.date,
      time: form.time,
      endTime: form.endTime,
      description: form.description,
      category: form.category,
      participantEmails: emails,
    });

    setForm({
      title: "",
      date: format(new Date(), "yyyy-MM-dd"),
      time: "09:00",
      endTime: "10:00",
      description: "",
      category: "Pessoal",
      participants: "",
    });

    setAddOpen(false);
  };

  const openEdit = (ev: Event) => {
    setEditingEvent(ev);
    setEditForm({
      title: ev.title,
      date: ev.date,
      time: ev.time,
      endTime: ev.endTime || "",
      description: ev.description || "",
      category: ev.category,
    });
    setEditOpen(true);
  };

  const handleEdit = () => {
    if (!editingEvent || !editForm.title.trim()) return;

    updateEvent(editingEvent.id, {
      title: editForm.title,
      date: editForm.date,
      time: editForm.time,
      endTime: editForm.endTime,
      description: editForm.description,
      category: editForm.category,
    });

    setEditOpen(false);
    setEditingEvent(null);

    if (editForm.date !== editingEvent.date) {
      setSelectedDate(new Date(editForm.date + "T12:00:00"));
    }
  };

  const openPostpone = (ev: Event) => {
    setPostponingEvent(ev);
    setPostponeCustomDate(addDaysToDate(ev.date, 1));
    setPostponeOpen(true);
  };

  const handlePostpone = (newDate: string) => {
    if (!postponingEvent) return;
    updateEvent(postponingEvent.id, { date: newDate });
    setPostponeOpen(false);
    setPostponingEvent(null);
    setSelectedDate(new Date(newDate + "T12:00:00"));
  };

  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const dayEvents = events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });
  const startDay = getDay(startOfMonth(currentMonth));

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <CalendarDays className="h-6 w-6" /> Agenda
        </h1>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setView("timeline")}
              className={cn("px-3 py-1.5 text-sm", view === "timeline" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              data-testid="button-view-timeline"
            >
              <LayoutList className="h-4 w-4" />
            </button>

            <button
              onClick={() => setView("calendar")}
              className={cn("px-3 py-1.5 text-sm", view === "calendar" ? "bg-primary text-primary-foreground" : "hover:bg-muted")}
              data-testid="button-view-calendar"
            >
              <CalendarIcon className="h-4 w-4" />
            </button>
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-event">
                <Plus className="h-4 w-4 mr-1" /> Novo Evento
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif italic">Novo Evento</DialogTitle>
              </DialogHeader>

              <div className="space-y-3">
                <Input
                  placeholder="Título do evento"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  data-testid="input-event-title"
                />

                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  data-testid="input-event-date"
                />

                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Início</label>
                    <Input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm({ ...form, time: e.target.value })}
                      data-testid="input-event-time"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">Fim</label>
                    <Input
                      type="time"
                      value={form.endTime}
                      onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                      data-testid="input-event-end-time"
                    />
                  </div>
                </div>

                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger data-testid="select-event-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Textarea
                  placeholder="Descrição (opcional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  data-testid="input-event-description"
                />

                <Input
                  placeholder="Emails dos convidados (separados por vírgula)"
                  value={form.participants}
                  onChange={(e) => setForm({ ...form, participants: e.target.value })}
                />

                <Button onClick={handleAdd} className="w-full" data-testid="button-save-event">
                  Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif italic">Editar Evento</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Título do evento"
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              data-testid="input-edit-event-title"
            />

            <Input
              type="date"
              value={editForm.date}
              onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
              data-testid="input-edit-event-date"
            />

            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Início</label>
                <Input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  data-testid="input-edit-event-time"
                />
              </div>

              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">Fim</label>
                <Input
                  type="time"
                  value={editForm.endTime}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value })}
                  data-testid="input-edit-event-end-time"
                />
              </div>
            </div>

            <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
              <SelectTrigger data-testid="select-edit-event-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Descrição (opcional)"
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              data-testid="input-edit-event-description"
            />

            <Button onClick={handleEdit} className="w-full" data-testid="button-save-edit-event">
              Salvar alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={postponeOpen} onOpenChange={setPostponeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif italic flex items-center gap-2">
              <CalendarClock className="h-5 w-5" /> Adiar Evento
            </DialogTitle>
          </DialogHeader>

          {postponingEvent && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Adiando: <span className="font-medium text-foreground">{postponingEvent.title}</span>
              </p>

              <div className="grid grid-cols-2 gap-2">
                {POSTPONE_OPTIONS.map((opt) => (
                  <Button
  key={opt.label}
  variant="outline"
  onClick={() => handlePostpone(addDaysToDate(postponingEvent.date, opt.days))}
  data-testid={`button-postpone-${opt.days}`}
  className="h-auto py-3 flex flex-col"
>
  <span className="font-semibold">{opt.label}</span>
  <span className="text-xs text-muted-foreground mt-0.5">
    {format(
      new Date(addDaysToDate(postponingEvent.date, opt.days) + "T12:00:00"),
      "d 'de' MMM",
      { locale: ptBR }
    )}
  </span>
</Button>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Ou escolha uma data:</p>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={postponeCustomDate}
                    onChange={(e) => setPostponeCustomDate(e.target.value)}
                    min={postponingEvent.date}
                    data-testid="input-postpone-custom-date"
                    className="flex-1"
                  />
                  <Button onClick={() => handlePostpone(postponeCustomDate)} data-testid="button-postpone-custom">
                    OK
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {view === "timeline" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() - 86400000))}
              data-testid="button-prev-day"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <h2 className="text-lg font-medium capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </h2>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(new Date(selectedDate.getTime() + 86400000))}
              data-testid="button-next-day"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
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
                          <div
                            key={ev.id}
                            className="flex items-center justify-between bg-primary/10 text-primary px-3 py-2 rounded-lg text-sm group"
                            data-testid={`event-${ev.id}`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{ev.title}</span>

                                {!ev.isOwner && (
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-medium">
                                    Compartilhado
                                  </span>
                                )}

                                <span className="text-xs opacity-70">
                                  {ev.time}
                                  {ev.endTime ? ` - ${ev.endTime}` : ""}
                                </span>
                              </div>

                              {ev.description && (
  <p className="text-xs opacity-60 truncate mt-0.5">{ev.description}</p>
)}

{!ev.isOwner && ev.ownerEmail && (
  <p className="text-[11px] opacity-70 mt-1">
    Criado por: {ev.ownerEmail}
  </p>
)}
</div>

{ev.isOwner && (
  <div className="flex items-center gap-1 ml-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
    <button
      onClick={() => openEdit(ev)}
      className="text-primary/70 hover:text-primary transition-colors p-1"
      title="Editar"
      data-testid={`button-edit-event-${ev.id}`}
    >
      <Pencil className="h-3.5 w-3.5" />
    </button>

    <button
      onClick={() => openPostpone(ev)}
      className="text-primary/70 hover:text-primary transition-colors p-1"
      title="Adiar"
      data-testid={`button-postpone-event-${ev.id}`}
    >
      <CalendarClock className="h-3.5 w-3.5" />
    </button>

    <button
      onClick={() => deleteEvent(ev.id)}
      className="text-destructive/70 hover:text-destructive transition-colors p-1"
      data-testid={`button-delete-event-${ev.id}`}
    >
      <Trash2 className="h-3.5 w-3.5" />
    </button>
  </div>
)}
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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
        data-testid="button-prev-month"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <CardTitle className="text-lg capitalize">
        {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
      </CardTitle>

      <Button
        variant="ghost"
        size="icon"
        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
        data-testid="button-next-month"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  </CardHeader>

  <CardContent>
    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground mb-2">
      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
        <div key={d} className="py-1 font-medium">
          {d}
        </div>
      ))}
    </div>

    <div className="grid grid-cols-7 gap-1">
      {Array.from({ length: startDay }).map((_, i) => (
        <div key={`empty-${i}`} />
      ))}
              {monthDays.map((day) => {
                const ds = format(day, "yyyy-MM-dd");
                const count = events.filter((e) => e.date === ds).length;
                const isToday = isSameDay(day, new Date());
                const isSelected = isSameDay(day, selectedDate);

                return (
                  <button
                    key={ds}
                    onClick={() => {
                      setSelectedDate(day);
                      setView("timeline");
                    }}
                    className={cn(
                      "aspect-square rounded-lg text-sm flex flex-col items-center justify-center gap-0.5 transition-colors",
                      isToday && "ring-2 ring-primary",
                      isSelected && "bg-primary text-primary-foreground",
                      !isSelected && "hover:bg-muted"
                    )}
                    data-testid={`calendar-day-${ds}`}
                  >
                    {format(day, "d")}
                    {count > 0 && (
                      <div className={cn("w-1.5 h-1.5 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary")} />
                    )}
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
