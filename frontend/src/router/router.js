import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegistrationView from '@/views/RegistrationView.vue'
import ProfileView from '@/views/ProfileView.vue'
import DrinksView from '@/views/DrinksView.vue'
import DrinkDetailView from '@/views/DrinkDetailView.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: HomeView,
    },
    {
        path: '/profile',
        name: 'Profile',
        component: ProfileView,
        meta: { requiresAuth: true },
    },
    {
        path: '/drinks',
        name: 'Drinks',
        component: DrinksView,
    },
    {
        path: '/drinks/:slug',
        name: 'DrinkDetail',
        component: DrinkDetailView,
    },
    {
        path: '/login',
        name: 'Login',
        component: LoginView,
    },
    {
        path: '/registration',
        name: 'Registration',
        component: RegistrationView,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to) => {
    if (to.meta.requiresAuth) {
        const auth = useAuthStore()
        await auth.initAuth()
        if (!auth.isAuthenticated) {
            return { name: 'Login', query: { redirect: to.fullPath } }
        }
    }
})

export default router
