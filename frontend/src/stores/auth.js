import { defineStore } from "pinia";
import { authApi } from "@/api/auth.api";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
  },

  actions: {
    setTokens(access, refresh) {
      this.accessToken = access;
      this.refreshToken = refresh;
      if (access) localStorage.setItem("accessToken", access);
      else localStorage.removeItem("accessToken");
      if (refresh) localStorage.setItem("refreshToken", refresh);
      else localStorage.removeItem("refreshToken");
    },

    setAccessToken(access) {
      this.accessToken = access;
      if (access) localStorage.setItem("accessToken", access);
      else localStorage.removeItem("accessToken");
    },

    async login(credentials) {
      const { data } = await authApi.login(credentials);
      this.setTokens(data.accessToken, data.refreshToken);
      try {
        await this.fetchProfile();
      } catch (e) {
        this.user = null;
        this.setTokens(null, null);
        throw e;
      }
    },

    async register(data) {
      return authApi.register(data);
    },

    async fetchProfile() {
      const { data } = await authApi.getProfile();
      this.user = data.user;
    },

    async initAuth() {
      if (this.accessToken && !this.user) {
        try {
          await this.fetchProfile();
        } catch {
          await this.logout();
        }
      }
    },

    async logout() {
      const rt = this.refreshToken;
      if (rt) {
        try {
          await authApi.logout(rt);
        } catch {
          /* ignore network errors on logout */
        }
      }
      this.user = null;
      this.setTokens(null, null);
    },
  },
});
