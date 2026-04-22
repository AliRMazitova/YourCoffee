<template>
  <div class="home-view">
    <nav class="top-nav">
      <div class="container nav-inner">
        <RouterLink to="/" class="brand">YourCoffee</RouterLink>

        <div class="nav-links">
          <RouterLink
            v-for="link in navLinks"
            :key="link.label"
            :to="link.to"
            :class="['nav-link', { active: link.active }]"
          >
            {{ link.label }}
          </RouterLink>
        </div>

        <RouterLink to="/profile" class="profile-button" aria-label="Профиль">
          <span class="material-symbols-outlined">person</span>
        </RouterLink>
      </div>
    </nav>

    <main class="main-content">
      <section class="hero-section container">
        <div class="hero-content">
          <h1 class="hero-title">Найди кофе, который подойдет именно тебе</h1>
          <p class="hero-description">
            Мы верим, что кофе - это больше, чем просто кофеин. Он для каждого
            свой. Наша система может помочь Вам с выбором напитка, под ваше
            настроение и предпочтения.
          </p>

          <div class="hero-actions">
            <RouterLink to="/drinks" class="btn btn-primary">
              Посмотреть меню
            </RouterLink>
            <button class="btn btn-secondary" type="button">
              Рекомендации
            </button>
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
                Тщательно подобранные блюда из нашего постоянно обновляющегося
                меню, идеально подходящие для атмосферы этого сезона.
              </p>
            </div>

            <RouterLink to="/drinks" class="section-link">Посмотреть все меню →</RouterLink>
          </div>

          <div class="drinks-grid">
            <article
              v-for="drink in seasonalDrinks"
              :key="drink.title"
              class="drink-card"
            >
              <div class="drink-image-wrapper">
                <img class="drink-image" :src="drink.image" :alt="drink.alt" />
              </div>

              <div class="drink-header">
                <h3 class="drink-title">{{ drink.title }}</h3>
                <span class="drink-price">{{ drink.price }}</span>
              </div>

              <div class="drink-tags">
                <span v-for="tag in drink.tags" :key="tag" class="drink-tag">
                  {{ tag }}
                </span>
              </div>

              <p class="drink-description">{{ drink.description }}</p>
            </article>
          </div>
        </div>
      </section>

      <section class="highlight-section container">
        <div class="highlight-card">
          <div class="highlight-image-block">
            <img
              class="highlight-image"
              :src="featuredDrink.image"
              :alt="featuredDrink.alt"
            />

            <span class="highlight-badge">Сегодняшний хит</span>
          </div>

          <div class="highlight-content">
            <h2 class="highlight-title">{{ featuredDrink.title }}</h2>
            <p class="highlight-description">{{ featuredDrink.description }}</p>

            <div class="highlight-prices">
              <span class="highlight-price-current">{{
                featuredDrink.price
              }}</span>
              <span class="highlight-price-old">{{
                featuredDrink.oldPrice
              }}</span>
            </div>

            <button class="btn btn-primary" type="button">Подробнее</button>
          </div>
        </div>
      </section>

      <section class="cta-section">
        <div class="container cta-content">
          <h2 class="cta-title">Не знаете, что выбрать?</h2>
          <a class="btn btn-ghost" href="#">Получить рекомендации</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-inner">
        <div class="footer-brand">YourCoffee</div>

        <div class="footer-links">
          <a
            v-for="link in footerLinks"
            :key="link"
            href="#"
            class="footer-link"
          >
            {{ link }}
          </a>
        </div>

        <div class="footer-copy">© 2024 YourCoffee. The Curated Ritual.</div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";

const navLinks = [
  { label: "Главная", active: true, to: "/" },
  { label: "Меню", active: false, to: "/drinks" },
  { label: "Избранное", active: false, to: "/profile" },
];

const footerLinks = ["Privacy", "Terms", "Brewing Guide", "Contact"];

