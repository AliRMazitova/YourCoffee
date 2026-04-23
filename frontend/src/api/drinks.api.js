import { http } from "@/utils/http";

const DEFAULT_DRINK_IMAGE = "/uploads/drinks/espresso.png";

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizePrice(value) {
  const price = Number(value);
  return Number.isFinite(price) ? price : 0;
}

function resolveImageUrl(value) {
  const imageUrl = String(value ?? "").trim();

  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl;

  return `/${imageUrl}`;
}

export function mapDrinkSummary(drink) {
  const price = normalizePrice(drink.min_price ?? drink.price);
  const isHot = drink.is_hot ?? true;
  const image = resolveImageUrl(drink.image_url) || DEFAULT_DRINK_IMAGE;

  return {
    ...drink,
    slug: slugify(drink.name),
    title: drink.name,
    image,
    price,
    priceLabel: `${price} ₽`,
    description: drink.description ?? "",
    shortDescription: drink.description ?? "",
    tags: Array.isArray(drink.tags) ? drink.tags : [],
    badges: Array.isArray(drink.tags) ? drink.tags : [],
    temperature: isHot ? "hot" : "cold",
  };
}

function mapNutritionRow(volume) {
  return [
    { label: "Калории", value: `${normalizePrice(volume.calories)}` },
    { label: "Белки", value: `${normalizePrice(volume.protein)} г` },
    { label: "Жиры", value: `${normalizePrice(volume.fat)} г` },
    { label: "Углеводы", value: `${normalizePrice(volume.carbs)} г` },
  ];
}

export const drinksApi = {
  async getDrinks(params = {}) {
    const { data } = await http.get("/drinks", { params });
    return data.map(mapDrinkSummary);
  },

  async getDrinkById(id) {
    const { data } = await http.get(`/drinks/${id}`);
    return mapDrinkSummary(data);
  },

  async getDrinkBySlug(slug) {
    const drinks = await this.getDrinks();
    return drinks.find((drink) => drink.slug === slug) ?? null;
  },

  async getDrinkTags(id) {
    const { data } = await http.get(`/drinks/${id}/tags`);
    return data;
  },

  async getDrinkVolumes(id) {
    const { data } = await http.get(`/drinks/${id}/volumes`);
    return data.map((volume) => ({
      ...volume,
      price: normalizePrice(volume.price),
      ml: Number(volume.ml) || 0,
      nutrition: mapNutritionRow(volume),
      priceLabel: `${normalizePrice(volume.price)} ₽`,
    }));
  },

  async getDrinkIngredients(id, volumeId) {
    const params = volumeId ? { volume_id: volumeId } : undefined;
    const { data } = await http.get(`/drinks/${id}/ingredients`, { params });
    return data;
  },

  async getDrinkAddons(id) {
    const { data } = await http.get(`/drinks/${id}/addons`);
    return data.map((item) => ({
      ...item,
      price: normalizePrice(item.price),
    }));
  },

  async getTags() {
    const { data } = await http.get("/tags");
    return data;
  },
};
