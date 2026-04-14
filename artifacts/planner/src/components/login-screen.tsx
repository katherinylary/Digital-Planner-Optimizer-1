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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }
    if (!isSetup) {
      if (password.length < 4) {
        setError("A senha deve ter pelo menos 4 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }
    setLoading(true);
    try {
      if (isSetup) {
        const ok = await onLogin(username, password);
        if (!ok) setError("Usuário ou senha incorretos.");
      } else {
        await onSetup(username, password);
      }
    } finally {
      setLoading(false);
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
            {isSetup ? "Bem-vinda de volta! 🌸" : "Crie seu acesso para começar ✨"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-center">
            {isSetup ? "Entrar" : "Criar acesso"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-9"
                autoComplete="username"
                data-testid="input-username"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type={showPass ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9 pr-9"
                autoComplete={isSetup ? "current-password" : "new-password"}
                data-testid="input-password"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {/* Confirm password (setup only) */}
            {!isSetup && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-9 pr-9"
                  autoComplete="new-password"
                  data-testid="input-confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-xs text-destructive text-center font-medium" data-testid="text-login-error">{error}</p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              data-testid="button-login-submit"
            >
              {loading ? "Aguarde..." : isSetup ? "Entrar" : "Criar acesso"}
            </Button>
          </form>

          {!isSetup && (
            <p className="text-xs text-center text-muted-foreground">
              Sua senha ficará salva com segurança no seu navegador.
            </p>
          )}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Meu Planner Digital 🌸
        </p>
      </div>
    </div>
  );
}
