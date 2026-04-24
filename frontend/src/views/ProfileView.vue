<template>
  <div class="profile-view">
        <SiteHeader />

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

            <button
              class="secondary-button secondary-button--logout"
              type="button"
              @click="handleLogout"
            >
              Выйти из аккаунта
            </button>
          </section>

          <section class="panel">
            <div class="panel-heading">
              <h2 class="panel-title">Вкусовые предпочтения</h2>
              <button
                v-if="!preferencesLoading && hasPreferences && !isPreferencesEditorOpen"
                class="panel-action-button panel-action-button--icon"
                type="button"
                aria-label="Редактировать вкусовые предпочтения"
                title="Редактировать вкусовые предпочтения"
                @click="openPreferencesEditor"
              >
                <span
                  class="material-symbols-outlined panel-action-button__icon"
                  aria-hidden="true"
                >
                  edit
                </span>
              </button>
            </div>

            <div v-if="preferencesLoading" class="panel-note">Загружаем теги из базы данных...</div>

            <template v-else>
              <div v-if="tasteRituals.length" class="ritual-list">
                <span
                  v-for="ritual in tasteRituals"
                  :key="ritual"
                  class="ritual-tag"
                >
                  {{ ritual }}
                </span>
              </div>

              <div v-else class="panel-note panel-note--empty">
                Предпочтения пока не выбраны. Нажмите «Выбрать», чтобы указать вкусы.
              </div>

              <p v-if="preferencesError" class="panel-feedback panel-feedback--error">
                {{ preferencesError }}
              </p>
              <p v-else-if="preferencesSuccess" class="panel-feedback panel-feedback--success">
                {{ preferencesSuccess }}
              </p>

              <button
                v-if="!preferencesLoading && !hasPreferences && !isPreferencesEditorOpen"
                class="panel-action-button panel-action-button--bottom"
                type="button"
                aria-label="Выбрать вкусовые предпочтения"
                title="Выбрать вкусовые предпочтения"
                @click="openPreferencesEditor"
              >
                <span>Выбрать</span>
              </button>

              <form
                v-if="isPreferencesEditorOpen"
                class="preferences-form"
                @submit.prevent="savePreferences"
              >
                <div class="preferences-form__header">
                  <h3>Выберите вкусы</h3>
                  <p>
                    Отметьте теги, которые лучше всего описывают ваши любимые напитки.
                  </p>
                </div>

                <div v-if="availableTags.length" class="preferences-options">
                  <label
                    v-for="tag in availableTags"
                    :key="tag.id"
                    class="preference-option"
                    :class="{
                      'preference-option--selected': selectedTagIds.includes(tag.id),
                    }"
                  >
                    <input
                      class="preference-option__input"
                      type="checkbox"
                      :checked="selectedTagIds.includes(tag.id)"
                      @change="toggleTagSelection(tag.id)"
                    />
                    <span class="preference-option__label">{{ tag.name }}</span>
                  </label>
                </div>

                <div v-else class="panel-note">
                  Список тегов пока недоступен.
                </div>

                <div class="preferences-form__actions">
                  <button
                    class="secondary-button secondary-button--ghost"
                    type="button"
                    @click="cancelPreferencesEditor"
                  >
                    Отмена
                  </button>
                  <button
                    class="primary-button"
                    type="submit"
                    :disabled="preferencesSaving"
                  >
                    {{
                      preferencesSaving
                        ? "Сохраняем..."
                        : "Сохранить"
                    }}
                  </button>
                </div>
              </form>
            </template>
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
                  @click.prevent.stop="toggleFavorite(drink)"
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

        <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";

import { RouterLink, useRouter } from "vue-router";

import { preferencesApi } from "@/api/preferences.api";
import { useAuthStore } from "@/stores/auth";
import { useFavoritesStore } from "@/stores/favorites";

const auth = useAuthStore();
const favorites = useFavoritesStore();
const router = useRouter();

const preferencesLoading = ref(false);
const preferencesSaving = ref(false);
const isPreferencesEditorOpen = ref(false);
const preferencesError = ref("");
const preferencesSuccess = ref("");
const availableTags = ref([]);
const selectedTagIds = ref([]);
const tasteRituals = ref([]);

onMounted(async () => {
  await auth.initAuth();
  await Promise.all([loadAvailableTags(), loadPreferences(), favorites.loadFavorites()]);
});

const user = computed(() => auth.user ?? null);
const favoriteDrinks = computed(() => favorites.items);
const hasPreferences = computed(() => tasteRituals.value.length > 0);

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
  preferencesError.value = "";

  try {
    const data = await preferencesApi.getPreferences();
    selectedTagIds.value = Array.isArray(data?.tags)
      ? data.tags
          .map((tagId) => Number(tagId))
          .filter((tagId) => Number.isFinite(tagId))
      : [];
    tasteRituals.value = Array.isArray(data?.tag_details)
      ? data.tag_details.map((tag) => tag.name)
      : [];
  } catch (error) {
    console.error(error);
    selectedTagIds.value = [];
    tasteRituals.value = [];
    preferencesError.value = "Не удалось загрузить предпочтения.";
  } finally {
    preferencesLoading.value = false;
  }
}

