import { http } from "@/utils/http";

export const authApi = {
  register(data) {
    return http.post("/auth/register", data);
  },

  login(data) {
    return http.post("/auth/login", data);
  },

  getProfile() {
    return http.get("/auth/me");
  },

  refresh(refreshToken) {
    return http.post("/auth/refresh", { refreshToken });
  },

  logout(refreshToken) {
    return http.post("/auth/logout", { refreshToken });
  },
};
