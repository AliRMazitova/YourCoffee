<template>
  <nav class="top-nav">
    <div class="container nav-inner">
      <RouterLink to="/" class="brand">YourCoffee</RouterLink>

      <div class="nav-links">
        <RouterLink to="/" :class="linkClass('/')">Главная</RouterLink>
        <RouterLink to="/drinks" :class="linkClass('/drinks')">Меню</RouterLink>
      </div>

      <RouterLink
        to="/profile"
        class="profile-button"
        :class="{ 'profile-button--active': isProfileActive }"
        aria-label="Профиль"
      >
        <span class="material-symbols-outlined">person</span>
      </RouterLink>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink, useRoute } from "vue-router";

const route = useRoute();

const isProfileActive = computed(() => route.path.startsWith("/profile"));

function linkClass(path) {
  const isActive =
    path === "/" ? route.path === "/" : route.path.startsWith(path);

  return ["nav-link", { active: isActive }];
}
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400;1,700&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");

.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 50;
  width: 100%;
  background: rgba(251, 251, 226, 0.7);
  backdrop-filter: blur(12px);
  box-shadow: 0 10px 30px rgba(27, 29, 14, 0.05);
}

.container {
  width: min(100%, 1250px);
  margin: 0 auto;
  padding: 0 56px;
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  width: min(100%, 1180px);
  margin: 0 auto;
  padding-top: 18px;
  padding-bottom: 18px;
}

.brand {
  font-family: "Noto Serif", serif;
  color: #795437;
  font-size: 32px;
  font-weight: 700;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 40px;
}

.nav-link {
  padding-bottom: 4px;
  border-bottom: 2px solid transparent;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #636451;
  transition: 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
  color: #795437;
}

.nav-link.active {
  border-bottom-color: #795437;
}

.profile-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  color: #795437;
  transition: 0.2s ease;
}

.profile-button:hover,
.profile-button--active {
  background: rgba(121, 84, 55, 0.08);
}

.material-symbols-outlined {
  font-family: "Material Symbols Outlined", sans-serif;
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }

  .nav-links {
    display: none;
  }
}

@media (max-width: 640px) {
  .nav-inner {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .brand {
    font-size: 24px;
  }
}
</style>