const heroImage =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuADut2UHFuo3q4YdCqhlg7r3JtdEMMi_RH9_li7lJbx4r2YkXaRxw9a0TsR4viJQK5tcegJsqBDLkJ-GodtorYq-vGMCWH_0mu2dAcu1PLcxwngVYoQ3I6yKXySQBBr80yP-AxAp0B8pTUrp3oEd-ZL1nf-nsZhi_fYW1Se3b0cWnUvJC2jiqjkQevf0piM23wLsYk3wilbl4bhKOhs37ngAaCN-RFSnPJWlFP5xwwAqxB23rNH9Zpq3KvFUFyfoEoSOYeIvF7CbA";

const seasonalDrinks = [
  {
    title: "Ванильный латте",
    price: "300",
    tags: ["Сладкий", "Ваниль"],
    description:
      "Micro-foamed oat milk poured over our signature Brazilian espresso blend.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBLcgMkxoqq7hECBt_WN4-KCr7cQvQlyH88_K93SXTxUiPDqfka-tb6ekW2F5Ylq7eI8tyrFNE3B84alNiziybUQlSGqFI1fY1ssUFC4Had4MjO-aKvrbkjDauJ9CprPWVzhzlt5gtyOkDBxE-x7mx4tl2I-nOTaVgpeqr2MQWS3zYvI-b1zENQLdcOfqqhsaZHAahfC917nvx0Yfb1ENlYUhKsMi44iBLGfndOWDhqhaxY7u8fIymyb0pfmPrh7W18Bkn47oykYg",
    alt: "Oat Milk Flat White",
  },
  {
    title: "Amber Cold Brew",
    price: "450",
    tags: ["Citrus", "Clean"],
    description:
      "Steeped for 18 hours. A refreshing profile with bright notes of lemon zest.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA7G_u4wt62jr2pswnfxcxlyfSej57P70LPMRldVJlg5m7G1ELxZFNrkEnGW1zcB-5_tfbjp3veMCsqIA2Znq45jK9BAxQQbkDw6ADmwKr4LiECk5onBiV7VqfzefvyEXIXTxl6cKDUoibHe4tbsVE42T4WULEe5Rb0Z39KukHgd-ZwXgKyDJIjYovMsTyKOWiHEpEepCAfwzc0KF5ccnZtcx5wLAXeu7d-_f4lFjOjVorbaixl7ZaKzu51gasc8gfrtqT-KdcOUQ",
    alt: "Cold Brew Reserve",
  },
  {
    title: "Origin V60",
    price: "410",
    tags: ["Floral", "Tea-like"],
    description:
      "Precision brewed single origin from Ethiopia. Jasmine and stone fruit notes.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBi6RzPCToTbccfjKlQs_2o-HiTQ6LJHuukFQ0Nhf09oCZm7haxny7XeVZU9m7coi8egmj0RooHya3OxxcgCpndxB0NuAXD0tPk6vsWbVGpRPfnXweG9Ar5ze5FUg4Cl9MrPmcHrIpyuvRyrIjZ1TDPXzg1O9MgJ3081F2vxCB4wsyh9_0UBZBucFsdLRKYForIByJvyM-91-u9rsoQJ4wg-Sh2xjpinFExQ4MAuT7iCXBTMBY0SKbOz7ULzt9t7L51UUTXitMMlQ",
    alt: "V60 Pour Over",
  },
];

const featuredDrink = {
  title: "Honey Lavender Miel",
  description:
    "A delicate balance of local wildflower honey and dried organic lavender. Each sip is a subtle floral embrace, finished with a whisper of nutmeg.",
  price: "250",
  oldPrice: "350",
  image:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBi6RzPCToTbccfjKlQs_2o-HiTQ6LJHuukFQ0Nhf09oCZm7haxny7XeVZU9m7coi8egmj0RooHya3OxxcgCpndxB0NuAXD0tPk6vsWbVGpRPfnXweG9Ar5ze5FUg4Cl9MrPmcHrIpyuvRyrIjZ1TDPXzg1O9MgJ3081F2vxCB4wsyh9_0UBZBucFsdLRKYForIByJvyM-91-u9rsoQJ4wg-Sh2xjpinFExQ4MAuT7iCXBTMBY0SKbOz7ULzt9t7L51UUTXitMMlQ",
  alt: "Drink of the Day",
};
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
  width: min(100%, 1440px);
  margin: 0 auto;
  padding: 0 48px;
}

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

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding-top: 24px;
  padding-bottom: 24px;
}

