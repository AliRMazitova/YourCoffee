<template>
  <div class="profile-view">
    <nav class="top-nav">
      <div class="shell nav-inner">
        <RouterLink to="/" class="brand">YourCoffee</RouterLink>

        <div class="nav-links">
          <RouterLink to="/" class="nav-link">Home</RouterLink>
          <RouterLink to="/drinks" class="nav-link">Menu</RouterLink>
          <a href="#" class="nav-link">Recommendations</a>
          <a href="#" class="nav-link nav-link--active">Profile</a>
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
              <button class="avatar-edit" type="button" aria-label="Редактировать профиль">
                <span class="material-symbols-outlined">edit</span>
              </button>
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

            <button class="primary-button" type="button">Edit Profile</button>
          </section>

          <section class="panel">
            <h2 class="panel-title">Taste Rituals</h2>
            <div class="ritual-list">
              <span
                v-for="ritual in tasteRituals"
                :key="ritual.label"
                class="ritual-tag"
              >
                <span class="material-symbols-outlined">{{ ritual.icon }}</span>
                {{ ritual.label }}
              </span>
            </div>
          </section>
        </aside>

        <section class="content">
          <div class="content-header">
            <div>
              <h2>Your Favorites</h2>
              <p>Your curated collection of perfect brews.</p>
            </div>

            <div class="view-switcher">
              <button class="switcher-button switcher-button--active" type="button">
                <span class="material-symbols-outlined material-symbols-outlined--filled">grid_view</span>
              </button>
              <button class="switcher-button" type="button">
                <span class="material-symbols-outlined">view_list</span>
              </button>
            </div>
          </div>

          <div class="favorites-grid">
            <article
              v-for="drink in favoriteDrinks"
              :key="drink.title"
              class="favorite-card"
            >
              <div class="favorite-card__image-wrap">
                <img
                  class="favorite-card__image"
                  :src="drink.image"
                  :alt="drink.alt"
                />
                <div class="favorite-card__favorite">
                  <span class="material-symbols-outlined material-symbols-outlined--filled">favorite</span>
                </div>
              </div>

              <div class="favorite-card__body">
                <div class="favorite-card__header">
                  <h3>{{ drink.title }}</h3>
                  <span class="favorite-card__badge">{{ drink.category }}</span>
                </div>

                <p class="favorite-card__description">{{ drink.description }}</p>

                <div class="favorite-card__tags">
                  <template v-for="(tag, index) in drink.tags" :key="`${drink.title}-${tag}`">
                    <span>{{ tag }}</span>
                    <span v-if="index < drink.tags.length - 1" class="favorite-card__separator">•</span>
                  </template>
                </div>
              </div>
            </article>
          </div>

          <div class="stats-grid">
            <section class="stat-card stat-card--wide">
              <div>
                <p class="stat-card__label">Cups Brewed</p>
                <h3>124</h3>
              </div>
              <span class="material-symbols-outlined stat-card__icon">coffee</span>
            </section>

            <section class="stat-card stat-card--centered">
              <p class="stat-card__label">Badge</p>
              <span class="material-symbols-outlined material-symbols-outlined--filled stat-card__icon stat-card__icon--strong">workspace_premium</span>
              <p class="stat-card__note">Elite Brewer</p>
            </section>

            <section class="stat-card stat-card--centered">
              <p class="stat-card__label">Streak</p>
              <h3 class="stat-card__streak">12 Days</h3>
              <p class="stat-card__note">Keep it up!</p>
            </section>
          </div>
        </section>
      </div>
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
import { computed, onMounted } from "vue";
import { RouterLink } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();

onMounted(() => {
  auth.initAuth();
});

const user = computed(() => auth.user ?? null);

const displayName = computed(() => user.value?.username || "Julian Thorne");
const displayEmail = computed(() => user.value?.email || "julian.t@ritual.com");
const subtitle = computed(() =>
  user.value?.username
    ? `${user.value.username} is shaping a personal coffee ritual`
    : "Coffee Enthusiast since 2018",
);

const joinedLabel = computed(() => {
  const rawDate = user.value?.created_at;
  if (!rawDate) return "Joined Oct 2023";

  const date = new Date(rawDate);
  if (Number.isNaN(date.getTime())) return "Joined recently";

  return `Joined ${new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date)}`;
});

const avatarUrl = computed(() => {
  const seed = encodeURIComponent(displayName.value);
  return `https://api.dicebear.com/8.x/initials/svg?seed=${seed}&backgroundColor=eed7c5,d9b79f,c69a7c`;
});

const location = "Portland, Oregon";

const footerLinks = ["Privacy", "Terms", "Brewing Guide", "Contact"];

const tasteRituals = [
  { icon: "bolt", label: "Loves strong coffee" },
  { icon: "icecream", label: "Sweet tooth" },
  { icon: "eco", label: "Oat milk fan" },
  { icon: "ac_unit", label: "Always Iced" },
];

