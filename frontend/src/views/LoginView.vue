<template>
  <div class="login-view">
    <SiteHeader />

    <main class="login-main">
      <section class="auth-card">
        <div class="auth-panel">
          <div
            class="auth-tabs"
            role="tablist"
            aria-label="Authentication tabs"
          >
            <RouterLink
              to="/login"
              class="auth-tab auth-tab--active"
              aria-current="page"
            >
              Вход
            </RouterLink>
            <RouterLink to="/registration" class="auth-tab">
              Регистрация
            </RouterLink>
          </div>

          <div class="auth-content">
            <header class="auth-content__header">
              <h1 class="auth-title">С возвращением!</h1>
              <p class="auth-subtitle">
                Введите ваши данные, чтобы зайти в профиль.
              </p>
              <p
                v-if="registeredBanner"
                class="form-success form-success--banner"
              >
                {{ registeredBanner }}
              </p>
            </header>

            <form class="auth-form" @submit.prevent="handleSubmit">
              <div class="form-field">
                <label class="form-label" for="email">Почта</label>
                <input
                  id="email"
                  v-model="form.email"
                  class="form-input"
                  type="email"
                  placeholder="example@example.com"
                  autocomplete="email"
                />
              </div>

              <div class="form-field">
                <div class="form-field__head">
                  <label class="form-label" for="password">Пароль</label>
                </div>

                <input
                  id="password"
                  v-model="form.password"
                  class="form-input"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="current-password"
                />
              </div>

              <p v-if="submitError" class="form-error form-error--block">
                {{ submitError }}
              </p>

              <button
                class="submit-button"
                type="submit"
                :disabled="isSubmitting"
              >
                <span>{{ isSubmitting ? "Выполняем вход..." : "Вход" }}</span>
                <span class="submit-button__icon" aria-hidden="true">→</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import SiteFooter from "@/components/SiteFooter.vue";
import SiteHeader from "@/components/SiteHeader.vue";

import { computed, reactive, ref } from "vue";
import { RouterLink, useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const registeredBanner = computed(() =>
  route.query.registered === "1"
    ? "Account created. Sign in with your email and password."
    : "",
);

const form = reactive({
  email: "",
  password: "",
});

const isSubmitting = ref(false);
const submitError = ref("");

const handleSubmit = async () => {
  submitError.value = "";
  if (!form.email.trim() || !form.password) {
    submitError.value = "Enter email and password.";
    return;
  }

  try {
    isSubmitting.value = true;
    await auth.login({
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });
    const redirect =
      typeof route.query.redirect === "string" ? route.query.redirect : "/";
    await router.replace(redirect || "/");
  } catch (err) {
    const msg =
      err.response?.data?.error ||
      err.message ||
      "Sign in failed. Please try again.";
    submitError.value = msg;
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
:global(*) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  font-family: "Plus Jakarta Sans", sans-serif;
  background: #fbfbe2;
  color: #1b1d0e;
}

:global(a) {
  color: inherit;
  text-decoration: none;
}

:global(button),
:global(input) {
  font: inherit;
}

.login-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbfbe2;
  color: #1b1d0e;
}

.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 132px 16px 48px;
}

.auth-card {
  width: 100%;
  max-width: 560px;
}

.auth-panel {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(27, 29, 14, 0.05);
  overflow: hidden;
}

.auth-content {
  padding: 32px;
}

.auth-tabs {
  display: flex;
  gap: 24px;
  padding: 24px 32px 0;
  border-bottom: 1px solid rgba(212, 195, 185, 0.4);
}

.auth-tab {
  padding: 0 0 16px;
  border: 0;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: #636451;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  text-decoration: none;
  transition:
    color 0.2s ease,
    border-color 0.2s ease;
}

.auth-tab:hover {
  color: #795437;
}

.auth-tab--active {
  color: #795437;
  border-bottom-color: #795437;
}

.auth-content__header {
  margin-bottom: 32px;
}

.auth-title {
  margin: 0 0 8px;
  font-family: "Noto Serif", serif;
  font-size: 36px;
  font-weight: 700;
  line-height: 1.15;
}

.auth-subtitle {
  margin: 0;
  color: #50443d;
  font-size: 14px;
  line-height: 1.5;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.form-label {
  color: #50443d;
  font-family: "Noto Serif", serif;
  font-size: 14px;
  font-style: italic;
}

.form-link {
  color: #82746c;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transition: color 0.2s ease;
}

.form-link:hover {
  color: #795437;
}

.form-input {
  width: 100%;
  padding: 14px 0;
  border: 0;
  border-bottom: 1px solid rgba(130, 116, 108, 0.35);
  background: transparent;
  color: #1b1d0e;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input::placeholder {
  color: #82746c;
}

.form-input:focus {
  border-bottom-color: #795437;
}

.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  margin-top: 8px;
  padding: 16px 24px;
  border: 0;
  border-radius: 999px;
  background: #795437;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;
}

.submit-button:hover {
  background: #956c4d;
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.form-error--block {
  margin: 0;
  text-align: center;
}

.form-success--banner {
  margin: 16px 0 0;
  text-align: left;
  color: #4d7a52;
  font-size: 13px;
  line-height: 1.45;
}

.submit-button__icon {
  font-size: 16px;
  line-height: 1;
}

@media (max-width: 640px) {
  .login-main {
    padding: 112px 12px 40px;
  }

  .auth-tabs,
  .auth-content {
    padding-left: 20px;
    padding-right: 20px;
  }

  .auth-tabs {
    gap: 16px;
  }

  .auth-title {
    font-size: 30px;
  }
}
</style>
