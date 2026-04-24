import { http } from "@/utils/http";
import { mapDrinkSummary } from "@/api/drinks.api";

export const recommendationsApi = {
  async getRecommendations() {
    const { data } = await http.get("/recommendations");

    return {
      preferredTags: Array.isArray(data?.preferred_tags) ? data.preferred_tags : [],
      recommendations: Array.isArray(data?.recommendations)
        ? data.recommendations.map(mapDrinkSummary)
        : [],
    };
  },
};
