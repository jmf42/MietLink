import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/components/ui/language-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import PropertySetup from "@/pages/property-setup";
import PropertyIntro from "@/pages/property-intro";
import DocumentWizard from "@/pages/document-wizard";
import ApplicantDesk from "@/pages/applicant-desk";
import TaskChecklist from "@/pages/task-checklist";
import DocumentsPage from "@/pages/documents";
import AppointmentsPage from "@/pages/appointments";
import ApplicationsPage from "@/pages/applications";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/property/:slug" component={PropertyIntro} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/property-setup" component={PropertySetup} />
          <Route path="/documents" component={DocumentsPage} />
          <Route path="/appointments" component={AppointmentsPage} />
          <Route path="/applications" component={ApplicationsPage} />
          <Route path="/property/:slug/apply" component={DocumentWizard} />
          <Route path="/property/:propertyId/tasks" component={TaskChecklist} />
          <Route path="/property/:propertyId/desk" component={ApplicantDesk} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
