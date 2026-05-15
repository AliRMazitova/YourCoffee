<template>
  <div class="home-view">
    <SiteHeader />

    <main class="main-content">
      <section class="hero-section container">
        <div class="hero-content">
          <h1 class="hero-title" aria-label="Найди кофе, который подойдет именно тебе">
            <span class="hero-title__line">Найди кофе,</span>
            <span class="hero-title__line">который</span>
            <span class="hero-title__line">подойдет</span>
            <span class="hero-title__line hero-title__line--accent">именно тебе</span>
          </h1>
          <p class="hero-description">
            Откройте для себя сезонные вкусы и фирменные напитки, собранные для уютных
            утренних ритуалов и бодрых дневных пауз.
          </p>

          <div class="hero-actions">
            <RouterLink to="/drinks" class="btn btn-primary">
              Посмотреть меню
            </RouterLink>
          </div>
        </div>

        <div class="hero-image-wrapper">
          <img
            class="hero-image"
            :src="heroImage"
            alt="Morning Coffee Ritual"
          />
        </div>
      </section>

      <section class="seasonal-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">Сезонные напитки</h2>
              <p class="section-description">
                Тщательно подобранные позиции сезона с выразительным вкусом, мягкой
                текстурой и настроением, которое хочется повторить.
              </p>
            </div>

            <RouterLink to="/drinks" class="section-link">Посмотреть всё меню →</RouterLink>
          </div>

          <div v-if="isLoading" class="seasonal-empty">
            Загружаем сезонные напитки...
          </div>

          <div v-else-if="loadError" class="seasonal-empty">
            {{ loadError }}
          </div>

          <div v-else-if="seasonalDrinks.length" class="drinks-grid">
            <article
              v-for="drink in seasonalDrinks"
              :key="drink.id"
              class="drink-card"
            >
              <div class="drink-image-wrapper">
                <img class="drink-image" :src="drink.image" :alt="drink.title" />
              </div>

              <div class="drink-header">
                <h3 class="drink-title">{{ drink.title }}</h3>
                <span class="drink-price">{{ formatPrice(drink.price) }}</span>
              </div>

              <div class="drink-tags">
                <span v-for="tag in drink.badges" :key="tag" class="drink-tag">
                  {{ tag }}
                </span>
              </div>

              <p class="drink-description">{{ drink.description }}</p>
            </article>
          </div>

          <div v-else class="seasonal-empty">
            Сезонная подборка скоро появится.
          </div>
        </div>
      </section>

      <section class="recommendations-section">
        <div class="container">
          <div class="section-header">
            <div>
              <h2 class="section-title">На основе ваших предпочтений</h2>
              <p class="section-description">
                Рекомендуем попробовать напитки по выбранным вами вкусовым тегам.
              </p>
            </div>

            <RouterLink to="/profile" class="section-link">Настроить предпочтения →</RouterLink>
          </div>

          <div v-if="recommendationsLoading" class="seasonal-empty">
            Подбираем рекомендации для вас...
          </div>

          <div v-else-if="recommendationsError" class="seasonal-empty">
            {{ recommendationsError }}
          </div>

          <div v-else-if="!auth.isAuthenticated" class="seasonal-empty">
            Войдите в аккаунт и выберите вкусовые предпочтения в профиле, чтобы увидеть
            персональные рекомендации.
          </div>

          <div
            v-else-if="!recommendedDrinks.length && !preferredTags.length"
            class="seasonal-empty"
          >
            Выберите вкусовые предпочтения в профиле, и здесь появятся напитки под ваш вкус.
          </div>

          <div
            v-else-if="!recommendedDrinks.length"
            class="seasonal-empty"
          >
            Пока не нашли подходящие напитки по выбранным предпочтениям. Попробуйте изменить
            теги в профиле.
          </div>

          <template v-else>
            <div v-if="preferredTags.length" class="preference-tags">
              <span
                v-for="tag in preferredTags"
                :key="tag"
                class="preference-tag"
              >
                {{ tag }}
              </span>
            </div>

            <div class="drinks-grid">
              <RouterLink
                v-for="drink in recommendedDrinks"
                :key="`recommendation-${drink.id}`"
                :to="`/drinks/${drink.slug}`"
                class="drink-card drink-card--link"
              >
                <div class="drink-image-wrapper">
                  <img class="drink-image" :src="drink.image" :alt="drink.title" />
                </div>

                <div class="drink-header">
                  <h3 class="drink-title">{{ drink.title }}</h3>
                  <span class="drink-price">{{ formatPrice(drink.price) }}</span>
                </div>

                <div class="drink-tags">
                  <span v-for="tag in drink.badges" :key="tag" class="drink-tag">
                    {{ tag }}
                  </span>
                </div>

                <p class="drink-description">{{ drink.description }}</p>
              </RouterLink>
            </div>
          </template>
        </div>
      </section>

      <section v-if="featuredDrink" class="highlight-section container">
        <div class="highlight-section-heading">
          <h2 class="highlight-section-title">Попробуйте сегодня</h2>
        </div>

        <div class="highlight-card">
          <div class="highlight-image-block">
            <div class="highlight-badge">Хит</div>
            <img
              class="highlight-image"
              :src="featuredDrink.image"
              :alt="featuredDrink.title"
            />
          </div>

          <div class="highlight-content">
            <h2 class="highlight-title">{{ featuredDrink.title }}</h2>
            <p class="highlight-description">{{ featuredDrink.description }}</p>

            <div class="highlight-prices">
              <span class="highlight-price-current">{{ formatPrice(featuredDrink.price) }}</span>
            </div>

            <RouterLink :to="`/drinks/${featuredDrink.slug}`" class="btn btn-primary">Подробнее</RouterLink>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";

