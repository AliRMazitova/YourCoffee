<template>
  <div class="drinks-view">
    <SiteHeader />

    <div class="shell drinks-layout">
      <aside class="filters-card">
        <div class="filters-card__scroll">
          <div class="filters-header">
            <h2>Фильтры</h2>
          </div>

          <div v-if="activeFiltersCount" class="filters-summary">
            <button type="button" class="filters-summary__reset" @click="resetFilters">
              Сбросить всё
            </button>
          </div>

          <section class="filter-panel">
            <button
              type="button"
              class="filter-panel__toggle"
              :aria-expanded="isMoodFiltersOpen"
              @click="isMoodFiltersOpen = !isMoodFiltersOpen"
            >
              <span>
                <strong>Настроение</strong>
                <small>{{ selectedMoodName || "Любое настроение" }}</small>
              </span>
              <span class="material-symbols-outlined">
                {{ isMoodFiltersOpen ? "remove" : "add" }}
              </span>
            </button>

            <div v-show="isMoodFiltersOpen" class="filter-panel__body">
              <div class="mood-chips">
                <button
                  type="button"
                  :class="['mood-chip', { 'mood-chip--active': selectedMoodId === null }]"
                  @click="selectMood(null)"
                >
                  Любое настроение
                </button>

                <button
                  v-for="mood in moods"
                  :key="mood.id"
                  type="button"
                  :class="['mood-chip', { 'mood-chip--active': selectedMoodId === mood.id }]"
                  @click="selectMood(mood.id)"
                >
                  {{ mood.name }}
                </button>
              </div>
            </div>
          </section>

          <section class="filter-panel">
            <button
              type="button"
              class="filter-panel__toggle"
              :aria-expanded="isClassicFiltersOpen"
              @click="isClassicFiltersOpen = !isClassicFiltersOpen"
            >
              <span>
                <strong>Обычные фильтры</strong>
              </span>
              <span class="material-symbols-outlined">
                {{ isClassicFiltersOpen ? "remove" : "add" }}
              </span>
            </button>

            <div v-show="isClassicFiltersOpen" class="filter-panel__body">
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
                  <label class="price-field">
                    <span class="price-field__label">Мин.</span>
                    <div class="price-field__input-wrap">
                      <input v-model.number="priceRange.min" type="number" min="0" max="10000" step="10" />
                      <span class="price-field__currency">₽</span>
                    </div>
                  </label>

                  <label class="price-field">
                    <span class="price-field__label">Макс.</span>
                    <div class="price-field__input-wrap">
                      <input v-model.number="priceRange.max" type="number" min="0" max="10000" step="10" />
                      <span class="price-field__currency">₽</span>
                    </div>
                  </label>
                </div>

                <div class="range-stack">
                  <div class="range-track"></div>
                  <div class="range-track range-track--active" :style="rangeSelectionStyle"></div>

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
          </section>
        </div>
      </aside>

      <main class="content">
        <section class="weather-card" :class="`weather-card--${weatherTheme}`">
          <div class="weather-card__content">
              <div class="weather-card__main">
                <div class="weather-card__eyebrow">Погода в Казани сейчас</div>
                <h1 class="weather-card__title">{{ weatherHeadline }}</h1>
                <p class="weather-card__summary">{{ weatherSummary }}</p>

              <div v-if="weatherFacts.length" class="weather-facts">
                <span v-for="fact in weatherFacts" :key="fact.label" class="weather-fact">
                  <strong>{{ fact.value }}</strong>
                  <span>{{ fact.label }}</span>
                </span>
              </div>

              <p v-if="weatherError" class="weather-card__error">{{ weatherError }}</p>
            </div>

            <aside v-if="weatherTopDrinks.length" class="weather-recommendations">
              <div class="weather-recommendations__header">
                <h2>Подойдут прямо сейчас</h2>
              </div>

              <RouterLink
                v-for="drink in weatherTopDrinks"
                :key="`weather-${drink.id}`"
                :to="`/drinks/${drink.slug}`"
                class="weather-drink"
              >
                <img :src="drink.image" :alt="drink.title" />

                <div class="weather-drink__body">
                  <div class="weather-drink__meta">
                    <strong>{{ drink.title }}</strong>
                    <span>{{ formatPrice(drink.price) }}</span>
                  </div>
                </div>
              </RouterLink>
            </aside>
          </div>
        </section>

        <section class="collection-section">
          <div class="collection-header">
            <div>
              <h2>Наша коллекция</h2>
            </div>
          </div>

          <div v-if="activeFilterChips.length" class="active-filters">
            <button
              v-for="chip in activeFilterChips"
              :key="chip.key"
              type="button"
              class="active-filter-chip"
              @click="removeActiveFilter(chip)"
            >
              <span>{{ chip.label }}</span>
              <span aria-hidden="true">×</span>
            </button>
          </div>

          <div v-if="isLoading" class="empty-state">
            <h3>Загрузка</h3>
            <p>Получаем список напитков, теги и подборку по погоде.</p>
          </div>

          <div v-else-if="loadError" class="empty-state">
            <h3>Ошибка загрузки</h3>
            <p>{{ loadError }}</p>
            <button type="button" class="primary-button primary-button--compact" @click="loadInitialData">
              Повторить
            </button>
          </div>

          <div v-else-if="filteredDrinks.length" class="drinks-grid">
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
                  <span class="drink-price">{{ formatPrice(drink.price) }}</span>
                </div>

                <p>{{ drink.description }}</p>
                <RouterLink :to="`/drinks/${drink.slug}`" class="secondary-button">Подробнее</RouterLink>
              </div>
            </article>
          </div>

          <div v-else class="empty-state">
            <h3>Ничего не найдено</h3>
            <p>Попробуйте ослабить фильтры.</p>
            <button type="button" class="primary-button primary-button--compact" @click="resetFilters">
              Сбросить фильтры
            </button>
          </div>
        </section>
      </main>
    </div>

    <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";

