import { useEffect, useMemo, useState } from "react";
import { livresApi } from "../api/livres";
import { utilisateursApi } from "../api/utilisateurs";
import { empruntsApi } from "../api/emprunts";
import { useToast } from "../components/ToastProvider";
import { StatCard } from "../components/StatCard";
import { Loading } from "../components/Loading";
import { EmptyState } from "../components/EmptyState";
import { IconBook, IconUsers, IconSwap, IconAlertCircle, IconHistory, IconArrowRight } from "../components/icons";

function formatDate(value) {
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

export function Dashboard({ onNavigate }) {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [livres, setLivres] = useState([]);
  const [users, setUsers] = useState([]);
  const [emprunts, setEmprunts] = useState([]);
  const [retards, setRetards] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const [l, u, e, r] = await Promise.all([
          livresApi.list(),
          utilisateursApi.list(),
          empruntsApi.list(),
          empruntsApi.retards(),
        ]);
        setLivres(l);
        setUsers(u);
        setEmprunts(e);
        setRetards(r);
      } catch (err) {
        toast.error("Impossible de charger le tableau de bord : " + err.message);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const livreById = useMemo(() => Object.fromEntries(livres.map((l) => [l.id, l])), [livres]);
  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  const enCours = useMemo(() => emprunts.filter((e) => !e.date_retour_effective).length, [emprunts]);

  const recent = useMemo(
    () => [...emprunts].sort((a, b) => new Date(b.date_emprunt) - new Date(a.date_emprunt)).slice(0, 5),
    [emprunts]
  );

  const usersByType = useMemo(() => {
    const counts = { Etudiant: 0, Professeur: 0, Personnel: 0 };
    users.forEach((u) => {
      counts[u.type_utilisateur] = (counts[u.type_utilisateur] || 0) + 1;
    });
    return counts;
  }, [users]);

  if (loading) return <Loading />;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="stat-grid">
        <StatCard icon={<IconBook />} label="Livres au catalogue" value={livres.length} tone="info" />
        <StatCard icon={<IconUsers />} label="Utilisateurs inscrits" value={users.length} tone="success" />
        <StatCard icon={<IconSwap />} label="Emprunts en cours" value={enCours} tone="warning" />
        <StatCard icon={<IconAlertCircle />} label="Retards à traiter" value={retards.length} tone="danger" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }} className="dashboard-grid">
        <div className="panel">
          <div className="panel-header">
            <h3>Activité récente</h3>
            <button className="btn btn-ghost" onClick={() => onNavigate("emprunts")}>
              Voir tout <IconArrowRight />
            </button>
          </div>
          {recent.length === 0 ? (
            <EmptyState icon={<IconHistory />} title="Aucun emprunt enregistré" />
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Livre</th>
                    <th>Emprunteur</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((e) => {
                    const livre = livreById[e.livre_id];
                    const user = userById[e.utilisateur_id];
                    const late = !e.date_retour_effective && new Date(e.date_retour_prevue) < new Date();
                    return (
                      <tr key={e.id}>
                        <td className="cell-primary">{livre ? livre.titre : `#${e.livre_id}`}</td>
                        <td className="cell-muted">{user ? `${user.prenom} ${user.nom}` : `#${e.utilisateur_id}`}</td>
                        <td className="cell-muted">{formatDate(e.date_emprunt)}</td>
                        <td>
                          {e.date_retour_effective ? (
                            <span className="badge badge-neutral">
                              <span className="badge-dot" /> Retourné
                            </span>
                          ) : late ? (
                            <span className="badge badge-danger">
                              <span className="badge-dot" /> En retard
                            </span>
                          ) : (
                            <span className="badge badge-info">
                              <span className="badge-dot" /> En cours
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Utilisateurs par profil</h3>
          </div>
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            {Object.entries(usersByType).map(([type, count]) => {
              const pct = users.length ? Math.round((count / users.length) * 100) : 0;
              return (
                <div key={type}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600 }}>{type === "Personnel" ? "Personnel administratif" : type}</span>
                    <span className="cell-muted">{count}</span>
                  </div>
                  <div style={{ height: 8, borderRadius: 999, background: "var(--surface-hover)", overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: "var(--primary)",
                        borderRadius: 999,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
            {users.length === 0 && <span className="cell-muted" style={{ fontSize: 13 }}>Aucun utilisateur inscrit.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