import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";
import { drinksApi } from "@/api/drinks.api";
import { recommendationsApi } from "@/api/recommendations.api";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADut2UHFuo3q4YdCqhlg7r3JtdEMMi_RH9_li7lJbx4r2YkXaRxw9a0TsR4viJQK5tcegJsqBDLkJ-GodtorYq-vGMCWH_0mu2dAcu1PLcxwngVYoQ3I6yKXySQBBr80yP-AxAp0B8pTUrp3oEd-ZL1nf-nsZhi_fYW1Se3b0cWnUvJC2jiqjkQevf0piM23wLsYk3wilbl4bhKOhs37ngAaCN-RFSnPJWlFP5xwwAqxB23rNH9Zpq3KvFUFyfoEoSOYeIvF7CbA";

const drinks = ref([]);
const isLoading = ref(false);
const loadError = ref("");

const recommendedDrinks = ref([]);
const preferredTags = ref([]);
const recommendationsLoading = ref(false);
const recommendationsError = ref("");

const seasonalDrinks = computed(() =>
  drinks.value.filter((drink) => drink.is_seasonal).slice(0, 3),
);

const featuredDrink = computed(() => {
  if (!seasonalDrinks.value.length) {
    return null;
  }

  const today = new Date();
  const dayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  const hash = [...dayKey].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const index = hash % seasonalDrinks.value.length;

  return seasonalDrinks.value[index];
});

onMounted(async () => {
  await auth.initAuth();

  await Promise.all([loadSeasonalDrinks(), loadRecommendations()]);
});

async function loadSeasonalDrinks() {
  isLoading.value = true;
  loadError.value = "";

  try {
    drinks.value = await drinksApi.getDrinks();
  } catch (error) {
    console.error(error);
    loadError.value = "Не удалось загрузить сезонные напитки.";
  } finally {
    isLoading.value = false;
  }
}

async function loadRecommendations() {
  recommendationsLoading.value = true;
  recommendationsError.value = "";
  recommendedDrinks.value = [];
  preferredTags.value = [];

  if (!auth.isAuthenticated) {
    recommendationsLoading.value = false;
    return;
  }

  try {
    const data = await recommendationsApi.getRecommendations();
    recommendedDrinks.value = data.recommendations.slice(0, 3);
    preferredTags.value = data.preferredTags;
  } catch (error) {
    console.error(error);
    recommendationsError.value = "Не удалось загрузить рекомендации.";
  } finally {
    recommendationsLoading.value = false;
  }
}

function formatPrice(price) {
  return `${price} ₽`;
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");

:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Plus Jakarta Sans", sans-serif;
  background-color: #fbfbe2;
  color: #1b1d0e;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button) {
  font: inherit;
}

.home-view {
  min-height: 100vh;
  background-color: #fbfbe2;
}

.container {
  width: min(100%, 1250px);
  margin: 0 auto;
  padding: 0 56px;
}

.main-content {
  padding-top: 128px;
}

.hero-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 64px;
  align-items: center;
  max-width: 1250px;
  margin: 0 auto;
  padding-bottom: 96px;
}

.hero-content {
  max-width: 640px;
}

.hero-title,
.section-title,
.highlight-title,
.highlight-section-title {
  margin: 0;
  font-family: "Noto Serif", serif;
  color: #1b1d0e;
}

.hero-title {
  margin-bottom: 32px;
  font-size: clamp(52px, 7vw, 92px);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: -0.04em;
}

.hero-title__line {
  display: block;
}

.hero-title__line--accent {
  color: #ba937b;
}

