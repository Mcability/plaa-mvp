import { AuthProvider, useAuth } from "./lib/auth";
import { useHashRoute } from "./lib/router";
import { Navbar } from "./components/Navbar";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Workspace } from "./pages/Workspace";
import { PrintView } from "./pages/PrintView";

function Shell() {
  const { user, loading } = useAuth();
  const [path, navigate] = useHashRoute();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">Loading PLAA…</div>;
  }

  const printMatch = path.match(/^\/project\/([^/]+)\/print$/);
  const projectMatch = path.match(/^\/project\/([^/]+)$/);

  if (printMatch) {
    return <PrintView projectId={printMatch[1]} onBack={() => navigate(`/project/${printMatch[1]}`)} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onLogoClick={() => navigate("/")} />
      <main className="flex-1">
        {!user ? (
          <Landing />
        ) : projectMatch ? (
          <Workspace
            projectId={projectMatch[1]}
            onBack={() => navigate("/")}
            onOpenPrint={() => navigate(`/project/${projectMatch[1]}/print`)}
          />
        ) : (
          <Dashboard onOpenProject={(id) => navigate(`/project/${id}`)} />
        )}
      </main>
      <footer className="print-hidden border-t border-navy/10 py-6 text-center text-xs text-gray-400">
        PLAA — Publishing &amp; Layout Assistant Agent · built by McAbility
      </footer>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}

export default App;
