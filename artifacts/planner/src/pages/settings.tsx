import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings as SettingsIcon, Download, Upload, Trash2, AlertTriangle } from "lucide-react";

export default function Settings() {
  const [confirmClear, setConfirmClear] = useState(false);

  const handleExport = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("planner_")) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planner-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith("planner_")) {
              localStorage.setItem(key, value as string);
            }
          });
          window.location.reload();
        } catch {
          alert("Arquivo inválido");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleClearAll = () => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("planner_")) keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    setConfirmClear(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
        <SettingsIcon className="h-6 w-6" /> Configurações
      </h1>

      <Card>
        <CardHeader><CardTitle className="text-lg font-serif italic">Dados</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={handleExport} className="flex-1" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" /> Exportar Dados (JSON)
            </Button>
            <Button variant="outline" onClick={handleImport} className="flex-1" data-testid="button-import">
              <Upload className="h-4 w-4 mr-2" /> Importar Dados
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Exporte seus dados para backup ou importe de um arquivo anterior.</p>
        </CardContent>
      </Card>

      <Card className="border-destructive/20">
        <CardHeader><CardTitle className="text-lg font-serif italic text-destructive flex items-center gap-2"><AlertTriangle className="h-5 w-5" /> Zona de Perigo</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Essa ação irá remover todos os seus dados do planner. Não é possível desfazer.</p>
          <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
            <DialogTrigger asChild>
              <Button variant="destructive" data-testid="button-clear-data"><Trash2 className="h-4 w-4 mr-2" /> Limpar Todos os Dados</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Tem certeza?</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">Todos os seus dados serão permanentemente removidos. Considere exportar um backup antes.</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" onClick={() => setConfirmClear(false)} className="flex-1">Cancelar</Button>
                <Button variant="destructive" onClick={handleClearAll} className="flex-1" data-testid="button-confirm-clear">Sim, Limpar Tudo</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg font-serif italic">Sobre</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Meu Planner Digital - Seu organizador pessoal 🌸</p>
          <p className="text-xs text-muted-foreground mt-2">Todos os dados são armazenados localmente no seu navegador.</p>
        </CardContent>
      </Card>
    </div>
  );
}
