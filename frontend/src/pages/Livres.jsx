import { useEffect, useMemo, useState } from "react";
import { livresApi } from "../api/livres";
import { useToast } from "../components/ToastProvider";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EmptyState } from "../components/EmptyState";
import { Loading } from "../components/Loading";
import { IconBook, IconPlus, IconSearch, IconEdit, IconTrash } from "../components/icons";

const EMPTY_FORM = { titre: "", auteur: "", isbn: "" };

export function Livres() {
  const toast = useToast();
  const [livres, setLivres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(null); // { mode: "create" | "edit", livre }
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await livresApi.list();
      setLivres(data);
    } catch (e) {
      toast.error("Impossible de charger les livres : " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      load();
      return;
    }
    const handle = setTimeout(async () => {
      try {
        const data = await livresApi.search(q);
        setLivres(data);
      } catch (e) {
        toast.error("Recherche impossible : " + e.message);
      }
    }, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setFormError("");
    setModal({ mode: "create" });
  };

  const openEdit = (livre) => {
    setForm({ titre: livre.titre, auteur: livre.auteur, isbn: livre.isbn });
    setFormError("");
    setModal({ mode: "edit", livre });
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.titre.trim() || !form.auteur.trim() || !form.isbn.trim()) {
      setFormError("Tous les champs sont obligatoires.");
      return;
    }
    setSaving(true);
    setFormError("");
    try {
      if (modal.mode === "create") {
        await livresApi.create(form);
        toast.success(`« ${form.titre} » a été ajouté au catalogue.`);
      } else {
        await livresApi.update(modal.livre.id, form);
        toast.success(`« ${form.titre} » a été mis à jour.`);
      }
      setModal(null);
      setQuery("");
      await load();
    } catch (e) {
      setFormError(e.message || "Une erreur est survenue.");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    try {
      await livresApi.remove(toDelete.id);
      toast.success(`« ${toDelete.titre} » a été supprimé.`);
      await load();
    } catch (e) {
      toast.error("Suppression impossible : " + e.message);
    }
  };

  const list = useMemo(() => livres, [livres]);

  return (
    <div className="panel">
      <div className="panel-header">
        <div className="search-box">
          <IconSearch />
          <input
            className="input"
            placeholder="Rechercher par titre, auteur ou ISBN..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <IconPlus /> Ajouter un livre
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : list.length === 0 ? (
        <EmptyState
          icon={<IconBook />}
          title={query ? "Aucun livre ne correspond à votre recherche" : "Aucun livre pour le moment"}
          description={query ? "Essayez un autre titre, auteur ou ISBN." : "Commencez par ajouter un livre au catalogue."}
        />
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Auteur</th>
                <th>ISBN</th>
                <th>Disponibilité</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((livre) => (
                <tr key={livre.id}>
                  <td className="cell-primary">{livre.titre}</td>
                  <td className="cell-muted">{livre.auteur}</td>
                  <td className="cell-muted">{livre.isbn}</td>
                  <td>
                    {livre.disponible ? (
                      <span className="badge badge-success">
                        <span className="badge-dot" /> Disponible
                      </span>
                    ) : (
                      <span className="badge badge-warning">
                        <span className="badge-dot" /> Emprunté
                      </span>
                    )}
                  </td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost btn-icon" onClick={() => openEdit(livre)} aria-label="Modifier">
                        <IconEdit />
                      </button>
                      <button className="btn btn-danger btn-icon" onClick={() => setToDelete(livre)} aria-label="Supprimer">
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
          title={modal.mode === "create" ? "Ajouter un livre" : "Modifier le livre"}
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
            <div className="field">
              <label>Titre</label>
              <input
                className="input"
                value={form.titre}
                onChange={(e) => setForm({ ...form, titre: e.target.value })}
                placeholder="Ex. Une si longue lettre"
                autoFocus
              />
            </div>
            <div className="field">
              <label>Auteur</label>
              <input
                className="input"
                value={form.auteur}
                onChange={(e) => setForm({ ...form, auteur: e.target.value })}
                placeholder="Ex. Mariama Bâ"
              />
            </div>
            <div className="field">
              <label>ISBN</label>
              <input
                className="input"
                value={form.isbn}
                onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                placeholder="Ex. 978-2-7087-0632-4"
              />
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Supprimer ce livre ?"
          message={`« ${toDelete.titre} » sera définitivement retiré du catalogue.`}
          confirmLabel="Supprimer"
          onConfirm={confirmDelete}
          onClose={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
