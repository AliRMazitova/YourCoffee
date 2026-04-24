import { http } from "@/utils/http";

export const preferencesApi = {
  async getPreferences() {
    const { data } = await http.get("/preferences");
    return data;
  },

  async updatePreferences(tags) {
    const { data } = await http.post("/preferences", { tags });
    return data;
  },

  async getTags() {
    const { data } = await http.get("/tags");
    return data;
  },
};
