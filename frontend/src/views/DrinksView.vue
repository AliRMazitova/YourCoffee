<template>
  <div class="drinks-view">
    <nav class="top-nav">
      <div class="shell nav-inner">
        <RouterLink to="/" class="brand">YourCoffee</RouterLink>

        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Главная</RouterLink>
          <RouterLink to="/drinks" class="nav-link nav-link--active">Меню</RouterLink>
          <a href="#" class="nav-link">Рекомендации</a>
          <a href="#" class="nav-link">Избранное</a>
        </div>

        <RouterLink to="/profile" class="profile-button" aria-label="Профиль">
          <span class="material-symbols-outlined">person</span>
        </RouterLink>
      </div>
    </nav>

    <div class="shell drinks-layout">
      <aside class="filters-card">
        <div class="filters-header">
          <h2>Фильтры</h2>
          <p>Настройте свой ритуал</p>
        </div>

        <section class="filter-group">
          <h3>Вкусовые теги</h3>
          <label
            v-for="tag in availableTags"
            :key="tag"
            class="checkbox-row"
          >
            <input
              :checked="selectedTags.includes(tag)"
              type="checkbox"
              @change="toggleTag(tag)"
            />
            <span>{{ tag }}</span>
          </label>
        </section>

        <section class="filter-group">
          <h3>Температура</h3>
          <div class="temperature-switch">
            <button
              v-for="option in temperatureOptions"
              :key="option.value"
              type="button"
              :class="['chip-button', { 'chip-button--active': selectedTemperature === option.value }]"
              @click="selectedTemperature = option.value"
            >
              {{ option.label }}
            </button>
          </div>
        </section>

        <section class="filter-group">
          <div class="price-header">
            <h3>Диапазон цены</h3>
            <button type="button" class="reset-button" @click="resetFilters">Сбросить</button>
          </div>

          <div class="price-values">
            <label>
              <span>Мин.</span>
              <input v-model.number="priceRange.min" type="number" min="100" max="1000" step="10" />
            </label>
            <label>
              <span>Макс.</span>
              <input v-model.number="priceRange.max" type="number" min="100" max="1000" step="10" />
            </label>
          </div>

          <div class="range-stack">
            <input
              v-model.number="priceRange.min"
              class="range-input"
              type="range"
              min="100"
              max="1000"
              step="10"
            />
            <input
              v-model.number="priceRange.max"
              class="range-input"
              type="range"
              min="100"
              max="1000"
              step="10"
            />
          </div>
        </section>
      </aside>

      <main class="content">
        <section class="mood-section">
          <div class="section-heading">
            <h1>Ваш ритуал сегодня</h1>
            <p>Подберите напиток под текущее настроение и сохраните нужный темп дня.</p>
          </div>

          <div class="mood-card">
            <div class="mood-tabs">
              <button
                v-for="mood in moods"
                :key="mood.id"
                type="button"
                :class="['mood-tab', { 'mood-tab--active': activeMood === mood.id }]"
                @click="activeMood = mood.id"
              >
                {{ mood.label }}
              </button>
            </div>

            <div class="mood-content">
              <div class="mood-copy">
                <span class="eyebrow">{{ currentMood.kicker }}</span>
                <h2>{{ currentMood.title }}</h2>
                <p>{{ currentMood.description }}</p>
                <button type="button" class="primary-button">Выбрать этот напиток</button>
              </div>

              <div class="mood-image-wrap">
                <img :src="currentMood.image" :alt="currentMood.title" />
              </div>
            </div>
          </div>
        </section>

        <section class="collection-section">
          <div class="collection-header">
            <div>
              <h2>Наша коллекция</h2>
              <p>{{ filteredDrinks.length }} напитков по вашему запросу</p>
            </div>

            <div class="collection-meta">
              <span>Сортировка: Популярное</span>
              <button type="button" class="icon-button" aria-label="Фильтры">
                <span class="material-symbols-outlined">tune</span>
              </button>
            </div>
          </div>

          <div class="drinks-grid">
            <article
              v-for="drink in filteredDrinks"
              :key="drink.slug"
              class="drink-card"
            >
              <div class="drink-media">
                <img :src="drink.image" :alt="drink.title" />

                <button type="button" class="favorite-button" aria-label="Добавить в избранное">
                  <span class="material-symbols-outlined">favorite</span>
                </button>

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

          <div v-if="!filteredDrinks.length" class="empty-state">
            <h3>Ничего не найдено</h3>
            <p>Попробуйте ослабить фильтры или выбрать другую температуру напитка.</p>
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
import { computed, reactive, ref, watch } from "vue";
import { RouterLink } from "vue-router";
import { drinks } from "@/data/drinks";

