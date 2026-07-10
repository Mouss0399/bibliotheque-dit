import { useEffect, useMemo, useState } from "react";
import { utilisateursApi } from "../api/utilisateurs";
import { useToast } from "../components/ToastProvider";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { IconUsers, IconPlus, IconSearch, IconEdit, IconTrash, IconEye, IconMail, IconIdBadge } from "../components/icons";

const EMPTY_FORM = { nom: "", prenom: "", email: "", type_utilisateur: "Etudiant" };

const TYPE_TONE = {
  Etudiant: "info",
  Professeur: "success",
  Personnel: "warning",
};

function initials(nom, prenom) {
  return `${(prenom || "?")[0] ?? ""}${(nom || "?")[0] ?? ""}`.toUpperCase();
}

export function Utilisateurs() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null);
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await utilisateursApi.list();
      setUsers(data);
    } catch (e) {
      toast.error("Impossible de charger les utilisateurs : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.nom, u.prenom, u.email, u.type_utilisateur].some((v) => (v || "").toLowerCase().includes(q))
    );
  }, [users, query]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (u) => {
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, type_utilisateur: u.type_utilisateur });
    setFormError("");
    setModal({ mode: "edit", user: u });
  };

  const openProfile = async (u) => {
    try {
      const data = await utilisateursApi.get(u.id);
      setProfile(data);
    } catch (e) {
      toast.error("Profil introuvable : " + e.message);
    }
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim()) {
      setFormError("Nom, prénom et email sont obligatoires.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        await utilisateursApi.create(form);
        toast.success(`${form.prenom} ${form.nom} a été ajouté.`);
      } else {
        await utilisateursApi.update(modal.user.id, form);
        toast.success(`${form.prenom} ${form.nom} a été mis à jour.`);
      }
      setModal(null);
      await load();
    } catch (e) {
      setFormError(e.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await utilisateursApi.remove(toDelete.id);
      toast.success(`${toDelete.prenom} ${toDelete.nom} a été supprimé.`);
      await load();
    } catch (e) {
      toast.error("Suppression impossible : " + e.message);
    }
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="search-box">
          <IconSearch />
          <input
            className="input"
            placeholder="Rechercher un utilisateur..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus /> Ajouter un utilisateur
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<IconUsers />}
          title={query ? "Aucun utilisateur ne correspond" : "Aucun utilisateur pour le moment"}
          description={query ? "Essayez un autre nom ou email." : "Commencez par créer un compte étudiant, professeur ou personnel."}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Type</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className="avatar">{initials(u.nom, u.prenom)}</div>
                      <span className="cell-primary">
                        {u.prenom} {u.nom}
                      </span>
                    </div>
                  </td>
                  <td className="cell-muted">{u.email}</td>
                  <td>
                    <span className={`badge badge-${TYPE_TONE[u.type_utilisateur] || "neutral"}`}>
                      <span className="badge-dot" /> {u.type_utilisateur}
                    </span>
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => openProfile(u)} aria-label="Voir le profil">
                        <IconEye />
                      </button>
                      <button className="btn btn-ghost btn-icon" onClick={() => openEdit(u)} aria-label="Modifier">
                        <IconEdit />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => setToDelete(u)} aria-label="Supprimer">
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <Modal
          title={modal.mode === "create" ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal} disabled={saving}>
                Annuler
              </button>
              <button className="btn btn-primary" onClick={submit} disabled={saving}>
                {saving ? "Enregistrement..." : modal.mode === "create" ? "Ajouter" : "Enregistrer"}
              </button>
            </>
          }
        >
          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-grid">
              <div className="field">
                <label>Prénom</label>
                <input
                  className="input"
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                  autoFocus
                />
              </div>
              <div className="field">
                <label>Nom</label>
                <input className="input" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} />
              </div>
              <div className="field span-2">
                <label>Email</label>
                <input
                  className="input"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="prenom.nom@dit.sn"
                />
              </div>
              <div className="field span-2">
                <label>Type d'utilisateur</label>
                <select
                  className="input"
                  value={form.type_utilisateur}
                  onChange={(e) => setForm({ ...form, type_utilisateur: e.target.value })}
                >
                  <option value="Etudiant">Étudiant</option>
                  <option value="Professeur">Professeur</option>
                  <option value="Personnel">Personnel administratif</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {profile && (
        <Modal title="Profil utilisateur" onClose={() => setProfile(null)} width="380px">
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "8px 0 4px" }}>
            <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>
              {initials(profile.nom, profile.prenom)}
            </div>
            <h3 style={{ fontSize: 17 }}>
              {profile.prenom} {profile.nom}
            </h3>
            <span className={`badge badge-${TYPE_TONE[profile.type_utilisateur] || "neutral"}`}>
              <span className="badge-dot" /> {profile.type_utilisateur}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
              <IconMail style={{ width: 16, height: 16, color: "var(--text-faint)" }} />
              {profile.email}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5 }}>
              <IconIdBadge style={{ width: 16, height: 16, color: "var(--text-faint)" }} />
              Identifiant #{profile.id}
            </div>
          </div>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer cet utilisateur ?"
          message={`${toDelete.prenom} ${toDelete.nom} sera définitivement supprimé.`}
          confirmLabel="Supprimer"
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
