import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
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
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