const footerLinks = ["Конфиденциальность", "Условия", "Гайд по варке", "Контакты"];

const moods = [
  {
    id: "cozy",
    label: "Уют",
    kicker: "Рекомендация для уюта",
    title: "Ванильный Раф",
    description:
      "Нежнейший кофейный десерт со сливками и натуральной ванилью. Создает ощущение теплого пледа и спокойствия.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBkQ2GCBKuIQkSxbLJdwVTiQY49dOlIiaaMZEiFjsdqZM9zdzRfoP2BoYpBwO2LvzHvdmW7j9lnXRysVdGLoHovVrwuGfZ6_gURGBmcN16uHwNwvIaYnA7pPBtHSDKOsK_NmZ_NZqnfc07mgnfgtg_xtviqgZ86XgQhX-8iZtIstyx_AF8uFGnPVLywR_4raVY2hArkWEOHIYxF3ONLUMO07p2afQ2pJ1hdfdo77N8Ytfa4L0dI4zqUTMDnXE7GX1bQMFKO8p4Ddw",
  },
  {
    id: "refresh",
    label: "Свежесть",
    kicker: "Рекомендация для свежести",
    title: "Эспрессо Тоник",
    description:
      "Бодрящий холодный микс с терпким тоником и долькой лайма. Идеальное завершение прогулки или начала вечера.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA6PGcsTJ5n6gAXxeobpC_77LuvKR8sV2unW8dFRfgJJuafcJnWWT4UGuD6Cdc46GeApxxGPXoREE0gwzgGBIY4-lXHbzrhzU1B6UBx-exbQq05y7Ev2JpyBctWhwXG8vdrT3GIxO2nP7by08xVasaJi2yBHaYrzpGP3ahjLHo6W414gfuqM5FDDA40Ojff7uXBQ97Gr38FmUhyDCC8ppI3lvwmDH4rYqSxgOsfhd5VdsJGz6n5mQh1KVZtt9DSNCk53vdNA2XyNw",
  },
  {
    id: "energy",
    label: "Бодрость",
    kicker: "Рекомендация для бодрости",
    title: "Двойной Эспрессо",
    description:
      "Концентрированный вкус обжаренных зерен. Чистая энергия для тех, кто готов к новым свершениям сегодня.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDKiv0an9vqnKWqO2z9J1I6V1jRVlb-dxb64p83HamhP9h-6Il1iamjOhCeGk0HDvNGm0xpwN_BVd0jUlvD0sRSmdHNebS-ZNjb6WD5KMr2KWjqy5vPZGelrRpfkEj1NR_fDP60fZNBRI_zdcGwi4Q98I8vSzSol2VewzdciZu31y6f76G30yyDdXd2WOl8klBKtp88w9-bcgkZvCP2TPbbQfBd9OqNC0J38h2S-KZqm8zS1QRUgf85BO38-L_PlYRXc0RwX3BSew",
  },
];

const availableTags = ["Сладкий", "Горький", "Молочный"];
const temperatureOptions = [
  { value: "all", label: "Все" },
  { value: "hot", label: "Горячий" },
  { value: "cold", label: "Холодный" },
];