import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import { drinksApi } from "@/api/drinks.api";
import { recommendationsApi } from "@/api/recommendations.api";

const drinks = ref([]);
const moods = ref([]);
const availableTags = ref([]);
const selectedTags = ref([]);
const selectedTemperatures = ref([]);
const selectedMoodId = ref(null);

const isLoading = ref(false);
const loadError = ref("");
const weatherLoading = ref(false);
const weatherError = ref("");
const weatherContext = ref(null);
const isMoodFiltersOpen = ref(true);
const isClassicFiltersOpen = ref(true);

const priceRange = reactive({
  min: 0,
  max: 1000,
});

const priceLimits = reactive({
  min: 0,
  max: 1000,
});

const temperatureOptions = [
  { value: "hot", label: "Горячие" },
  { value: "cold", label: "Холодные" },
];

const rangeSelectionStyle = computed(() => {
  const span = Math.max(priceLimits.max - priceLimits.min, 1);
  const start = ((priceRange.min - priceLimits.min) / span) * 100;
  const end = ((priceRange.max - priceLimits.min) / span) * 100;

  return {
    left: `${Math.max(0, Math.min(start, 100))}%`,
    width: `${Math.max(0, Math.min(end - start, 100))}%`,
  };
});

const selectedMoodName = computed(() => {
  const mood = moods.value.find((item) => Number(item.id) === Number(selectedMoodId.value));
  return mood?.name ?? "";
});

const drinksById = computed(
  () => new Map(drinks.value.map((drink) => [Number(drink.id), drink])),
);

const hasCustomPriceRange = computed(
  () => priceRange.min !== priceLimits.min || priceRange.max !== priceLimits.max,
);

const classicFiltersCount = computed(() => {
  return (
    selectedTags.value.length +
    selectedTemperatures.value.length +
    (hasCustomPriceRange.value ? 1 : 0)
  );
});

const activeFiltersCount = computed(
  () => classicFiltersCount.value + (selectedMoodId.value === null ? 0 : 1),
);

const weatherTheme = computed(
  () => weatherContext.value?.explanation?.visualTheme ?? "neutral",
);

const weatherHeadline = computed(() => {
  const bestType = weatherContext.value?.explanation?.bestType;

  if (bestType === "warming") {
    return "Сегодня хочется чего-то тёплого и уютного";
  }

  if (bestType === "refreshing") {
    return "Погода просит чего-то холодного и бодрого";
  }

  return "Сегодня особенно хорошо подойдут универсальные напитки";
});

const weatherSummary = computed(() => {
  const facts = weatherContext.value?.explanation?.facts;

  if (weatherLoading.value && !facts) {
    return "Собираем погодные данные для рекомендаций.";
  }

  if (!facts) {
    return "Погодная рекомендация появится после загрузки текущих условий в Казани.";
  }

  return `Сейчас в Казани ${facts.weatherLabel}, температура ${facts.temperature}°C.`;
});

const weatherFacts = computed(() => {
  const facts = weatherContext.value?.explanation?.facts;
  if (!facts) {
    return [];
  }

  return [
    { label: "температура", value: `${facts.temperature}°C` },
    { label: "влажность", value: `${facts.humidity}%` },
    { label: "ветер", value: `${facts.windSpeed} м/с` },
    { label: "осадки", value: `${facts.precipitation} мм/ч` },
  ];
});

