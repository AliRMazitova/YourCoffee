<template>
  <div class="drinks-view">
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

    <div class="shell drinks-layout">
      <aside class="filters-card">
        <div class="filters-card__scroll">
          <div class="filters-header">
            <h2>Фильтры</h2>
            <p>Настройте меню под свой вкус</p>
          </div>

          <section class="filter-group">
            <h3 class="filter-group-title filter-group-title--tags">Теги</h3>

            <div class="tag-chips">
              <button
                v-for="tag in availableTags"
                :key="tag"
                type="button"
                :class="['tag-chip', { 'tag-chip--active': selectedTags.includes(tag) }]"
                @click="toggleTag(tag)"
              >
                {{ tag }}
              </button>
            </div>
          </section>

          <section class="filter-group">
            <h3>Температура</h3>
            <label
              v-for="option in temperatureOptions"
              :key="option.value"
              class="checkbox-row"
            >
              <input
                :checked="selectedTemperatures.includes(option.value)"
                type="checkbox"
                @change="toggleTemperature(option.value)"
              />
              <span>{{ option.label }}</span>
            </label>
          </section>

          <section class="filter-group">
            <h3>Диапазон цены</h3>

            <div class="price-values">
              <label>
                <span>Мин.</span>
                <input v-model.number="priceRange.min" type="number" min="0" max="10000" step="10" />
              </label>
              <label>
                <span>Макс.</span>
                <input v-model.number="priceRange.max" type="number" min="0" max="10000" step="10" />
              </label>
            </div>

            <div class="range-stack">
              <input
                v-model.number="priceRange.min"
                class="range-input"
                type="range"
                :min="priceLimits.min"
                :max="priceLimits.max"
                step="10"
              />
              <input
                v-model.number="priceRange.max"
                class="range-input"
                type="range"
                :min="priceLimits.min"
                :max="priceLimits.max"
                step="10"
              />
            </div>
          </section>
        </div>
      </aside>

      <main class="content">
        <section class="mood-section">
          <div class="section-heading"></div>
        </section>

        <section class="collection-section">
          <div class="collection-header">
            <div>
              <h2>Наша коллекция</h2>
            </div>
          </div>

          <div v-if="isLoading" class="empty-state">
            <h3>Загрузка</h3>
            <p>Получаем список напитков и цены из базы данных.</p>
          </div>

          <div v-else-if="loadError" class="empty-state">
            <h3>Ошибка загрузки</h3>
            <p>{{ loadError }}</p>
            <button type="button" class="primary-button primary-button--compact" @click="loadInitialData">
              Повторить
            </button>
          </div>

          <div v-else class="drinks-grid">
            <article
              v-for="drink in filteredDrinks"
              :key="drink.id"
              class="drink-card"
            >
              <div class="drink-media">
                <img :src="drink.image" :alt="drink.title" />

                <div class="drink-tags">
                  <span v-for="tag in drink.badges" :key="tag">{{ tag }}</span>
                </div>
              </div>

              <div class="drink-body">
                <div class="drink-heading">
                  <h3>{{ drink.title }}</h3>
                  <span>{{ formatPrice(drink.price) }}</span>
                </div>

                <p>{{ drink.description }}</p>
                <RouterLink :to="`/drinks/${drink.slug}`" class="secondary-button">Подробнее</RouterLink>
              </div>
            </article>
          </div>

          <div v-if="!isLoading && !loadError && !filteredDrinks.length" class="empty-state">
            <h3>Ничего не найдено</h3>
            <p>Попробуйте ослабить фильтры или изменить выбранную температуру.</p>
            <button type="button" class="primary-button primary-button--compact" @click="resetFilters">
              Сбросить фильтры
            </button>
          </div>
        </section>
      </main>
    </div>

    <footer class="site-footer">
      <div class="shell footer-inner">
        <div class="footer-brand">YourCoffee</div>
        <div class="footer-links">
          <a v-for="link in footerLinks" :key="link" href="#">{{ link }}</a>
        </div>
        <div class="footer-copy">© 2024 YourCoffee. Искусство ритуала.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import { drinksApi } from "@/api/drinks.api";

const footerLinks = ["Конфиденциальность", "Условия", "Гайд по варке", "Контакты"];

