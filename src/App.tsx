import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AACC from "./pages/projetos/AACC";
import AIEX from "./pages/projetos/AIEX";
import CIFOP from "./pages/projetos/CIFOP";
import Seminarios from "./pages/projetos/Seminarios";
import PIBID from "./pages/projetos/PIBID";
import Eventos from "./pages/projetos/Eventos";

function Router() {
  return (
    <WouterRouter hook={useHashLocation}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/projetos/aacc" component={AACC} />
        <Route path="/projetos/aiex" component={AIEX} />
        <Route path="/projetos/cifop" component={CIFOP} />
        <Route path="/projetos/seminarios" component={Seminarios} />
        <Route path="/projetos/pibid" component={PIBID} />
        <Route path="/projetos/eventos" component={Eventos} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
