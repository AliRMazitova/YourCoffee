<template>
  <div class="profile-view">
    <nav class="top-nav">
      <div class="shell nav-inner">
        <RouterLink to="/" class="brand">YourCoffee</RouterLink>

        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Главная</RouterLink>
          <RouterLink to="/drinks" class="nav-link">Меню</RouterLink>
          <a href="#" class="nav-link nav-link--active">Профиль</a>
        </div>

        <button class="profile-icon-button" type="button" aria-label="Профиль">
          <span class="material-symbols-outlined">person</span>
        </button>
      </div>
    </nav>

    <main class="shell profile-main">
      <div class="profile-layout">
        <aside class="sidebar">
          <section class="panel profile-card">
            <div class="avatar-wrap">
              <img class="avatar" :src="avatarUrl" alt="Profile avatar" />
            </div>

            <div class="profile-header">
              <h1>{{ displayName }}</h1>
              <p>{{ subtitle }}</p>
            </div>

            <div class="profile-meta">
              <div class="meta-row">
                <span class="material-symbols-outlined">mail</span>
                <span>{{ displayEmail }}</span>
              </div>
              <div class="meta-row">
                <span class="material-symbols-outlined">location_on</span>
                <span>{{ location }}</span>
              </div>
              <div class="meta-row">
                <span class="material-symbols-outlined">calendar_today</span>
                <span>{{ joinedLabel }}</span>
              </div>
            </div>
          </section>

          <section class="panel">
            <h2 class="panel-title">Вкусовые предпочтения</h2>

            <div v-if="preferencesLoading" class="panel-note">Загружаем теги из базы данных...</div>

            <div v-else-if="tasteRituals.length" class="ritual-list">
              <span
                v-for="ritual in tasteRituals"
                :key="ritual"
                class="ritual-tag"
              >
                {{ ritual }}
              </span>
            </div>

            <div v-else class="panel-note">Предпочтения пока не выбраны.</div>
          </section>
        </aside>

        <section class="content">
          <div class="content-header">
            <div>
              <h2>Избранные напитки</h2>
              <p>Ваши любимые кофейные позиции.</p>
            </div>
          </div>

          <div v-if="favorites.isLoading && !favoriteDrinks.length" class="empty-state">
            <h3>Загрузка</h3>
            <p>Получаем избранные напитки из базы данных.</p>
          </div>

          <div v-else-if="favoriteDrinks.length" class="favorites-grid">
            <RouterLink
              v-for="drink in favoriteDrinks"
              :key="drink.id"
              :to="`/drinks/${drink.slug}`"
              class="favorite-card"
            >
              <div class="favorite-card__image-wrap">
                <img
                  class="favorite-card__image"
                  :src="drink.image"
                  :alt="drink.title"
                />
                <button
                  class="favorite-card__favorite"
                  type="button"
                  aria-label="Убрать из избранного"
                  @click="toggleFavorite(drink)"
                >
                  <span class="material-symbols-outlined material-symbols-outlined--filled">favorite</span>
                </button>
              </div>

              <div class="favorite-card__body">
                <div class="favorite-card__header">
                  <div>
                    <h3>{{ drink.title }}</h3>
                    <p class="favorite-card__price">{{ formatPrice(drink.price) }}</p>
                  </div>
                  <span class="favorite-card__badge">{{ drink.category_name || "Напиток" }}</span>
                </div>

                <p class="favorite-card__description">{{ drink.description || "Описание появится позже." }}</p>

                <div v-if="drink.tags?.length" class="favorite-card__tags">
                  <template v-for="(tag, index) in drink.tags" :key="`${drink.id}-${tag}`">
                    <span>{{ tag }}</span>
                    <span v-if="index < drink.tags.length - 1" class="favorite-card__separator">•</span>
                  </template>
                </div>
              </div>
            </RouterLink>
          </div>

          <div v-else class="empty-state">
            <h3>Пока пусто</h3>
            <p>Добавьте напитки в избранное, и они появятся здесь.</p>
            <RouterLink to="/drinks" class="secondary-button">Перейти в меню</RouterLink>
          </div>
        </section>
      </div>
    </main>

    <footer class="site-footer">
      <div class="shell footer-inner">
        <div class="footer-brand">YourCoffee</div>
        <div class="footer-links">
          <RouterLink to="/drinks" class="footer-link">Меню</RouterLink>
        </div>
        <div class="footer-copy">© 2026 YourCoffee.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import { preferencesApi } from "@/api/preferences.api";
import { useAuthStore } from "@/stores/auth";
import { useFavoritesStore } from "@/stores/favorites";

const auth = useAuthStore();
const favorites = useFavoritesStore();

const preferencesLoading = ref(false);
const tasteRituals = ref([]);

onMounted(async () => {
  await auth.initAuth();
  await Promise.all([loadPreferences(), favorites.loadFavorites()]);
});

const user = computed(() => auth.user ?? null);
const favoriteDrinks = computed(() => favorites.items);

const displayName = computed(() => user.value?.username || "Julian Thorne");
const displayEmail = computed(() => user.value?.email || "julian.t@ritual.com");
const subtitle = "Любитель кофе";

const joinedLabel = computed(() => {
  const rawDate = user.value?.created_at;
  if (!rawDate) return "Зарегистрирован: октябрь 2023";

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Зарегистрирован недавно";

  return `Зарегистрирован: ${new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(date)}`;
});

