import { useState } from "react";
import { format, subDays, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDiary } from "@/hooks/use-diary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { BookOpen, ChevronLeft, ChevronRight, Save } from "lucide-react";
import { cn } from "@/lib/utils";

const STICKERS = [
  "🌸", "🦋", "🌺", "💐", "🌷", "🌻", "🎀", "💝", "🌟", "⭐", "✨", "💫",
  "🎭", "🎨", "🖼️", "🎵", "🎶", "☕", "🍰", "🧁", "🍩", "🌈", "🌙", "☀️",
  "💖", "💕", "🥰", "😊", "🌹", "🍂", "🍃", "🧡", "💜", "💙", "🤍", "🪷",
];

const MOODS = ["😊", "😢", "😡", "😴", "🥰", "😎", "🤩", "😌", "🥺", "😭", "😋", "🤔", "💪", "🌸", "✨"];

export default function Diary() {
  const { getEntryForDate, saveEntry, entries } = useDiary();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const existing = getEntryForDate(dateStr);

  const [content, setContent] = useState(existing?.content || "");
  const [mood, setMood] = useState<string | undefined>(existing?.mood);
  const [stickers, setStickers] = useState<string[]>(existing?.stickers || []);
  const [showStickers, setShowStickers] = useState(false);

  const handleDateChange = (newDate: Date) => {
    handleSave();
    setSelectedDate(newDate);
    const ds = format(newDate, "yyyy-MM-dd");
    const entry = entries.find((e) => e.date === ds);
    setContent(entry?.content || "");
    setMood(entry?.mood);
    setStickers(entry?.stickers || []);
  };

  const handleSave = () => {
    if (content.trim() || mood || stickers.length > 0) {
      saveEntry(dateStr, content, mood, stickers);
    }
  };

  const toggleSticker = (s: string) => {
    setStickers((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
          <BookOpen className="h-6 w-6" /> Diário
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleDateChange(subDays(selectedDate, 1))} data-testid="button-prev-day"><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium capitalize min-w-[180px] text-center">{format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}</span>
          <Button variant="ghost" size="icon" onClick={() => handleDateChange(addDays(selectedDate, 1))} data-testid="button-next-day"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className="bg-gradient-to-br from-primary/5 to-accent/10">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif italic">Como você está se sentindo?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {MOODS.map((emoji) => (
              <button key={emoji} onClick={() => setMood(mood === emoji ? undefined : emoji)} className={cn("text-2xl w-10 h-10 rounded-full flex items-center justify-center transition-transform", mood === emoji ? "bg-primary/20 scale-110 shadow-sm" : "hover:bg-muted hover:scale-105")} data-testid={`mood-${emoji}`}>{emoji}</button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-serif italic">Meu Dia</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setShowStickers(!showStickers)} data-testid="button-toggle-stickers">
            {showStickers ? "Fechar" : "🌸 Figurinhas"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {showStickers && (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Clique para adicionar ao diário:</p>
              <div className="flex flex-wrap gap-2">
                {STICKERS.map((s) => (
                  <button key={s} onClick={() => toggleSticker(s)} className={cn("text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-all", stickers.includes(s) ? "bg-primary/20 scale-110 ring-2 ring-primary/30" : "hover:bg-muted hover:scale-105")} data-testid={`sticker-${s}`}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {stickers.length > 0 && (
            <div className="flex flex-wrap gap-1 p-2 bg-muted/30 rounded-lg">
              {stickers.map((s, i) => <span key={i} className="text-2xl">{s}</span>)}
            </div>
          )}

          <Textarea
            placeholder="Escreva sobre o seu dia... ✨"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[250px] text-base leading-relaxed bg-background/50"
            data-testid="input-diary-content"
          />

          <Button onClick={handleSave} className="w-full" data-testid="button-save-diary">
            <Save className="h-4 w-4 mr-2" /> Salvar Entrada
          </Button>
        </CardContent>
      </Card>

      {entries.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-serif italic">Entradas Anteriores</h2>
          {entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map((entry) => (
            <Card key={entry.id} className="cursor-pointer hover:shadow-sm transition-shadow" onClick={() => handleDateChange(new Date(entry.date + "T12:00:00"))}>
              <CardContent className="py-3 px-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium capitalize">{format(new Date(entry.date + "T12:00:00"), "EEEE, d 'de' MMMM", { locale: ptBR })}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{entry.content}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.mood && <span className="text-lg">{entry.mood}</span>}
                    {entry.stickers.slice(0, 3).map((s, i) => <span key={i} className="text-sm">{s}</span>)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
