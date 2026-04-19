import { Link, useLocation } from "wouter";
import {
  Home,
  CalendarDays,
  CheckSquare,
  Activity,
  CheckCircle2,
  Heart,
  GraduationCap,
  Briefcase,
  BookOpen,
  BookMarked,
  CalendarHeart,
  Settings,
  Menu,
  X,
  Sparkles,
  Wallet,
  LogOut,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";

const navigation = [
  { name: "Início", href: "/", icon: Home },
  { name: "Agenda", href: "/schedule", icon: CalendarDays },
  { name: "Tarefas", href: "/tasks", icon: CheckSquare },
  { name: "Hábitos", href: "/habits", icon: Activity },
  { name: "Checklist Mensal", href: "/monthly-checklist", icon: CheckCircle2 },
  { name: "Autocuidado", href: "/self-care", icon: Heart },
  { name: "Faculdade", href: "/university", icon: GraduationCap },
  { name: "Profissional", href: "/professional", icon: Briefcase },
  { name: "Finanças", href: "/finance", icon: Wallet },
  { name: "Diário", href: "/diary", icon: BookOpen },
  { name: "Livros", href: "/books", icon: BookMarked },
  { name: "Datas Importantes", href: "/important-dates", icon: CalendarHeart },
  { name: "Cursos", href: "/courses", icon: Sparkles },
  { name: "Configurações", href: "/settings", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const auth = useAuth();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border/50">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-serif italic text-primary"
          >
            <Sparkles className="h-5 w-5" />
            <span>Meu Planner</span>
          </Link>

          <button
            className="md:hidden text-muted-foreground hover:text-foreground"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = location === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {auth.isSetup && (
          <div className="px-3 py-3 border-t border-border/50">
            <div className="flex items-center justify-between px-3 py-1.5">
              <span className="text-xs text-muted-foreground truncate">
                {auth.storedUsername}
              </span>

              <button
                onClick={auth.logout}
                className="text-muted-foreground hover:text-destructive transition-colors ml-2 shrink-0"
                title="Sair"
                data-testid="button-sidebar-logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </aside>

      <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden bg-background">
        <header className="h-16 flex items-center px-4 md:px-6 bg-card/50 backdrop-blur-sm border-b border-border/50 shrink-0 sticky top-0 z-30">
          <button
            className="md:hidden mr-4 text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-muted"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />

              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>

            <div className="text-sm text-muted-foreground font-medium">
              {new Date().toLocaleDateString("pt-BR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
