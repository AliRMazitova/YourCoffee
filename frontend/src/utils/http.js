import axios from "axios";

const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export const http = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

let refreshPromise = null;

async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(REFRESH_KEY);
  if (!refreshToken) throw new Error("No refresh token");
  const { data } = await axios.post("/api/auth/refresh", { refreshToken });
  localStorage.setItem(ACCESS_KEY, data.accessToken);
  return data.accessToken;
}

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status !== 401 ||
      original?._retry ||
      !original
    ) {
      return Promise.reject(error);
    }

    const url = String(original.url || "");
    if (
      url.includes("/auth/login") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/register")
    ) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newAccess = await refreshPromise;
      original.headers.Authorization = `Bearer ${newAccess}`;
      return http(original);
    } catch {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      return Promise.reject(error);
    }
  }
);
