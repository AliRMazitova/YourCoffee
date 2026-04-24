<template>
  <div class="drink-detail-view">
        <SiteHeader />

    <main class="shell detail-main">
      <RouterLink to="/drinks" class="back-link">
        <span class="material-symbols-outlined">arrow_back</span>
        <span>Назад в меню</span>
      </RouterLink>

      <div v-if="isLoading" class="empty-state">
        <h2>Загрузка</h2>
        <p>Получаем данные напитка из базы данных.</p>
      </div>

      <div v-else-if="loadError" class="empty-state">
        <h2>Ошибка</h2>
        <p>{{ loadError }}</p>
        <RouterLink to="/drinks" class="secondary-button">Вернуться к меню</RouterLink>
      </div>

      <template v-else-if="drink">
        <section class="hero-grid">
          <div class="drink-visual">
            <div class="drink-image-wrap">
              <img :src="drink.image" :alt="drink.title" />
              <div v-if="drink.badges?.length" class="aroma-notes">
                <span v-for="note in drink.badges" :key="note">{{ note }}</span>
              </div>
            </div>
          </div>

          <div class="drink-summary">
            <header class="summary-header">
              <h1>{{ drink.title }}</h1>
              <p>{{ detailDescription }}</p>
            </header>

            <section v-if="volumes.length" class="detail-card">
              <div class="section-topline section-topline--compact">
                <h2>Выберите объем</h2>
              </div>

              <div class="milk-grid">
                <button
                  v-for="volume in volumes"
                  :key="volume.id"
                  type="button"
                  :class="['milk-option', { 'milk-option--active': selectedVolumeId === volume.id }]"
                  @click="selectedVolumeId = volume.id"
                >
                  <span class="material-symbols-outlined">local_cafe</span>
                  <span>{{ volume.volume_name }} · {{ volume.ml }} мл</span>
                </button>
              </div>
            </section>

            <section v-if="addons.length" class="detail-section">
              <div class="section-topline">
                <h2>Добавки</h2>
                <span>+40₽ к цене</span>
              </div>

              <div class="chip-list">
                <button
                  v-for="addon in addons"
                  :key="addon.id"
                  type="button"
                  class="chip-button"
                >
                  {{ addon.name }}
                </button>
              </div>
            </section>

            <div class="action-stack">
              <button type="button" class="primary-button">
                <span class="material-symbols-outlined">shopping_bag</span>
                Добавить в заказ — {{ selectedVolume?.priceLabel ?? drink.priceLabel }}
              </button>

              <button
                v-if="auth.isAuthenticated"
                type="button"
                class="secondary-button"
                @click="toggleFavorite"
              >
                <span class="material-symbols-outlined filled-icon">favorite</span>
                {{ isFavorite ? "Убрать из избранного" : "Добавить в избранное" }}
              </button>
            </div>
          </div>
        </section>

        <section class="info-grid">
          <article class="info-card info-card--wide">
            <div class="card-heading">
              <span class="material-symbols-outlined">format_list_bulleted</span>
              <h2>Состав</h2>
            </div>

            <ul class="ingredients-list">
              <li
                v-for="ingredient in currentIngredients"
                :key="`${ingredient.drink_volume_id}-${ingredient.ingredient_id}`"
              >
                <span class="dot"></span>
                <span>
                  {{ ingredient.name }}
                  <template v-if="ingredient.amount_g"> — {{ ingredient.amount_g }} г</template>
                </span>
              </li>
            </ul>
          </article>

          <article class="nutrition-card">
            <h2>Пищевая ценность</h2>

            <div class="nutrition-list">
              <div v-for="item in nutritionRows" :key="item.label" class="nutrition-row">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <p>{{ servingNote }}</p>
          </article>
        </section>
      </template>
    </main>

        <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";

import { RouterLink, useRoute } from "vue-router";

import { drinksApi } from "@/api/drinks.api";
import { useAuthStore } from "@/stores/auth";
import { useFavoritesStore } from "@/stores/favorites";

const route = useRoute();
const auth = useAuthStore();
const favorites = useFavoritesStore();

const drink = ref(null);
const volumes = ref([]);
const addons = ref([]);
const ingredients = ref([]);
const selectedVolumeId = ref(null);
const isLoading = ref(false);
const loadError = ref("");

const selectedVolume = computed(
  () => volumes.value.find((volume) => volume.id === selectedVolumeId.value) ?? null,
);

const currentIngredients = computed(() => {
  if (!selectedVolume.value) {
    return ingredients.value;
  }

  return ingredients.value.filter(
    (ingredient) => ingredient.drink_volume_id === selectedVolume.value.id,
  );
});

const nutritionRows = computed(
  () => selectedVolume.value?.nutrition ?? [],
);

const detailDescription = computed(
  () => drink.value?.shortDescription ?? drink.value?.description ?? "",
);

