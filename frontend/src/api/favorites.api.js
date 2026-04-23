import { http } from "@/utils/http";
import { mapDrinkSummary } from "@/api/drinks.api";

export const favoritesApi = {
  async getFavorites() {
    const { data } = await http.get("/favorites");
    return data.map(mapDrinkSummary);
  },

  async addFavorite(drinkId) {
    const { data } = await http.post("/favorites", { drink_id: drinkId });
    return data;
  },

  async removeFavorite(drinkId) {
    const { data } = await http.delete(`/favorites/${drinkId}`);
    return data;
  },
};
