import { api } from "./client";

export const livresApi = {
  list: () => api.get("livres", "/livres"),
  search: (q) => api.get("livres", `/livres/recherche?q=${encodeURIComponent(q)}`),
  create: (livre) => api.post("livres", "/livres", livre),
  update: (id, livre) => api.put("livres", `/livres/${id}`, livre),
  remove: (id) => api.del("livres", `/livres/${id}`),
};