const isFavorite = computed(() => {
  if (!drink.value) {
    return false;
  }

  return favorites.isFavorite(drink.value.id);
});

const servingNote = computed(() => {
  if (!selectedVolume.value) {
    return "Данные указаны для стандартной порции напитка.";
  }

  return `Значения рассчитаны для объёма ${selectedVolume.value.volume_name} (${selectedVolume.value.ml} мл).`;
});

onMounted(async () => {
  await Promise.all([loadDrinkDetails(), auth.initAuth()]);
});

watch(
  () => route.params.slug,
  async () => {
    await loadDrinkDetails();
  },
);

watch(selectedVolumeId, async (volumeId) => {
  if (!drink.value || !volumeId) {
    return;
  }

  try {
    ingredients.value = await drinksApi.getDrinkIngredients(drink.value.id, volumeId);
  } catch (error) {
    console.error(error);
  }
});

async function loadDrinkDetails() {
  isLoading.value = true;
  loadError.value = "";
  drink.value = null;
  volumes.value = [];
  addons.value = [];
  ingredients.value = [];
  selectedVolumeId.value = null;

  try {
    const summary = await drinksApi.getDrinkBySlug(route.params.slug);

    if (!summary) {
      loadError.value = "Напиток не найден в базе данных.";
      return;
    }

    const [drinkData, drinkVolumes, drinkAddons, drinkTags] = await Promise.all([
      drinksApi.getDrinkById(summary.id),
      drinksApi.getDrinkVolumes(summary.id),
      drinksApi.getDrinkAddons(summary.id),
      drinksApi.getDrinkTags(summary.id),
    ]);

    drink.value = {
      ...drinkData,
      badges: drinkTags.map((tag) => tag.name),
      tags: drinkTags.map((tag) => tag.name),
    };
    volumes.value = drinkVolumes;
    addons.value = drinkAddons;
    selectedVolumeId.value = drinkVolumes[0]?.id ?? null;
    ingredients.value = await drinksApi.getDrinkIngredients(summary.id, selectedVolumeId.value);
  } catch (error) {
    console.error(error);
    loadError.value = "Не удалось загрузить карточку напитка из базы данных.";
  } finally {
    isLoading.value = false;
  }
}

function formatPrice(price) {
  return `${price} ₽`;
}

async function toggleFavorite() {
  if (!drink.value) {
    return;
  }

  try {
    await favorites.toggleFavorite(drink.value);
  } catch (error) {
    console.error(error);
  }
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@100..700&display=swap");

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Plus Jakarta Sans", sans-serif;
  color: #1b1d0e;
  background:
    radial-gradient(circle at top left, rgba(239, 188, 152, 0.18), transparent 24%),
    linear-gradient(180deg, #fbfbe2 0%, #f7f1dc 100%);
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button) {
  font: inherit;
}

.drink-detail-view {
  min-height: 100vh;
}

.shell {
  width: min(100%, 1320px);
  margin: 0 auto;
  padding: 0 40px;
}

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 40;
  width: 100%;
  background: rgba(251, 251, 226, 0.72);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(212, 195, 185, 0.28);
  box-shadow: 0 10px 30px rgba(27, 29, 14, 0.05);
}

.nav-inner,
.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.nav-inner {
  min-height: 92px;
}

.brand,
.footer-brand,
.summary-header h1,
.section-topline h2,
.card-heading h2,
.nutrition-card h2,
.empty-state h2 {
  font-family: "Noto Serif", serif;
}

.brand,
.footer-brand {
  color: #795437;
  font-weight: 700;
}

.brand {
  font-size: 32px;
}