const weatherRankingIndex = computed(() => {
  const ids = weatherContext.value?.rankedDrinkIds ?? [];
  return new Map(ids.map((id, index) => [Number(id), index]));
});

const weatherScoreMap = computed(() => {
  const scoreMap = weatherContext.value?.scoreMap ?? {};
  return new Map(
    Object.entries(scoreMap).map(([drinkId, score]) => [Number(drinkId), score]),
  );
});

const moodFilteredDrinkIds = computed(() => {
  if (selectedMoodId.value === null) {
    return null;
  }

  const ids = [...weatherScoreMap.value.entries()]
    .filter(([, score]) => Number(score?.moodBonus) > 0)
    .map(([drinkId]) => drinkId);

  return new Set(ids);
});

const filteredDrinks = computed(() => {
  const moodSet = moodFilteredDrinkIds.value;

  return [...drinks.value]
    .filter((drink) => {
      const matchesTags =
        selectedTags.value.length === 0 ||
        selectedTags.value.every((tag) => drink.tags.includes(tag));

      const matchesTemperature =
        selectedTemperatures.value.length === 0 ||
        selectedTemperatures.value.includes(drink.temperature);

      const matchesPrice =
        drink.price >= priceRange.min && drink.price <= priceRange.max;

      const matchesMood =
        moodSet === null || moodSet.has(Number(drink.id));

      return matchesTags && matchesTemperature && matchesPrice && matchesMood;
    })
    .sort((left, right) => {
      const leftRank = weatherRankingIndex.value.get(Number(left.id)) ?? Number.MAX_SAFE_INTEGER;
      const rightRank = weatherRankingIndex.value.get(Number(right.id)) ?? Number.MAX_SAFE_INTEGER;

      if (leftRank !== rightRank) {
        return leftRank - rightRank;
      }

      const leftScore = weatherScoreMap.value.get(Number(left.id))?.finalScore ?? -1;
      const rightScore = weatherScoreMap.value.get(Number(right.id))?.finalScore ?? -1;

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return left.title.localeCompare(right.title, "ru");
    });
});

const weatherRankedDrinks = computed(() => {
  const ids = weatherContext.value?.rankedDrinkIds ?? [];

  return ids
    .map((id) => drinksById.value.get(Number(id)))
    .filter(Boolean);
});

const weatherTopDrinks = computed(() => {
  if (filteredDrinks.value.length) {
    return filteredDrinks.value.slice(0, 3);
  }

  return weatherRankedDrinks.value.slice(0, 3);
});

const activeFilterChips = computed(() => {
  const chips = [];

  if (selectedMoodName.value) {
    chips.push({
      key: `mood-${selectedMoodId.value}`,
      label: `Настроение: ${selectedMoodName.value}`,
      type: "mood",
    });
  }

  selectedTags.value.forEach((tag) => {
    chips.push({
      key: `tag-${tag}`,
      label: tag,
      type: "tag",
      value: tag,
    });
  });

  selectedTemperatures.value.forEach((value) => {
    const option = temperatureOptions.find((item) => item.value === value);
    chips.push({
      key: `temperature-${value}`,
      label: option?.label ?? value,
      type: "temperature",
      value,
    });
  });

  if (hasCustomPriceRange.value) {
    chips.push({
      key: "price",
      label: `Цена: ${formatPrice(priceRange.min)} - ${formatPrice(priceRange.max)}`,
      type: "price",
    });
  }

  return chips;
});

watch(
  () => [priceRange.min, priceRange.max],
  ([min, max]) => {
    const safeMin = clampPrice(min);
    const safeMax = clampPrice(max);

    priceRange.min = Math.min(safeMin, safeMax);
    priceRange.max = Math.max(safeMin, safeMax);
  },
);

watch(selectedMoodId, async () => {
  await loadWeatherContext();
});

onMounted(async () => {
  await loadInitialData();
});