const drinks = ref([]);
const availableTags = ref([]);
const temperatureOptions = [
  { value: "hot", label: "Горячие" },
  { value: "cold", label: "Холодные" },
];

const selectedTags = ref([]);
const selectedTemperatures = ref([]);
const isLoading = ref(false);
const loadError = ref("");
const priceRange = reactive({
  min: 0,
  max: 1000,
});
const priceLimits = reactive({
  min: 0,
  max: 1000,
});

watch(
  () => [priceRange.min, priceRange.max],
  ([min, max]) => {
    if (min > max) {
      priceRange.min = Math.min(min, max);
      priceRange.max = Math.max(min, max);
    }
  },
);

const filteredDrinks = computed(() =>
  drinks.value.filter((drink) => {
    const matchesTags =
      selectedTags.value.length === 0 ||
      selectedTags.value.every((tag) => drink.tags.includes(tag));

    const matchesTemperature =
      selectedTemperatures.value.length === 0 ||
      selectedTemperatures.value.includes(drink.temperature);

    const matchesPrice =
      drink.price >= priceRange.min && drink.price <= priceRange.max;

    return matchesTags && matchesTemperature && matchesPrice;
  }),
);

onMounted(async () => {
  await loadInitialData();
});

async function loadInitialData() {
  isLoading.value = true;
  loadError.value = "";

  try {
    const [drinksResponse, tagsResponse] = await Promise.all([
      drinksApi.getDrinks(),
      drinksApi.getTags(),
    ]);

    drinks.value = drinksResponse;
    availableTags.value = tagsResponse
      .map((tag) => tag.name)
      .filter((tag) => !["Горячий", "Холодный", "Горячие", "Холодные"].includes(tag));

    if (drinksResponse.length > 0) {
      const prices = drinksResponse.map((drink) => drink.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      priceLimits.min = min;
      priceLimits.max = max;
      priceRange.min = min;
      priceRange.max = max;
    }
  } catch (error) {
    console.error(error);
    loadError.value = "Не удалось загрузить меню из базы данных.";
  } finally {
    isLoading.value = false;
  }
}

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag);
    return;
  }

  selectedTags.value = [...selectedTags.value, tag];
}

function toggleTemperature(value) {
  if (selectedTemperatures.value.includes(value)) {
    selectedTemperatures.value = selectedTemperatures.value.filter((item) => item !== value);
    return;
  }

  selectedTemperatures.value = [...selectedTemperatures.value, value];
}

function resetFilters() {
  selectedTags.value = [];
  selectedTemperatures.value = [];
  priceRange.min = priceLimits.min;
  priceRange.max = priceLimits.max;
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

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button),
:global(input) {
  font: inherit;
}

:global(body) {
  margin: 0;
  font-family: "Plus Jakarta Sans", sans-serif;
  color: #1b1d0e;
  background:
    radial-gradient(circle at top left, rgba(239, 188, 152, 0.18), transparent 24%),
    linear-gradient(180deg, #fbfbe2 0%, #f7f1dc 100%);
}

.drinks-view {
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

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 92px;
}

.brand,
.footer-brand {
  color: #795437;
  font-family: "Noto Serif", serif;
  font-weight: 700;
}

.brand {
  font-size: 32px;
}

.nav-links {
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
}

.nav-link:hover,
.nav-link--active {
  color: #795437;
}

.nav-link--active {
  border-bottom-color: #795437;
}

.profile-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 0;
  background: rgba(255, 255, 255, 0.7);
  color: #795437;
  cursor: pointer;
}

.drinks-layout {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 32px;
  padding-top: 132px;
  padding-bottom: 72px;
  align-items: start;
}

.filters-card,
.drink-card,
.empty-state {
  border: 1px solid rgba(212, 195, 185, 0.28);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 48px rgba(70, 54, 42, 0.06);
  backdrop-filter: blur(8px);
}

.filters-card {
  position: sticky;
  top: 124px;
  max-height: calc(100vh - 148px);
  padding: 0;
  overflow: hidden;
}

.filters-card__scroll {
  max-height: calc(100vh - 148px);
  padding: 32px;
  overflow-y: auto;
}

