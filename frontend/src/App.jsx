import { useCallback, useEffect, useState } from "react";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./components/ToastProvider";
import { Dashboard } from "./pages/Dashboard";
import { Livres } from "./pages/Livres";
import { Utilisateurs } from "./pages/Utilisateurs";
import { Emprunts } from "./pages/Emprunts";

const PAGES = ["dashboard", "livres", "utilisateurs", "emprunts"];

function pageFromHash() {
  const hash = window.location.hash.replace("#/", "");
  return PAGES.includes(hash) ? hash : "dashboard";
}

export function App() {
  const [page, setPage] = useState(pageFromHash);

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const navigate = useCallback((next) => {
    window.location.hash = `/${next}`;
    setPage(next);
  }, []);

  return (
    <ToastProvider>
      <Layout page={page} onNavigate={navigate}>
        {page === "dashboard" && <Dashboard onNavigate={navigate} />}
        {page === "livres" && <Livres />}
        {page === "utilisateurs" && <Utilisateurs />}
        {page === "emprunts" && <Emprunts />}
      </Layout>
    </ToastProvider>
  );
}
