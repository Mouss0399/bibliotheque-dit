const BASE_URLS = {
  livres: import.meta.env.VITE_API_LIVRES || "http://localhost:8000",
  utilisateurs: import.meta.env.VITE_API_UTILISATEURS || "http://localhost:8001",
  emprunts: import.meta.env.VITE_API_EMPRUNTS || "http://localhost:8002",
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(service, path, options = {}) {
  const res = await fetch(`${BASE_URLS[service]}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || detail;
    } catch {
      // réponse sans corps JSON
    }
    throw new ApiError(detail, res.status);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (service, path) => request(service, path),
  post: (service, path, data) =>
    request(service, path, { method: "POST", body: JSON.stringify(data) }),
  put: (service, path, data) =>
    request(service, path, { method: "PUT", body: JSON.stringify(data) }),
  del: (service, path) => request(service, path, { method: "DELETE" }),
};
