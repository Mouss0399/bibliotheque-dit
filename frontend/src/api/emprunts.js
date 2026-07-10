import { api } from "./client";

export const empruntsApi = {
  list: () => api.get("emprunts", "/emprunts"),
  listByUtilisateur: (utilisateurId) =>
    api.get("emprunts", `/emprunts/utilisateur/${utilisateurId}`),
  retards: () => api.get("emprunts", "/emprunts/retards"),
  emprunter: (emprunt) => api.post("emprunts", "/emprunts", emprunt),
  retourner: (id) => api.put("emprunts", `/emprunts/${id}/retour`, {}),
};