const activeMood = ref("energy");
const selectedTags = ref([]);
const selectedTemperature = ref("all");
const priceRange = reactive({
  min: 100,
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

const currentMood = computed(
  () => moods.find((mood) => mood.id === activeMood.value) ?? moods[0],
);

const filteredDrinks = computed(() =>
  drinks.filter((drink) => {
    const matchesTags =
      selectedTags.value.length === 0 ||
      selectedTags.value.every((tag) => drink.tags.includes(tag));

    const matchesTemperature =
      selectedTemperature.value === "all" ||
      drink.temperature === selectedTemperature.value;

    const matchesPrice =
      drink.price >= priceRange.min && drink.price <= priceRange.max;

    return matchesTags && matchesTemperature && matchesPrice;
  }),
);

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag);
    return;
  }

  selectedTags.value = [...selectedTags.value, tag];
}

function resetFilters() {
  selectedTags.value = [];
  selectedTemperature.value = "all";
  priceRange.min = 100;
  priceRange.max = 1000;
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
.icon-button,
.favorite-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
}

.profile-button {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #795437;
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
.mood-card,
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
  padding: 32px;
}

.filters-header h2,
.section-heading h1,
.mood-copy h2,
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
.mood-copy p,
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
.eyebrow,
.collection-meta span {
  margin: 0 0 16px;
  color: rgba(121, 84, 55, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
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

.temperature-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip-button,
.secondary-button,
.reset-button {
  border: 1px solid rgba(130, 116, 108, 0.35);
  background: rgba(255, 255, 255, 0.7);
  color: #636451;
}

.chip-button {
  padding: 10px 16px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.2s ease;
}

.chip-button:hover,
.chip-button--active {
  border-color: #795437;
  background: #795437;
  color: #ffffff;
}

.price-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.price-header h3 {
  margin-bottom: 0;
}

.reset-button {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
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

.section-heading {
  margin-bottom: 20px;
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

.mood-card {
  padding: 32px;
}

.mood-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 28px;
}

.mood-tab {
  padding: 12px 20px;
  border: 1px solid rgba(130, 116, 108, 0.35);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.7);
  color: #795437;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s ease;
}

.mood-tab:hover,
.mood-tab--active {
  border-color: #795437;
  background: #795437;
  color: #ffffff;
}

.mood-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 28px;
  align-items: center;
}

.eyebrow {
  display: block;
  margin-bottom: 12px;
}

.mood-copy h2 {
  color: #795437;
  font-size: clamp(34px, 4vw, 48px);
  font-style: italic;
}

.mood-copy p {
  max-width: 520px;
  margin: 16px 0 28px;
  font-size: 15px;
  line-height: 1.8;
}

.primary-button,
.secondary-button {
  padding: 15px 24px;
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
  background: #795437;
  color: #ffffff;
}

.primary-button:hover {
  background: #956c4d;
  transform: translateY(-1px);
}

.primary-button--compact {
  padding-inline: 20px;
}

.mood-image-wrap {
  overflow: hidden;
  border-radius: 26px;
  aspect-ratio: 4 / 5;
  background: #efefd7;
}

.mood-image-wrap img,
.drink-media img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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

.collection-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.collection-meta span {
  margin: 0;
}

.icon-button {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  color: #795437;
  box-shadow: 0 10px 24px rgba(121, 84, 55, 0.12);
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
  transition: transform 0.6s ease;
}

.drink-card:hover .drink-media img {
  transform: scale(1.06);
}

.favorite-button {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(251, 251, 226, 0.88);
  color: #795437;
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

.secondary-button {
  width: 100%;
}

.secondary-button:hover {
  border-color: #795437;
  background: #795437;
  color: #ffffff;
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
  }

  .drinks-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .nav-links {
    display: none;
  }

  .mood-content,
  .collection-header,
  .footer-inner {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .mood-image-wrap {
    width: 100%;
    max-width: 420px;
  }

  .collection-meta {
    width: 100%;
    justify-content: space-between;
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

  .filters-card,
  .mood-card,
  .drink-body,
  .empty-state {
    padding: 20px;
  }

  .filters-card,
  .mood-card,
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
  .collection-header h2,
  .mood-copy h2 {
    font-size: 34px;
  }
}
</style>