.nav-links,
.footer-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.nav-link {
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  color: #636451;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.nav-link:hover,
.nav-link--active {
  color: #795437;
}

.nav-link--active {
  border-bottom-color: #795437;
}

.profile-button,
.back-link,
.milk-option,
.chip-button,
.primary-button,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-button {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #795437;
}

.detail-main {
  padding-top: 132px;
  padding-bottom: 72px;
}

.back-link {
  gap: 10px;
  margin-bottom: 24px;
  color: #636451;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-grid,
.info-grid {
  display: grid;
  gap: 22px;
}

.hero-grid {
  grid-template-columns: minmax(0, 1.04fr) minmax(340px, 0.9fr);
  align-items: start;
}

.drink-visual {
  position: relative;
  display: flex;
  justify-content: flex-start;
}

.drink-image-wrap,
.detail-card,
.info-card,
.nutrition-card,
.empty-state {
  border: 1px solid rgba(212, 195, 185, 0.28);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 16px 36px rgba(70, 54, 42, 0.06);
  backdrop-filter: blur(8px);
}

.empty-state {
  padding: 28px;
  text-align: center;
}

.empty-state h2 {
  margin: 0;
  color: #795437;
  font-size: 36px;
  font-style: italic;
}

.empty-state p {
  margin: 16px 0 0;
  color: #50443d;
  line-height: 1.7;
}

.drink-image-wrap {
  position: relative;
  overflow: hidden;
  width: min(100%, 600px);
  margin: 0;
  aspect-ratio: 4 / 4.7;
}

.drink-image-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aroma-notes {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: min(280px, calc(100% - 36px));
}

.aroma-notes span {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(251, 221, 202, 0.92);
  color: #28180d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-align: center;
  text-transform: uppercase;
}

.drink-summary {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.summary-header h1 {
  margin: 0 0 14px;
  color: #795437;
  font-size: clamp(36px, 4.3vw, 56px);
  font-style: italic;
  line-height: 1.04;
}

.summary-header p {
  margin: 0;
  max-width: 520px;
  color: #50443d;
  font-size: 15px;
  line-height: 1.7;
}

.detail-card,
.info-card,
.nutrition-card {
  padding: 22px;
}

.section-topline,
.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.section-topline--compact {
  justify-content: flex-start;
}

.section-topline h2,
.card-heading h2,
.nutrition-card h2 {
  margin: 0;
  color: #795437;
  font-size: 28px;
  font-style: italic;
  white-space: nowrap;
}

.section-topline span,
.nutrition-card p {
  color: #636451;
  font-size: 12px;
  line-height: 1.5;
}

.milk-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.milk-option {
  flex-direction: column;
  gap: 8px;
  min-height: 92px;
  border: 1px solid rgba(130, 116, 108, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  color: #636451;
  cursor: pointer;
  transition: 0.2s ease;
}

.milk-option span:last-child {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.milk-option--active,
.milk-option:hover {
  border-color: #795437;
  background: #795437;
  color: #ffffff;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip-button,
.secondary-button {
  border: 1px solid rgba(130, 116, 108, 0.32);
  background: rgba(255, 255, 255, 0.72);
  color: #636451;
}

.chip-button {
  padding: 12px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: 0.2s ease;
}

.chip-button:hover {
  border-color: #795437;
  color: #795437;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.primary-button,
.secondary-button {
  gap: 12px;
  width: 100%;
  padding: 16px 20px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
}

.primary-button {
  border: 0;
  background: linear-gradient(135deg, #795437 0%, #956c4d 100%);
  color: #ffffff;
  box-shadow: 0 16px 28px rgba(121, 84, 55, 0.16);
}

.primary-button:hover {
  transform: translateY(-1px);
}

.secondary-button {
  border-radius: 18px;
}

.secondary-button:hover {
  border-color: #795437;
  background: #795437;
  color: #ffffff;
}

.filled-icon {
  font-variation-settings: "FILL" 1;
}

.info-grid {
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.65fr);
  margin-top: 32px;
}

.info-card--wide {
  min-height: 100%;
}

.card-heading {
  justify-content: flex-start;
}

.card-heading .material-symbols-outlined {
  color: #795437;
  font-size: 32px;
}

.ingredients-list,
.nutrition-list {
  display: grid;
  gap: 16px;
}

.ingredients-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.ingredients-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(212, 195, 185, 0.24);
  color: #1b1d0e;
  font-size: 15px;
  font-weight: 500;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #956c4d;
}

.nutrition-card {
  background: #1b1d0e;
  color: #fbfbe2;
}

.nutrition-card h2,
.nutrition-row strong {
  color: #ffffff;
}

.nutrition-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(228, 228, 204, 0.16);
}

.nutrition-row span {
  color: rgba(251, 251, 226, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.nutrition-row strong {
  font-family: "Noto Serif", serif;
  font-size: 28px;
  font-style: italic;
}

.nutrition-card p {
  margin: 18px 0 0;
  color: rgba(251, 251, 226, 0.5);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.material-symbols-outlined {
  font-family: "Material Symbols Outlined", sans-serif;
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

.site-footer {
  margin-top: 80px;
  padding: 48px 0;
  background-color: #f5f5dc;
  border-top: 1px solid rgba(212, 195, 185, 0.3);
}

.footer-inner {
  gap: 32px;
}

.footer-brand {
  font-size: 24px;
}

.footer-link,
.footer-copy {
  color: #636451;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 1100px) {
  .hero-grid,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .milk-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 640px) {
  .shell {
    padding: 0 18px;
  }

  .nav-inner {
    min-height: 76px;
  }

  .brand {
    font-size: 26px;
  }

  .detail-main {
    padding-top: 108px;
    padding-bottom: 56px;
  }

  .detail-card,
  .info-card,
  .nutrition-card,
  .empty-state {
    padding: 20px;
    border-radius: 22px;
  }

  .milk-grid {
    grid-template-columns: 1fr;
  }

  .summary-header h1,
  .section-topline h2,
  .card-heading h2,
  .nutrition-card h2,
  .empty-state h2 {
    font-size: 34px;
  }

  .section-topline {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
