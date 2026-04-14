import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings as SettingsIcon, Download, Upload, Trash2, AlertTriangle, Lock, Eye, EyeOff, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const [confirmClear, setConfirmClear] = useState(false);
  const auth = useAuth();

  const [changePwOpen, setChangePwOpen] = useState(false);
  const [removeAuthOpen, setRemoveAuthOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newUser, setNewUser] = useState(auth.storedUsername);
  const [newPw, setNewPw] = useState("");
  const [confirmNewPw, setConfirmNewPw] = useState("");
  const [removeCurrentPw, setRemoveCurrentPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);
  const [removeError, setRemoveError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showRemove, setShowRemove] = useState(false);

  const handleExport = () => {
    const data: Record<string, string | null> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("planner_") && key !== "planner_auth_credentials") {
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
            if (key.startsWith("planner_") && key !== "planner_auth_credentials") {
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
      if (key?.startsWith("planner_") && key !== "planner_auth_credentials") keys.push(key);
    }
    keys.forEach((k) => localStorage.removeItem(k));
    setConfirmClear(false);
    window.location.reload();
  };

  const handleChangeCredentials = async () => {
    setPwError("");
    setPwSuccess(false);
    if (!newUser.trim() || !newPw.trim() || !currentPw.trim()) {
      setPwError("Preencha todos os campos.");
      return;
    }
    if (newPw.length < 4) {
      setPwError("A nova senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (newPw !== confirmNewPw) {
      setPwError("As senhas não coincidem.");
      return;
    }
    const ok = await auth.changeCredentials(currentPw, newUser, newPw);
    if (!ok) {
      setPwError("Senha atual incorreta.");
      return;
    }
    setPwSuccess(true);
    setCurrentPw(""); setNewPw(""); setConfirmNewPw("");
    setTimeout(() => { setPwSuccess(false); setChangePwOpen(false); }, 1500);
  };

  const handleRemoveAuth = async () => {
    setRemoveError("");
    if (!removeCurrentPw.trim()) {
      setRemoveError("Digite sua senha atual.");
      return;
    }
    const ok = await auth.removeAuth(removeCurrentPw);
    if (!ok) {
      setRemoveError("Senha incorreta.");
      return;
    }
    setRemoveAuthOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 pb-20">
      <h1 className="text-2xl font-serif italic text-primary flex items-center gap-2" data-testid="text-page-title">
        <SettingsIcon className="h-6 w-6" /> Configurações
      </h1>

      {/* Security */}
      {auth.isSetup && (
        <Card>
          <CardHeader><CardTitle className="text-lg font-serif italic flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> Acesso e Segurança</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Usuário atual: <span className="font-medium text-foreground">{auth.storedUsername}</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Change credentials */}
              <Dialog open={changePwOpen} onOpenChange={(o) => { setChangePwOpen(o); setPwError(""); setPwSuccess(false); }}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1" data-testid="button-change-password">
                    <Lock className="h-4 w-4 mr-2" /> Alterar Usuário/Senha
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle className="font-serif italic">Alterar Acesso</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div className="relative">
                      <Input
                        type={showCurrent ? "text" : "password"}
                        placeholder="Senha atual"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="pr-9"
                        data-testid="input-current-password"
                      />
                      <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Input
                      placeholder="Novo usuário"
                      value={newUser}
                      onChange={(e) => setNewUser(e.target.value)}
                      data-testid="input-new-username"
                    />
                    <div className="relative">
                      <Input
                        type={showNew ? "text" : "password"}
                        placeholder="Nova senha (mín. 4 caracteres)"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="pr-9"
                        data-testid="input-new-password"
                      />
                      <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Input
                      type="password"
                      placeholder="Confirmar nova senha"
                      value={confirmNewPw}
                      onChange={(e) => setConfirmNewPw(e.target.value)}
                      data-testid="input-confirm-new-password"
                    />
                    {pwError && <p className="text-xs text-destructive font-medium">{pwError}</p>}
                    {pwSuccess && <p className="text-xs text-emerald-600 font-medium">✓ Acesso atualizado com sucesso!</p>}
                    <Button onClick={handleChangeCredentials} className="w-full" data-testid="button-save-new-password">Salvar</Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Logout */}
              <Button variant="outline" className="flex-1" onClick={auth.logout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" /> Sair
              </Button>
            </div>

            {/* Remove auth */}
            <Dialog open={removeAuthOpen} onOpenChange={(o) => { setRemoveAuthOpen(o); setRemoveError(""); }}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive text-xs w-full" data-testid="button-remove-auth">
                  Remover proteção por senha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-serif italic">Remover proteção</DialogTitle></DialogHeader>
                <p className="text-sm text-muted-foreground">Digite sua senha atual para confirmar que deseja remover a proteção do planner.</p>
                <div className="space-y-3 mt-2">
                  <div className="relative">
                    <Input
                      type={showRemove ? "text" : "password"}
                      placeholder="Senha atual"
                      value={removeCurrentPw}
                      onChange={(e) => setRemoveCurrentPw(e.target.value)}
                      className="pr-9"
                      data-testid="input-remove-auth-password"
                    />
                    <button type="button" onClick={() => setShowRemove(!showRemove)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                      {showRemove ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {removeError && <p className="text-xs text-destructive font-medium">{removeError}</p>}
                  <Button variant="destructive" onClick={handleRemoveAuth} className="w-full" data-testid="button-confirm-remove-auth">Remover proteção</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Data */}
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

      {/* Danger zone */}
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

      {/* About */}
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
