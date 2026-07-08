import { api } from "./client";

export const utilisateursApi = {
  list: () => api.get("utilisateurs", "/utilisateurs"),
  get: (id) => api.get("utilisateurs", `/utilisateurs/${id}`),
  create: (utilisateur) => api.post("utilisateurs", "/utilisateurs", utilisateur),
  update: (id, utilisateur) => api.put("utilisateurs", `/utilisateurs/${id}`, utilisateur),
  remove: (id) => api.del("utilisateurs", `/utilisateurs/${id}`),
};
