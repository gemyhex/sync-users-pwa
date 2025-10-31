import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/pages/Login.vue';
import Home from '@/pages/Home.vue';
import { useAuthStore } from '@/modules/auth/stores/auth.store';

const routes = [
    { path: '/', name: 'home', component: Home, meta: { requiresAuth: true } },
    { path: '/login', name: 'login', component: Login }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const auth = useAuthStore();
    if (to.meta.requiresAuth && !auth.isAuthenticated) return next({ name: 'login' });
    next();
});
export default router;