const favoriteDrinks = [
  {
    title: "Velvet Oat Latte",
    category: "ESPRESSO",
    description:
      "A double shot of Ethiopian Yirgacheffe over creamy oat milk with a hint of organic agave.",
    tags: ["Oat Milk", "Iced"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfBV7zB0hNKF_K8XWK4mUlCuWj8urUUgBeHvs-nzaj1rFYyfWzFZfs84ES41tooaR-loYRONm96Zs3C9snHLMV12S_e7I3U2psqfwNOzKtzEQbpALzozuJz7V2QISifoWh5RVeqz_i3jiBzm8DizQa2k9WXutyGZKpBz9w7u41zqpvykYUxZYscSHBRD23BSxtLYNg2BeO7NzDU0_R9qBaH8nbq54xzn5sr9nmcnkHbOk4AH0eSkaFvScaF2ziY7OQys5mPXY5qw",
    alt: "Iced oat milk latte",
  },
  {
    title: "Midnight Ritual",
    category: "POUR OVER",
    description:
      "Sumatran Mandheling beans, dark roasted for notes of cedar, spice, and dark chocolate.",
    tags: ["Dark Roast", "Bold"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXcKObxXmoUF6ws3Mp0LUG2xQHe4XsQEYiM3YO5XBDhURqf1EKKpWup-iYcs2lDoi1pdaMS9oej6Xks4BS0oFIXdOQKlP5ngDVu4qcoZQuHUoAeEPuyFe3v1i6Q73hizS_OEXh91hUa-EZZ8rPb41VyLry3MiBtN4Jp0XuvtLL5hAPr0EJ69rQxvm7uQVejSSnRycVOntOJFLwxnShAXK5WuuZ4y0xXBQVGPGm1ul0b_qMN1arK79wBH_0bvqgwqYzjrCUy9ym3w",
    alt: "Dark roast pour over",
  },
  {
    title: "Honey Cortado",
    category: "ESPRESSO",
    description:
      "Equal parts espresso and warm milk, sweetened with local wildflower honey and a dash of cinnamon.",
    tags: ["Sweet", "Aromatic"],
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASIf8ud6tEz8ylnu1uM911Ha6QDZNZksHOWEQB5L4Aen9T3baDCnfl4OUMEkqUdEMVD88LkMKOo74x-Gm5budzaCseY6fFEr7_hgufu0snFd14u9Tiz8wZIc7ZkMts7oGK_4AVfp2HVETfGvccjbahlk-dmIOjXDjCP85ByGzlJgdBXLasZm3h2cmgnzHgYiitzhKgVRvMFAk9mP3OgncxyUY12Yy_FvyS7KayiB1FdmUD5n0Uan_AE_2kNLzIAcCM_XjpjsgwHA",
    alt: "Honey cortado",
  },
];
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
.switcher-button,
.avatar-edit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: pointer;
}

.profile-icon-button {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  color: #795437;
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
.stat-card {
  border: 1px solid rgba(212, 195, 185, 0.28);
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 18px 48px rgba(70, 54, 42, 0.06);
  backdrop-filter: blur(8px);
}

.panel {
  padding: 32px;
}

.avatar-wrap {
  position: relative;
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

.avatar-edit {
  position: absolute;
  right: 0;
  bottom: 0;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #795437;
  color: #fff;
  box-shadow: 0 10px 24px rgba(121, 84, 55, 0.22);
}

.profile-header {
  margin-top: 20px;
  text-align: center;
}

.profile-header h1,
.panel-title,
.content-header h2,
.favorite-card__header h3,
.stat-card h3 {
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
.stat-card__note {
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

.primary-button {
  width: 100%;
  margin-top: 24px;
  padding: 16px 24px;
  border: 0;
  border-radius: 999px;
  background: #795437;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.primary-button:hover {
  background: #956c4d;
  transform: translateY(-1px);
}

.panel-title {
  margin-bottom: 20px;
  color: #795437;
  font-size: 28px;
  font-style: italic;
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

.ritual-tag .material-symbols-outlined {
  font-size: 16px;
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

.view-switcher {
  display: flex;
  gap: 10px;
}

.switcher-button {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid rgba(212, 195, 185, 0.35);
  background: rgba(255, 255, 255, 0.7);
  color: #636451;
}

.switcher-button:hover,
.switcher-button--active {
  background: #efefd7;
  color: #795437;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(251, 251, 226, 0.9);
  color: #ba1a1a;
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

.favorite-card__badge {
  flex-shrink: 0;
  padding: 6px 10px;
  border-radius: 8px;
  background: #e1e1c9;
  color: #636451;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.favorite-card__description {
  min-height: 68px;
  margin: 14px 0 0;
  line-height: 1.7;
}

.favorite-card__tags {
  display: flex;
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 24px;
  margin-top: 8px;
}

.stat-card {
  padding: 28px;
}

.stat-card--wide {
  grid-column: span 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: linear-gradient(135deg, rgba(149, 108, 77, 0.1), rgba(255, 255, 255, 0.92));
}

.stat-card--centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stat-card__label {
  margin: 0 0 8px;
  color: rgba(121, 84, 55, 0.72);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.stat-card h3 {
  color: #795437;
  font-size: 48px;
  font-style: italic;
}

.stat-card__streak {
  font-size: 34px !important;
}

.stat-card__icon {
  font-size: 52px;
  color: rgba(121, 84, 55, 0.22);
}

.stat-card__icon--strong {
  color: #795437;
  opacity: 0.9;
}

.stat-card__note {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 700;
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

@media (max-width: 1180px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .favorites-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats-grid {
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

  .favorites-grid,
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .stat-card--wide {
    grid-column: span 1;
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
  .stat-card {
    padding: 20px;
  }

  .panel,
  .favorite-card,
  .stat-card {
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

