<template>
  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="footer-copy">yourcoffe 2026 - для каждого свой</p>
    </div>
  </footer>
</template>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap");

.site-footer {
  margin-top: 56px;
  padding: 24px 0;
  background-color: #f5f5dc;
  border-top: 1px solid rgba(212, 195, 185, 0.3);
}

.container {
  width: min(100%, 1250px);
  margin: 0 auto;
  padding: 0 56px;
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-copy {
  margin: 0;
  color: #636451;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  text-align: center;
}

@media (max-width: 1024px) {
  .container {
    padding: 0 24px;
  }
}
</style>
