import { useState } from "react";
import { Sparkles, Eye, EyeOff, Lock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface LoginScreenProps {
  isSetup: boolean;
  onLogin: (username: string, password: string) => Promise<boolean>;
  onSetup: (username: string, password: string) => Promise<void>;
}

export function LoginScreen({ isSetup, onLogin, onSetup }: LoginScreenProps) {
  const [tab, setTab] = useState<"login" | "register">(isSetup ? "login" : "register");

  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [regUser, setRegUser] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirm, setRegConfirm] = useState("");
  const [showRegPass, setShowRegPass] = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);
  const [regError, setRegError] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    if (!loginUser.trim() || !loginPass.trim()) {
      setLoginError("Preencha todos os campos.");
      return;
    }
    if (!isSetup) {
      const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoginError("");
  if (!loginUser.trim() || !loginPass.trim()) {
    setLoginError("Preencha todos os campos.");
    return;
  }

  setLoginLoading(true);
  try {
    const ok = await onLogin(loginUser, loginPass);
    if (!ok) setLoginError("Usuário ou senha incorretos.");
  } finally {
    setLoginLoading(false);
  }
};
      return;
    }
    setLoginLoading(true);
    try {
      const ok = await onLogin(loginUser, loginPass);
      if (!ok) setLoginError("Usuário ou senha incorretos.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    if (!regUser.trim() || !regPass.trim()) {
      setRegError("Preencha todos os campos.");
      return;
    }
    if (isSetup) {
      const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setRegError("");
  if (!regUser.trim() || !regPass.trim()) {
    setRegError("Preencha todos os campos.");
    return;
  }

  if (regPass.length < 4) {
    setRegError("A senha deve ter pelo menos 4 caracteres.");
    return;
  }

  if (regPass !== regConfirm) {
    setRegError("As senhas não coincidem.");
    return;
  }

  setRegLoading(true);
  try {
    await onSetup(regUser, regPass);
  } catch (error) {
    setRegError(error instanceof Error ? error.message : "Erro ao criar conta.");
  } finally {
    setRegLoading(false);
  }
};);
      return;
    }
    if (regPass.length < 4) {
      setRegError("A senha deve ter pelo menos 4 caracteres.");
      return;
    }
    if (regPass !== regConfirm) {
      setRegError("As senhas não coincidem.");
      return;
    }
    setRegLoading(true);
    try {
      await onSetup(regUser, regPass);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" style={{ fontFamily: "Outfit, sans-serif" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-serif italic text-primary">Meu Planner</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {tab === "login" ? "Bem-vinda de volta! 🌸" : "Crie seu acesso para começar ✨"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => { setTab("login"); setLoginError(""); }}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-colors",
                tab === "login"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="tab-login"
            >
              Entrar
            </button>
            <button
              onClick={() => { setTab("register"); setRegError(""); }}
              className={cn(
                "flex-1 py-3 text-sm font-semibold transition-colors",
                tab === "register"
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-muted-foreground hover:text-foreground"
              )}
              data-testid="tab-register"
            >
              Criar conta
            </button>
          </div>

          <div className="p-6">
            {tab === "login" ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Usuário"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    className="pl-9"
                    autoComplete="username"
                    data-testid="input-username"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showLoginPass ? "text" : "password"}
                    placeholder="Senha"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="pl-9 pr-9"
                    autoComplete="current-password"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPass(!showLoginPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showLoginPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginError && (
                  <p className="text-xs text-destructive text-center font-medium" data-testid="text-login-error">{loginError}</p>
                )}
                <Button type="submit" className="w-full" disabled={loginLoading} data-testid="button-login-submit">
                  {loginLoading ? "Aguarde..." : "Entrar"}
                </Button>
                {!isSetup && (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Ainda não tem conta?{" "}
                    <button type="button" onClick={() => setTab("register")} className="text-primary underline font-medium">
                      Criar agora
                    </button>
                  </p>
                )}
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Escolha um usuário"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    className="pl-9"
                    autoComplete="username"
                    data-testid="input-register-username"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showRegPass ? "text" : "password"}
                    placeholder="Crie uma senha (mín. 4 caracteres)"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    className="pl-9 pr-9"
                    autoComplete="new-password"
                    data-testid="input-register-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPass(!showRegPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRegPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    type={showRegConfirm ? "text" : "password"}
                    placeholder="Confirmar senha"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    className="pl-9 pr-9"
                    autoComplete="new-password"
                    data-testid="input-confirm-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirm(!showRegConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showRegConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {regError && (
                  <p className="text-xs text-destructive text-center font-medium" data-testid="text-register-error">{regError}</p>
                )}
                <Button type="submit" className="w-full" disabled={regLoading} data-testid="button-register-submit">
                  {regLoading ? "Aguarde..." : "Criar acesso"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Sua senha ficará salva com segurança no seu navegador.
                </p>
                {isSetup && (
                  <p className="text-xs text-center text-muted-foreground pt-1">
                    Já tem conta?{" "}
                    <button type="button" onClick={() => setTab("login")} className="text-primary underline font-medium">
                      Fazer login
                    </button>
                  </p>
                )}
              </form>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Meu Planner Digital 🌸
        </p>
      </div>
    </div>
  );
}
