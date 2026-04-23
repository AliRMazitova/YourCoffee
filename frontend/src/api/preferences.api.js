import { http } from "@/utils/http";

export const preferencesApi = {
  async getPreferences() {
    const { data } = await http.get("/preferences");
    return data;
  },
};
