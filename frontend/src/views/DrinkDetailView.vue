<template>
  <div class="drink-detail-view">
    <nav class="top-nav">
      <div class="shell nav-inner">
        <RouterLink to="/" class="brand">YourCoffee</RouterLink>

        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Главная</RouterLink>
          <RouterLink to="/drinks" class="nav-link nav-link--active">Меню</RouterLink>
        </div>

        <RouterLink to="/profile" class="profile-button" aria-label="Профиль">
          <span class="material-symbols-outlined">person</span>
        </RouterLink>
      </div>
    </nav>

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
            </div>

            <div v-if="drink.badges?.length" class="aroma-notes">
              <span v-for="note in drink.badges" :key="note">{{ note }}</span>
            </div>
          </div>

          <div class="drink-summary">
            <header class="summary-header">
              <span class="eyebrow">Карточка напитка</span>
              <h1>{{ drink.title }}</h1>
              <p>{{ detailDescription }}</p>
            </header>

            <section v-if="volumes.length" class="detail-card">
              <div class="section-topline">
                <h2>Выберите объём</h2>
                <span>Цена и пищевая ценность зависят от выбранного размера</span>
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
                <span>Доступно для этого напитка</span>
              </div>

              <div class="chip-list">
                <button
                  v-for="addon in addons"
                  :key="addon.id"
                  type="button"
                  class="chip-button"
                >
                  {{ addon.name }} · {{ formatPrice(addon.price) }}
                </button>
              </div>
            </section>

            <div class="action-stack">
              <button type="button" class="primary-button">
                <span class="material-symbols-outlined">shopping_bag</span>
                Добавить в заказ — {{ selectedVolume?.priceLabel ?? drink.priceLabel }}
              </button>

              <button type="button" class="secondary-button">
                <span class="material-symbols-outlined filled-icon">favorite</span>
                Добавить в избранное
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
              <li v-for="ingredient in currentIngredients" :key="`${ingredient.drink_volume_id}-${ingredient.ingredient_id}`">
                <span class="dot"></span>
                <span>{{ ingredient.name }}<template v-if="ingredient.amount_g"> — {{ ingredient.amount_g }} г</template></span>
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

    <footer class="site-footer">
      <div class="shell footer-inner">
        <div class="footer-brand">YourCoffee</div>
        <div class="footer-links">
          <a v-for="link in footerLinks" :key="link" href="#">{{ link }}</a>
        </div>
        <div class="footer-copy">© 2024 YourCoffee. The Curated Ritual.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { RouterLink, useRoute } from "vue-router";

import { drinksApi } from "@/api/drinks.api";

const route = useRoute();

const footerLinks = ["Privacy", "Terms", "Brewing Guide", "Contact"];

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

const servingNote = computed(() => {
  if (!selectedVolume.value) {
    return "Данные указаны для стандартной порции напитка.";
  }

  return `Значения рассчитаны для объёма ${selectedVolume.value.volume_name} (${selectedVolume.value.ml} мл).`;
});

onMounted(async () => {
  await loadDrinkDetails();
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
  width: min(100%, 1560px);
  margin: 0 auto;
  padding: 0 24px;
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
  margin-bottom: 28px;
  color: #636451;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-grid,
.info-grid {
  display: grid;
  gap: 32px;
}

.hero-grid {
  grid-template-columns: minmax(0, 1.08fr) minmax(360px, 0.92fr);
  align-items: start;
}

.drink-visual {
  position: relative;
}

.drink-image-wrap,
.detail-card,
.info-card,
.nutrition-card,
.empty-state {
  border: 1px solid rgba(212, 195, 185, 0.28);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 48px rgba(70, 54, 42, 0.06);
  backdrop-filter: blur(8px);
}

.empty-state {
  padding: 32px;
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
  overflow: hidden;
  aspect-ratio: 4 / 5;
}

.drink-image-wrap img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.aroma-notes {
  position: absolute;
  top: 24px;
  left: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.aroma-notes span,
.eyebrow {
  color: #6e5749;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.aroma-notes span {
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(251, 221, 202, 0.92);
  color: #28180d;
}

.drink-summary {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.summary-header h1 {
  margin: 12px 0 18px;
  color: #795437;
  font-size: clamp(40px, 5vw, 64px);
  font-style: italic;
  line-height: 1.04;
}

.summary-header p {
  margin: 0;
  max-width: 560px;
  color: #50443d;
  font-size: 17px;
  line-height: 1.8;
}

.detail-card,
.info-card,
.nutrition-card {
  padding: 28px;
}

.section-topline,
.card-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 20px;
}

.section-topline h2,
.card-heading h2,
.nutrition-card h2 {
  margin: 0;
  color: #795437;
  font-size: 32px;
  font-style: italic;
}

.section-topline span,
.nutrition-card p {
  color: #636451;
  font-size: 13px;
  line-height: 1.7;
}

.milk-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.milk-option {
  flex-direction: column;
  gap: 10px;
  min-height: 108px;
  border: 1px solid rgba(130, 116, 108, 0.28);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  color: #636451;
  cursor: pointer;
  transition: 0.2s ease;
}

.milk-option span:last-child {
  font-size: 14px;
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
  gap: 18px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
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
  gap: 14px;
}

.primary-button,
.secondary-button {
  gap: 12px;
  width: 100%;
  padding: 18px 24px;
  border-radius: 999px;
  font-size: 12px;
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
  box-shadow: 0 18px 32px rgba(121, 84, 55, 0.16);
}

.primary-button:hover {
  transform: translateY(-1px);
}

.secondary-button {
  border-radius: 22px;
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
  margin: 24px 0 0;
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
  padding: 8px 0 48px;
}

.footer-inner {
  padding-top: 32px;
  border-top: 1px solid rgba(212, 195, 185, 0.35);
}

.footer-brand {
  font-size: 24px;
}

.footer-links a,
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
    padding: 0 16px;
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