.hero-description,
.section-description,
.highlight-description,
.drink-description,
.footer-copy,
.seasonal-empty {
  color: #50443d;
}

.hero-description {
  max-width: 520px;
  margin: 0 0 40px;
  font-size: 18px;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 16px 40px;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition: 0.3s ease;
}

.btn-primary {
  background-color: #795437;
  color: #ffffff;
}

.btn-primary:hover {
  background-color: #956c4d;
}

.hero-image-wrapper {
  overflow: hidden;
  border-radius: 48px;
  max-width: 420px;
  margin-left: auto;
  aspect-ratio: 4 / 4.6;
}

.hero-image,
.drink-image,
.highlight-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seasonal-section,
.recommendations-section {
  padding: 80px 0;
}

.seasonal-section {
  background-color: #f5f5dc;
}

.recommendations-section {
  background:
    radial-gradient(circle at top right, rgba(239, 188, 152, 0.14), transparent 24%),
    linear-gradient(180deg, #fbfbe2 0%, #f7f1dc 100%);
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 56px;
}

.section-title {
  margin-bottom: 16px;
  font-size: clamp(32px, 4vw, 56px);
  color: #795437;
}

.section-description {
  max-width: 520px;
  margin: 0;
  line-height: 1.7;
}

.section-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #795437;
}

.seasonal-empty {
  padding: 40px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.7);
  text-align: center;
}

.preference-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 28px;
}

.preference-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(121, 84, 55, 0.12);
  color: #795437;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.drinks-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;
}

.drink-card {
  padding: 24px;
  background-color: #ffffff;
  border-radius: 26px;
  transition: box-shadow 0.3s ease;
}

.drink-card--link {
  display: block;
}

.drink-card:hover {
  box-shadow: 0 10px 30px rgba(27, 29, 14, 0.05);
}

.drink-image-wrapper {
  overflow: hidden;
  margin-bottom: 20px;
  border-radius: 20px;
  aspect-ratio: 1 / 0.9;
  background-color: #efefd7;
}

.drink-image {
  transition: transform 0.5s ease;
}

.drink-card:hover .drink-image {
  transform: scale(1.05);
}

.drink-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}

.drink-title {
  margin: 0;
  font-family: "Noto Serif", serif;
  font-size: 24px;
  font-style: italic;
}

.drink-price {
  font-size: 14px;
  font-weight: 700;
  color: #795437;
}

.drink-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.drink-tag {
  padding: 4px 8px;
  border-radius: 999px;
  background-color: #fbddca;
  color: #28180d;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.drink-description {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
}

.highlight-section {
  padding-top: 80px;
  padding-bottom: 80px;
}

.highlight-section-heading {
  margin-bottom: 24px;
}

.highlight-section-title {
  font-size: clamp(30px, 4vw, 48px);
  color: #795437;
}

.highlight-card {
  display: flex;
  overflow: hidden;
  max-width: 1040px;
  margin: 0 auto;
  border-radius: 48px;
  background-color: #efefd7;
}

.highlight-image-block {
  position: relative;
  flex: 0 0 44%;
  min-height: 336px;
}

.highlight-badge {
  position: absolute;
  top: 18px;
  left: 18px;
  z-index: 2;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(121, 84, 55, 0.92);
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.highlight-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: center;
  padding: 50px;
}

.highlight-title {
  margin-bottom: 24px;
  font-size: clamp(32px, 4vw, 56px);
  color: #795437;
}

.highlight-description {
  margin: 0 0 40px;
  line-height: 1.8;
}

.highlight-prices {
  display: flex;
  align-items: baseline;
  gap: 16px;
  margin-bottom: 40px;
}

.highlight-price-current {
  font-family: "Noto Serif", serif;
  font-size: 40px;
  font-style: italic;
}

@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }

  .hero-section,
  .highlight-card {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .hero-section {
    gap: 40px;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 32px;
  }

  .drinks-grid {
    grid-template-columns: 1fr;
  }

  .highlight-image-block,
  .highlight-content {
    width: 100%;
  }

  .highlight-content {
    padding: 40px 24px;
  }

}

@media (max-width: 640px) {
  .main-content {
    padding-top: 104px;
  }

  .hero-section,
  .seasonal-section,
  .recommendations-section,
  .highlight-section {
    padding-bottom: 48px;
  }

  .seasonal-section,
  .recommendations-section,
  .highlight-section {
    padding-top: 48px;
  }

  .hero-actions,
  .btn {
    width: 100%;
  }

  .drink-card,
  .highlight-card,
  .hero-image-wrapper {
    border-radius: 24px;
  }

  .highlight-badge {
    top: 16px;
    left: 16px;
  }
}
</style>
