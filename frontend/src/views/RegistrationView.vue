<template>
  <div class="register-view">
    <SiteHeader />

    <main class="register-main">
      <section class="auth-card">
        <div class="auth-panel">
          <div
            class="auth-tabs"
            role="tablist"
            aria-label="Authentication tabs"
          >
            <RouterLink to="/login" class="auth-tab">Вход</RouterLink>
            <RouterLink
              to="/registration"
              class="auth-tab auth-tab--active"
              aria-current="page"
            >
              Регистрация
            </RouterLink>
          </div>

          <div class="auth-content">
            <header class="auth-content__header">
              <h1 class="auth-title">Создайте свой аккаунт</h1>
              <p class="auth-subtitle">
                Зарегистрируйтесь, чтобы начать свое кофейное путешествие.
              </p>
            </header>

            <form class="auth-form" @submit.prevent="handleSubmit">
              <div class="form-field">
                <label class="form-label" for="username">Имя</label>
                <input
                  id="username"
                  v-model.trim="form.username"
                  class="form-input"
                  :class="{
                    'form-input--error': touched.username && usernameError,
                  }"
                  type="text"
                  placeholder="Как нам к Вам обращаться"
                  autocomplete="username"
                  @blur="touched.username = true"
                />
                <p v-if="touched.username && usernameError" class="form-error">
                  {{ usernameError }}
                </p>
              </div>

              <div class="form-field">
                <label class="form-label" for="email">Почта</label>
                <input
                  id="email"
                  v-model.trim="form.email"
                  class="form-input"
                  :class="{ 'form-input--error': touched.email && emailError }"
                  type="email"
                  placeholder="example@example.com"
                  autocomplete="email"
                  @blur="touched.email = true"
                />
                <p v-if="touched.email && emailError" class="form-error">
                  {{ emailError }}
                </p>
              </div>

              <div class="form-field">
                <div class="form-field__head">
                  <label class="form-label" for="password">Пароль</label>
                  <span class="form-hint">Минимум 6 символов</span>
                </div>

                <input
                  id="password"
                  v-model="form.password"
                  class="form-input"
                  :class="{
                    'form-input--error': touched.password && passwordError,
                  }"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  @blur="touched.password = true"
                />
                <p v-if="touched.password && passwordError" class="form-error">
                  {{ passwordError }}
                </p>
              </div>

              <div class="form-field">
                <label class="form-label" for="confirmPassword">
                  Повторите пароль
                </label>
                <input
                  id="confirmPassword"
                  v-model="form.confirmPassword"
                  class="form-input"
                  :class="{
                    'form-input--error':
                      touched.confirmPassword && confirmPasswordError,
                  }"
                  type="password"
                  placeholder="••••••••"
                  autocomplete="new-password"
                  @blur="touched.confirmPassword = true"
                />
                <p
                  v-if="touched.confirmPassword && confirmPasswordError"
                  class="form-error"
                >
                  {{ confirmPasswordError }}
                </p>
              </div>

              <button
                class="submit-button"
                :class="{ 'submit-button--disabled': !isFormValid }"
                type="submit"
                :disabled="isSubmitting || !isFormValid"
              >
                <span>{{
                  isSubmitting ? "Создаем аккаунт..." : "Зарегистрироваться"
                }}</span>
                <span class="submit-button__icon" aria-hidden="true">→</span>
              </button>

              <p v-if="submitError" class="form-error form-error--center">
                {{ submitError }}
              </p>
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
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const form = reactive({
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const touched = reactive({
  username: false,
  email: false,
  password: false,
  confirmPassword: false,
});

const isSubmitting = ref(false);
const submitError = ref("");

const usernameError = computed(() => {
  if (!form.username) return "Username is required.";
  if (form.username.length < 2)
    return "Username must be at least 2 characters.";
  return "";
});

const emailError = computed(() => {
  if (!form.email) return "Email is required.";

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(form.email)) return "Enter a valid email address.";

  return "";
});

const passwordError = computed(() => {
  if (!form.password) return "Password is required.";
  if (form.password.length < 6)
    return "Password must be at least 6 characters.";
  return "";
});

const confirmPasswordError = computed(() => {
  if (!form.confirmPassword) return "Please confirm your password.";
  if (form.confirmPassword !== form.password) return "Passwords do not match.";
  return "";
});

const isFormValid = computed(() => {
  return (
    !usernameError.value &&
    !emailError.value &&
    !passwordError.value &&
    !confirmPasswordError.value
  );
});

const handleSubmit = async () => {
  touched.username = true;
  touched.email = true;
  touched.password = true;
  touched.confirmPassword = true;
  submitError.value = "";

  if (!isFormValid.value) return;

  try {
    isSubmitting.value = true;
    await auth.register({
      username: form.username,
      email: form.email.toLowerCase(),
      password: form.password,
    });
    submitError.value = "";
    await router.push({ name: "Login", query: { registered: "1" } });
  } catch (error) {
    const msg =
      error.response?.data?.error ||
      error.message ||
      "Something went wrong. Please try again.";
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

.register-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbfbe2;
  color: #1b1d0e;
}

.register-main {
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

.form-hint {
  color: #82746c;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

.form-input--error {
  border-bottom-color: #c45757;
}

.form-error {
  margin: 0;
  color: #c45757;
  font-size: 12px;
  line-height: 1.4;
}

.form-error--center {
  text-align: center;
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
    background-color 0.2s ease,
    opacity 0.2s ease;
}

.submit-button:hover:not(:disabled) {
  background: #956c4d;
}

.submit-button:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-button:disabled,
.submit-button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-button__icon {
  font-size: 16px;
  line-height: 1;
}

@media (max-width: 640px) {
  .register-main {
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
