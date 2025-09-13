// import axios from "axios";

// const instance = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
// });

// export const submitContact = (data) =>
//   instance.post("/api/contact", data);

// export default instance;



import axios from "axios";

const API_ROOT = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/$/, "");

const api = axios.create({
  baseURL: `${API_ROOT}/api`,
  timeout: 15000,
  headers: { "Content-Type": "application/json", Accept: "application/json" }
});

// Admin token helpers (if you build an admin page)
export function setAdminToken(token) {
  if (token) {
    localStorage.setItem("ADMIN_TOKEN", token);
    api.defaults.headers.common["x-admin-token"] = token;
  }
}
(() => {
  const t = localStorage.getItem("ADMIN_TOKEN");
  if (t) api.defaults.headers.common["x-admin-token"] = t;
})();

api.interceptors.response.use(
  (r) => r,
  (err) => {
    const normalized = {
      status: err.response?.status || 0,
      message:
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Request failed",
      data: err.response?.data,
      url: err.config?.url,
      method: err.config?.method
    };
    return Promise.reject(normalized);
  }
);

export async function submitContact(payload) {
  const { data } = await api.post("/contact", payload);
  return data; // { ok: true, id }
}

export async function fetchContactRequests({ page = 1, limit = 20 } = {}) {
  const { data } = await api.get("/admin/requests", { params: { page, limit } });
  return data; // { ok, total, items }
}

export default api;