.filters-header h2,
.section-heading h1,
.collection-header h2,
.drink-heading h3,
.empty-state h3 {
  margin: 0;
  font-family: "Noto Serif", serif;
}

.filters-header h2 {
  color: #795437;
  font-size: 32px;
  font-style: italic;
}

.filters-header p,
.section-heading p,
.collection-header p,
.drink-body p,
.footer-copy,
.empty-state p {
  color: #50443d;
}

.filters-header p {
  margin: 8px 0 0;
  font-size: 14px;
}

.filter-group + .filter-group {
  margin-top: 32px;
}

.filter-group h3,
.collection-meta span {
  margin: 0 0 16px;
  color: rgba(121, 84, 55, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.filter-group-title--tags {
  margin-top: 8px;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-chip,
.secondary-button {
  border: 1px solid rgba(130, 116, 108, 0.35);
  background: rgba(255, 255, 255, 0.7);
  color: #636451;
}

.tag-chip {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.2s ease;
}

.tag-chip:hover,
.tag-chip--active {
  border-color: #795437;
  background: #795437;
  color: #fff;
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.checkbox-row + .checkbox-row {
  margin-top: 14px;
}

.checkbox-row input {
  width: 18px;
  height: 18px;
  accent-color: #795437;
}

.checkbox-row span {
  color: #636451;
  font-size: 14px;
  font-weight: 500;
}

.price-values {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.price-values label {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.price-values span {
  color: #636451;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.price-values input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgba(212, 195, 185, 0.7);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.8);
  color: #1b1d0e;
}

.range-stack {
  display: grid;
  gap: 12px;
  margin-top: 18px;
}

.range-input {
  width: 100%;
  accent-color: #795437;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section-heading h1 {
  color: #795437;
  font-size: clamp(40px, 5vw, 58px);
  font-style: italic;
}

.section-heading p {
  max-width: 620px;
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.7;
}

.collection-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.collection-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.collection-header h2 {
  color: #795437;
  font-size: clamp(34px, 4vw, 48px);
  font-style: italic;
}

.collection-header p {
  margin: 8px 0 0;
  font-size: 15px;
}

.drinks-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.drink-card {
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.drink-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(70, 54, 42, 0.1);
}

.drink-media {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  background: #efefd7;
}

.drink-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.drink-tags {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.drink-tags span {
  padding: 7px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.9);
  color: #795437;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.drink-body {
  padding: 24px;
}

.drink-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.drink-heading h3 {
  color: #795437;
  font-size: 30px;
  font-style: italic;
}

.drink-heading span {
  color: #795437;
  font-weight: 700;
}

.drink-body p {
  min-height: 68px;
  margin: 14px 0 22px;
  line-height: 1.75;
}

.secondary-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 15px 24px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
}

.secondary-button:hover {
  border-color: #795437;
  background: #795437;
  color: #fff;
}

.primary-button {
  border: 0;
  background: #795437;
  color: #fff;
}

.empty-state {
  padding: 40px;
  text-align: center;
}

.empty-state h3 {
  color: #795437;
  font-size: 36px;
  font-style: italic;
}

.empty-state p {
  max-width: 460px;
  margin: 12px auto 24px;
  line-height: 1.7;
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-top: 32px;
  border-top: 1px solid rgba(212, 195, 185, 0.35);
}

.footer-brand {
  font-size: 24px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
}

.footer-links a,
.footer-copy {
  color: #636451;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 1240px) {
  .drinks-layout {
    grid-template-columns: 1fr;
  }

  .filters-card {
    position: static;
    max-height: none;
  }

  .filters-card__scroll {
    max-height: none;
    overflow: visible;
  }

  .drinks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .collection-header,
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .drinks-grid {
    grid-template-columns: 1fr;
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

  .drinks-layout {
    padding-top: 108px;
    padding-bottom: 56px;
  }

  .filters-card__scroll,
  .drink-body,
  .empty-state {
    padding: 20px;
  }

  .filters-card,
  .drink-card,
  .empty-state {
    border-radius: 22px;
  }

  .price-values {
    grid-template-columns: 1fr;
  }

  .drink-heading {
    flex-direction: column;
  }

  .section-heading h1,
  .collection-header h2 {
    font-size: 34px;
  }
}
</style>
