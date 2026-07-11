import { useEffect, useState } from "react";
import { IconDashboard, IconBook, IconUsers, IconSwap, IconSun, IconMoon, IconMenu, IconX } from "./icons";

const NAV_ITEMS = [
  { key: "dashboard", label: "Tableau de bord", icon: IconDashboard },
  { key: "livres", label: "Livres", icon: IconBook },
  { key: "utilisateurs", label: "Utilisateurs", icon: IconUsers },
  { key: "emprunts", label: "Emprunts", icon: IconSwap },
];

const PAGE_META = {
  dashboard: { title: "Tableau de bord", desc: "Vue d'ensemble de la bibliothèque DIT" },
  livres: { title: "Livres", desc: "Ajoutez, modifiez et recherchez les ouvrages du catalogue" },
  utilisateurs: { title: "Utilisateurs", desc: "Étudiants, professeurs et personnel administratif" },
  emprunts: { title: "Emprunts", desc: "Suivi des emprunts, retours et retards" },
};

function getInitialTheme() {
  const saved = localStorage.getItem("dit-theme");
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function Layout({ page, onNavigate, children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dit-theme", theme);
  }, [theme]);

  useEffect(() => {
    setMobileOpen(false);
  }, [page]);

  const meta = PAGE_META[page] ?? PAGE_META.dashboard;

  return (
    <div className="app-shell">
      <div className={`sidebar-scrim ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />
      <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="logo">DIT</div>
          <div>
            <div className="title">Bibliothèque DIT</div>
            <div className="subtitle">Gestion académique</div>
          </div>
        </div>

        <ul className="nav-list">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <li key={key}>
              <button
                className={`nav-item ${page === key ? "active" : ""}`}
                onClick={() => onNavigate(key)}
              >
                <Icon />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <span className="sidebar-hint">Examen DevOps · DIT</span>
          <button
            className="theme-toggle"
            onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            aria-label="Changer de thème"
          >
            {theme === "dark" ? <IconSun /> : <IconMoon />}
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="menu-toggle" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
              {mobileOpen ? <IconX /> : <IconMenu />}
            </button>
            <div>
              <h1 className="page-title">{meta.title}</h1>
              <p className="page-desc">{meta.desc}</p>
            </div>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
