import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import HomePage from "@/pages/HomePage";
import AttorneysPage from "@/pages/AttorneysPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import OfficePage from "@/pages/OfficePage";
import HistoryPage from "@/pages/HistoryPage";
import EventsPage from "@/pages/EventsPage";
import ResearchCoHelperPage from "@/pages/ResearchCoHelperPage";
import UnderConstruction from "@/pages/UnderConstruction";
import NotFound from "@/pages/not-found";

function ProtectedOfficeRoute({ params }: { params: { officeId: string } }) {
  const { firmUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-400 uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  if (!firmUser) {
    return <Redirect to="/login" />;
  }

  if (firmUser.officeId !== params.officeId) {
    return <Redirect to={`/office/${firmUser.officeId}`} />;
  }

  return <OfficePage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/attorneys" component={AttorneysPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/onboard" component={RegisterPage} />
      <Route path="/office/:officeId" component={ProtectedOfficeRoute} />
      <Route path="/research" component={ResearchCoHelperPage} />
      <Route path="/research-cohelper" component={ResearchCoHelperPage} />
      <Route path="/history" component={HistoryPage} />
      <Route path="/events" component={EventsPage} />
      <Route path="/news" component={EventsPage} />
      <Route path="/services"><UnderConstruction title="Practice Areas" /></Route>
      <Route path="/careers"><UnderConstruction title="Careers" /></Route>
      <Route path="/contact"><UnderConstruction title="Contact" /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const baseUrl = (import.meta.env.BASE_URL || "").replace(/\/$/, "");
  return (
    <AuthProvider>
      <WouterRouter base={baseUrl}>
        <Router />
      </WouterRouter>
    </AuthProvider>
  );
}

export default App;