async function loadInitialData() {
  isLoading.value = true;
  loadError.value = "";

  try {
    const [drinksResponse, tagsResponse, moodsResponse] = await Promise.all([
      drinksApi.getDrinks(),
      drinksApi.getTags(),
      recommendationsApi.getMoods(),
    ]);

    drinks.value = drinksResponse;
    availableTags.value = tagsResponse.map((tag) => tag.name);
    moods.value = moodsResponse;

    if (drinksResponse.length > 0) {
      const prices = drinksResponse.map((drink) => drink.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      priceLimits.min = min;
      priceLimits.max = max;
      priceRange.min = min;
      priceRange.max = max;
    }

    await loadWeatherContext();
  } catch (error) {
    console.error(error);
    loadError.value = "Не удалось загрузить меню, настроения или погодную рекомендацию.";
  } finally {
    isLoading.value = false;
  }
}

async function loadWeatherContext(forceRefresh = false) {
  weatherLoading.value = true;
  weatherError.value = "";

  try {
    weatherContext.value = await recommendationsApi.getWeatherRecommendations({
      ...(selectedMoodId.value !== null ? { mood_id: selectedMoodId.value } : {}),
      ...(forceRefresh ? { refresh: true } : {}),
    });
  } catch (error) {
    console.error(error);
    weatherError.value =
      error.response?.data?.error ||
      "Не удалось получить погодную рекомендацию для Казани.";
  } finally {
    weatherLoading.value = false;
  }
}

function selectMood(moodId) {
  selectedMoodId.value = moodId === null ? null : Number(moodId);
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
  selectedMoodId.value = null;
  priceRange.min = priceLimits.min;
  priceRange.max = priceLimits.max;
}

function formatPrice(price) {
  return `${price}\u00A0\u20BD`;
}

function removeActiveFilter(chip) {
  if (chip.type === "mood") {
    selectMood(null);
    return;
  }

  if (chip.type === "tag") {
    toggleTag(chip.value);
    return;
  }

  if (chip.type === "temperature") {
    toggleTemperature(chip.value);
    return;
  }

  if (chip.type === "price") {
    priceRange.min = priceLimits.min;
    priceRange.max = priceLimits.max;
  }
}

function clampPrice(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return priceLimits.min;
  }

  return Math.min(priceLimits.max, Math.max(priceLimits.min, numericValue));
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
.empty-state,
.weather-card {
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
  overflow: hidden;
}

.filters-card__scroll {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-height: calc(100vh - 148px);
  padding: 32px;
  overflow-y: auto;
}

.filters-header h2,
.collection-header h2,
.drink-heading h3,
.empty-state h3,
.weather-card__title,
.weather-recommendations__header h2 {
  margin: 0;
  font-family: "Noto Serif", serif;
}

.filters-header h2 {
  color: #795437;
  font-size: 32px;
  font-style: italic;
}

.collection-header p,
.drink-body p,
.empty-state p,
.weather-card__summary {
  color: #50443d;
}

.filters-summary {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(121, 84, 55, 0.08);
}

.filters-summary__reset {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border: 0;
  background: transparent;
  color: #795437;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
}

.filter-panel {
  padding: 6px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.56);
  border: 1px solid rgba(212, 195, 185, 0.22);
}

.filter-panel__toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 14px 16px;
  border: 0;
  border-radius: 18px;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.filter-panel__toggle strong {
  display: block;
  color: #795437;
  font-size: 16px;
}

.filter-panel__toggle small {
  display: block;
  margin-top: 4px;
  color: #636451;
  font-size: 12px;
}

.filter-panel__body {
  padding: 4px 14px 14px;
}

.filter-group + .filter-group {
  margin-top: 28px;
}

