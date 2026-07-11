import { useEffect, useMemo, useState } from "react";
import { empruntsApi } from "../api/emprunts";
import { livresApi } from "../api/livres";
import { utilisateursApi } from "../api/utilisateurs";
import { useToast } from "../components/ToastProvider";
import { Modal } from "../components/Modal";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { IconSwap, IconPlus, IconHistory, IconAlertCircle, IconClock } from "../components/icons";

const EMPTY_FORM = { livre_id: "", utilisateur_id: "", date_retour_prevue: "" };

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}

function statusOf(emprunt) {
  if (emprunt.date_retour_effective) return "retourne";
  if (new Date(emprunt.date_retour_prevue) < new Date()) return "retard";
  return "encours";
}

export function Emprunts() {
  const toast = useToast();
  const [emprunts, setEmprunts] = useState([]);
  const [livres, setLivres] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("encours");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [e, l, u] = await Promise.all([empruntsApi.list(), livresApi.list(), utilisateursApi.list()]);
      setEmprunts(e);
      setLivres(l);
      setUsers(u);
    } catch (err) {
      toast.error("Impossible de charger les emprunts : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const livreById = useMemo(() => Object.fromEntries(livres.map((l) => [l.id, l])), [livres]);
  const userById = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);

  const enriched = useMemo(
    () =>
      emprunts
        .map((e) => ({ ...e, status: statusOf(e) }))
        .sort((a, b) => new Date(b.date_emprunt) - new Date(a.date_emprunt)),
    [emprunts]
  );

  const counts = useMemo(
    () => ({
      encours: enriched.filter((e) => e.status === "encours").length,
      retard: enriched.filter((e) => e.status === "retard").length,
      all: enriched.length,
    }),
    [enriched]
  );

  const visible = useMemo(() => {
    if (tab === "historique") return enriched;
    if (tab === "retard") return enriched.filter((e) => e.status === "retard");
    return enriched.filter((e) => e.status === "encours");
  }, [enriched, tab]);

  const availableLivres = useMemo(() => livres.filter((l) => l.disponible), [livres]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.livre_id || !form.utilisateur_id || !form.date_retour_prevue) {
      setFormError("Veuillez sélectionner un livre, un utilisateur et une date de retour.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      await empruntsApi.emprunter({
        livre_id: Number(form.livre_id),
        utilisateur_id: Number(form.utilisateur_id),
        date_retour_prevue: form.date_retour_prevue,
      });
      toast.success("Emprunt enregistré.");
      setModalOpen(false);
      await load();
    } catch (err) {
      setFormError(err.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const retourner = async (emprunt) => {
    setReturningId(emprunt.id);
    try {
      await empruntsApi.retourner(emprunt.id);
      toast.success("Livre marqué comme retourné.");
      await load();
    } catch (err) {
      toast.error("Retour impossible : " + err.message);
    } finally {
      setReturningId(null);
    }
  };

  const StatusBadge = ({ status }) => {
    if (status === "retourne")
      return (
        <span className="badge badge-neutral">
          <span className="badge-dot" /> Retourné
        </span>
      );
    if (status === "retard")
      return (
        <span className="badge badge-danger">
          <span className="badge-dot" /> En retard
        </span>
      );
    return (
      <span className="badge badge-info">
        <span className="badge-dot" /> En cours
      </span>
    );
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="tab-list">
          <button className={`tab-btn ${tab === "encours" ? "active" : ""}`} onClick={() => setTab("encours")}>
            En cours <span className="count">{counts.encours}</span>
          </button>
          <button className={`tab-btn ${tab === "retard" ? "active" : ""}`} onClick={() => setTab("retard")}>
            Retards <span className="count">{counts.retard}</span>
          </button>
          <button className={`tab-btn ${tab === "historique" ? "active" : ""}`} onClick={() => setTab("historique")}>
            Historique <span className="count">{counts.all}</span>
          </button>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus /> Nouvel emprunt
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={tab === "retard" ? <IconAlertCircle /> : tab === "historique" ? <IconHistory /> : <IconSwap />}
          title={
            tab === "retard"
              ? "Aucun retard"
              : tab === "historique"
              ? "Aucun emprunt enregistré"
              : "Aucun emprunt en cours"
          }
          description={tab === "encours" ? "Enregistrez un nouvel emprunt pour commencer." : undefined}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Livre</th>
                <th>Emprunteur</th>
                <th>Date d'emprunt</th>
                <th>Retour prévu</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => {
                const livre = livreById[e.livre_id];
                const user = userById[e.utilisateur_id];
                return (
                  <tr key={e.id}>
                    <td className="cell-primary">{livre ? livre.titre : `Livre #${e.livre_id}`}</td>
                    <td className="cell-muted">{user ? `${user.prenom} ${user.nom}` : `Utilisateur #${e.utilisateur_id}`}</td>
                    <td className="cell-muted">{formatDate(e.date_emprunt)}</td>
                    <td className="cell-muted">{formatDate(e.date_retour_prevue)}</td>
                    <td>
                      <StatusBadge status={e.status} />
                    </td>
                    <td>
                      {!e.date_retour_effective && (
                        <div className="row-actions">
                          <button
                            className="btn btn-secondary"
                            onClick={() => retourner(e)}
                            disabled={returningId === e.id}
                          >
                            {returningId === e.id ? "..." : "Retourner"}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal
          title="Nouvel emprunt"
          onClose={() => !saving && setModalOpen(false)}
          footer={
            <>
              <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>
                {saving ? "Enregistrement..." : "Emprunter"}
              </button>
            </>
          }
        >
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {formError && <div className="form-error">{formError}</div>}
            <div className="field">
              <label>Livre</label>
              <select
                className="input"
                value={form.livre_id}
                onChange={(e) => setForm({ ...form, livre_id: e.target.value })}
              >
                <option value="">Sélectionner un livre</option>
                {availableLivres.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.titre} — {l.auteur}
                  </option>
                ))}
                {availableLivres.length === 0 && <option disabled>Aucun livre disponible</option>}
              </select>
            </div>
            <div className="field">
              <label>Emprunteur</label>
              <select
                className="input"
                value={form.utilisateur_id}
                onChange={(e) => setForm({ ...form, utilisateur_id: e.target.value })}
              >
                <option value="">Sélectionner un utilisateur</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.prenom} {u.nom} ({u.type_utilisateur})
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>
                <IconClock style={{ width: 12, height: 12, verticalAlign: "-1px", marginRight: 4 }} />
                Date de retour prévue
              </label>
              <input
                className="input"
                type="datetime-local"
                value={form.date_retour_prevue}
                onChange={(e) => setForm({ ...form, date_retour_prevue: e.target.value })}
              />
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
