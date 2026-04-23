import { defineStore } from "pinia";

import { favoritesApi } from "@/api/favorites.api";
import { useAuthStore } from "@/stores/auth";

export const useFavoritesStore = defineStore("favorites", {
  state: () => ({
    items: [],
    isLoading: false,
    isLoaded: false,
  }),

  getters: {
    favoriteIds: (state) => state.items.map((drink) => Number(drink.id)),
    hasFavorites: (state) => state.items.length > 0,
  },

  actions: {
    clear() {
      this.items = [];
      this.isLoaded = false;
    },

    isFavorite(drinkId) {
      return this.items.some((drink) => Number(drink.id) === Number(drinkId));
    },

    async loadFavorites(force = false) {
      const auth = useAuthStore();
      if (!auth.accessToken) {
        this.clear();
        return [];
      }

      if (this.isLoaded && !force) {
        return this.items;
      }

      this.isLoading = true;

      try {
        this.items = await favoritesApi.getFavorites();
        this.isLoaded = true;
        return this.items;
      } finally {
        this.isLoading = false;
      }
    },

    async addFavorite(drink) {
      await favoritesApi.addFavorite(drink.id);
      await this.loadFavorites(true);
    },

    async removeFavorite(drinkId) {
      await favoritesApi.removeFavorite(drinkId);
      this.items = this.items.filter((drink) => Number(drink.id) !== Number(drinkId));
      this.isLoaded = true;
    },

    async toggleFavorite(drink) {
      if (this.isFavorite(drink.id)) {
        await this.removeFavorite(drink.id);
        return false;
      }

      await this.addFavorite(drink);
      return true;
    },
  },
});