.filter-group h3,
.price-field__label,
.weather-card__eyebrow {
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

.tag-chips,
.mood-chips,
.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-chip,
.mood-chip,
.secondary-button,
.active-filter-chip {
  border: 1px solid rgba(130, 116, 108, 0.35);
  background: rgba(255, 255, 255, 0.7);
  color: #636451;
}

.tag-chip,
.mood-chip {
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
.tag-chip--active,
.mood-chip:hover,
.mood-chip--active {
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
  gap: 10px;
}

.price-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.price-field__input-wrap {
  position: relative;
}

.price-values input {
  width: 100%;
  min-width: 0;
  padding: 7px 24px 7px 10px;
  border: 1px solid rgba(130, 116, 108, 0.35);
  background: rgba(255, 255, 255, 0.7);
  color: #636451;
  font-size: 18px;
  line-height: 1;
  appearance: textfield;
}

.price-values input::-webkit-outer-spin-button,
.price-values input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}

.price-field__currency {
  position: absolute;
  top: 50%;
  right: 8px;
  color: #636451;
  font-size: 16px;
  pointer-events: none;
  transform: translateY(-50%);
}

.range-stack {
  position: relative;
  height: 26px;
  margin-top: 16px;
}

.range-track {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: 999px;
  background: rgba(214, 194, 165, 0.9);
  transform: translateY(-50%);
}

.range-track--active {
  background: #c8ab84;
}

.range-input {
  position: absolute;
  inset: 0;
  width: 100%;
  margin: 0;
  background: transparent;
  pointer-events: none;
  appearance: none;
}

.range-input::-webkit-slider-runnable-track,
.range-input::-moz-range-track {
  height: 2px;
  background: transparent;
}

.range-input::-webkit-slider-thumb {
  width: 16px;
  height: 16px;
  margin-top: -7px;
  border: 2px solid #9c7f5f;
  border-radius: 50%;
  background: #fffdf8;
  box-shadow: 0 0 0 2px rgba(255, 251, 231, 0.95);
  cursor: pointer;
  pointer-events: auto;
  appearance: none;
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border: 2px solid #9c7f5f;
  border-radius: 50%;
  background: #fffdf8;
  box-shadow: 0 0 0 2px rgba(255, 251, 231, 0.95);
  cursor: pointer;
  pointer-events: auto;
}

.range-input:focus {
  outline: none;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.weather-card {
  padding: 32px;
  overflow: hidden;
}

.weather-card--warming {
  background:
    radial-gradient(circle at top right, rgba(194, 129, 85, 0.22), transparent 36%),
    linear-gradient(135deg, rgba(255, 248, 238, 0.98), rgba(249, 237, 219, 0.95));
}

.weather-card--refreshing {
  background:
    radial-gradient(circle at top right, rgba(108, 181, 209, 0.24), transparent 36%),
    linear-gradient(135deg, rgba(243, 251, 255, 0.98), rgba(232, 245, 247, 0.95));
}

.weather-card--neutral {
  background:
    radial-gradient(circle at top right, rgba(186, 165, 121, 0.18), transparent 36%),
    linear-gradient(135deg, rgba(255, 252, 244, 0.98), rgba(246, 240, 223, 0.95));
}

.weather-card__content {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 360px);
  gap: 28px;
  align-items: start;
}

.weather-card__title {
  color: #795437;
  font-size: clamp(34px, 4vw, 52px);
  font-style: italic;
  line-height: 1.02;
}

.weather-card__summary {
  margin: 16px 0 0;
  max-width: 760px;
  line-height: 1.75;
}

.weather-facts {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

.weather-fact {
  display: inline-flex;
  flex-direction: column;
  gap: 6px;
  min-width: 120px;
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.7);
}

.weather-fact strong {
  color: #1b1d0e;
  font-size: 18px;
}

.weather-fact span:last-child {
  color: rgba(121, 84, 55, 0.72);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.weather-card__error {
  margin: 18px 0 0;
  color: #8f1d1d;
  font-size: 14px;
}

.weather-recommendations {
  padding: 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(212, 195, 185, 0.28);
}

.weather-recommendations__header h2 {
  color: #795437;
  font-size: 26px;
  font-style: italic;
}

.weather-drink {
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 14px 0;
  border-top: 1px solid rgba(130, 116, 108, 0.16);
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.weather-drink:hover {
  transform: translateX(4px);
}

.weather-drink:first-of-type {
  margin-top: 10px;
}

.weather-drink img {
  width: 78px;
  height: 78px;
  flex: 0 0 78px;
  border-radius: 20px;
  object-fit: cover;
  background: #efefd7;
}

.weather-drink__body {
  min-width: 0;
}

.weather-drink__meta {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
}

.weather-drink__meta strong {
  color: #795437;
  font-size: 18px;
  line-height: 1.3;
}

.weather-drink__meta span {
  color: #795437;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
}

.collection-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.active-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: 0.2s ease;
}

.active-filter-chip:hover {
  border-color: #795437;
  color: #795437;
}

.drinks-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.drink-card {
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
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

.drink-price {
  color: #795437;
  font-weight: 700;
  white-space: nowrap;
}

.drink-body p {
  min-height: 68px;
  margin: 14px 0 16px;
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

.primary-button--compact {
  width: auto;
  min-width: 180px;
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
  max-width: 520px;
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

  .weather-card__content {
    grid-template-columns: 1fr;
  }

  .drinks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .collection-header {
    flex-direction: column;
    align-items: stretch;
  }

  .drinks-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .shell {
    padding: 0 16px;
  }

  .drinks-layout {
    padding-top: 108px;
    padding-bottom: 56px;
  }

  .filters-card__scroll,
  .drink-body,
  .empty-state,
  .weather-card {
    padding: 20px;
  }

  .filters-card,
  .drink-card,
  .empty-state,
  .weather-card {
    border-radius: 22px;
  }

  .price-values {
    grid-template-columns: 1fr;
  }

  .drink-heading,
  .weather-drink__meta,
  .filters-summary {
    flex-direction: column;
    align-items: flex-start;
  }

  .weather-drink {
    align-items: flex-start;
  }
}
</style>