const avatarUrl = computed(() => {
  const seed = encodeURIComponent(displayName.value);
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}&backgroundColor=eed7c5,d9b79f,c69a7c`;
});

const location = "Казань";

async function loadPreferences() {
  preferencesLoading.value = true;

  try {
    const data = await preferencesApi.getPreferences();
    tasteRituals.value = Array.isArray(data?.tag_details)
      ? data.tag_details.map((tag) => tag.name)
      : [];
  } catch (error) {
    console.error(error);
    tasteRituals.value = [];
  } finally {
    preferencesLoading.value = false;
  }
}

async function toggleFavorite(drink) {
  try {
    await favorites.toggleFavorite(drink);
  } catch (error) {
    console.error(error);
  }
}

function formatPrice(price) {
  return `${Number(price) || 0} ₽`;
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
  background:
    radial-gradient(circle at top left, rgba(239, 188, 152, 0.18), transparent 26%),
    linear-gradient(180deg, #fbfbe2 0%, #f7f1dc 100%);
  color: #1b1d0e;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button) {
  font: inherit;
}

.profile-view {
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
  z-index: 30;
  width: 100%;
  background: rgba(251, 251, 226, 0.72);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(212, 195, 185, 0.3);
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

.profile-icon-button,
.favorite-card__favorite,
.secondary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.profile-icon-button {
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #795437;
  cursor: pointer;
}

.profile-main {
  padding-top: 132px;
  padding-bottom: 72px;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(300px, 360px) minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}

.sidebar,
.content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel,
.favorite-card,
.empty-state {
  border: 1px solid rgba(212, 195, 185, 0.28);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 48px rgba(70, 54, 42, 0.06);
  backdrop-filter: blur(8px);
}

.panel,
.empty-state {
  padding: 32px;
}

.avatar-wrap {
  width: 128px;
  height: 128px;
  margin: 0 auto;
}

.avatar {
  display: block;
  width: 100%;
  height: 100%;
  border: 4px solid #fbfbe2;
  border-radius: 50%;
  object-fit: cover;
  background: #f5f5dc;
}

.profile-header {
  margin-top: 20px;
  text-align: center;
}

.profile-header h1,
.panel-title,
.content-header h2,
.favorite-card__header h3,
.empty-state h3 {
  margin: 0;
  font-family: "Noto Serif", serif;
}

.profile-header h1 {
  color: #795437;
  font-size: 38px;
  font-style: italic;
  line-height: 1.12;
}

.profile-header p,
.content-header p,
.favorite-card__description,
.footer-copy,
.panel-note,
.empty-state p {
  color: #50443d;
}

.profile-header p {
  margin: 10px 0 0;
  font-size: 14px;
  font-weight: 500;
}

.profile-meta {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(212, 195, 185, 0.35);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.meta-row .material-symbols-outlined {
  color: rgba(121, 84, 55, 0.65);
}

.panel-title {
  margin-bottom: 20px;
  color: #795437;
  font-size: 28px;
  font-style: italic;
}

.panel-note {
  font-size: 14px;
  line-height: 1.6;
}

.ritual-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.ritual-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fbddca;
  color: #28180d;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.content-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.content-header h2 {
  color: #795437;
  font-size: clamp(40px, 5vw, 56px);
  font-style: italic;
}

.content-header p {
  margin: 10px 0 0;
  font-size: 16px;
  font-weight: 500;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.favorite-card {
  overflow: hidden;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.favorite-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 24px 48px rgba(70, 54, 42, 0.1);
}

.favorite-card__image-wrap {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.favorite-card__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.favorite-card:hover .favorite-card__image {
  transform: scale(1.08);
}

.favorite-card__favorite {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: rgba(251, 251, 226, 0.9);
  color: #ba1a1a;
  cursor: pointer;
}

.favorite-card__body {
  padding: 24px;
}

.favorite-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.favorite-card__header h3 {
  color: #795437;
  font-size: 28px;
  font-style: italic;
}

.favorite-card__price {
  margin: 8px 0 0;
  color: #795437;
  font-size: 15px;
  font-weight: 700;
}

.favorite-card__badge {
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: #e1e1c9;
  color: #636451;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.favorite-card__description {
  min-height: 68px;
  margin: 14px 0 0;
  line-height: 1.7;
}

.favorite-card__tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
  color: rgba(121, 84, 55, 0.8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.favorite-card__separator {
  letter-spacing: normal;
}

.secondary-button {
  margin-top: 18px;
  color: #795437;
  font-size: 13px;
  font-weight: 700;
}

.secondary-button {
  padding: 14px 18px;
  border: 1px solid rgba(121, 84, 55, 0.18);
  border-radius: 999px;
  background: #fff;
}

.empty-state {
  text-align: left;
}

.empty-state h3 {
  color: #795437;
  font-size: 32px;
  font-style: italic;
}

.empty-state p {
  margin: 12px 0 0;
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

.material-symbols-outlined--filled {
  font-variation-settings:
    "FILL" 1,
    "wght" 500,
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.footer-brand {
  font-size: 24px;
}

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
}

.footer-link,
.footer-copy {
  color: #636451;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

@media (max-width: 1180px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .nav-links {
    display: none;
  }

  .content-header,
  .footer-inner {
    flex-direction: column;
    align-items: flex-start;
  }

  .favorites-grid {
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

  .profile-main {
    padding-top: 108px;
    padding-bottom: 56px;
  }

  .panel,
  .favorite-card__body,
  .empty-state {
    padding: 20px;
  }

  .panel,
  .favorite-card,
  .empty-state {
    border-radius: 22px;
  }

  .favorite-card__header {
    flex-direction: column;
  }

  .profile-header h1 {
    font-size: 32px;
  }

  .content-header h2 {
    font-size: 36px;
  }
}
</style>
