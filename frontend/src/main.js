import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router/router'

import { createVuetify } from 'vuetify'
import 'vuetify/styles'

import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '@mdi/font/css/materialdesignicons.css'
import '@/style.css'

const vuetify = createVuetify({
  components,
  directives,

  icons: {
    defaultSet: 'mdi',
  },

  theme: {
    defaultTheme: 'light',

    themes: {
      light: {
        dark: false,

        colors: {
          background: '#fbfbe2',
          surface: '#ffffff',
          'surface-bright': '#fbfbe2',
          'surface-variant': '#e4e4cc',

          primary: '#795437',
          'primary-container': '#956c4d',
          'primary-fixed': '#ffdcc4',
          'primary-fixed-dim': '#efbc98',
          'on-primary': '#ffffff',
          'on-primary-container': '#fffbff',
          'on-primary-fixed': '#2f1501',
          'on-primary-fixed-variant': '#613f24',

          secondary: '#5e604d',
          'secondary-container': '#e1e1c9',
          'secondary-fixed': '#e4e4cc',
          'secondary-fixed-dim': '#c8c8b0',
          'on-secondary': '#ffffff',
          'on-secondary-container': '#636451',
          'on-secondary-fixed': '#1b1d0e',
          'on-secondary-fixed-variant': '#474836',

          tertiary: '#6e5749',
          'tertiary-container': '#887061',
          'tertiary-fixed': '#fbddca',
          'tertiary-fixed-dim': '#dec1af',
          'on-tertiary': '#ffffff',
          'on-tertiary-container': '#fffbff',
          'on-tertiary-fixed': '#28180d',
          'on-tertiary-fixed-variant': '#574335',

          'on-background': '#1b1d0e',
          'on-surface': '#1b1d0e',
          'on-surface-variant': '#50443d',

          outline: '#82746c',
          'outline-variant': '#d4c3b9',

          error: '#ba1a1a',
          'error-container': '#ffdad6',
          'on-error': '#ffffff',
          'on-error-container': '#93000a',

          'inverse-surface': '#303221',
          'inverse-on-surface': '#f2f2d9',
          'inverse-primary': '#efbc98',

          'surface-container': '#efefd7',
          'surface-container-high': '#eaead1',
          'surface-container-highest': '#e4e4cc',
          'surface-container-low': '#f5f5dc',
          'surface-container-lowest': '#ffffff',
          'surface-dim': '#dbdcc3',

          accent: '#9CAA00',
          primaryContainer: '#956c4d',
        },
      },
    },
  },
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

app.mount('#app')