import axios from "axios";

// Change the backend URL in client/.env (VITE_API_URL). Falls back to localhost:5000.
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// "Remember me" ON  -> localStorage (survives closing the browser)
// "Remember me" OFF -> sessionStorage (cleared when the tab closes)
export const storage = {
  get: (key) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
  set: (key, value, remember) => (remember ? localStorage : sessionStorage).setItem(key, value),
  clear: () => {
    ["cc_token", "cc_user"].forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
  },
};

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = storage.get("cc_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the backend says the token is invalid/expired, log out and go to /login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const onAuthPage = ["/login", "/register"].includes(window.location.pathname);
    if (err.response?.status === 401 && !onAuthPage) {
      storage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;