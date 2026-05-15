import { http } from "@/utils/http";

const DEFAULT_DRINK_IMAGE = "/uploads/drinks/espresso.png";
const HIDDEN_DISPLAY_TAGS = new Set([
  "горячий",
  "холодный",
  "освежающий",
  "согревающий",
  "уютный",
  "нежный",
  "тонизирующий",
  "классический",
  "легкий",
  "травяной",
  "спокойный",
]);
const DISPLAY_TAG_PRIORITY = [
  "кофе",
  "чай",
  "матча",
  "молочный",
  "сливочный",
  "раф",
  "тоник",
  "цитрус",
  "фруктовый",
  "ягодный",
  "шоколадный",
  "сладкий",
  "пряный",
  "авторский",
  "сезонный",
];

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

function normalizeList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeAddonName(value) {
  return String(value ?? "").replace(/^доп\.\s*/i, "").trim();
}

function normalizeMilkOptionName(value) {
  const rawName = String(value ?? "").trim();

  if (rawName === "Молоко") return "Классическое";
  if (rawName === "Кокосовое молоко") return "Кокосовое";
  if (rawName === "Овсяное молоко") return "Овсяное";

  return rawName;
}

function resolveImageUrl(value) {
  const imageUrl = String(value ?? "").trim();

  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  if (imageUrl.startsWith("/")) return imageUrl;

  return `/${imageUrl}`;
}

export function filterDisplayTags(tags) {
  if (!Array.isArray(tags)) return [];

  return tags.filter((tag) => !HIDDEN_DISPLAY_TAGS.has(String(tag).toLowerCase()));
}

function sortTagsForDisplay(tags) {
  return [...tags].sort((left, right) => {
    const leftIndex = DISPLAY_TAG_PRIORITY.indexOf(String(left).toLowerCase());
    const rightIndex = DISPLAY_TAG_PRIORITY.indexOf(String(right).toLowerCase());
    const safeLeftIndex = leftIndex === -1 ? DISPLAY_TAG_PRIORITY.length : leftIndex;
    const safeRightIndex = rightIndex === -1 ? DISPLAY_TAG_PRIORITY.length : rightIndex;

    if (safeLeftIndex !== safeRightIndex) {
      return safeLeftIndex - safeRightIndex;
    }

    return String(left).localeCompare(String(right), "ru");
  });
}

export function pickDisplayTags(tags, limit = 3) {
  return sortTagsForDisplay(filterDisplayTags(tags)).slice(0, limit);
}

export function mapDrinkSummary(drink) {
  const price = normalizePrice(drink.min_price ?? drink.price);
  const isHot = drink.is_hot ?? true;
  const image = resolveImageUrl(drink.image_url) || DEFAULT_DRINK_IMAGE;
  const visibleTags = filterDisplayTags(drink.tags);
  const displayTags = pickDisplayTags(visibleTags);

  return {
    ...drink,
    slug: slugify(drink.name),
    title: drink.name,
    image,
    price,
    priceLabel: `${price} ₽`,
    description: drink.description ?? "",
    shortDescription: drink.description ?? "",
    tags: visibleTags,
    badges: displayTags,
    displayTags,
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

  async getDrinkIngredients(id, volumeId, milkOptionId) {
    const params = {};

    if (volumeId) params.volume_id = volumeId;
    if (milkOptionId) params.milk_option_id = milkOptionId;

    const { data } = await http.get(`/drinks/${id}/ingredients`, {
      params: Object.keys(params).length ? params : undefined,
    });

    return data.map((item) => ({
      ...item,
      amount_g: Number(item.amount_g) || 0,
      calories: normalizePrice(item.calories),
      protein: normalizePrice(item.protein),
      fat: normalizePrice(item.fat),
      carbs: normalizePrice(item.carbs),
      allergens: normalizeList(item.allergens),
    }));
  },

  async getDrinkMilkOptions(id) {
    const { data } = await http.get(`/drinks/${id}/milk-options`);
    return data.map((item) => {
      const extraPrice = normalizePrice(item.extra_price);

      return {
        ...item,
        displayName: normalizeMilkOptionName(item.name),
        price: normalizePrice(item.price),
        extraPrice,
        extraPriceLabel: extraPrice ? `+${extraPrice} ₽` : "без доплаты",
        allergens: normalizeList(item.allergens),
      };
    });
  },

  async getDrinkAddons(id) {
    const { data } = await http.get(`/drinks/${id}/addons`);
    return data.map((item) => ({
      ...item,
      displayName: normalizeAddonName(item.name),
      price: normalizePrice(item.price),
      allergens: normalizeList(item.allergens),
    }));
  },

  async getTags(params = { scope: "user" }) {
    const { data } = await http.get("/tags", { params });
    return data;
  },
};
