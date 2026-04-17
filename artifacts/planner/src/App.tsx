import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { LoginScreen } from "@/components/login-screen";
import { useAuth } from "@/hooks/use-auth";
import Home from "@/pages/home";
import Schedule from "@/pages/schedule";
import Tasks from "@/pages/tasks";
import Habits from "@/pages/habits";
import MonthlyChecklist from "@/pages/monthly-checklist";
import SelfCare from "@/pages/self-care";
import University from "@/pages/university";
import Professional from "@/pages/professional";
import Diary from "@/pages/diary";
import Books from "@/pages/books";
import ImportantDates from "@/pages/important-dates";
import Courses from "@/pages/courses";
import Finance from "@/pages/finance";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/schedule" component={Schedule} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/habits" component={Habits} />
        <Route path="/monthly-checklist" component={MonthlyChecklist} />
        <Route path="/self-care" component={SelfCare} />
        <Route path="/university" component={University} />
        <Route path="/professional" component={Professional} />
        <Route path="/diary" component={Diary} />
        <Route path="/books" component={Books} />
        <Route path="/important-dates" component={ImportantDates} />
        <Route path="/courses" component={Courses} />
        <Route path="/finance" component={Finance} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function AuthGate() {
  const auth = useAuth();

  if (auth.isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-sm animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <LoginScreen
        isSetup={auth.isSetup}
        onLogin={auth.login}
        onSetup={auth.setupCredentials}
      />
    );
  }

  return <Router />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthGate />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