async function loadAvailableTags() {
  try {
    const data = await preferencesApi.getTags();
    availableTags.value = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(error);
    availableTags.value = [];
    preferencesError.value = "Не удалось загрузить список тегов.";
  }
}

function openPreferencesEditor() {
  preferencesError.value = "";
  preferencesSuccess.value = "";
  isPreferencesEditorOpen.value = true;
}

function cancelPreferencesEditor() {
  isPreferencesEditorOpen.value = false;
  preferencesError.value = "";
  preferencesSuccess.value = "";
}

function toggleTagSelection(tagId) {
  if (selectedTagIds.value.includes(tagId)) {
    selectedTagIds.value = selectedTagIds.value.filter((id) => id !== tagId);
    return;
  }

  selectedTagIds.value = [...selectedTagIds.value, tagId];
}

async function savePreferences() {
  preferencesSaving.value = true;
  preferencesError.value = "";
  preferencesSuccess.value = "";

  try {
    const tagsToSave = [...selectedTagIds.value];
    await preferencesApi.updatePreferences(tagsToSave);
    await loadPreferences();
    isPreferencesEditorOpen.value = false;
    preferencesSuccess.value = tagsToSave.length
      ? "Вкусовые предпочтения сохранены."
      : "Выбор вкусов очищен.";
  } catch (error) {
    console.error(error);
    preferencesError.value =
      error.response?.data?.error ||
      "Не удалось сохранить вкусовые предпочтения.";
  } finally {
    preferencesSaving.value = false;
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
async function handleLogout() {
  await auth.logout();
  await router.push("/");
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

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  min-width: 0;
}

.panel-title {
  min-width: 0;
  flex: 1;
  color: #795437;
  font-size: 28px;
  font-style: italic;
}

.panel-action-button,
.primary-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: #795437;
  color: #fffdf8;
  cursor: pointer;
  flex-shrink: 0;
  max-width: 100%;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.panel-action-button:hover,
.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(121, 84, 55, 0.18);
}

.panel-action-button:disabled,
.primary-button:disabled {
  opacity: 0.7;
  cursor: wait;
  transform: none;
  box-shadow: none;
}

.panel-action-button--icon {
  width: 44px;
  height: 44px;
  padding: 0;
}

.panel-action-button__icon {
  font-size: 20px;
  line-height: 1;
}

.panel-action-button--bottom {
  margin-top: 20px;
}

.panel-note {
  font-size: 14px;
  line-height: 1.6;
}

.panel-note--empty {
  margin-bottom: 18px;
}

.panel-feedback {
  margin: 16px 0 0;
  padding: 12px 14px;
  border-radius: 14px;
  font-size: 13px;
  font-weight: 600;
}

.panel-feedback--error {
  background: rgba(186, 26, 26, 0.08);
  color: #8f1d1d;
}

.panel-feedback--success {
  background: rgba(69, 109, 54, 0.1);
  color: #365926;
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

.preferences-form {
  margin-top: 24px;
  padding: 22px;
  border: 1px solid rgba(121, 84, 55, 0.12);
  border-radius: 22px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(251, 243, 230, 0.9));
}

.preferences-form__header h3 {
  margin: 0;
  color: #795437;
  font-family: "Noto Serif", serif;
  font-size: 24px;
  font-style: italic;
}

.preferences-form__header p {
  margin: 10px 0 0;
  color: #50443d;
  font-size: 14px;
  line-height: 1.6;
}

.preferences-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 18px;
}

.preference-option {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0 18px;
  border: 1px solid rgba(121, 84, 55, 0.16);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #5d4633;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.preference-option:hover {
  transform: translateY(-1px);
  border-color: rgba(121, 84, 55, 0.3);
}

.preference-option--selected {
  border-color: transparent;
  background: linear-gradient(135deg, #795437, #9a6a47);
  color: #fff8ef;
  box-shadow: 0 14px 28px rgba(121, 84, 55, 0.18);
}

.preference-option__input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.preference-option__label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.preferences-form__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
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
  padding: 14px 18px;
  border: 1px solid rgba(121, 84, 55, 0.18);
  border-radius: 999px;
  background: #fff;
  color: #795437;
  font-size: 13px;
  font-weight: 700;
}

.secondary-button--ghost {
  margin-top: 0;
  background: transparent;
}

.secondary-button--logout {
  width: 100%;
  margin-top: 24px;
  border-color: rgba(186, 26, 26, 0.2);
  color: #8f1d1d;
}

.secondary-button--logout:hover {
  border-color: #8f1d1d;
  background: #8f1d1d;
  color: #fff;
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

  .panel-heading,
  .preferences-form__actions,
  .favorite-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .panel-action-button {
    align-self: flex-start;
  }

  .panel-action-button--icon {
    align-self: flex-end;
  }

  .profile-header h1 {
    font-size: 32px;
  }

  .content-header h2 {
    font-size: 36px;
  }
}
</style>