.brand,
.footer-brand {
  font-family: "Noto Serif", serif;
  color: #795437;
}

.brand {
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
  border: 0;
  background: transparent;
  color: #795437;
  cursor: pointer;
}

.material-symbols-outlined {
  font-family: "Material Symbols Outlined", sans-serif;
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}

.main-content {
  padding-top: 128px;
}

.hero-section {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 64px;
  align-items: center;
  padding-bottom: 96px;
}

.hero-content {
  max-width: 640px;
}

.hero-title,
.section-title,
.highlight-title,
.cta-title {
  margin: 0;
  font-family: "Noto Serif", serif;
  font-style: italic;
  color: #1b1d0e;
}

.hero-title {
  margin-bottom: 32px;
  font-size: clamp(42px, 6vw, 82px);
  line-height: 1.05;
}

.hero-description,
.section-description,
.highlight-description,
.drink-description,
.footer-copy {
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

.btn-secondary {
  border-radius: 12px;
  background-color: #e1e1c9;
  color: #636451;
}

.btn-secondary:hover {
  background-color: #e4e4cc;
}

.btn-ghost {
  background-color: #e4e4cc;
  color: #1b1d0e;
}

.btn-ghost:hover {
  background-color: #795437;
  color: #ffffff;
}

.hero-image-wrapper {
  overflow: hidden;
  border-radius: 48px;
  aspect-ratio: 4 / 5;
}

.hero-image,
.drink-image,
.highlight-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seasonal-section {
  padding: 128px 0;
  background-color: #f5f5dc;
}

.section-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 80px;
}

.section-title {
  margin-bottom: 16px;
  font-size: clamp(32px, 4vw, 56px);
}

.section-description {
  max-width: 420px;
  margin: 0;
  line-height: 1.7;
}

.section-link {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #795437;
}

.drinks-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 32px;
}

.drink-card {
  padding: 32px;
  background-color: #ffffff;
  border-radius: 32px;
  transition: box-shadow 0.3s ease;
}

.drink-card:hover {
  box-shadow: 0 10px 30px rgba(27, 29, 14, 0.05);
}

.drink-image-wrapper {
  overflow: hidden;
  margin-bottom: 32px;
  border-radius: 24px;
  aspect-ratio: 1 / 1;
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
  font-size: 32px;
  font-style: italic;
}

.drink-price {
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
  border-radius: 4px;
  background-color: #fbddca;
  color: #28180d;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.drink-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.7;
}

.highlight-section {
  padding-top: 128px;
  padding-bottom: 128px;
}

.highlight-card {
  display: flex;
  overflow: hidden;
  border-radius: 48px;
  background-color: #efefd7;
}

.highlight-image-block {
  position: relative;
  flex: 0 0 60%;
  min-height: 500px;
}

.highlight-badge {
  position: absolute;
  top: 32px;
  left: 32px;
  padding: 8px 16px;
  border-radius: 999px;
  background-color: #795437;
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
  padding: 64px;
}

.highlight-title {
  margin-bottom: 24px;
  font-size: clamp(32px, 4vw, 56px);
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

.highlight-price-old {
  font-size: 14px;
  color: #50443d;
  text-decoration: line-through;
}

.cta-section {
  padding: 80px 0;
  text-align: center;
}

.cta-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cta-title {
  margin-bottom: 32px;
  font-size: clamp(28px, 3vw, 44px);
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
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #636451;
}

@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }

  .hero-section,
  .drinks-grid,
  .highlight-card,
  .footer-inner {
    grid-template-columns: 1fr;
    flex-direction: column;
  }

  .hero-section {
    gap: 40px;
  }

  .nav-links {
    display: none;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 48px;
  }

  .drinks-grid {
    display: grid;
    grid-template-columns: 1fr;
  }

  .highlight-image-block,
  .highlight-content {
    width: 100%;
  }

  .highlight-content {
    padding: 40px 24px;
  }

  .footer-inner {
    align-items: flex-start;
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

  .main-content {
    padding-top: 104px;
  }

  .hero-section,
  .seasonal-section,
  .highlight-section {
    padding-bottom: 72px;
  }

  .seasonal-section,
  .highlight-section {
    padding-top: 72px;
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
}
</style>
